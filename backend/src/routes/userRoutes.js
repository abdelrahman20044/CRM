const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
} = require("../controllers/userController");
const { protect, restrictedTo } = require("../middlewares/auth");

router.use(protect);

router.use(restrictedTo("owner", "admin"));

router.route("/").get(getAllUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(restrictedTo("owner"), deleteUser);

router.patch("/:id/activate", activateUser);

module.exports = router;
