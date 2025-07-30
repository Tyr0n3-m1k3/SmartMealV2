require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// STATIC FILE SERVING (SIMPLIFIED)
// =============================================
const adminDir = path.join(__dirname, '../admin'); // Points to /SmartMealV2/admin

// Serve all admin files (including login.html if it exists)
app.use('/admin', express.static(adminDir));

// Default admin route - serves index.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// =============================================
// DATABASE CONNECTION
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// =============================================
// ROUTES
// =============================================
// Import routes from /server/routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// =============================================
// ERROR HANDLING
// =============================================
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ==================================
  🚀 Server running on port ${PORT}
  ==================================
  Admin Dashboard:   http://localhost:${PORT}/admin
  API Health Check:  http://localhost:${PORT}/api/health
  `);
});
