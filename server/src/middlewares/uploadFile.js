const multer = require("multer");

exports.uploadFile = (imageFile) => {
  //init storage (destination upload & filename)
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s/g));
    },
  });

  //filter file (only image)
  const fileFilter = function (req, file, cb) {
    if (file.filename === imageFile) {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {
          message: "Only image files are allowed!",
        };
        return cb(new Error("Only image files are allowed!"));
      }
    }
    cb(null, true);
  };

  //limit max size file upload
  const maxSize = 10 * 1000 * 1000; //10MB

  //
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(imageFile);

  //
  return (req, res, next) => {
    upload(req, res, function (err) {
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      if (!req.file && !err) {
        return res.status(400).send({
          message: "please select files to upload",
        });
      }

      if (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            message: "Max file sized 10Mb",
          });
        }
        return res.status(400).send(err);
      }

      return next();
    });
  };
};
