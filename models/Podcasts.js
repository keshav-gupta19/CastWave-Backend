const Mongoose = require("mongoose");

const PodcastSchema = Mongoose.Schema(
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
    tags: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      default: "audio",
    },
    category: {
      type: String,
      default: "podcast",
    },
    views: {
      type: Number,
      default: 0,
    },
    episodes: {
      type: [Mongoose.Schema.Types.ObjectId],
      ref: "Episode",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Podcast = Mongoose.model("Podcast", PodcastSchema);

module.exports = { Podcast };
