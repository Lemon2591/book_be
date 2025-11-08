const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const generateToken = async (result) => {
  const accessToken = await jwt.sign(
    { userID: result.id },
    process.env.JWT_ACCESS_KEY,
    { expiresIn: "10m" }
  );
  return accessToken;
};

const generateRefreshToken = async (result) => {
  const refreshToken = await jwt.sign(
    { userID: result.id },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: "30d" }
  );
  return refreshToken;
};

const generateOTP = () => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const sendMail = async (emailReceiver, OTP) => {
  let config = {
    service: "gmail",
    auth: {
      user: "lemondev.id.vn@gmail.com",
      pass: "tkgy snwr nccq gutq",
    },
  };
  let transporter = await nodemailer.createTransport(config);
  let message = {
    from: "lemondev.id.vn@gmail.com",
    to: emailReceiver,
    subject: "Xác minh địa chỉ email của bạn",
    html: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    
      <p style="font-family: 'Roboto', sans-serif; font-weight: 600; text-align: center; margin-top: 24px">Xác minh địa chỉ email của bạn</p>
    
    <p style="font-family: 'Roboto'; font-size: 12px; line-height: 18px;margin-bottom: 42px; text-align: center">Cảm ơn bạn đã bắt đầu quá trình tạo tài khoản LemonCloud mới. Chúng tôi muốn đảm bảo rằng đó thực sự là bạn. Vui lòng nhập mã xác minh sau đây khi được nhắc. Nếu bạn không muốn tạo tài khoản này, vui lòng bỏ qua thông báo này.</p>
    <p style="font-family: 'Roboto'; text-align:center; font-weight: 600; margin:5px 0px; font-size: 12px ">Mã xác minh</p>
    <p style="font-family: 'Roboto'; text-align:center; font-weight: 600; font-size: 24px; margin:8px 0px">${OTP}</p>
    
    <p style="font-family: 'Roboto';font-size: 12px;margin-top: 24px">Lemon Cloud<br>Copy right: https://lemondev.id.vn</p>`,
  };
  try {
    return await transporter.sendMail(message);
  } catch (error) {
    throw new Error(error);
  }
};

const makeid = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const createFolder = async (name) => {
  const folderName = path.join(__dirname, `../../static/storage/${name}`);
  try {
    if (!fs.existsSync(folderName)) {
      return fs.mkdirSync(folderName);
    }
  } catch (err) {
    return err;
  }
};

const stringToSlug = (string) => {
  const a =
    "àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;";
  const b =
    "aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");
  return string
    .toString()
    .toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a")
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e")
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, "i")
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o")
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u")
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y")
    .replace(/đ/gi, "d")
    .replace(/\s+/g, "-")
    .replace(p, (c) => b.charAt(a.indexOf(c)))
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateOTP,
  sendMail,
  makeid,
  createFolder,
  stringToSlug,
};
