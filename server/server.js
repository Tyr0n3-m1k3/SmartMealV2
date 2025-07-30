require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =============================================
// STATIC FILE SERVING (FIXED IMPLEMENTATION)
// =============================================
const rootDir = path.dirname(require.main.filename || process.mainModule.filename);

// Serve static files from client directory
const clientPath = path.join(rootDir, 'client');
app.use(express.static(clientPath));

// Serve admin files with proper path resolution
const adminPath = path.join(rootDir, 'admin');
app.use('/admin', express.static(adminPath, {
  index: false,
  extensions: ['html']
}));

// Explicit admin routes with error handling
app.get('/admin/login.html', (req, res, next) => {
  const loginPath = path.join(adminPath, 'login.html');
  res.sendFile(loginPath, (err) => {
    if (err) {
      console.error('Failed to send login.html:', err);
      next(err);
    }
  });
});

app.get('/admin', (req, res, next) => {
  const adminIndexPath = path.join(adminPath, 'index.html');
  res.sendFile(adminIndexPath, (err) => {
    if (err) {
      console.error('Failed to send admin index:', err);
      next(err);
    }
  });
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// =============================================
// ERROR HANDLING
// =============================================
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(clientPath, '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(clientPath, '500.html'));
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
