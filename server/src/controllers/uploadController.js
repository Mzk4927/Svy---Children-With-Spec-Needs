const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('file');

const uploadToCloudinary = (localFilePath) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload(
    localFilePath,
    {
      folder: 'special-needs-app/records',
      resource_type: 'image'
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );
});

exports.uploadImage = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    if (!isCloudinaryConfigured) {
      return res.json({ imageUrl: `/uploads/${req.file.filename}` });
    }

    try {
      const uploaded = await uploadToCloudinary(req.file.path);

      fs.unlink(req.file.path, () => {});

      return res.json({
        imageUrl: uploaded.secure_url,
        imagePublicId: uploaded.public_id
      });
    } catch (uploadError) {
      return next(uploadError);
    }
  });
};