const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
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
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all restaurants (including inactive)
// @route   GET /api/admin/restaurants
// @access  Private/Admin
exports.getRestaurants = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        const restaurants = await Restaurant.find(query).populate('owner', 'name email phone');
        res.json(restaurants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle restaurant status
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private/Admin
exports.toggleRestaurantStatus = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        restaurant.isActive = !restaurant.isActive;
        await restaurant.save();

        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const { status, from, to } = req.query;
        let query = {};

        if (status && status !== 'all') {
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
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
