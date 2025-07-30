require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path configuration
const projectRoot = path.resolve(__dirname);
const adminDir = path.join(projectRoot, 'admin');

// Verify admin directory exists
if (!fs.existsSync(adminDir)) {
  console.error('ERROR: Admin directory not found at:', adminDir);
  process.exit(1);
}

// Static file serving
app.use('/admin', express.static(adminDir));

// Admin routes
app.get('/admin/login.html', (req, res) => {
  const loginPath = path.join(adminDir, 'login.html');
  if (!fs.existsSync(loginPath)) {
    console.error('ERROR: login.html not found at:', loginPath);
    return res.status(404).send('Login page not found');
  }
  res.sendFile(loginPath);
});

app.get('/admin', (req, res) => {
  const indexPath = path.join(adminDir, 'index.html');
  res.sendFile(indexPath);
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Individual route imports (fixes the routes error)
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login.html`);
});
