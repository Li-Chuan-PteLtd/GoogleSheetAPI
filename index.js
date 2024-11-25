import express from 'express';
import sheetsRouter from './src/routes/sheets.js';

const app = express();

// Try different ports starting from 3000
const tryPort = async (startPort) => {
  for (let port = startPort; port < startPort + 10; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port)
          .once('listening', () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
            console.log(`📝 Try accessing: http://localhost:${port}/sheets to get sheet data`);
            resolve();
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.log(`Port ${port} is busy, trying next port...`);
              server.close();
              resolve(false);
            } else {
              reject(err);
            }
          });
      });
      break;
    } catch (error) {
      console.error('Server error:', error);
      if (port === startPort + 9) {
        throw new Error('Could not find an available port');
      }
    }
  }
};

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Mount the sheets router
app.use('/sheets', sheetsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start the server
tryPort(3000).catch(error => {
  console.error('Failed to start server:', error);
});
