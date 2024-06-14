import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/customerform.css';
import StatusModal from '../Components/StatusModal';

const EmployeeForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [employeeContactNumber, setEmployeeContactNumber] = useState('');
    const [typeOfWork, setTypeOfWork] = useState('NA');
    const [typeOfEmployee, setTypeOfEmployee] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('NA');
    const [atmIds, setAtmIds] = useState([]);
    const [selectedAtmId, setSelectedAtmId] = useState('NA');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:5000/customer');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        if (selectedCustomer !== 'NA') {
            fetchAtmIds(selectedCustomer);
        }
    }, [selectedCustomer]);

    const fetchAtmIds = async (customerId) => {
        try {
            const response = await fetch(`http://localhost:5000/atm?CustomerId=${customerId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch ATM IDs');
            }
            const data = await response.json();
            setAtmIds(data);
            setSelectedAtmId('NA');
        } catch (error) {
            console.error('Error fetching ATM IDs:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = {
            employeeDetails: [{
                EmployeeId: employeeId,
                EmployeeName: employeeName,
                EmployeeContactNumber: employeeContactNumber,
                TypeOfWork: typeOfWork,
                EmployeeRole: typeOfEmployee,
                CustomerId: selectedCustomer,
                AtmId: selectedAtmId
            }]
        };
        setShowModal(true);
        setIsUploading(true);
        setModalMessage('Uploading employee details...');
        await delay(500);

        try {
            const insertResponseEmployee = await axios.post('http://localhost:5000/api/insertEmployeeData', formData);
            if (insertResponseEmployee.status === 200) {
                setModalMessage('name submitted successfully');
                const response = await axios.post('http://localhost:5000/api/insertEmployeeIdAtmIdData', {
                  AtmId: selectedAtmId, EmployeeId: employeeId ,
                });
                if (response.status === 200) {
                    setModalMessage('Employee details submitted successfully');
                } else {
                    setModalMessage('Error inserting Employee details');
                }
            }
        } catch (error) {
            setModalMessage('Error inserting Employee details');
            console.error('Error submitting form:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className='container-form'>
            <form className="customer-details" onSubmit={handleSubmit}>
                <p className="customer-details-heading">Employee Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-2 mt-4">
                    <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="dropdown"
                        placeholder="Employee Id"
                        required
                    />
                    <input
                        type="text"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        className="dropdown"
                        placeholder="Employee Name"
                        required
                    />
                </div>
                <div className="grid gap-4 mb-6 md:grid-cols-2 mt-4">
                    <input
                        type="number"
                        value={employeeContactNumber}
                        onChange={(e) => setEmployeeContactNumber(e.target.value)}
                        className="dropdown"
                        placeholder="Employee Contact Number"
                        required
                    />
                    <select
                        value={typeOfWork}
                        onChange={(e) => setTypeOfWork(e.target.value)}
                        className="dropdown"
                    >
                        <option value="NA">Type Of Work</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Offsite">Offsite</option>
                    </select>
                </div>
                <div className="grid gap-4 mb-6 md:grid-cols-2 mt-4">
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="dropdown"
                    >
                        <option value="NA">Select Customer</option>
                        {customers.map((customer) => (
                            <option key={customer.CustomerId} value={customer.CustomerId}>
                                {customer.CustomerName}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedAtmId}
                        onChange={(e) => setSelectedAtmId(e.target.value)}
                        className="dropdown"
                    >
                        <option value="NA">Select ATM ID</option>
                        {atmIds.map((atm) => (
                            <option key={atm.AtmId} value={atm.AtmId}>
                                {atm.AtmId}
                            </option>
                        ))}
                    </select>
                </div>
                <ul className="checkbox-list">
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="checkbox-label">
                            <input
                                type="radio"
                                id="P-TeamLeader"
                                name="typeOfEmployee"
                                value="P-Team Leader"
                                checked={typeOfEmployee === 'P-Team Leader'}
                                onChange={() => setTypeOfEmployee('P-Team Leader')}
                                className="checkbox-input"
                            />
                            <label htmlFor="P-TeamLeader" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">P-Team Leader</label>
                        </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="checkbox-label">
                            <input
                                type="radio"
                                id="TeamLeader"
                                name="typeOfEmployee"
                                value="Team Leader"
                                checked={typeOfEmployee === 'Team Leader'}
                                onChange={() => setTypeOfEmployee('Team Leader')}
                                className="checkbox-input"
                            />
                            <label htmlFor="TeamLeader" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Team Leader</label>
                        </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="checkbox-label">
                            <input
                                type="radio"
                                id="Supervisor"
                                name="typeOfEmployee"
                                value="Supervisor"
                                checked={typeOfEmployee === 'Supervisor'}
                                onChange={() => setTypeOfEmployee('Supervisor')}
                                className="checkbox-input"
                            />
                            <label htmlFor="Supervisor" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Supervisor</label>
                        </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="checkbox-label">
                            <input
                                type="radio"
                                id="Custodian"
                                name="typeOfEmployee"
                                value="Custodian"
                                checked={typeOfEmployee === 'Custodian'}
                                onChange={() => setTypeOfEmployee('Custodian')}
                                className="checkbox-input"
                            />
                            <label htmlFor="Custodian" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Custodian</label>
                        </div>
                    </li>
                </ul>

                <button type="submit" className="submit-btn">Submit</button>
            </form>

            <StatusModal
                show={showModal}
                handleClose={handleCloseModal}
                message={modalMessage}
                isUploading={isUploading}
            />
        </div>
    );
};

export default EmployeeForm;
