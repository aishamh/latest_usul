const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory not found. Please run the build command first.');
  console.error('Available files:', fs.readdirSync(__dirname));
  process.exit(1);
}

console.log(`✓ Found dist directory at: ${distPath}`);
console.log(`✓ Dist contents:`, fs.readdirSync(distPath));

// Serve static files from dist directory
app.use(express.static(distPath));

// Handle client-side routing - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Skip if it's a health check or API route
  if (req.path === '/health') {
    return next();
  }
  
  // Check if it's a static file request
  if (req.path.includes('.') && !req.path.includes('/')) {
    return next();
  }
  
  // For all other routes, serve index.html (client-side routing)
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Application not built properly' });
  }
});

// Start server on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});