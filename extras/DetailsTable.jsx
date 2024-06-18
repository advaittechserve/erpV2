import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import '../css/detailsTable.css';
// import CSVDownloadButton from './CSVDownloadButton';
import Papa from 'papaparse';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumb from '../src/Components/Breadcrumb';
import breadcrumbData from "../src/functions/breadcrumbData";


const DetailsTable = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    //const [additionalDetails, setAdditionalDetails] = useState({});
    //console.log(data);
    {/* <CSVDownloadButton data={data} filename="myData" /> */ }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    customerResponse,
                    bankResponse,
                    atmResponse,
                    atmregionResponse,
                    servicesResponse,
                    employeeResponse
                ] = await Promise.all([
                    axios.get('http://localhost:5000/customer'),
                    axios.get('http://localhost:5000/bank'),
                    axios.get('http://localhost:5000/atm'),
                    axios.get('http://localhost:5000/atmregion'),
                    axios.get('http://localhost:5000/services'),
                    axios.get('http://localhost:5000/atm_employeedetails')
                ]);

                const customers = customerResponse.data;
                const banks = bankResponse.data;
                const atms = atmResponse.data;
                const atmregions = atmregionResponse.data;
                const services = servicesResponse.data;
                const employees = employeeResponse.data;

                // Merge customer data with related data (bank, atm, atmregion, service, employee)
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
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); // Run once on component mount

    const handleDownload = () => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // useEffect(() => {
    //     // Navigate to DetailsPage when additionalDetails state is updated
    //     if (Object.keys(additionalDetails).length !== 0) {
    //         navigate("/DetailsPage", {
    //             state: additionalDetails
    //         });
    //     }
    // }, [additionalDetails, navigate]);

    const columns = [
        { name: "CustomerId", label: "Customer ID" },
        { name: "CustomerName", label: "Customer Name" },
        { name: "AtmCount", label: "Atm Count" },

        {
            name: "View",
            label: "View",
            options: {
                customBodyRender: (value, tableMeta, updateValue) => (
                    <button
                        onClick={() => {
                            const customerId = tableMeta.rowData[0]; // Get CustomerId from the row data
                            navigate(`/BankDetails/${customerId}`); // Navigate to /bankdetails with the specific CustomerId
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
        selectableRows: 'none',
        customToolbar: () => (
            <button onClick={handleDownload} className="">
                <Tooltip title="Download as csv">
                    <IconButton>
                        <CloudDownloadIcon style={{ color: '#757575' }} />
                    </IconButton>
                </Tooltip>
            </button>
        ),
    };

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
            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: 'none'
                    }
                }
            }
        }
    })
    return (
        <div className='container-form'>
            <div className="customer-details">
                <div className="mb-1 w-full">
                    <div className="mb-4">    <Breadcrumb items={breadcrumbData.Customer} /> </div>
                    <div className="sm:flex">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Customer </h1>
                        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
                            <button type="button" onClick={() => navigate("/CustomerForm")} className="submit-btn">
                                <span>Add Customer</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className='mt-10'>
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
}

export default DetailsTable;
