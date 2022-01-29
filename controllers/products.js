const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({});
  // .sort("-price name")
  // .select("name price");
  res.status(200).json({ products, nbHits: products.length });
};

const operatorMap = {
  ">": "$gt",
  ">=": "$gte",
  "<": "$lt",
  "<=": "$lte",
  "=": "$eq",
};
const NumericFilteringFields = ["price", "rating"];

const createSearchQueryObj = (query) => {
  const { name, featured, company, numericFilters } = query;
  const searchQueryObj = {};

  if (featured) {
    searchQueryObj.featured = featured === "true" ? true : false;
  }
  if (company) {
    searchQueryObj.company = company;
  }
  if (name) {
    searchQueryObj.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    let numFiltersStr = "";
    for (const prop in numericFilters) {
      if (numericFilters[prop] !== "")
        numFiltersStr += prop.toString() + numericFilters[prop] + ",";
    }
    //console.log(numFiltersStr);
    const regEx = /\b(<|<=|=|>=|>)\b/g;
    let filters = numFiltersStr.replace(
      regEx,
      (match) => `*${operatorMap[match]}*`
    );
    filter = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("*");
      if (NumericFilteringFields.includes(field)) {
        if (searchQueryObj.hasOwnProperty(field)) {
          searchQueryObj[field][operator] = Number(value);
        } else {
          searchQueryObj[field] = { [operator]: Number(value) };
        }
      }
    });
  }
  console.log(searchQueryObj);

  return searchQueryObj;
};

const getAllProducts = async (req, res) => {
  console.log(req.query);
  const { sort, fields } = req.query;
  const searchQueryObj = createSearchQueryObj(req.query);

  let resultQuery = Product.find(searchQueryObj);

  if (sort) {
    const sortList = sort.replace(",", " ");
    resultQuery = resultQuery.sort(sortList);
  } else {
    resultQuery = resultQuery.sort("createdAt");
  }

  if (fields) {
    const filedsList = fields.replace(",", " ");
    resultQuery = resultQuery.select(filedsList);
  }

  // number of page that is requested
  const page = Number(req.query.page) || 1;
  // how much products to return
  const limit = Number(req.query.limit);
  // how mush products to skip from the begining
  const skip = (page - 1) * limit;

  resultQuery = resultQuery.skip(skip).limit(limit);

  const products = await resultQuery;
  //return res.status(200).json({ nbHits: products.length, products });
  console.log(products.length);
  return res.render("index", { nbHits: products.length, products });
};

module.exports = {
  getAllProductsStatic,
  getAllProducts,
};
