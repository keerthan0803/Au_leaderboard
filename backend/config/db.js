const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MongoDB Atlas IP whitelist settings');
    console.error('2. Database user credentials');
    console.error('3. Network/Firewall settings');
    console.error('4. Internet connection');
    process.exit(1);
  }
};

module.exports = connectDB;
