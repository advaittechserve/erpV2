import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import uploadAnimationData from '../assets/upload-icon.json';
import '../css/dragAnddrop.css';
import { jwtDecode } from 'jwt-decode';
import StatusModal from './StatusModal';
import { Margin } from '@mui/icons-material';
import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import io from 'socket.io-client';
import LinearProgress from '@mui/material/LinearProgress';


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

  const isRowEmpty = (row) => {
    return Object.values(row).every(x => (x === null || x === ''));
  };

  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = '/Template%20for%20download.xlsx';
    link.download = 'Template for download.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    useEffect(() => {
        const socket = io('http://localhost:5000');
        console.log(socket.id)
        socket.on('uploadProgress', (percentCompleted) => {
          setUploadProgress(percentCompleted);
        });  
    
        return () => socket.disconnect();
      }, []);


  // const handleFileSubmit = async (data) => {
  //     if (!selectedFile) {
  //         alert('Please select a file');
  //         return;
  //     }

  //     try {
  //         setIsUploading(true);
  //         const workbook = XLSX.readFile(selectedFile);
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  //         excelData.forEach((row, rowIndex) => {
  //             row.forEach((cell, columnIndex) => {
  //                 if (cell === '') {
  //                     validationErrors.push(`Blank cell found at row ${rowIndex + 1}, column ${columnIndex + 1}`);
  //                 }
  //             });
  //             templateData.forEach(section => {
  //                 section.fields.forEach(field => {
  //                     if (field.required && !row.includes(field.label)) {
  //                         validationErrors.push(`Required field '${field.label}' is empty at row ${rowIndex + 1}`);
  //                     }
  //                 });
  //             });
  //         });

  //         if (validationErrors.length > 0) {
  //             // If validation errors exist, set errors and return
  //             setValidationErrors(validationErrors);
  //             setModalMessage(validationErrors);
  //             setShowModal(true);
  //             return;
  //         }

  useEffect(() => {
    const socket = io('http://localhost:5000');
    console.log(socket.id)
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
      const response = await axios.post('http://localhost:5000/api/uploadbulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
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
        status: 'Success',
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
        const filesData = response.data.map(file => {
          const istTime = new Date(file.uploadedTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
          return {
            ...file,
            uploadedTime: istTime
          };
        });
        filesData.sort((a, b) => new Date(b.uploadedTime) - new Date(a.uploadedTime));
        setUploadedFiles(filesData);
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
    const uploadProgresslinear = uploadProgress === 100 ? 0 : uploadProgress;
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
              <p className="mb-2 text-md font-semibold">Click to upload or drag and drop</p>
              {fileName && <p>{fileName}</p>}
              <p className="text-xs">Excel Files (.XLS , .XLSX)</p>
            </div>
            <input id="dropzone-file" name='file' type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <button className="submit-btn" onClick={handleFileSubmit} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Submit File'}
        </button>

        <button
          style={{ marginLeft: '10px' }}
          className="cancel-btn"
          onClick={handleTemplateDownload}>
          Download Template
        </button>

        <div className="flex justify-between m-2">
          <span className="text-base font-medium text-yellow-500 dark:text-white">{modalMessage}</span>
          <span className="text-sm font-medium text-yellow-500 dark:text-white">{uploadProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          
          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}><LinearProgress
            value={uploadProgresslinear}
          /></div>
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
