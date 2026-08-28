import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  bodyParser.json({
    limit: '30mb',
    extended: true,
  })
);

app.use(
  bodyParser.urlencoded({
    limit: '30mb',
    extended: true,
  })
);

app.use(cors());

// ======================================================
// ROUTES
// ======================================================

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/projects',
  projectRoutes
);

app.use('/api/comments', commentRoutes);

app.use(
  '/api/notifications',
  notificationRoutes
);

// ======================================================
// BASIC HEALTH CHECK
// ======================================================

app.get(
  '/',
  (req, res) => {
    res.send(
      'PeerProjectHub API is running'
    );
  }
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req, res) => {
    res.status(404).json({
      message: 'Route not found',
    });
  }
);

// ======================================================
// CENTRAL ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
      message:
        'Something went wrong',
      error: err.message,
    });
  }
);

// ======================================================
// DATABASE
// ======================================================

const CONNECTION_URL =
  process.env.MONGO_URI;

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL)
  .then(() => {
    app.listen(
      PORT,
      () => {
        console.log(
          `Server Running on Port: http://localhost:${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error
    );
  });