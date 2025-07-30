require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// PATH CONFIGURATION (UPDATED FOR YOUR STRUCTURE)
// =============================================
const projectRoot = path.resolve(__dirname, '..'); // Go up one level from /server
const adminDir = path.join(projectRoot, 'admin'); // Points to /SmartMealV2/admin

console.log('Project root:', projectRoot);
console.log('Admin directory:', adminDir);
console.log('Login.html exists:', fs.existsSync(path.join(adminDir, 'login.html')));

// =============================================
// STATIC FILE SERVING
// =============================================
app.use('/admin', express.static(adminDir));

// Explicit admin routes
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

// =============================================
// DATABASE CONNECTION
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// =============================================
// ROUTES (UPDATED FOR YOUR STRUCTURE)
// =============================================
// Since your routes are in /server/routes
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login.html`);
  console.log(`Admin directory confirmed at: ${adminDir}`);
});
