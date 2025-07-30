
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
// Serve static files from the /public folder inside /server
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));

// Serve admin index directly for /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(staticPath, 'admin', 'index.html'));
});

// =============================================
// DATABASE CONNECTION
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

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
  🚀 Server running on http://localhost:${PORT}
  🔐 Admin Dashboard: http://localhost:${PORT}/admin/login.html
  `);
});
