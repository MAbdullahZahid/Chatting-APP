// routes/chatRoutes.js
const router = require("express").Router();
const { getUserContacts } = require("../controllers/chatController");

router.get("/contacts/:userId", getUserContacts);

module.exports = router;
