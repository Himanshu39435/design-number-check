import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import designRoutes from './routes/designRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Narang Textile API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected successfully');

    const server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${env.port} is already in use. Stop the existing server or set a different PORT.`);
      } else {
        console.error('Failed to start the HTTP server', error);
      }
      await mongoose.disconnect();
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();
