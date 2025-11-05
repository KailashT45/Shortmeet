const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('📊 Using existing database connection');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI || MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>')) {
      console.log('⚠️  No valid MongoDB URI found in environment variables');
      console.log('⚠️  Database not available. App will work without persistence.');
      console.log('💡 To enable database:');
      console.log('   1. Create a MongoDB Atlas account at https://cloud.mongodb.com');
      console.log('   2. Create a cluster and get your connection string');
      console.log('   3. Update MONGODB_URI in server/config.env with your credentials');
      console.log('   4. Restart the server\n');
      isConnected = false;
      return;
    }

    console.log('📊 Connecting to MongoDB Atlas...');
    console.log('⏳ This may take a few moments...');

    // Increase timeout and add retry logic
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log('🎉 Room creation will now persist data!\n');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
      console.log('\n🔍 **MOST COMMON CAUSES & SOLUTIONS:**');
      console.log('1. **IP NOT WHITELISTED** (Most likely):');
      console.log('   • Go to: https://cloud.mongodb.com/v2#/security/network/accessList');
      console.log('   • Click "Add IP Address"');
      console.log('   • Add "0.0.0.0/0" (Allow from anywhere) or your specific IP');
      console.log('   • Wait 1-2 minutes, then restart server');

      console.log('\n2. **CLUSTER PAUSED**:');
      console.log('   • Check your Atlas dashboard');
      console.log('   • Resume cluster if paused');
      console.log('   • Free tier clusters auto-pause after inactivity');

      console.log('\n3. **CONNECTION STRING INCORRECT**:');
      console.log('   • Verify MONGODB_URI in server/config.env');
      console.log('   • Ensure username/password are correct');
      console.log('   • Make sure cluster name matches');
    }

    console.log('\n⚠️  Database not available. App will work without persistence.');
    console.log('💡 Room creation will work but data won\'t be saved.\n');

    // Don't crash the app if database is not available
    isConnected = false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('📊 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📊 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = { connectDB, isConnected: () => isConnected };
