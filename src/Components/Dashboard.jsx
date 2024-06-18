import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from 'highcharts/highstock';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsFullscreen from 'highcharts/modules/full-screen';
import HighchartsReact from 'highcharts-react-official';
import "../css/customerform.css";
import "../css/dashboard.css";

HighchartsExporting(Highcharts);
HighchartsFullscreen(Highcharts);
const Dashboard = () => {
  const [chartOptions, setChartOptions] = useState(null);
  const [data, setData] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [monthOnMonthGrowth, setMonthOnMonthGrowth] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());




  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/services");
        const sortedData = response.data
          .map(item => ({
            timestamp: new Date(item.TakeoverDate).getTime(),
            costToClient: item.CostToClient
          }))
          .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

        const data = sortedData.map(item => [item.timestamp, item.costToClient]);

        // Create the chart with the sorted data
        Highcharts.stockChart('container', {
          accessibility: {
            typeDescription: `Revenue.`
          },
          title: {
            text: 'Revenue'
          },
          exporting: {
            enabled: true // Enable exporting options
          },
          navigation: {
            buttonOptions: {
              enabled: true // Enable fullscreen button
            }
          },
          xAxis: {
            overscroll: 2678400000 // 1 month
          },
          rangeSelector: {
            selected: 3,
            buttons: [{
              type: 'month',
              count: 3,
              text: '3m',
              title: 'View 3 months'
            }, {
              type: 'month',
              count: 6,
              text: '6m',
              title: 'View 6 months'
            }, {
              type: 'ytd',
              text: 'YTD',
              title: 'View year to date'
            }, {
              type: 'year',
              count: 1,
              text: '1y',
              title: 'View 1 year'
            }, {
              type: 'all',
              text: 'All',
              title: 'View all'
            }]
          },
          series: [{
            name: 'Cost to Client',
            color: '#ffbf00',
            data: data,
            id: 'dataseries',
            tooltip: {
              valueDecimals: 2,
              valuePrefix: '₹'
            }
          }]
        });
        const currentDate = new Date();
        // Calculate revenue for the selected month and year
      const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1).getTime();
      const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0).getTime();
      const selectedMonthData = data.filter(([timestamp]) => timestamp >= selectedMonthStart && timestamp <= selectedMonthEnd);
      const totalRevenue = selectedMonthData.reduce((acc, [, costToClient]) => acc + costToClient, 0);
      setRevenue(totalRevenue.toFixed(3));


        const customerResponse = await axios.get("http://localhost:5000/customer");
        const uniqueCustomers = new Set(customerResponse.data.map(item => item.CustomerId)).size;
        setCustomerCount(uniqueCustomers);

        // Calculate month-on-month growth
        const prevMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).getTime();
        const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getTime();
        const prevMonthData = data.filter(([timestamp]) => timestamp >= prevMonthStart && timestamp <= prevMonthEnd);
        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
        const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getTime();
        const currentMonthData = data.filter(([timestamp]) => timestamp >= currentMonthStart && timestamp <= currentMonthEnd);
        const currentMonthRevenue = currentMonthData.reduce((acc, [, costToClient]) => acc + costToClient, 0);

        const prevMonthRevenue = prevMonthData.reduce((acc, [, costToClient]) => acc + costToClient, 0);

        const monthOnMonthGrowth = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
        setMonthOnMonthGrowth(monthOnMonthGrowth.toFixed(2));
      } catch (error) {
        console.error('Error fetching or processing data:', error);
      }
    }

    fetchData();
  },[selectedMonth, selectedYear]);

  const getPreviousMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const prevMonthIndex = (currentDate.getMonth() === 0) ? 11 : currentDate.getMonth() - 1;
    return months[prevMonthIndex];
  };

  const getPreviousYear = () => {
    const currentDate = new Date();
    const prevYear = (currentDate.getMonth() === 0) ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    return prevYear;
  };


  return (
    <main className="">
      <div className="col-span-12 mt-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Dashboard{" "}
        </h1>

        <div className="grid grid-cols-12 gap-6 mt-5">
          <a className="card card-blue col-span-12 sm:col-span-6 xl:col-span-4" href="#">
            <div className="card-content">
              <div className="card-header">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M4 4V16C4 18.2091 5.79086 20 8 20H20" stroke="#000" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M6.59869 14.5841C6.43397 14.8057 6.48012 15.1189 6.70176 15.2837C6.9234 15.4484 7.2366 15.4022 7.40131 15.1806L6.59869 14.5841ZM19.4779 4.85296C19.3967 4.58903 19.1169 4.4409 18.853 4.52211L14.552 5.8455C14.288 5.92671 14.1399 6.2065 14.2211 6.47043C14.3023 6.73436 14.5821 6.88249 14.846 6.80128L18.6692 5.62493L19.8455 9.44805C19.9267 9.71198 20.2065 9.8601 20.4704 9.7789C20.7344 9.69769 20.8825 9.41789 20.8013 9.15396L19.4779 4.85296ZM13.5434 12.4067L13.1671 12.7359L13.5434 12.4067ZM15.1797 12.2161L15.6216 12.45L15.1797 12.2161ZM7.40131 15.1806L10.6621 10.7929L9.85952 10.1964L6.59869 14.5841L7.40131 15.1806ZM11.4397 10.7619L13.1671 12.7359L13.9196 12.0774L12.1923 10.1034L11.4397 10.7619ZM15.6216 12.45L19.4419 5.23394L18.5581 4.76606L14.7378 11.9821L15.6216 12.45ZM13.1671 12.7359C13.8594 13.5272 15.1297 13.3792 15.6216 12.45L14.7378 11.9821C14.5739 12.2919 14.1504 12.3412 13.9196 12.0774L13.1671 12.7359ZM10.6621 10.7929C10.8522 10.5371 11.2299 10.522 11.4397 10.7619L12.1923 10.1034C11.5628 9.38385 10.4298 9.42903 9.85952 10.1964L10.6621 10.7929Z" fill="#000"></path>
                  </g>
                </svg>
              </div>
              <div className="card-body">
                <div>
                  

                  <div className="card-title">₹ {revenue}</div>
                  <div className="card-subtitle">Revenue for <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                      ))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                      ))}
                    </select></div>
                  
                    
                  

                </div>
              </div>
            </div>
          </a>
          <a className="card card-yellow col-span-12 sm:col-span-6 xl:col-span-4" href="#">
            <div className="card-content">
              <div className="card-header">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <circle cx="9" cy="9" r="2" stroke="#000" strokeWidth="1.5"></circle>{" "}
                    <path d="M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z" stroke="#000" strokeWidth="1.5"></path>{" "}
                    <path d="M22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C21.298 5.64118 21.5794 6.2255 21.748 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                    <path d="M19 12H15" stroke="#000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                    <path d="M19 9H14" stroke="#000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                    <path d="M19 15H16" stroke="#000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                  </g>
                </svg>
              </div>
              <div className="card-body">
                <div>
                  <div className="card-title">{customerCount}</div>
                  <div className="card-subtitle">Customers</div>
                </div>
              </div>
            </div>
          </a>
          <a className="card card-pink col-span-12 sm:col-span-6 xl:col-span-4" href="#">
            <div className="card-content">
              <div className="card-header">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                    <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>{" "}
                  </g>
                </svg>
              </div>
              <div className="card-body">
                <div>
                  <div className="card-title">{monthOnMonthGrowth}%</div>
                  <div className="card-subtitle"> MOM growth</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-12 mt-8">
        <div className="intro-y block sm:flex items-center h-10">
          <h2 className="mr-5 text-lg font-medium truncate">Revenue Chart</h2>
        </div>
        <div className="intro-y box p-5 mt-5">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          <div id="container"></div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
