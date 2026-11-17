import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => new ProductModel(product).save();

export const getAllProductsRepo = async (filter = {}, skip = 0, limit = 10) =>
  ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

export const updateProductRepo = async (_id, updatedData) =>
  ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
  });

export const deleProductRepo = async (_id) => ProductModel.findByIdAndDelete(_id);
export const getProductDetailsRepo = async (_id) => ProductModel.findById(_id);
export const getTotalCountsOfProduct = async (filter = {}) => ProductModel.countDocuments(filter);
export const findProductRepo = async (productId) => ProductModel.findById(productId);
