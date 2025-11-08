const {
  Users,
  LoginStatus,
  UserRole,
  Role,
  UserWebsite,
  Website,
  Category,
} = require("../models");
const {
  generateOTP,
  sendMail,
  generateToken,
  generateRefreshToken,
  makeid,
  createFolder,
} = require("../libs/utils");

const { deToken } = require("../helper/helper");
const crypto = require("crypto-js");
const moment = require("moment");

const loginService = async (user_name, password, ip, response) => {
  let usernameRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!user_name?.trim() || !password?.trim()) {
    throw new Error("Vui lòng nhập tên tài khoản hoặc mật khẩu !");
  }

  if (!usernameRegex?.test(user_name)) {
    throw new Error("Tài khoản không hợp lệ !");
  }

  const res = await Users.findOne({
    where: {
      email: user_name,
    },
    raw: true,
  });
  if (!res) {
    throw new Error("Tài khoản hoặc mật khẩu không chính xác !");
  }

  var de_password = crypto.AES.decrypt(
    res?.password,
    process.env.HASH_SCRIPT
  ).toString(crypto.enc.Utf8);

  if (password?.toString() !== de_password?.toString()) {
    throw new Error("Tài khoản hoặc mật khẩu không chính xác !");
  }

  if (res?.is_delete === 1) {
    throw new Error("Tài khoản của bạn đã bị khoá, vui lòng liên hệ admin !");
  }

  const token = await generateToken(res);
  const refresh_token = await generateRefreshToken(res);

  await LoginStatus.create({
    user_id: res?.id,
    login_time: moment().format(),
    ip_login: ip,
  });

  const config_cookie =
    process.env.ENVIRONMENT === "production"
      ? {
          signed: true,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        }
      : {
          httpOnly: true,
        };
  response.cookie("auth_t", token, config_cookie);
  response.cookie("auth_r", refresh_token, config_cookie);
  response.status(200);
  return token;
};

const registerService = async (full_name, email, password, cPassword) => {
  if (!full_name || !email || !password || !cPassword) {
    throw new Error("Vui lòng nhập đầy đủ thông tin !");
  }

  if (password !== cPassword) {
    throw new Error("Mật khẩu xác nhận không trùng khớp!");
  }

  const existingUser = await Users.findOne({
    where: {
      email: email,
    },
    raw: true,
  });
  if (existingUser) {
    throw new Error("Địa chỉ email đã tồn tại !");
  }

  const pass_hash = crypto.AES.encrypt(
    password,
    process.env.HASH_SCRIPT
  ).toString();

  const OTP = generateOTP();
  const res = await Users.create({
    full_name: full_name,
    email: email,
    password: pass_hash,
    otp: OTP,
    expired: moment().format(),
  });

  await UserRole.create({
    user_id: res?.toJSON()?.id,
    role_id: 2,
  });

  await sendMail(email, OTP);
  return {
    email: email,
    step: "otp",
  };
};

const retryOTOService = async (id, email) => {
  const OTP = await generateOTP();
  await Users.update(
    {
      otp: OTP,
      expired: moment().format(),
    },
    {
      where: {
        email: email,
      },
      raw: true,
    }
  );

  await sendMail(email, OTP);

  return {
    otp: OTP,
  };
};

const veryOTOService = async (email, otp, ip, response) => {
  const data = await Users.findOne({
    where: {
      email: email,
    },
    raw: true,
  });

  const check_expired = (
    (moment() - moment(data?.expired)) /
    1000 /
    60
  ).toFixed();
  if (check_expired > 5) {
    throw new Error("Mã OTP đã hết hạn !");
  }

  if (data?.otp !== otp) {
    throw new Error("Mã OTP không chính xác !");
  }

  if (data?.is_active) {
    throw new Error("Tài khoản đã được xác minh OTP !");
  }

  await Users.update(
    {
      is_active: 1,
    },
    {
      where: {
        email: email,
      },
    }
  );

  const token = await generateToken(data);
  const refresh_token = await generateRefreshToken(data);

  await LoginStatus.create({
    user_id: data?.id,
    login_time: moment().format(),
    ip_login: ip,
  });

  const config_cookie =
    process.env.ENVIRONMENT === "production"
      ? {
          signed: true,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        }
      : {
          httpOnly: true,
        };
  response.status(200).cookie("auth_r", refresh_token, config_cookie);

  return token;
};

const getUser = async (auth_t) => {
  var decoded = await deToken(`Bearer ${auth_t}`);
  const user = await Users?.findOne({
    where: {
      id: decoded?.userID,
    },
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "password",
        "is_delete",
        "expired",
        "otp",
      ],
    },
    include: [
      {
        model: UserRole,
        as: "user_role",
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "user_id"],
        },

        include: [
          {
            model: Role,
            as: "role",
            attributes: {
              exclude: ["createdAt", "updatedAt", "id", "is_delete"],
            },
          },
        ],
      },
    ],
  });

  const websites = await UserWebsite.findAll({
    where: {
      user_id: decoded?.userID,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt", "user_id", "id"],
    },
    include: [
      {
        model: Website,
        as: "websites",
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "is_delete"],
        },
      },
    ],
  });

  const category_list = await Category?.findAll({
    where: {
      is_delete: false,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt", "is_delete"],
    },
  });

  return { ...user.toJSON(), websites: websites, category_list: category_list };
};

module.exports = {
  loginService,
  registerService,
  retryOTOService,
  veryOTOService,
  getUser,
};
