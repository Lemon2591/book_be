const multer = require("multer");
const pathFile = require("path");

const formatNameFile = (name) => {
  if (!name) return "";
  return `${name}`.replace(/[^a-zA-Z0-9. ]/g, "").replace(/ /g, "_");
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      cb(null, pathFile.join(__dirname, `../../static/storage`));
    } catch (error) {
      return { message: "Có lỗi xảy ra !" };
    }
  },
  filename: (req, file, cb) => {
    const uploadedFileName = `${Date.now()}-${formatNameFile(
      file.originalname
    )}`;
    cb(null, uploadedFileName);
  },
});

const uploadImageFile = multer({
  storage,
  fileFilter: function (req, file, callback) {
    var ext = pathFile.extname(file.originalname).toLowerCase();

    if (
      ![
        ".svg",
        ".webp",
        ".jpeg",
        ".jpg",
        ".png",
        ".mp4",
        ".mov",
        ".SVG",
        ".WEBP",
        ".JPEG",
        ".JPG",
        ".PNG",
        ".MP4",
        ".MOV",
        ".MP3",
        ".mp3",
      ].includes(ext)
    ) {
      return callback(new Error("Định dạng không được hỗ trợ !"));
    }
    callback(null, true);
  },
});

module.exports = {
  uploadImageFile,
};
