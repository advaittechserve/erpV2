import { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import uploadAnimationData from '../assets/upload-icon.json';
import '../css/dragAnddrop.css';
import { jwtDecode } from 'jwt-decode';
import StatusModal from './StatusModal';

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
    
    //         // Process the uploaded data
    //         await uploadCustomerData(data, setUploadProgress, setModalMessage);
    //         await uploadBankData(data, setUploadProgress, setModalMessage);
    //         await uploadAtmData(data, setUploadProgress, setModalMessage);
    //         await uploadEmployeeData(data, setUploadProgress, setModalMessage);
    //         await uploadServiceData(data, setUploadProgress, setModalMessage);
    //         setModalMessage('File data logged successfully');
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //         setModalMessage('Error uploading file!');
    //     } finally {
    //         setIsUploading(false);
    //     }
    // };
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
            }
          });
      
          setModalMessage(response.data.message); // Assuming response contains a message
      
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
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">File Name</th>
                                <th scope="col" className="px-6 py-3">Uploaded Time</th>
                                <th scope="col" className="px-6 py-3">Uploaded By</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedFiles.map(file => (
                                <tr key={file.id} className="border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {file.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {file.uploadedTime}
                                    </td>
                                    <td className="px-6 py-4">
                                        {file.uploadedBy}
                                    </td>
                                    <td className="px-6 py-4">
                                        {file.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
