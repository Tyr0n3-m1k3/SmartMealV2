require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Added for file existence checking

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// ABSOLUTE PATH RESOLUTION
// =============================================
const projectRoot = path.resolve(__dirname);
const adminDir = path.join(projectRoot, 'admin');

// Debug: Verify paths
console.log('Project root:', projectRoot);
console.log('Admin directory:', adminDir);
console.log('Login.html exists:', fs.existsSync(path.join(adminDir, 'login.html')));

// =============================================
// STATIC FILE SERVING (SIMPLIFIED)
// =============================================
// Serve admin files
app.use('/admin', express.static(adminDir));

// Explicit route for admin login with existence check
app.get('/admin/login.html', (req, res) => {
  const loginPath = path.join(adminDir, 'login.html');
  
  if (!fs.existsSync(loginPath)) {
    console.error('ERROR: login.html not found at:', loginPath);
    return res.status(404).send('Login page not found');
  }

  res.sendFile(loginPath);
});

// Fallback for admin dashboard
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
// ROUTES
// =============================================
app.use('/api', require('./routes'));

// =============================================
// SERVER START
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login.html`);
});
