const Mongoose = require("mongoose");

const EpisodeSchema = Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    creator: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "audio",
    },
    duration: {
      type: String,
      default: "",
    },
    file: {
      type: String,
      default: "",
    },
  },
  {
    timeStamps: true,
  }
);

const Episode = Mongoose.model("Episode", EpisodeSchema);

module.exports = { Episode };
