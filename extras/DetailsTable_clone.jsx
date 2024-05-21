import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import '../css/detailsTable.css';

const DetailsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState({});


  const columns = [
    { name: "CustomerId", label: "Customer ID" },
    { name: "CustomerName", label: "Customer Name" },
    { name: "BankName", label: "Bank Name" },
    { name: "AtmCount", label: "Atm Count" }
    // { name: "State", label: "State" },
    // { name: "City", label: "City" },
    // { name: "Address", label: "Address" },
    // {
    //   name: "SiteStatus",
    //   label: "Site Status",
    //   options: {
    //     customBodyRender: (value) => {
    //       const statusStyle = {
    //         borderRadius: '5px',
    //         color: '#fff',
    //         margin: '8px',
    //         display: 'inline-block',
    //         width: '70px', 
    //         textAlign: 'center',
    //       };

    //       const activeStyle = {
    //         ...statusStyle,
    //         backgroundColor: '#0E9F6E',
    //         padding: '5px'
    //       };

    //       const inactiveStyle = {
    //         ...statusStyle,
    //         backgroundColor: '#E02424',
    //         padding: '5px'

    //       };

    //       return (
    //         <span style={value === 'Active' ? activeStyle : inactiveStyle}>
    //           {value}
    //         </span>
    //       );
    //     }
    //   }
    // }
  ];

  const options = {
    search: true,
    download: true,
    print: true,
    viewColumns: false,
    filter: true,
    responsive: "standard",
    scrollX: true,
    selectableRows: 'none',
    onTableChange: (action, state) => {
      console.log(action);
      console.dir(state);
    },
    onRowClick: async () => {
      //console.log("Clicked on row:", rowData, rowMeta);
      //const atmId = rowData[columns.findIndex(col => col.name === "AtmId")];
      try {
        const [atmRegionResponse, servicesResponse, employeeResponse, customerResponse, bankResponse, atmResponse] = await Promise.all([
          axios.get(`http://localhost:5000/atmregion`),
          axios.get(`http://localhost:5000/services`),
          axios.get(`http://localhost:5000/employee`),
          axios.get(`http://localhost:5000/customer`),
          axios.get(`http://localhost:5000/bank`),
          axios.get(`http://localhost:5000/atm`)
        ]);
        const atmRegionData = atmRegionResponse.data;
        const servicesData = servicesResponse.data;
        const employeeData = employeeResponse.data;
        const customerData = customerResponse.data;
        const bankData = bankResponse.data;
        const atmData = atmResponse.data;

        setAdditionalDetails({
          atmRegion: atmRegionData,
          services: servicesData,
          employee: employeeData,
          customer: customerData,
          bank: bankData,
          atm: atmData
        });
      } catch (error) {
        console.error('Error fetching additional details:', error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerResponse, bankResponse, atmResponse] = await Promise.all([
          axios.get('http://localhost:5000/customer'),
          axios.get('http://localhost:5000/bank'),
          axios.get('http://localhost:5000/atm')
        ]);

        const customers = customerResponse.data;
        const banks = bankResponse.data;
        const atms = atmResponse.data;

        // Merge customer data with bank and atm data
        const mergedData = customers.map(customer => {
          const bank = banks.find(bank => bank.CustomerId === customer.CustomerId);
          const atm = bank ? atms.find(atm => atm.BankId === bank.BankId) : null;
          return {
            ...customer,
            BankName: bank ? bank.BankName : '', // Add bank name to data
            AtmId: atm ? atm.AtmId : ''        // Add ATM ID to data
          };
        });

        setData(mergedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Navigate to DetailsPage when additionalDetails state is updated
    if (Object.keys(additionalDetails).length !== 0) {
      navigate("/DetailsPage", {
        state: additionalDetails
      });
    }
  }, [additionalDetails, navigate]);

  const getMuiTheme = () => createTheme({
    typography: {
      fontFamily:
        'Calibri',
        
    },

    palette: {
      background: {
        paper: '#fff',
        default: ''
      }
    },
    components: {
    
      MuiTableCell: {
        styleOverrides: {
          head: {
            whiteSpace: 'nowrap',
            padding: '5px',
            fontWeight: 'bold',
          },
          body: {
            padding: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
          }
        }
      },
    }
  })
  return (
    <div className="detailsTable">

      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={columns}
          options={options}
          className="muitable"
        />
      </ThemeProvider>
    </div>

  );
}

export default DetailsTable;
