const express = require("express");
const router = express.Router();
const { setWaterGoal, updateIntake, getWaterStatus } = require("../controllers/water.controller");

router.post("/set", setWaterGoal);              // Set target + reminder
router.patch("/update", updateIntake);          // Manually add intake
router.get("/status/:userId", getWaterStatus);  // Get current intake

module.exports = router;
