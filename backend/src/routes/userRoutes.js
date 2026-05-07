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
const validate = require("../middlewares/validate");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validators/userValidator");

router.use(protect);

router.use(restrictedTo("owner", "admin"));

router
  .route("/")
  .get(getAllUsers)
  .post(validate(createUserSchema), createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(validate(updateUserSchema), updateUser)
  .delete(restrictedTo("owner"), deleteUser);

router.patch("/:id/activate", activateUser);

module.exports = router;
