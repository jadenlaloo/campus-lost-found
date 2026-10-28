const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });