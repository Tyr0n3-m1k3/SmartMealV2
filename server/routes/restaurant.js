const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @route   GET api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { cuisine, search } = req.query;
        let query = { isActive: true };

        if (cuisine) {
            query.cuisineType = new RegExp(cuisine, 'i');
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { cuisineType: new RegExp(search, 'i') }
            ];
        }

        const restaurants = await Restaurant.find(query)
            .populate('owner', 'name email phone')
            .sort({ rating: -1 });

        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
            .populate('owner', 'name email phone');

        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }

        const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });

        res.json({ restaurant, menuItems });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   GET api/restaurants/nearby
// @desc    Get nearby restaurants
// @access  Public
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, distance = 5000 } = req.query; // distance in meters

        if (!lat || !lng) {
            return res.status(400).json({ msg: 'Please provide latitude and longitude' });
        }

        const restaurants = await Restaurant.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            },
            isActive: true
        }).limit(20);

        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/restaurants
// @desc    Create a restaurant
// @access  Private (Restaurant Owner)
router.post('/', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('cuisineType', 'Cuisine type is required').not().isEmpty(),
        check('address.street', 'Street address is required').not().isEmpty(),
        check('address.city', 'City is required').not().isEmpty(),
        check('address.state', 'State is required').not().isEmpty(),
        check('address.zip', 'Zip code is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        name,
        description,
        cuisineType,
        address,
        phone,
        email,
        openingHours,
        deliveryFee,
        minOrder,
        image
    } = req.body;

    try {
        // Check if user already has a restaurant
        const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });
        if (existingRestaurant) {
            return res.status(400).json({ msg: 'User already has a restaurant' });
        }

        const location = {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates, should be updated with actual location
        };

        const restaurant = new Restaurant({
            name,
            description,
            cuisineType,
            address,
            location,
            phone,
            email,
            openingHours,
            deliveryFee,
            minOrder,
            image,
            owner: req.user.id
        });

        await restaurant.save();

        // Update user role to restaurant_owner
        const user = await User.findById(req.user.id);
        user.role = 'restaurant_owner';
        user.restaurant = restaurant._id;
        await user.save();

        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/restaurants/:id
// @desc    Update restaurant
// @access  Private (Restaurant Owner)
router.put('/:id', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }

        // Check user is restaurant owner
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            restaurant[key] = updates[key];
        });

        await restaurant.save();

        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
