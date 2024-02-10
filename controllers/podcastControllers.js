const createError = require("../error");
const { Episode } = require("../models/Episodes");
const { Podcast } = require("../models/Podcasts");
const { User } = require("../models/User");

const createPodcast = async (req, res, next) => {
  // console.log("Func call hua");
  // console.log("req", req);
  try {
    const user = await User.findById(req.user.id);
    let totalEpisodes = [];
    await Promise.all(
      req.body.episodes.map(async (item) => {
        const episode = new Episode({ creator: user.id, ...item });
        const savedEpisode = await episode.save();
        totalEpisodes.push(savedEpisode._id);
      })
    );
    // console.log(totalEpisodes);
    const podcast = new Podcast({
      creator: user.id, // Assign the creator field
      episodes: totalEpisodes,
      name: req.body.name,
      desc: req.body.desc,
      thumbnail: req.body.thumbnail,
      tags: req.body.tags,
      type: req.body.type,
      category: req.body.category,
    });

    const savedPodcast = await podcast.save();

    await User.findByIdAndUpdate(
      user.id,
      {
        $push: { podcasts: savedPodcast.id },
      },
      { new: true }
    );
    res.status(201).json(savedPodcast);
  } catch (error) {
    // console.log("Error aaya");
    next(error);
  }
};

const addEpisodes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    await Promise.all(
      req.body.episodes.map(async (item) => {
        const episode = new Episode({
          creator: user.id,
          ...item,
        });
        const savedEpisode = episode.save();

        await Podcast.findByIdAndUpdate(
          req.body.podid,
          {
            $push: { episodes: savedEpisode._id },
          },
          { new: true }
        );
      })
    );
    res.status(201).json({ message: "Episode Added Successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find()
      .populate("creator", "name img")
      .populate("episodes");
    res.status(200).json(podcasts);
  } catch (error) {
    next(error);
  }
};

const getPodcastById = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate("creator", "name img")
      .populate("episodes");
    res.status(200).json(podcast);
  } catch (error) {
    next(error);
  }
};

const addFavorites = async (req, res, next) => {
  // console.log(req.body);
  try {
    const user = await User.findById(req.user.id);
    const podcast = await Podcast.findById(req.body.id);
    // console.log("user", user);
    // console.log("podcast", podcast);
    let found = false;
    // console.log(user?.id);
    // console.log(podcast?.creator);
    if (user?.id == podcast?.creator) {
      return next(createError(403, "You can't favorit your own podcast!"));
    }
    // console.log("user", user);
    // console.log("user favorites", user?.favourites);

    await Promise?.all(
      user?.favourites?.map(async (item) => {
        if (req.body.id == item) {
          //remove from favorite
          found = true;
          // console.log("this");
          await User.findByIdAndUpdate(
            user?.id,
            {
              $pull: { favourites: req.body.id },
            },
            { new: true }
          );
          res.status(200).json({ message: "Removed from favourites" });
        }
      })
    );
    if (!found) {
      await User.findByIdAndUpdate(
        user?.id,
        {
          $push: { favourites: req.body.id },
        },
        { new: true }
      );
      res.status(200).json({ message: "Added to favorites" });
    }
  } catch (error) {
    next(error);
  }
};

const addOrView = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Podcast.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });
    res.status(201).json({ message: "Veiwed By You" });
  } catch (error) {
    next(error);
  }
};

// search Podcasts

const random = async (res, req, next) => {
  try {
    const podcasts = await Podcast.aggregate([{ $sample: { size: 40 } }])
      .populate("creator", "name img")
      .populate("episodes");
    res.status(200).json(podcasts);
  } catch (error) {
    next(error);
  }
};
const mostPopular = async (req, res, next) => {
  try {
    const podcast = await Podcast.find()
      .sort({ views: -1 })
      .populate("creator", "name img")
      .populate("episodes");
    res.status(200).json(podcast);
  } catch (error) {
    next(error);
  }
};
const getByTag = async (req, res, next) => {
  const tag = req.query.tags.split(",");
  try {
    const podcast = await Podcast.find({ tags: { $in: tag } })
      .populate("creator", "name img")
      .populate("episodes");
    return res.status(200).json(podcast);
  } catch (error) {
    next(error);
  }
};

const getByCategory = async (req, res, next) => {
  const query = req.query.q;
  try {
    const podcast = await Podcast.find({
      category: { $regex: query, $options: "i" },
    })
      .populate("creator", "name img")
      .populate("episodes");
    return res.status(200).json(podcast);
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  const query = req.query.q;
  // console.log(query);
  try {
    const podcast = await Podcast.find({
      name: { $regex: query, $options: "i" },
    })
      .populate("creator", "name img")
      .populate("episodes");
    return res.status(200).json(podcast);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createPodcast,
  addEpisodes,
  getAllPodcasts,
  getPodcastById,
  addFavorites,
  addOrView,
  random,
  mostPopular,
  getByTag,
  getByCategory,
  search,
};
