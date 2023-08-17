import mongoose, {model, Schema, models} from "mongoose";

const vendorSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  });
  
  export const Vendor = models.Vendor || model('Vendor', vendorSchema);