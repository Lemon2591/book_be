const {
  Post,
  Website,
  Users,
  Category,
  Media,
  View,
  Genres,
  Stories,
  StoryGenres,
  Chapters,
} = require("../models");
const { Paging } = require("../helper/helper");
const axios = require("axios");
const { stringToSlug } = require("../libs/utils");
const fs = require("fs");
const path = require("path");
const { Op, where } = require("sequelize");
const { generateToken } = require("../libs/utils");

const uploadFileService = async (files, data) => {
  for (let item of files) {
    const filePath = `${process.env.API_SERVER}/storage/${item.filename}`;

    await Media.create({
      url: filePath,
      author: JSON.parse(data)?.author,
    });

    return {
      url: filePath,
    };
  }
};

const getImageService = async (page, limit) => {
  const paging = Paging(page, limit);

  const data = await Media.findAll({
    where: {
      is_delete: false,
    },
    ...paging,
  });

  const total = await Media?.count({
    where: {
      is_delete: false,
    },
  });
  return {
    data,
    total,
  };
};

const loadData = async () => {
  let count = 0;
  const response = await axios.get(
    "https://daotruyen.me/api/public/stories?pageNo=17&pageSize=8",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://daotruyen.me/",
      },
    }
  );
  const { data } = response;

  outerLoop: for (let val of data?.content) {
    count++;
    const des = val?.descriptions.map((val) => {
      const text = val?.replace("\r", "<br/>");
      return text;
    });
    const story = {
      user_id: 2,
      title: val?.story?.name,
      slug: val?.slug,
      description: des.join(""),
      author: val?.story?.authorName,
      cover_url: val?.imageSrc,
    };
    const imageUrl = `https://daotruyen.me${val?.imageSrc}`;
    // 👉 Lấy tên file từ URL gốc
    const fileName = path.basename(new URL(imageUrl).pathname);
    // 👉 Đường dẫn tuyệt đối để lưu file
    const savePath = path.join(
      __dirname,
      "../..",
      "static/img/stories",
      fileName
    );
    // 👉 Tạo thư mục nếu chưa có
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    // 👉 Kiểm tra nếu file đã tồn tại thì không tải lại
    if (fs.existsSync(savePath)) {
      console.log("⚠️ Ảnh đã tồn tại:", savePath);
      return `/img/stories/${fileName}`;
    }
    // 👉 Gửi request tải ảnh
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });
    // 👉 Ghi file ra ổ đĩa
    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    console.log("✅ Ảnh đã lưu:", savePath);
    const storyDB = await Stories.create(story, { raw: true });
    console.log("✅ Story đã được lưu");
    for (let i = 0; i < val?.categories?.length; i++) {
      const category = val?.categories[i];
      let slugConvert = stringToSlug(category);
      const categoryDB = await Genres.findOne({
        where: {
          slug: slugConvert,
        },
        raw: true,
      });
      if (!categoryDB) {
        console.log("❌ Không tìm thấy thể loại:", category);
        continue outerLoop; // ← bỏ qua story hiện tại, nhảy sang story kế tiếp
      }
      const storyGenresSave = {
        story_id: storyDB?.id,
        genre_id: categoryDB?.id,
      };

      const existed = await StoryGenres.findOne({
        where: storyGenresSave,
      });

      if (!existed) {
        await StoryGenres.create(storyGenresSave);
        console.log("✅ StoryGenres đã được lưu");
      }
    }

    for (let i = 0; i < val?.totalChapter; i++) {
      const chap = await axios.get(
        `https://daotruyen.me/api/public/v2/${val?.slug}/${i + 1}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "application/json, text/plain, */*",
            Referer: "https://daotruyen.me/",
          },
        }
      );
      const chapterData = chap?.data;
      const contentRemove = chapterData?.chapter?.paragraph?.replace(
        /\r?\n/g,
        "<br/>"
      );
      const chapterSave = {
        story_id: storyDB?.id,
        title: chapterData?.chapter?.title || "",
        slug: chapterData?.story?.url,
        content: contentRemove,
        order_number: i + 1,
      };
      await Chapters.create(chapterSave);
      console.log("✅ Chapters đã được lưu");
    }
    console.log("✅ Lưu xong");
    console.log("✅ Lưu xong vị bản số:", count);
    console.log("✅ ===========");
    console.log("✅ ===========");
    console.log("✅ ===========");
    console.log("✅ ===========");
  }
  return data;
};

const getTrendingService = async () => {
  const stories = await Stories.findAll({
    order: [["createdAt", "DESC"]],
    limit: 8,
    raw: true,
    attributes: ["id", "title", "slug", "cover_url", "createdAt"],
    where: { status: 5 },
  });

  const topStories = await Stories.findAll({
    attributes: [
      "id",
      "title",
      "slug",
      "cover_url",
      "views",
      "author",
      "createdAt",
    ],
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
    ],
    where: { status: 1 }, // chỉ lấy truyện đang hoạt động (nếu có)
    order: [["views", "DESC"]], // sắp xếp theo lượt xem
    limit: 18,
    nest: true,
  });

  const categories = await Genres.findAll({
    attributes: ["name", "slug"],
  });
  return { stories, topStories, categories };
};

const getTopService = async (page, limit) => {
  const paging = Paging(page, limit);

  const topData = await Stories.findAll({
    attributes: [
      "id",
      "title",
      "slug",
      "cover_url",
      "views",
      "author",
      "createdAt",
      "status",
    ],
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
    ],
    where: { status: 1 }, // chỉ lấy truyện đang hoạt động (nếu có)
    ...paging,
    nest: true,
    order: [["createdAt", "DESC"]],
  });

  const total = await Stories?.count({
    where: { status: 1 },
  });
  return { topData, total, page, limit };
};

const getDetailsService = async (slug) => {
  const details = await Stories.findOne({
    where: { status: { [Op.in]: [1, 5] }, slug: slug },
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id", "createdAt", "title", "order_number"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
      {
        model: Genres,
        as: "genres",
        attributes: ["name"],
        through: { attributes: [] }, // bỏ cột trung gian story_genres
      },
    ],
  });
  await Stories.increment("views", { where: { slug } });
  return details;
};

const getSearchService = async (keyword) => {
  const ids = new Set();
  const results = [];

  // Gần đúng
  const near = await Stories.findAll({
    where: {
      slug: { [Op.like]: `%${keyword}%` },
      status: 1,
    },
    attributes: ["id", "title", "slug", "cover_url", "views", "createdAt"],
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
    ],
  });
  for (let r of near) {
    if (!ids.has(r.id)) {
      ids.add(r.id);
      results.push(r);
    }
  }

  // LIKE mở rộng
  const parts = keyword.split("-").filter(Boolean);
  for (let part of parts) {
    const like = await Stories.findAll({
      where: {
        slug: { [Op.like]: `%${part}%` },
        id: { [Op.notIn]: [...ids] },
        status: 1,
      },
      attributes: ["id", "title", "slug", "cover_url", "views", "createdAt"],
      include: [
        {
          model: Chapters,
          as: "chapters",
          attributes: ["id"], // chỉ lấy id
          required: false, // vẫn lấy truyện dù chưa có chapter
        },
      ],
    });
    for (let r of like) {
      if (!ids.has(r.id)) {
        ids.add(r.id);
        results.push(r);
      }
    }
  }

  // Exact (từ khóa trùng khớp hoàn toàn)
  const exact = await Stories.findAll({
    where: { slug: keyword, status: 1 },
    attributes: ["id", "title", "slug", "cover_url", "views", "createdAt"],
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
    ],
  });
  for (let r of exact) {
    if (!ids.has(r.id)) {
      ids.add(r.id);
      results.push(r);
    }
  }

  return results;
};

const getChapterService = async (slug, chapterId) => {
  const details = await Stories.findOne({
    where: { status: 1, slug: slug },
    include: [
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id", "createdAt", "title", "order_number"], // chỉ lấy id
        required: false, // vẫn lấy truyện dù chưa có chapter
      },
      {
        model: Genres,
        as: "genres",
        attributes: ["name"],
        through: { attributes: [] }, // bỏ cột trung gian story_genres
      },
    ],
  });

  const chapter = await Chapters.findOne({
    where: { status: 1, id: chapterId, story_id: details?.id },
  });

  return { details: details, chapter: chapter };
};

const getFilterCategoriesService = async (slug, page, limit) => {
  if (!(page.trim() !== "" && !isNaN(page) && isFinite(Number(page)))) {
    throw new Error("Có lỗi xảy ra !");
  }
  if (limit > 12) {
    throw new Error("Có lỗi xảy ra !");
  }
  const paging = Paging(page, limit);

  const categoryId = await Genres.findOne({
    where: {
      slug: slug,
    },
    attributes: ["id", "name", "slug"],
    raw: true,
  });

  if (!categoryId) {
    return {};
  }
  const topStories = await Stories.findAll({
    attributes: [
      "id",
      "title",
      "slug",
      "cover_url",
      "views",
      "author",
      "createdAt",
    ],
    include: [
      {
        model: Genres,
        as: "genres",
        attributes: [],
        through: { attributes: [] },
        where: { id: categoryId?.id },
      },
      {
        model: Chapters,
        as: "chapters",
        attributes: ["id", "title", "order_number"],
        required: false, // vẫn lấy truyện chưa có chương
      },
    ],
    ...paging,
    where: { status: 1 }, // chỉ lấy truyện đang hoạt động (nếu có)
  });

  if (topStories?.length === 0) {
    throw new Error("Không có data!");
  }
  const total = await Stories?.count({
    where: { status: 1 },
    include: [
      {
        model: Genres,
        as: "genres",
        attributes: [],
        through: { attributes: [] },
        where: { id: categoryId?.id },
      },
    ],
  });

  return { categoryId, topStories, total };
};

const getSiteMapService = async (slug, page, limit) => {
  const slugCategory = await Genres.findAll({
    attributes: ["slug"],
  });
  const siteMapCategories = slugCategory?.map((val) => {
    return `/${val?.slug}`;
  });

  const slugStories = await Stories.findAll({
    where: { status: 1 },
    attributes: ["slug"],
    order: [["createdAt", "DESC"]],
  });

  const siteMapStories = slugStories?.map((val) => {
    return `/page/${val?.slug}`;
  });

  const slugChapter = await Chapters.findAll({
    where: { status: 1 },
  });

  const siteMapChapter = slugChapter?.map((val) => {
    return `/page/${val?.slug}/${val?.id}`;
  });

  const dataSiteMap = [
    ...siteMapStories,
    ...siteMapCategories,
    ...siteMapChapter,
  ];
  return dataSiteMap;
};

const unlockService = async (data, response) => {
  const tokenUnlock = { id: data?.timeUnlock };
  const token = await generateToken(tokenUnlock);
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
  response.cookie("unlock", token, config_cookie);

  return token;
};

module.exports = {
  uploadFileService,
  loadData,
  getTrendingService,
  getTopService,
  getDetailsService,
  getSearchService,
  getChapterService,
  getFilterCategoriesService,
  getSiteMapService,
  unlockService,
};
