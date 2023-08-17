import mongoose, {model, Schema, models} from "mongoose";

const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor', // This should match the name of your Vendor model
  },
});

export const Product = models.Product || model('Product', productSchema);
