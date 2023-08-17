import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Product() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedVendorOrders, setSelectedVendorOrders] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    axios.get('/api/vendors').then(response => {
      setVendors(response.data);
    });
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      axios.get(`/api/vendors?id=${selectedVendor}`).then(response => {
        setSelectedVendorOrders(response.data);
      });
    }
  }, [selectedVendor]);

  useEffect(() => {
    if (selectedVendorOrders.length > 0) {
      const productGroups = new Map();

      selectedVendorOrders.forEach(order => {
        if (order.cart_item) {
          order.cart_item.forEach(item => {
            if (item.product && item.product.name) {
              const productName = item.product.name;
              const itemCount = item.item_count;
              if (productGroups.has(productName)) {
                productGroups.set(productName, productGroups.get(productName) + itemCount);
              } else {
                productGroups.set(productName, itemCount);
              }
            }
          });
        }
      });

      setProductData(Array.from(productGroups.entries()));
    }
  }, [selectedVendorOrders]);

  const handleVendorSelect = event => {
    setSelectedVendor(event.target.value);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div>
        <h2>Product Data</h2>
        <select onChange={handleVendorSelect} value={selectedVendor}>
          <option value="">Select a vendor</option>
          {vendors.map(vendor => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </option>
          ))}
        </select>
        {productData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Total Item Count</th>
              </tr>
            </thead>
            <tbody>
              {productData.map(([productName, itemCount]) => (
                <tr key={productName}>
                  <td>{productName}</td>
                  <td>{itemCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {productData.length === 0 && <p>No product data available.</p>}
      </div>
    </main>
  );
}
