const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dob: { type: Date },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, unique: true },
  googleId: { type: String },
  profile: { type: String, default: "" }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;
