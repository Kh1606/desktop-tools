// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Allow requests from anywhere (for local test)
app.use(cors());

// Set up storage in uploads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Create uploads folder if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// File upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded!' });
  }
  res.json({ message: 'File uploaded!', filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
