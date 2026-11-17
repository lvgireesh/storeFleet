import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data) => new OrderModel(data).save();
