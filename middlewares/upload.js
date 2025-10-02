const multer = require("multer");
const path = require("path");

// simpan file ke folder uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // contoh: 1696354920.jpg
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
