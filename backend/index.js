const express = require('express')
const app = express()
const db = require('./config/db.js')
const dotenv = require("dotenv")
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();
app.use(cors());
db();

const port = process.env.PORT

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Ensure the uploads directory exists
const ensureUploadsDirectoryExists = () => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Call this to create the directory if it doesn't exist
ensureUploadsDirectoryExists();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        ensureUploadsDirectoryExists(); // Ensure the directory exists before saving the file
        cb(null, path.join(__dirname, "uploads")); // Use absolute path
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("file"), (req, res) => {
    res.sendStatus({ filePath: `/uploads/${req.file.filename}` });
});

app.use("/api/auth", require("./routes/Auth.js"));
app.use("/api/post", upload.array("image"), require('./routes/Post.js'))
app.use("/api/user", upload.array("image"), require('./routes/User.js'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})