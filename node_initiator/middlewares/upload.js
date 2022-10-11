const multer = require('multer');

// handle storage using multer
const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads');
  },
});

const upload = multer({ storage }).single('researchCoordinatorFile');

exports.upload = upload;
