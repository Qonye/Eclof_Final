const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image
const uploadImage = async (filePath, folder = 'eclof-submissions') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      cloudinaryId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function to delete image
const deleteImage = async (cloudinaryId) => {
  try {
    await cloudinary.uploader.destroy(cloudinaryId);
    console.log(`Image deleted from Cloudinary: ${cloudinaryId}`);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Helper function to upload signature
const uploadSignature = async (filePath, folder = 'eclof-signatures') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 200, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      cloudinaryId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary signature upload error:', error);
    throw new Error('Failed to upload signature to Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadSignature
};
