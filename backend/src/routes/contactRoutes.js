const express = require("express");
const router = express.Router();
const {
  getAllContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  assignContact,
  // getContactStats,
} = require("../controllers/contactController");

const { protect, restrictedTo } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createContactSchema,
  updateContactSchema,
  assignContactSchema,
} = require("../validators/contactValidator");

router.use(protect);

router
  .route("/")
  .get(getAllContacts)
  .post(validate(createContactSchema), createContact);

router.patch(
  "/:id/assign",
  restrictedTo("owner", "admin"),
  validate(assignContactSchema),
  assignContact,
);

router
  .route("/:id")
  .get(getContact)
  .patch(validate(updateContactSchema), updateContact)
  .delete(restrictedTo("owner", "admin"), deleteContact);

module.exports = router;
