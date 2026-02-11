const express = require("express");
const router = express.Router();
const {
  getAllContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  assignContact,
} = require("../controllers/contactController");

const { protect, restrictedTo } = require("../middlewares/auth");
router.use(protect);

router.route("/").get(getAllContacts).post(createContact);
router.patch("/:id/assign", restrictedTo("owner", "admin"), assignContact);

router
  .route("/:id")
  .get(getContact)
  .patch(updateContact)
  .delete(restrictedTo("owner", "admin"), deleteContact);
