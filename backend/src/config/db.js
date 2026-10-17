const mongoose = require('mongoose');

const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI || 'mongodb://localhost:27017/college_review_db';
  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = {
  connectDB,
  disconnectDB,
};
