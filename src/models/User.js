const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const SALT_ROUNDS = 12;
const roles = ['member', 'librarian'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email must be valid'],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: roles,
      default: 'member',
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function save() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatch = async function (candidatePassword) {
  if (!candidatePassword) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const object = this.toObject();
  delete object.password;
  return object;
};

module.exports = mongoose.model('User', userSchema);
