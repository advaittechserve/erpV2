import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import '../css/detailsTable.css';
import { useParams } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import breadcrumbData from "../functions/breadcrumbData";



const BankDetailsTable = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ bankResponse] = await Promise.all([
                    axios.get('http://localhost:5000/bank')                  
                ]);
                const banks = bankResponse.data;
                const mergedData = banks.map(bank => {
                    if (bank.CustomerId === customerId) {
                        return {
                            ...bank, 
                        };
                    } else {
                        return null; 
                    }
                }).filter(bank => bank !== null); 

                setData(mergedData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [customerId]); 

    const columns = [
        { name: "BankId", label: "Bank ID" },
        { name: "BankName", label: "Bank Name" },
        { name: "AtmCount", label: "Atm Count" },
        { name: "Field", label: "Field" },
        {
            name: "View",
            label: "View",
            options: {
                customBodyRender: (value, tableMeta, updateValue) => (
                    <button
                        onClick={() => {
                            const bankId = tableMeta.rowData[0]; // Get CustomerId from the row data
                            navigate(`/AtmDetails/${bankId}`); // Navigate to /bankdetails with the specific CustomerId
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
                    <div className="mb-4">    <Breadcrumb items={breadcrumbData.Banks(customerId)} />  </div>
                    <div className="sm:flex">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Banks </h1>
                        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
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

export default BankDetailsTable;
