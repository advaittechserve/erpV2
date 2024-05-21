import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import '../css/detailsTable.css';
import { useParams } from "react-router-dom";
import { Margin } from "@mui/icons-material";
import breadcrumbData from "../functions/breadcrumbData";
import Breadcrumb from "./Breadcrumb";


const AtmDetailsTable = () => {
    const { bankId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data from '/atm'
                const [atmResponse] = await Promise.all([
                    axios.get('http://localhost:5000/atm')
                ]);
                const atms = atmResponse.data;
                const filteredAtms = atms.filter(atm => atm.BankId === bankId);
                setData(filteredAtms);
                const servicesResponse = await axios.get('http://localhost:5000/services');
                const servicesData = servicesResponse.data;
                const mergedData = filteredAtms.map(atm => {
                    const matchingService = servicesData.find(service => service.AtmId === atm.AtmId);
                    if (matchingService) {
                        return {
                            ...atm,
                            ServiceId: matchingService.ServiceId,
                            ServiceType: matchingService.ServiceType,
                            TakeoverDate: matchingService.TakeoverDate,
                            HandoverDate: matchingService.HandoverDate,
                            CostToClient: matchingService.CostToClient
                        };
                    } else {
                        return atm;
                    }
                });

                // Update state with the merged data
                setData(mergedData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [bankId]);


    const columns = [
        { name: "AtmId", label: "Atm ID" },
        { name: "Address", label: "Address" },
        { name: "Country", label: "Country" },
        { name: "State", label: "State" },
        { name: "City", label: "City" },
        { name: "BranchCode", label: "BranchCode" },
        { name: "SiteId", label: "SiteId" },
        { name: "ServiceId", label: "Service Id" },
        { name: "ServiceType", label: "Service Name" },
    
        {
              name: "SiteStatus",
              label: "Site Status",
              options: {
                customBodyRender: (value) => {
                  const statusStyle = {
                    border: 'none',
                    color: '#fff',
                    padding: '1px 10px',
                    display: 'inline-block',
                    width: '80px',
                    Margin: '2px', 
                    textAlign: 'center',
                    fontSize: '0.875rem',
                  };
        
                  const activeStyle = {
                    ...statusStyle,
                    backgroundColor: '#0E9F6E',
                  };
        
                  const inactiveStyle = {
                    ...statusStyle,
                    backgroundColor: '#E02424',       
                  };
        
                  return (
                    <span style={value === 'Active' ? activeStyle : inactiveStyle}>
                      {value}
                    </span>
                  );
                }
              }
            },

        {
            name: "View",
            label: "View",
            options: {
                customBodyRender: (value, tableMeta, updateValue) => (
                    <button
                        onClick={() => {
                            const atmId = tableMeta.rowData[0];
                            navigate(`/AtmDetailsEdit/${atmId}`); 
                        }}
                        className="add-btn"
                    >
                        View/Edit
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
                    <div className="mb-4">     <Breadcrumb items={breadcrumbData.Atms(bankId)} /> </div>
                    <div className="sm:flex">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Atms </h1>
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

export default AtmDetailsTable;
