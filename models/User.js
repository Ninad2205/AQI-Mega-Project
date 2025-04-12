// // models/User.js

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   emailId: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   mobileNumber: {
//     type: String,
//     required: true
//   },
//   organizationName: {
//     type: String,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  emailId: String,
  password: String,
  mobileNumber: String,
  organizationName: String
});

module.exports = mongoose.model('User', userSchema);
