const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const {
  createPodcast,
  addEpisodes,
  addFavorites,
  addOrView,
  getAllPodcasts,
  getPodcastById,
  mostPopular,
  random,
  getByTag,
  getByCategory,
  search,
} = require("../controllers/podcastControllers");

const Router = express.Router();

Router.post("/", verifyToken, createPodcast);
Router.get("/", getAllPodcasts);

Router.get("/get/:id", getPodcastById);

Router.post("/episode", verifyToken, addEpisodes);

Router.post("/favorites", verifyToken, addFavorites);

Router.post("/addorview/:id", addOrView);

// search Routes
Router.get("/mostpopular", mostPopular);
Router.get("/random", random);
Router.get("/tags", getByTag);
Router.get("/category", getByCategory);
Router.get("/search", search);
module.exports = Router;
