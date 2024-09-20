import mongoose from "mongoose";

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  username: {
    type: String,
    trim: true,
    required: true,
    minlength: 4,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin", "owner"],
    default: "user",
  },
  accountStatus: {
    type: String,
    enum: ["active", "banned"],
    default: "active",
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.pre("save", function (next) {
  if (this.isModified("firstName")) {
    this.firstName = capitalize(this.firstName);
  }
  if (this.isModified("lastName")) {
    this.lastName = capitalize(this.lastName);
  }
  next();
});

export default mongoose.model("User", userSchema);
