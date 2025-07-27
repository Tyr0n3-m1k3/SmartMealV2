const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', [auth, isAdmin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id', [
    auth,
    isAdmin,
    check('role', 'Role is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.role = req.body.role;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/restaurants
// @desc    Get all restaurants (including inactive)
// @access  Private (Admin)
router.get('/restaurants', [auth, isAdmin], async (req, res) => {
    try {
        const restaurants = await Restaurant.find()
            .populate('owner', 'name email phone');
        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/restaurants/:id/status
// @desc    Toggle restaurant active status
// @access  Private (Admin)
router.put('/restaurants/:id/status', [auth, isAdmin], async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }

        restaurant.isActive = !restaurant.isActive;
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

// @route   GET api/admin/orders
// @desc    Get all orders
// @access  Private (Admin)
router.get('/orders', [auth, isAdmin], async (req, res) => {
    try {
        const { status, from, to } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (from && to) {
            query.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const orders = await Order.find(query)
            .populate('restaurant', 'name')
            .populate('customer', 'name')
            .populate('driver', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', [auth, isAdmin], async (req, res) => {
    try {
        const [
            totalUsers,
            totalRestaurants,
            totalOrders,
            recentOrders,
            activeRestaurants
        ] = await Promise.all([
            User.countDocuments(),
            Restaurant.countDocuments(),
            Order.countDocuments(),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('restaurant', 'name')
                .populate('customer', 'name'),
            Restaurant.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('owner', 'name')
        ]);

        const revenueResult = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        const deliveredOrders = revenueResult.length > 0 ? revenueResult[0].count : 0;

        res.json({
            totalUsers,
            totalRestaurants,
            totalOrders,
            deliveredOrders,
            totalRevenue,
            recentOrders,
            activeRestaurants
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
