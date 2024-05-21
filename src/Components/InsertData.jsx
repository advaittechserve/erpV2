import  { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Lottie from 'react-lottie';
import uploadAnimationData from '../assets/upload-icon.json';
import '../css/dragAnddrop.css';
import { jwtDecode } from 'jwt-decode';

const ExcelUploader = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.username;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

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

    const handleFileSubmit = async () => {

        if (!selectedFile) {
            alert('Please select a file');
            return;
        }
        setUploadProgress(10); 
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setUploadProgress(20); 

                const response_upload = await axios.post('http://localhost:5000/api/insertData', { data: jsonData });
                setUploadProgress(50); // Start the animation
                let status_upload="";

                if (response_upload.status === 200) {
                    status_upload = "Success";
                }
                else {
                    status_upload = "Failed";
                }

                const formData = {
                    name: selectedFile.name,
                    uploadedBy: userId,
                    status: status_upload,
                    uploadedTime: formattedDate
                }
                setUploadProgress(100);
                await axios.post('http://localhost:5000/api/uploadfiledata', formData);
                alert('Data inserted successfully');
        };
        reader.readAsArrayBuffer(selectedFile);
    }

    useEffect(() => {
        const fetchUploadedFiles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/getfiledata');
                console.log('Fetched files:', response.data);
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
                <div className="drag-drop-area"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}>
                    <label htmlFor="dropzone-file">
                        <div className="upload-icon">
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: uploadAnimationData,
                                }}
                                height={150}
                                width={150} />
                        </div>
                        <div>
                            <p className="mb-2 text-sm">Click to upload or drag and drop</p>
                            {fileName && <p>{fileName}</p>}
                            <p className="text-xs">Excel Files (.XLS , .XLSX)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
                <button className="upload-btn" onClick={handleFileSubmit}>Upload File</button>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="mt-8 relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    File Name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Uploaded Time
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Uploaded By
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedFiles.map(files => (
                                <tr key={files.id} className={`border-b dark:bg-gray-800 dark:border-gray-700`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {files.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {files.uploadedTime}
                                    </td>
                                    <td className="px-6 py-4">
                                        {files.uploadedBy}
                                    </td>
                                    <td className="px-6 py-4">
                                        {files.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExcelUploader;