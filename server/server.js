require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added for file paths
const bodyParser = require('body-parser');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =============================================
// STATIC FILE SERVING (CRITICAL FIX)
// =============================================
// Serve customer frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Serve admin dashboard files
app.use('/admin', express.static(path.join(__dirname, '../admin'), { 
  index: false // Disable automatic index.html serving
});

// Explicit route for admin login page
app.get('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/login.html'));
});

// Fallback for admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// =============================================
// DATABASE CONNECTION
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmeal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// =============================================
// ROUTES
// =============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// =============================================
// ERROR HANDLING
// =============================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
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
  Customer Frontend: http://localhost:${PORT}
  Admin Dashboard:   http://localhost:${PORT}/admin
  Admin Login:       http://localhost:${PORT}/admin/login.html
  API Health Check:  http://localhost:${PORT}/api/health
  `);
});
