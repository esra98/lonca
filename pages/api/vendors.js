import {Vendor} from "@/models/Vendor";
import {Product} from "@/models/Product";
import {Order} from "@/models/Order";
import {mongooseConnect} from "@/lib/mongoose";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();

  if (method === 'GET') {
    if (req.query?.id) {
        try {
            const vendorId = req.query?.id; // Get the vendor ID from the query parameter
        
            // Find all orders where at least one cart_item has a product belonging to the given vendor
            const orders = await Order.find({
              'cart_item.product': { $in: await Product.find({ vendor: vendorId }).distinct('_id') },
            }).populate({
              path: 'cart_item.product',
              populate: { path: 'vendor' },
            });
        
            res.json(orders);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
          }
    } 
    else{
      res.json(await Vendor.find())
    }
    
  }  
}