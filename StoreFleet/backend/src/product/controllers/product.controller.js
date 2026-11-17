// Please don't change the pre-written code
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({ ...req.body, createdBy: req.user._id });
    if (!product) return next(new ErrorHandler(400, "Unable to create product"));
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { keyword, search, name, category, page = 1, limit = 10, minPrice, maxPrice } = req.query;
    const searchTerm = keyword || search || name;
    const filter = {};

    if (searchTerm && String(searchTerm).trim()) {
      filter.name = { $regex: String(searchTerm).trim(), $options: "i" };
    }
    if (category) filter.category = category;

    const priceFilter = {};
    const lowerPrice = minPrice ?? req.query["price[gte]"];
    const upperPrice = maxPrice ?? req.query["price[lte]"];
    if (lowerPrice !== undefined && lowerPrice !== "") priceFilter.$gte = Number(lowerPrice);
    if (upperPrice !== undefined && upperPrice !== "") priceFilter.$lte = Number(upperPrice);
    if (Object.keys(priceFilter).length) {
      if (Object.values(priceFilter).some((value) => !Number.isFinite(value))) {
        return next(new ErrorHandler(400, "Price filters must be valid numbers"));
      }
      filter.price = priceFilter;
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const [products, totalProducts] = await Promise.all([
      getAllProductsRepo(filter, skip, pageSize),
      getTotalCountsOfProduct(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      totalProducts,
      productsCount: totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
      pageSize,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (!updatedProduct) return next(new ErrorHandler(404, "Product not found!"));
    return res.status(200).json({ success: true, updatedProduct });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (!deletedProduct) return next(new ErrorHandler(404, "Product not found!"));
    return res.status(200).json({ success: true, deletedProduct });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (!productDetails) return next(new ErrorHandler(404, "Product not found!"));
    return res.status(200).json({ success: true, productDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (rating === undefined || !Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return next(new ErrorHandler(400, "Please provide a rating between 1 and 5"));
    }
    const product = await findProductRepo(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found!"));

    const review = { user: req.user._id, name: req.user.name, rating: Number(rating), comment };
    const existingIndex = product.reviews.findIndex((item) => item.user.toString() === req.user._id.toString());
    if (existingIndex >= 0) product.reviews.splice(existingIndex, 1, review);
    else product.reviews.push(review);

    product.rating = product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length;
    await product.save();
    return res.status(201).json({ success: true, msg: "Thank you for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found!"));
    return res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.query;
    if (!productId || !reviewId) {
      return next(new ErrorHandler(400, "Please provide productId and reviewId as query parameters"));
    }
    const product = await findProductRepo(productId);
    if (!product) return next(new ErrorHandler(404, "Product not found!"));

    const reviewIndex = product.reviews.findIndex((review) => review._id.toString() === reviewId.toString());
    if (reviewIndex < 0) return next(new ErrorHandler(404, "Review does not exist"));

    const reviewToDelete = product.reviews[reviewIndex];
    if (reviewToDelete.user.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler(403, "You can delete only your own review"));
    }

    product.reviews.splice(reviewIndex, 1);
    product.rating = product.reviews.length
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;
    await product.save();

    return res.status(200).json({
      success: true,
      msg: "Review deleted successfully",
      deletedReview: reviewToDelete,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};
