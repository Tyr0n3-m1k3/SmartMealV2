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
// STATIC FILE SERVING
// =============================================
// Serve everything in /public folder
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Optional: fallback route for /admin to serve admin index
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

// =============================================
// DATABASE CONNECTION
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// =============================================
// ROUTES
// =============================================
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
