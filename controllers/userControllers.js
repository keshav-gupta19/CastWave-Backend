const { User } = require("../models/User");

const getUserController = async (req, res, next) => {
  // console.log("id", req);
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "podcasts",
        populate: {
          path: "creator",
          select: "name img",
        },
      })
      .populate({
        path: "favourites",
        populate: {
          path: "creator",
          select: "name img",
        },
      });
    res.status(200).json(user);
  } catch (error) {
    // console.log(req.user);
    next(error);
  }
};

module.exports = { getUserController };
