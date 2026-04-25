const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images (course thumbnails, avatars)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vedhaeduspark/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vedhaeduspark/pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const uploadPdf = multer({ storage: pdfStorage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

module.exports = { cloudinary, uploadImage, uploadPdf };
