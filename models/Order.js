import mongoose, {model, Schema, models} from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  variantId: mongoose.Schema.Types.ObjectId,
  series: String,
  item_count: Number,
  quantity: Number,
  cogs: Number,
  price: Number,
  vendor_margin: Number,
  order_status: String,
});

const orderSchema = new mongoose.Schema({
  cart_item: [cartItemSchema],
  payment_at: Date,
});

export const Order = models.Order || model('Order', orderSchema);


