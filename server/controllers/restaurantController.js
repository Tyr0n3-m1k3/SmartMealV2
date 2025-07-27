const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
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
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
exports.getNearbyRestaurants = async (req, res) => {
    try {
        const { lat, lng, distance = 5000 } = req.query; // distance in meters

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Please provide latitude and longitude' });
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
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
            .populate('owner', 'name email phone');

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });

        res.json({ restaurant, menuItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Restaurant Owner
exports.createRestaurant = async (req, res) => {
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
            return res.status(400).json({ message: 'User already has a restaurant' });
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

        res.status(201).json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Restaurant Owner
exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check user is restaurant owner
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            restaurant[key] = updates[key];
        });

        await restaurant.save();

        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private/Restaurant Owner
exports.createMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check user is restaurant owner
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { name, description, price, category } = req.body;

        const menuItem = new MenuItem({
            name,
            description,
            price,
            category,
            restaurant: restaurant._id
        });

        await menuItem.save();

        res.status(201).json(menuItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/menu/:id
// @access  Private/Restaurant Owner
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        const restaurant = await Restaurant.findById(menuItem.restaurant);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check user is restaurant owner
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            menuItem[key] = updates[key];
        });

        await menuItem.save();

        res.json(menuItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
