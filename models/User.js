const Mongoose = require("mongoose");
const UserSchema = Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "",
    },
    img: {
      type: String,
      default: "",
    },
    googleSignIn: { type: Boolean, required: true, default: false },
    podcasts: {
      type: [Mongoose.Schema.Types.ObjectId],
      ref: "Podcast",
      default: [],
    },
    favourites: {
      type: [Mongoose.Schema.Types.ObjectId],
      ref: "Podcast",
      default: [],
    },
  },
  { timestamps: true }
);

const User = Mongoose.model("User", UserSchema);
module.exports = { User };
