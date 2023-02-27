const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');

const uploadPictureToCloudinary = async(files) => {

    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await files.mv(photoPath);

    if(!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        fs.unlinkSync(photoPath);
        return resultCloudinary;
    }

    fs.unlinkSync(photoPath);
    return;
};

module.exports = {
    uploadPictureToCloudinary
}