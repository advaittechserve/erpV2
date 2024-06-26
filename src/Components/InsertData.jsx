import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import uploadAnimationData from '../assets/upload-icon.json';
import '../css/dragAnddrop.css';
import {jwtDecode} from 'jwt-decode';
import StatusModal from './StatusModal';
import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import socketIOClient from 'socket.io-client';

const ExcelUploader = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [modalMessage, setModalMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.username;

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const allowedExtensions = ['.xls', '.xlsx'];

        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (allowedExtensions.includes('.' + extension)) {
                setSelectedFile(file);
                setFileName(file.name);
            } else {
                alert('Please upload a valid Excel file with .xls or .xlsx extension');
            }
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };
    useEffect(() => {
        const socket = socketIOClient('http://localhost:5000');
        socket.on('uploadProgress', (percentCompleted) => {
          setUploadProgress(percentCompleted);
        });
    
        return () => socket.disconnect();
      }, []);
    const handleFileSubmit = async () => {
        if (!selectedFile) {
          alert('Please select a file');
          return;
        }
      
        try {
          setIsUploading(true);
      
          const formData = new FormData();
          formData.append('file', selectedFile);
          console.log("Selected file:", selectedFile);
      
          const response = await axios.post('http://localhost:5000/api/uploadbulk', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded) / progressEvent.total);
                console.log('Axios upload progress:', percentCompleted);
                setUploadProgress(percentCompleted); // Update progress directly from Axios event
              }
          });
      
          setModalMessage(response.data.message); // Assuming response contains a message
          const token = localStorage.getItem("token");
          const decoded = jwtDecode(token);
          const uploadedBy = decoded.username;
          const uploadedTime = new Date().toISOString(); 
          const uploadFileDataResponse = await axios.post('http://localhost:5000/api/uploadfiledata', {
            name: fileName,
            uploadedBy,
            status : 'Success',
            uploadedTime
          });
      
      
        } catch (error) {
          console.error('Error uploading file to server:', error);
          setModalMessage('Error uploading file!');
        } finally {
          setIsUploading(false);
        }
      };
     
    useEffect(() => {
        const fetchUploadedFiles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/getfiledata');
                setUploadedFiles(response.data);
            } catch (error) {
                console.error('Error fetching uploaded files:', error);
            }
        };

        fetchUploadedFiles();
    }, []);

    const columns = [
        {
            name: "name",
            label: "File Name",
        },
        {
            name: "uploadedTime",
            label: "Uploaded Time",
        },
        {
            name: "uploadedBy",
            label: "Uploaded By",
        },
        {
            name: "status",
            label: "Status",
        }
    ];

    const options = {
        search: true,
        download: true,
        print: false,
        viewColumns: false,
        filter: true,
        responsive: "standard",
        scrollX: true,
        selectableRows: "none",
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
        <div className="container">
            <div className="file-upload-box">
                <div className="drag-drop-area" onDrop={handleFileDrop} onDragOver={handleDragOver}>
                    <label htmlFor="dropzone-file">
                        <div className="upload-icon">
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: uploadAnimationData,
                                }}
                                height={150}
                                width={150}
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-sm">Click to upload or drag and drop</p>
                            {fileName && <p>{fileName}</p>}
                            <p className="text-xs">Excel Files (.XLS , .XLSX)</p>
                        </div>
                        <input id="dropzone-file" name='file' type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
                <button className="upload-btn" onClick={handleFileSubmit} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>

                <div className="flex justify-between m-2">
                    <span className="text-base font-medium text-yellow-500 dark:text-white">{modalMessage}</span>
                    <span className="text-sm font-medium text-yellow-500 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="mt-8 relative overflow-x-auto">
                    <ThemeProvider theme={getMuiTheme}>
                        <MUIDataTable
                            data={uploadedFiles}
                            columns={columns}
                            options={options}
                        />
                    </ThemeProvider>
                </div>
            </div>
            <StatusModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                message={modalMessage} 
                isUploading={isUploading} 
            />
        </div>
    );
};

export default ExcelUploader;
