const express = require("express");
const { getUserController } = require("../controllers/userControllers");
const verifyToken = require("../middlewares/verifyToken");
const Router = express.Router();
Router.get("/", verifyToken, getUserController);

module.exports = Router;
