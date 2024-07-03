import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import '../css/detailsTable.css';
import Papa from "papaparse";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Breadcrumb from './Breadcrumb';
import breadcrumbData from "../functions/breadcrumbData";
import Dashboard from "./Dashboard";
import { getUserRole } from "../functions/userAuth";
import { jwtDecode } from 'jwt-decode';

const DetailsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [datacsv, setDatacsv] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
    const token = localStorage.getItem("token");

    if (token) {
     
        const decoded = jwtDecode(token); // Use jwtDecode correctly
        const userId = decoded.username;
        const role = await getUserRole(userId);
        setUserRole(role[0].access);
      } else {
        console.error("No token found in localStorage");
      }
    } catch (error) {
      console.error("Error decoding token or fetching user role:", error);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const customers = customerResponse.data;
        const banks = bankResponse.data;
        const atms = atmResponse.data;
        const atmregions = atmregionResponse.data;
        const services = servicesResponse.data;
        const employees = employeeResponse.data;

        // Create maps for easy lookup
        const customersMap = new Map(customers.map(customer => [customer.CustomerId, customer]));
        const banksMap = new Map(banks.map(bank => [bank.BankId, bank]));
        const atmregionsMap = new Map(atmregions.map(atmregion => [atmregion.AtmId, atmregion]));
        const servicesMap = new Map(services.map(service => [service.AtmId, service]));
        const employeesMap = new Map(employees.map(employee => [employee.EmployeeId, employee]));

        // Create a row for each ATM
        const mergedDatacsv = customers.flatMap(customer => {
          const customerAtms = atms.filter(atm => atm.CustomerId === customer.CustomerId);
          if (customerAtms.length === 0) {
            return [{
              ...customer,
              AtmCount: 0,
              AtmId: "",
              BankId: "",
              BankName: "",
              ...atmregionsMap.get(""),
              ...servicesMap.get(""),
              ...employeesMap.get(customer.EmployeeId),
            }];
          }

          return customerAtms.map(atm => {
            const bank = banksMap.get(atm.BankId) || {};
            const atmregion = atmregionsMap.get(atm.AtmId) || {};
            const service = servicesMap.get(atm.AtmId) || {};
            const employee = employeesMap.get(customer.EmployeeId) || {};

            return {
              ...customer,
              AtmCount: customerAtms.length,
              ...bank,
              ...atm,
              ...atmregion,
              ...service,
              ...employee,
            };
          });
        });

        setDatacsv(mergedDatacsv);
        const mergedData = customers.map(customer => {
          const bank = banks.find(bank => bank.CustomerId === customer.CustomerId) || {};
          const atm = atms.find(atm => atm.BankId === (bank && bank.BankId)) || {};
          const atmregion = atmregions.find(ar => ar.AtmId === (atm && atm.AtmId)) || {};
          const service = services.find(service => service.AtmId === (atm && atm.AtmId)) || {};
          const employee = employees.find(emp => emp.EmployeeId === customer.EmployeeId) || {};

          return {
            ...customer,
            ...bank,
            ...atm,
            ...atmregion,
            ...service,
            ...employee
          };
        });

        setData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Run once on component mount

  const handleDownload = () => {
    if (datacsv.length > 0) {
      const columns = [...new Set(datacsv.flatMap(item => Object.keys(item)))];
      const csv = Papa.unparse({
        fields: columns,
        data: datacsv.map(item => columns.map(col => item[col] || ''))
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      console.error("No data to download");
    }
  };

  const columns = [
    { name: "CustomerId", label: "Customer ID" },
    { name: "CustomerName", label: "Customer Name" },
    {
      name: "View",
      label: "View",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => (
          <button
            onClick={() => {
              const customerId = tableMeta.rowData[0];
              navigate(`/BankDetails/${customerId}`);
            }}
            className="add-btn"
          >
            View
          </button>
        ),
      },
    },
  ];

  const options = {
    search: true,
    download: false,
    print: false,
    viewColumns: false,
    filter: true,
    responsive: "standard",
    scrollX: true,
    selectableRows: "none",
    customToolbar: () => (
      <div onClick={handleDownload} style={{ cursor: 'pointer' }}>
        <Tooltip title="Download as CSV">
          <IconButton>
            <CloudDownloadIcon style={{ color: "#757575" }} />
          </IconButton>
        </Tooltip>
      </div>
    ),
  };

  const getMuiTheme = () =>
    createTheme({
      typography: {
        fontFamily: "Calibri",
      },
      palette: {
        background: {
          paper: "#fff",
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
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb items={breadcrumbData.Customer} />
            {userRole === 'SuperAdmin' ? <Dashboard /> : null}
          </div>
          <h2 className="mr-5 text-lg font-medium truncate"></h2>
        </div>
        <div className="mt-1">
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              data={data}
              columns={columns}
              options={options}
              className="muitable"
            />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
};

export default DetailsTable;
