const express = require("express");
const router = express.Router();
const { logSleep, getWeeklySleep } = require("../controllers/sleep.controller");

router.post("/log", logSleep);                     //  POST: Log sleep entry
router.get("/weekly/:userId", getWeeklySleep);     //  GET: Return 7-day trend

module.exports = router;
