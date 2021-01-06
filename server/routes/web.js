const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");
const config = require("config");
const crypto = require("crypto");
const Image = require("../model/image");
const { createConnection } = require("net");
const { RSA_NO_PADDING } = require("constants");

const db = config.get("mongoURL");

// get all images
router.get("/files", async (req, res) => {
    const images = await Image.find().sort({ date: -1 });
    res.status(200).json({ images });
});

// image uploading code
const conn = mongoose.createConnection(db, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

let gfs;

conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }

                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const newImage = new Image({
            address: req.file.filename,
            address_id: req.file.id,
        });
        const img = await newImage.save();
        res.status(201).json({
            file: req.file,
            msg: 'Image uploaded successfully',
            success: true
        })
    } catch (err) {
        res.status(400).send('Error in Image Uploading' + err)
    }
})

router.get('/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        
        if(!file || file.length === 0) {
            return res.json({
                sucess: false,
                msg: 'Image not found'
            })
        } 

        if(file.contentType === 'image/jpg' || file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readStream = gfs.createReadStream(file.filename)
            readStream.pipe(res)
        } else {
            res.json({
                success: false,
                msg: 'Not an Image'
            })
        }
    })
})

router.delete('/file/:id', async (req, res) => {
    let id = req.params.id
    let address_id = null
    
    const img = await Image.findById(id)
    address_id = img.address_id
    await img.remove().then(() => {
        gfs.remove({
            _id : address_id,
            root : 'uploads'
        }, (err, gridStore) => {
            if(err) {
                return res.json({
                    success: false,
                    msg: 'Image not found'
                })
            }

            res.json({
                success: true,
                msg : 'Image deleted successfully'
            })
        })
    }).catch(err => res.json({
        success: false,
        msg: 'Image not found'
    }))

})

module.exports = router;
