const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./config/mongodb');
const redis = require('./config/redis');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Basic Metrics (Mock for demonstration, use prom-client in production)
app.get('/api/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP node_up Node availability\n# TYPE node_up gauge\nnode_up 1\n');
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n  SkillSphere server running at http://localhost:${PORT}\n`);
});
