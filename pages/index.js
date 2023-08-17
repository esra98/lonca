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
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <select onChange={handleVendorSelect} value={selectedVendor}>
        <option value="">Select a vendor</option>
        {vendors?.length > 0 &&
          vendors.map(vendor => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </option>
          ))}
      </select>
      {selectedVendor && (
        <div>
          <h3>Selected Vendor:</h3>
          <p>{selectedVendor}</p>
          <h3>Orders for {selectedVendor}</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedOrders).map(yearMonth => (
                <tr key={yearMonth}>
                  <td>{yearMonth}</td>
                  <td>
                    <ul>
                      {groupedOrders[yearMonth].map(order => (
                        <li key={order._id}>Order ID: {order._id}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {chartData.labels && chartData.labels.length > 0 && (
            <div>
              <h3>Monthly Number of Orders</h3>
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
    </main>
  );
}
