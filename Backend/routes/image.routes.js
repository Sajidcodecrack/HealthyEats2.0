const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadImage } = require("../controllers/image.controller");

const storage = multer.memoryStorage(); // store in memory
const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
