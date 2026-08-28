import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// =========================================================
// TEST CLOUDINARY CONNECTION
// =========================================================

cloudinary.api
  .ping()
  .then((result) => {
    console.log(
      'Cloudinary connection:',
      result
    );
  })
  .catch((error) => {
    console.error(
      'Cloudinary connection error:',
      error
    );
  });

export default cloudinary;