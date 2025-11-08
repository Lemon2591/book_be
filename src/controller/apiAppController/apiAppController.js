const { ApiAppService } = require("../../service");
const { deToken } = require("../../helper/helper");

const ApiUpLoadFile = async (req, res) => {
  const files = req.files;
  const { data } = req.body;
  return ApiAppService.uploadFileService(files, data);
};

const getImage = async (req, res) => {
  const { page, limit } = req.query;
  return ApiAppService.getImageService(page, limit);
};

const loadData = async (req, res) => {
  return ApiAppService.loadData();
};

const getTrending = async (req, res) => {
  return ApiAppService.getTrendingService();
};

const getTop = async (req, res) => {
  const { page, limit } = req.query;
  return ApiAppService.getTopService(page, limit);
};

const getDetails = async (req, res) => {
  const { slug } = req.query;
  return ApiAppService.getDetailsService(slug);
};

const getSearch = async (req, res) => {
  const { key } = req.query;
  return ApiAppService.getSearchService(key);
};

const getChapter = async (req, res) => {
  const { slug, chapterId } = req.query;
  return ApiAppService.getChapterService(slug, chapterId);
};

const getFilterCategories = async (req, res) => {
  const { categories, page, limit } = req.query;
  return ApiAppService.getFilterCategoriesService(categories, page, limit);
};

const getSiteMap = async (req, res) => {
  return ApiAppService.getSiteMapService();
};

const unLock = async (req, res) => {
  return ApiAppService.unlockService(req.body, res);
};

module.exports = {
  ApiUpLoadFile,
  getImage,
  loadData,
  getTrending,
  getTop,
  getDetails,
  getSearch,
  getChapter,
  getFilterCategories,
  getSiteMap,
  unLock,
};
