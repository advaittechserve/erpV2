import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "../css/customerform.css";
import { Line, Pie } from 'react-chartjs-2';
import "chart.js/auto";
import Tooltip from "@mui/material/Tooltip";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';


function ReportGeneration() {

  const [customers, setCustomers] = useState([]);
  const [states, setStates] = useState([]);
  const [uniqueServices, setUniqueServices] = useState([]);
  const [data, setData] = useState();
  const [dataSubmit, setDataSubmit] = useState([]);
  const [banks, setBanks] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [bankId, setBankId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [stateName, setStateName] = useState("");
  const [TakeoverDate, setTakeoverDate] = useState("");
  const [HandoverDate, setHandoverDate] = useState("");
  const [lineChartData, setLineChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});


  const fetchBanksForClient = async () => {
    try {
      const response = await axios.get('http://localhost:5000/bank_customerdetails', {
        params: {
          customerId, // Pass the selected customer ID to filter banks
        },
      });

      // Check if the response contains data
      if (response.data && response.data.data) {
        // Filter out duplicate banks based on BankId
        const uniqueBanks = response.data.data.reduce((unique, bank) => {
          if (!unique.some((item) => item.BankId === bank.BankId)) {
            unique.push(bank);
          }
          return unique;
        }, []);
        setBanks(uniqueBanks);
      } else {
        console.error('No data found for the provided customer ID');
      }
    } catch (error) {
      console.error('Error fetching banks for client:', error);
    }
  };

  const fetchStatesForBank = async () => {
    try {
      const response = await axios.get("http://localhost:5000/atm", {
        params: {
          BankId: bankId,
        },
      });

      // Extract unique states from the response directly
      const uniqueStates = [...new Set(response.data.map((atm) => atm.State))];
      setStates(uniqueStates);
    } catch (error) {
      console.error("Error fetching states for bank:", error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch data from APIs
      const [
        customerResponse,
        bankResponse,
        atmResponse,
        atmregionResponse,
        servicesResponse,
        employeeResponse,
      ] = await Promise.all([
        axios.get("http://localhost:5000/customer"),
        axios.get("http://localhost:5000/bank"),
        axios.get("http://localhost:5000/atm"),
        axios.get("http://localhost:5000/atmregion"),
        axios.get("http://localhost:5000/services"),
        axios.get("http://localhost:5000/atm_employeedetails"),
      ]);

      // Extract data from responses
      const customers = customerResponse.data;
      const banks = bankResponse.data;
      const atms = atmResponse.data;
      const atmregions = atmregionResponse.data;
      const services = servicesResponse.data;
      const employees = employeeResponse.data;

      // Create maps for easy lookup
      const customersMap = new Map(customers.map(customer => [customer.CustomerId, customer]));
      const banksMap = new Map(banks.map(bank => [bank.BankId, bank]));
      const atmsMap = new Map(atms.map(atm => [atm.AtmId, atm]));
      const atmregionsMap = new Map(atmregions.map(atmregion => [atmregion.AtmId, atmregion]));
      const employeesMap = new Map(employees.map(employee => [employee.EmployeeId, employee]));

      // Create a row for each service
      const mergedDataCsv = services.map(service => {
        const atm = atmsMap.get(service.AtmId) || {};
        const bank = banksMap.get(atm.BankId) || {};
        const customer = customersMap.get(atm.CustomerId) || {};
        const atmregion = atmregionsMap.get(service.AtmId) || {};
        const employee = employeesMap.get(customer.EmployeeId) || {};

        return {
          CustomerId: customer.CustomerId || "",
          CustomerName: customer.CustomerName || "",
          CustomerSiteStatus: customer.CustomerSiteStatus || "",
          BankId: bank.BankId || "",
          BankName: bank.BankName || "",
          AtmId: atm.AtmId || "",
          AtmCount: 1,  // Each row represents one service
          Address: atm.Address || "",
          Country: atm.Country || "",
          State: atm.State || "",
          City: atm.City || "",
          BranchCode: atm.BranchCode || "",
          SiteId: atm.SiteId || "",
          Lho: atm.Lho || "",
          SiteStatus: atm.SiteStatus || "",
          SiteType: atm.SiteType || "",
          EmployeeId: employee.EmployeeId || "",
          EmployeeName: employee.EmployeeName || "",
          EmployeeRole: employee.EmployeeRole || "",
          EmployeeContactNumber: employee.EmployeeContactNumber || "",
          TypeOfWork: atmregion.TypeOfWork || "",
          ServiceId: service.ServiceId || "",
          ServiceType: service.ServiceType || "",
          TakeoverDate: service.TakeoverDate || "",
          HandoverDate: service.HandoverDate || "",
          PayOut: service.PayOut || "",
          CostToClient: service.CostToClient || "",
        };
      });

      setData(mergedDataCsv);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/customer");
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchBanksForClient();
    }
  }, [customerId]);

  useEffect(() => {
    if (bankId) {
      fetchStatesForBank();
    }
  }, [bankId]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/services");
        const uniqueServiceIds = new Set();
        const uniqueServicesData = response.data.filter((service) => {
          if (!uniqueServiceIds.has(service.ServiceId)) {
            uniqueServiceIds.add(service.ServiceId);
            return true;
          }
          return false;
        });
        setUniqueServices(uniqueServicesData); // Set unique services
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (customerId || bankId || stateName || selectedService || TakeoverDate || HandoverDate) {
      fetchData();
    }
  }, [customerId, bankId, stateName, selectedService, TakeoverDate, HandoverDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if TakeoverDate is provided
    if (!TakeoverDate) {
      alert("Takeover Date is required.");
      return;
    }

    // Function to validate and preprocess date strings in YYYY-MM-DD format
    const validateDateFormat = (dateString) => {
      const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
      if (isoFormat.test(dateString)) {
        return dateString;
      } else {
        return null;
      }
    };

    // Validate input dates
    const formattedTakeoverDate = validateDateFormat(TakeoverDate);
    const formattedHandoverDate = HandoverDate ? validateDateFormat(HandoverDate) : null;

    if (!formattedTakeoverDate) {
      alert("Invalid Takeover Date format.");
      return;
    }

    // Prepare filters
    const filters = {
      CustomerId: customerId,
      BankId: bankId,
      State: stateName,
      ServiceId: selectedService,
      TakeoverDate: formattedTakeoverDate,
      HandoverDate: formattedHandoverDate,
    };
    const appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );

    try {
      let filteredData = data;
      if (Object.keys(appliedFilters).length > 0) {
        filteredData = data.filter((item) => {
          return Object.entries(appliedFilters).every(([key, value]) => {
            if (key === "TakeoverDate") {
              const itemDate = new Date(item[key]);
              const filterDate = new Date(value);
              const endDate = HandoverDate ? new Date(formattedHandoverDate) : new Date();

              if (isNaN(itemDate.getTime())) {
                return false;
              }
              return itemDate >= filterDate && itemDate <= endDate;
            } else if (key === "HandoverDate" && TakeoverDate) {
              // This condition is handled in the 'TakeoverDate' filter
              return true;
            } else {
              return item[key] === value;
            }
          });
        });
      }
      const cumulativeData = [];

      filteredData.forEach(item => {
        const startDate = new Date(item.TakeoverDate);
        const endDate = item.HandoverDate ? new Date(item.HandoverDate) : new Date(); // Use HandoverDate if available, otherwise today's date

        let currentDate = new Date(startDate); // Start from TakeoverDate

        while (currentDate <= endDate && currentDate <= new Date()) {
          const monthString = currentDate.toISOString().slice(0, 7); // Extract the YYYY-MM part

          const existingEntry = cumulativeData.find(entry => entry.Month === monthString && entry.ServiceId === item.ServiceId);

          const costToClient = parseFloat(item.CostToClient);
          const payouts = parseFloat(item.PayOut) || 0; // Default to 0 if payouts are not defined

          const netRevenue = costToClient - payouts;
          console.log(netRevenue);

          if (existingEntry) {
            existingEntry.NetRevenue += netRevenue;
          } else {
            cumulativeData.push({
              Month: monthString,
              ServiceId: item.ServiceId,
              ServiceType: item.ServiceType,
              NetRevenue: netRevenue,
            });
          }

          currentDate.setMonth(currentDate.getMonth() + 1); // Move to the next month
        }
      });

      // Sort cumulativeData by Month
      cumulativeData.sort((a, b) => new Date(a.Month) - new Date(b.Month));

      // Extract labels (unique months)
      const labels = [...new Set(cumulativeData.map(entry => entry.Month))];

      // Extract unique service types
      const serviceTypes = [...new Set(cumulativeData.map(entry => entry.ServiceType))];

      // Prepare datasets for line chart
      const datasets = serviceTypes.map(serviceType => {
        const data = labels.map(month => {
          const entry = cumulativeData.find(item => item.Month === month && item.ServiceType === serviceType);
          return entry ? entry.NetRevenue : 0; // Use 0 if no entry found for the month
        });

        return {
          label: serviceType,
          data,
        };
      });

      // Line chart data structure
      const lineChartData = {
        labels,
        datasets,
      };

      // Prepare pie chart data
      const pieChartData = {
        labels: serviceTypes,
        datasets: [{
          data: serviceTypes.map(serviceType =>
            cumulativeData
              .filter(entry => entry.ServiceType === serviceType)
              .reduce((sum, entry) => sum + entry.NetRevenue, 0)
          ),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        }],
      };




      setLineChartData(lineChartData);
      setPieChartData(pieChartData);
      setShowTable(true);
      setDataSubmit(filteredData);
      setShowTable(true);
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  };
  const exportToExcel = async () => {
    const filteredData = dataSubmit.map(({ CustomerId, CustomerName, CustomerSiteStatus, BankId, BankName, AtmId, Address, Country, State, City, BranchCode, SiteId, Lho, SiteStatus, SiteType, EmployeeId, EmployeeName, EmployeeRole, EmployeeContactNumber, TypeOfWork, ServiceId, ServiceType, TakeoverDate, HandoverDate, PayOut, CostToClient }) => ({
      'Customer ID': CustomerId,
      'Customer Name': CustomerName,
      'Customer Site Status': CustomerSiteStatus,
      'Bank ID': BankId,
      'Bank Name': BankName,
      'ATM ID': AtmId,
      'Address': Address,
      'Country': Country,
      'State': State,
      'City': City,
      'Branch Code': BranchCode,
      'Site ID': SiteId,
      'LHO': Lho,
      'Site Status': SiteStatus,
      'Site Type': SiteType,
      'Employee ID': EmployeeId,
      'Employee Name': EmployeeName,
      'Employee Role': EmployeeRole,
      'Employee Contact Number': EmployeeContactNumber,
      'Type of Work': TypeOfWork,
      'Service ID': ServiceId,
      'Service Type': ServiceType,
      'Takeover Date': TakeoverDate,
      'Handover Date': HandoverDate,
      'Pay Out': PayOut,
      'Cost to Client': CostToClient,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");

    // Function to add image to worksheet
    const addImageToSheet = async (elementId, sheet, cell) => {
      try {
        const canvas = await html2canvas(document.getElementById(elementId));

        // Optimize canvas context for frequent read operations
        canvas.getContext('2d').willReadFrequently = true;

        const dataUrl = canvas.toDataURL('image/png');

        const imgCell = XLSX.utils.encode_cell({ r: cell.r, c: cell.c });
        sheet[imgCell] = { t: 's', v: '' };

        const drawing = {
          "!margins": { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75 },
          "image": {
            extension: 'png',
            data: dataUrl.split('base64,')[1],
          },
          "type": "image",
          "positioning": "absolute",
          "position": {
            "x": 0,
            "y": 0,
            "width": canvas.width,
            "height": canvas.height,
          },
        };

        sheet['!images'] = sheet['!images'] || [];
        sheet['!images'].push(drawing);
      } catch (error) {
        console.error(`Failed to add image from ${elementId}:`, error);
      }
    };



    // Create a new sheet for charts
    const wsCharts = XLSX.utils.aoa_to_sheet([['Line Chart'], [], ['Pie Chart']]);
    XLSX.utils.book_append_sheet(wb, wsCharts, "Charts");

    // Add images to the charts sheet
    await addImageToSheet('lineChart', wsCharts, { r: 1, c: 0 });
    await addImageToSheet('pieChart', wsCharts, { r: 3, c: 0 });

    XLSX.writeFile(wb, "Filtered_Data_with_Charts.xlsx");
  };
  const columns = [
    { name: "CustomerId", label: "Customer Id" },
    { name: "CustomerName", label: "Customer Name" },
    { name: "CustomerSiteStatus	", label: "Customer Site Status	" },
    { name: "BankId", label: "Bank Id" },
    { name: "BankName", label: "Bank Name" },
    { name: "AtmId", label: "Atm ID" },
    {
      name: "Address",
      label: "Address",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', width: '300px' }}>
              {value}
            </div>
          );
        },
        setCellProps: () => ({
          style: {
            maxWidth: '300px'
          }
        })
      },
    },
    { name: "Country", label: "Country" },
    { name: "State", label: "State" },
    { name: "City", label: "City" },
    { name: "BranchCode", label: "BranchCode" },
    { name: "SiteId", label: "SiteId" },
    { name: "Lho", label: "LHO" },
    { name: "SiteStatus", label: "Site Status" },
    { name: "SiteType", label: "Site Type" },
    { name: "EmployeeId", label: "Employee Id" },
    { name: "EmployeeName", label: "Employee Name" },
    { name: "EmployeeRole", label: "Employee Role" },
    { name: "EmployeeContactNumber", label: "Employee Contact Number" },
    { name: "TypeOfWork", label: "Type Of Work" },
    { name: "ServiceId", label: "Service Id" },
    { name: "ServiceType", label: "Service Name" },
    { name: "TakeoverDate", label: "Takeover Date" },
    { name: "HandoverDate", label: "Handover Date" },
    { name: "PayOut", label: "PayOut" },
    { name: "CostToClient", label: "Cost To Client" },
  ];

  const options = {
    search: true,
    download: true,
    print: false,
    viewColumns: true,
    filter: true,
    responsive: "standard",
    scrollX: true,
    selectableRows: "none",
    customToolbarSelect: () => { },
    // customToolbar: () => (
    //   <div onClick={exportToExcel} style={{ cursor: 'pointer' }}>
    //     <Tooltip title="Export To Excel">
    //       <IconButton>
    //         <CloudDownloadIcon style={{ color: "#757575" }} />
    //       </IconButton>
    //     </Tooltip>
    //   </div>
    // ),
  };
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12, // Adjust the size as needed
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 12, // Adjust the size as needed
        },
        bodyFont: {
          size: 10, // Adjust the size as needed
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10, // Adjust the size as needed
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 10, // Adjust the size as needed
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12, // Adjust the size as needed
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 12, // Adjust the size as needed
        },
        bodyFont: {
          size: 10, // Adjust the size as needed
        },
      },
    },
  };


  const getMuiTheme = () =>
    createTheme({
      typography: {
        fontFamily: "Calibri",
      },

      palette: {
        background: {
          paper: "#fff",
          default: "",
        },
      },
      components: {
        MuiTableCell: {
          styleOverrides: {
            head: {
              whiteSpace: "nowrap",
              padding: "5px",
              fontWeight: "bold",
            },
            body: {
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: "none",
            },
          },
        },
      },
    });

  return (
    <div className="container-form">
      <div className="customer-details">
        <div className="">
          <form className="" onSubmit={handleSubmit}>
            <p className="customer-details-heading">Generate Report</p>

            <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="dropdown"
                >
                  <option key="" value="">
                    Select Customer
                  </option>
                  {customers.map((customer) => (
                    <option
                      key={`${customer.CustomerId}`}
                      value={customer.CustomerId}
                    >
                      {customer.CustomerName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  Bank
                </label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  className="dropdown"
                >
                  <option key="" value="">
                    Select Bank
                  </option>
                  {banks.map((bank) => (
                    <option key={`bank-${bank.BankId}`} value={bank.BankId}>
                      {bank.BankName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  State
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="dropdown"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="dropdown"
                >
                  <option value="">Select Service</option>
                  {uniqueServices.map((service) => (
                    <option key={service.ServiceId} value={service.ServiceId}>
                      {service.ServiceType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  Takeover Date
                </label>
                <input
                  id="TakeoverDate"
                  type="date"
                  value={TakeoverDate}
                  onChange={(e) => setTakeoverDate(e.target.value)}
                  className="dropdown"
                  placeholder="From Date"
                />
              </div>
              <div className="relative">
                <label htmlFor="floating_outlined" className="label_form">
                  Handover Date
                </label>
                <input
                  id="HandoverDate"
                  type="date"
                  value={HandoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className="dropdown"
                  placeholder="To Date"
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>


          {showTable && (
            <>
              <div className="chartContainer">
                <div id="lineChart" className="lineChart">
                  <Line data={lineChartData} options={lineChartOptions}/>
                </div>
                <div id="pieChart" className="pieChart">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </div>

              <ThemeProvider theme={getMuiTheme()}>
                <br />
                <hr className="h-0.5 bg-yellow-500 rounded my-5" />
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-3">
                  Data Table{" "}
                </h1>
                <MUIDataTable
                  data={dataSubmit}
                  columns={columns}
                  options={options}
                  className="muitable"
                />
              </ThemeProvider>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportGeneration;