const mongoose = require('mongoose');

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

mongoose.set('strictQuery', true);

let connection = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required and must not be empty.');
  }

  const connectionOptions = {
    autoIndex: false,
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  let attempt = 0;

  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      connection = await mongoose.connect(mongoUri, connectionOptions);

      console.log('MongoDB Atlas connected successfully');
      return connection;
    } catch (error) {
      attempt += 1;
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

      if (attempt >= MAX_RETRY_ATTEMPTS) {
        console.error('MongoDB connection failed after maximum retries');
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

const registerConnectionEvents = () => {
  const db = mongoose.connection;

  db.on('connected', () => {
    console.info('Mongoose default connection is open');
  });

  db.on('error', (error) => {
    console.error('Mongoose default connection error:', error);
  });

  db.on('disconnected', () => {
    console.warn('Mongoose default connection disconnected');
  });

  db.on('reconnected', () => {
    console.info('Mongoose default connection reconnected');
  });
};

const closeConnection = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.info('MongoDB connection closed');
};

const setupGracefulShutdown = () => {
  const shutdown = async (signal) => {
    console.info(`${signal} received. Closing MongoDB connection...`);
    try {
      await closeConnection();
    } catch (error) {
      console.error('Error during MongoDB shutdown:', error);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception detected. Closing MongoDB connection...', error);
    await shutdown('uncaughtException');
  });
  process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled promise rejection detected. Closing MongoDB connection...', reason);
    await shutdown('unhandledRejection');
  });
};

registerConnectionEvents();
setupGracefulShutdown();

connectDB.closeConnection = closeConnection;

module.exports = connectDB;
