import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Inter } from 'next/font/google';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Import the entire Chart.js library
const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedVendorOrders, setSelectedVendorOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [chartData, setChartData] = useState({});
  
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    axios.get('/api/vendors').then(response => {
      setVendors(response.data);
    });
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      axios.get('/api/vendors?id=' + selectedVendor).then(response => {
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

  useEffect(() => {
    const groupOrdersByMonth = () => {
      if (selectedVendorOrders && selectedVendorOrders.length > 0) {
        const grouped = {};
        selectedVendorOrders.forEach(order => {
          const paymentDate = new Date(order.payment_at);
          const yearMonth = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
          if (!grouped[yearMonth]) {
            grouped[yearMonth] = [];
          }
          grouped[yearMonth].push(order);
        });

        // Sort the months chronologically
        const sortedMonths = Object.keys(grouped).sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA - dateB;
        });

        setGroupedOrders(grouped);

        // Prepare chart data
        const orderCounts = sortedMonths.map(month => grouped[month].length);

        setChartData({
          labels: sortedMonths, // Set sorted months as labels
          datasets: [
            {
              label: 'Number of Orders',
              data: orderCounts,
              backgroundColor: 'rgba(75,192,192,0.6)',
            },
          ],
        });
      }
    };

    groupOrdersByMonth();
  }, [selectedVendorOrders]);

  const handleVendorSelect = (event) => {
    setSelectedVendor(event.target.value);
  };

  return (
    <main className="pb-24 bg-opacity-100 bg-white">
          <header className="bg-blend-darken bg-no-repeat bg-center bg-cover bg-[url(https://media.istockphoto.com/id/929697584/photo/clothing-on-hanger-at-the-trendy-shop-boutique.jpg?s=612x612&w=0&k=20&c=Grv0jvglBQpMAn_3wsVTSBipkLwVwVnpukccsxIEnaM=)] w-full relative h-96">
            <div className="bg-opacity-50 bg-black w-full h-full left-0 top-0 absolute"></div>
            <div className="pl-4 pr-4 -translate-x-1/2 transform translate-y-[-50%] rotate-0 skew-x-0 skew-y-0 scale-x-1 scale-y-1 max-w-screen-xl w-full mx-auto left-1/2 top-20 absolute">
              <span></span>
            </div>
          </header>
          <div className="bg-opacity-100 bg-[rgb(31 41 55/var(--tw-bg-opacity))] p-5 md:px-20 mx-auto my-[-8rem] rounded-[0.25rem] justify-between flex z-20 relative">
            <article className="lg:flex w-full px-2 py-5 md:p-10 shadow text-base rounded-md leading-tight max-w-none bg-white">
              <div className="md:w-full lg:w-1/2">
                <h1 className="text-2xl leading-9 font-semibold text-green-800 mb-5">Search on Lonca</h1>
                <select className='inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50' onChange={handleVendorSelect} value={selectedVendor}>
        <option value="">Select a vendor</option>
        {vendors?.length > 0 &&
          vendors.map(vendor => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </option>
          ))}
      </select>
      {selectedVendor && (
        <div className='mt-5'>
          {chartData.labels && chartData.labels.length > 0 && (
            <div>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      type: 'linear',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Orders',
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Month',
                      },
                    },
                  },
                  xAxes: [
                    {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      )}
      
        {!selectedVendor && <p className='mt-10'>Please choose a vendor.</p>}
        {selectedVendor && productData.length === 0 && <p>No product data available.</p>}
                
              </div>
              <div className="md:w-full lg:w-1/2">
                <div className="p-0 lg:p-10 lg:pt-0">
                  {productData.length !== 0 &&(
                    <h4 className="font-bold leading-5 mb-4 mt-10 text-green-800 lg:mt-0">
                  Parent Product Details
                  </h4>
                  )}
                  
                  {productData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Total Items Sold</th>
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
                </div>
              </div>
            </article>
            <aside>

            </aside>
          </div>
        </main>
  );
}
