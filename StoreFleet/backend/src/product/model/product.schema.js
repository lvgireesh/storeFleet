import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "product name is required"], trim: true },
    description: { type: String, required: [true, "product description is required"], minLength: [10, "product description should be at least 10 characters long"] },
    price: { type: Number, required: [true, "product price is required"], min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    images: [{
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    }],
    category: {
      type: String,
      required: [true, "product category is required"],
      enum: ["Mobile", "Electronics", "Clothing", "Home & Garden", "Automotive", "Health & Beauty", "Sports & Outdoors", "Toys & Games", "Books & Media", "Jewelry", "Food & Grocery", "Furniture", "Shoes", "Pet Supplies", "Office Supplies", "Baby & Kids", "Art & Collectibles", "Travel & Luggage", "Music Instruments", "Electrical Appliances", "Handmade Crafts"],
    },
    stock: { type: Number, required: [true, "product stock is mandatory"], min: 0, default: 1 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: String,
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
