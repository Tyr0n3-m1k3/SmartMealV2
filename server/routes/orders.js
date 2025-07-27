const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// @route   POST api/orders
// @desc    Create an order
// @access  Private
router.post('/', [
    auth,
    [
        check('restaurant', 'Restaurant is required').not().isEmpty(),
        check('items', 'Items are required').isArray({ min: 1 }),
        check('deliveryAddress.street', 'Street address is required').not().isEmpty(),
        check('deliveryAddress.city', 'City is required').not().isEmpty(),
        check('deliveryAddress.state', 'State is required').not().isEmpty(),
        check('deliveryAddress.zip', 'Zip code is required').not().isEmpty(),
        check('paymentMethod', 'Payment method is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        restaurant,
        items,
        deliveryAddress,
        paymentMethod,
        instructions
    } = req.body;

    try {
        // Verify restaurant exists
        const restaurantDoc = await Restaurant.findById(restaurant);
        if (!restaurantDoc) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }

        // Calculate order totals and verify menu items
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);
            if (!menuItem) {
                return res.status(404).json({ msg: `Menu item ${item.menuItem} not found` });
            }

            if (menuItem.restaurant.toString() !== restaurant) {
                return res.status(400).json({ msg: `Menu item ${menuItem.name} does not belong to this restaurant` });
            }

            const itemTotal = menuItem.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        // Apply delivery fee
        const deliveryFee = restaurantDoc.deliveryFee || 2.99;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + deliveryFee + tax;

        // Create order
        const order = new Order({
            customer: req.user.id,
            restaurant: restaurantDoc._id,
            items: orderItems,
            subtotal,
            deliveryFee,
            tax,
            total,
            deliveryAddress: {
                ...deliveryAddress,
                instructions
            },
            paymentMethod,
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
        });

        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let orders;
        
        if (req.user.role === 'customer') {
            orders = await Order.find({ customer: req.user.id })
                .populate('restaurant', 'name image')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'restaurant_owner') {
            const restaurant = await Restaurant.findOne({ owner: req.user.id });
            if (!restaurant) {
                return res.status(400).json({ msg: 'No restaurant found for this user' });
            }
            orders = await Order.find({ restaurant: restaurant._id })
                .populate('customer', 'name phone')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'driver') {
            orders = await Order.find({ driver: req.user.id })
                .populate('restaurant', 'name image')
                .populate('customer', 'name phone')
                .sort({ createdAt: -1 });
        } else {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurant', 'name image phone address')
            .populate('customer', 'name phone')
            .populate('driver', 'name phone')
            .populate('items.menuItem', 'name price');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (
            order.customer._id.toString() !== req.user.id &&
            order.restaurant.owner.toString() !== req.user.id &&
            (order.driver && order.driver._id.toString() !== req.user.id) &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private (Restaurant Owner or Driver)
router.put('/:id/status', [
    auth,
    check('status', 'Status is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check user is authorized to update status
        const restaurant = await Restaurant.findById(order.restaurant);
        const isRestaurantOwner = restaurant.owner.toString() === req.user.id;
        const isDriver = order.driver && order.driver.toString() === req.user.id;

        if (!isRestaurantOwner && !isDriver && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Validate status transition
        const validStatusTransitions = {
            pending: ['accepted', 'cancelled'],
            accepted: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['on_delivery'],
            on_delivery: ['delivered'],
            delivered: [],
            cancelled: []
        };

        if (!validStatusTransitions[order.status].includes(req.body.status)) {
            return res.status(400).json({ msg: 'Invalid status transition' });
        }

        // Update status
        order.status = req.body.status;

        // If status is accepted, set estimated delivery time
        if (req.body.status === 'accepted') {
            order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60000); // 45 minutes from now
        }

        // If status is on_delivery and no driver assigned, assign current user as driver
        if (req.body.status === 'on_delivery' && !order.driver && req.user.role === 'driver') {
            order.driver = req.user.id;
        }

        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
