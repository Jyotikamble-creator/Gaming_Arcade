const mongoose = require('mongoose')
module.exports = async function connectDB(uri){
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch(e){
    console.error('DB connect error', e);
    process.exit(1);
  }
}
