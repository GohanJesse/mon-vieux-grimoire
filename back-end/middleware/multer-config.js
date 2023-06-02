const  multer = require('multer');
const sharp = require('sharp');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const storage = multer.memoryStorage();

const multerUpload = multer({ storage });

const fileUpload = multerUpload.single('image');

const compress = (req, res, next) => {
    fileUpload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return next(err);
        } else if (err) {
            return next(err);
        }
        
        if (req.file) {
            const buffer = req.file.buffer;
            const originalName = req.file.originalname.split('.').slice(0, -1).join('_');
            const timestamp = Date.now().toString();
            const extension = 'webp'; 
            const filename = `${originalName}_${timestamp}.${extension}`;
            
            await sharp(buffer)
                .resize(360)
                .webp({ quality: 30 })
                .toFile(`./images/${filename}`)
                .catch(err => {
                    console.log(err);
                });

            req.file = {
                ...req.file,
                destination: './images',
                filename,
                path: `./images/${filename}`,
            }
        }
        
        next();
        console.log('compression faite !');
    });
};

module.exports = compress;

