import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import uploadAnimationData from '../assets/upload-icon.json';
import { CSVImporter } from 'csv-import-react';
import { jwtDecode } from 'jwt-decode';
import { uploadCustomerData } from '../functions/customerDataHandler';
import { uploadBankData } from '../functions/bankDataHandler';
import { uploadAtmData } from '../functions/atmDataHandler';
import { uploadEmployeeData } from '../functions/employeeDataHandler';
import { uploadServiceData } from '../functions/serviceDataHandler';
import templateData from '../functions/template';// Importing the template data

const TestUpload = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [modalMessage, setModalMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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

    const handleFileUpload = async (data) => {
        console.log("Parsed CSV data:", data);
        try {
            setIsUploading(true);
            // Process the uploaded data
            await uploadCustomerData(data, setUploadProgress, setModalMessage);
            await uploadBankData(data, setUploadProgress, setModalMessage);
            await uploadAtmData(data, setUploadProgress, setModalMessage);
            await uploadEmployeeData(data, setUploadProgress, setModalMessage);
            await uploadServiceData(data, setUploadProgress, setModalMessage);
            setModalMessage('File data logged successfully');
        } catch (error) {
            setModalMessage('An error occurred while uploading data');
            console.error('Error uploading data:', error);
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
                <button onClick={() => setIsOpen(true)}>Open CSV Importer</button>
                <CSVImporter
                    modalIsOpen={isOpen}
                    modalOnCloseTriggered={() => setIsOpen(false)}
                    darkMode={true}
                    onComplete={handleFileUpload}
                    template={{
                        columns: templateData.flatMap(section => section.fields.map(field => ({
                            name: field.label.replace(':', ''),
                            key: field.key,
                            required: field.required,
                            description: field.description,
                            suggested_mappings: field.suggested_mappings,
                        })))
                    }}
                />

                <div className="flex justify-between m-2">
                    <span className="text-base font-medium text-yellow-500 dark:text-white">{modalMessage}</span>
                    <span className="text-sm font-medium text-yellow-500 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} ></div>
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
        </div>
    );
};

export default TestUpload;
