// Please don't change the pre-written code
import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderedItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!shippingInfo || !Array.isArray(orderedItems) || orderedItems.length === 0 || !paymentInfo) {
      return next(new ErrorHandler(400, "Please provide shipping information, ordered items and payment information"));
    }

    const orderData = {
      shippingInfo,
      orderedItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: req.user._id,
      paidAt: Date.now(),
    };

    const newOrder = await createNewOrderRepo(orderData);
    return res.status(201).json({ success: true, order: newOrder, newOrder });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};
