import React from 'react';
import { useState, useEffect } from 'react';
import '../css/customerform.css';
import "../css/toastStyles.css";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import Select from 'react-select';
import { ErrorOutline } from '@mui/icons-material';
//import StatusModal from '../Components/StatusModal';

const ServicesForm = () => {
    const [serviceId, setServiceId] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeOfEmployee, setTypeOfEmployee] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('NA');
    const [atmIds, setAtmIds] = useState([]);
    const [selectedAtmId, setSelectedAtmId] = useState('NA');
    const [isDatePickerStartDate, setIsDatePickerStartDate] = useState(false);
    const [isDatePickerEndDate, setIsDatePickerEndDate] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [costToClient, setcostToClient] = useState('');
    const [selectedAtmIds, setSelectedAtmIds] = useState([]);
    const [payOut, setpayOut] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    

    // Mapping of service types to service IDs
    const serviceIdMap = {
        HK: 'HK',
        BLM: 'BLM',
        CT: 'CT',
        'FIXED RNM': 'RNM',
        FB: 'FB',
        AUDIT: 'AUDIT',
    };
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#ffffff',
            border: state.isFocused ? '1.5px solid #12BBB4' : '1.5px solid #D7C72C',
            color: '#000',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#D7C72C' : 'white',
            color: state.isSelected ? 'black' : 'gray',
            cursor: 'pointer',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#D7C72C',
        }),
    };

    const handleServiceTypeChange = (selectedType) => {
        setServiceType(selectedType);
        setServiceId(serviceIdMap[selectedType] || ''); // Update Service ID based on selected service type
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleFocusStartDate = () => {
        setIsDatePickerStartDate(true);
    };

    const handleBlurStartDate = () => {
        setIsDatePickerStartDate(false);
    };
    const handleFocusEndDate = () => {
        setIsDatePickerEndDate(true);
    };

    const handleBlurEndDate = () => {
        setIsDatePickerEndDate(false);
    };

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

    const validateDates = () => {
        if (startDate && endDate) {
            if (new Date(startDate) >= new Date(endDate)) {
                setValidationError('End date must be greater than start date!');
                return false;
            }
        }
        setValidationError('');
        return true;
    };

    const options = [
        ...atmIds.map((atm) => ({ value: atm.AtmId, label: atm.AtmId })),
    ];

    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions.map((option) => option.value);
        setSelectedAtmIds(selectedValues);
    };
    const handleCheckboxToggle = () => {
        const allAtmIds = atmIds.map((atm) => atm.AtmId);
        setSelectedAtmIds(allAtmIds);
        setIsChecked((prevChecked) => !prevChecked); // Toggle the isChecked state
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const isValid = validateDates();
    
        if (isValid) {
            setShowModal(true);
    
            try {
                let hasError = false;
    
                for (const atmId of selectedAtmIds) {
                    // Check if service already exists for this ATM ID and Service Type
                    const response = await axios.get('http://localhost:5000/services', {
                        params: {
                            AtmId: atmId,
                            ServiceId: serviceType,
                        },
                    });
    
                    if (response.data && response.data.length > 0) {
                        // Service already exists for this ATM ID and Service Type, prompt for update
                        const existingService = response.data[0];
                        let message = `Service already exists for ATM ID ${atmId} with Service Type ${serviceType}.`;
                        if (existingService.TakeoverDate) {
                            message += `<br /> Start Date: ${existingService.TakeoverDate}`;
                        }
                        if (existingService.HandoverDate) {
                            message += `, End Date: ${existingService.HandoverDate}`;
                        }
                        setModalMessage(`${message} <br /> Do you want to update it?`);
                        setConfirmAction(() => async () => {
                            // Update service
                            const updateData = {
                                ServiceId: existingService.ServiceId,
                                ServiceType: serviceType,
                                TakeoverDate: startDate,
                                HandoverDate: endDate,
                                CostToClient: costToClient,
                                AtmId: atmId,
                                PayOut: payOut
                            };
                            await delay(1000);
                            await axios.post('http://localhost:5000/api/updateServicesData', updateData);
                            setModalMessage('Service updated successfully');
                            setShowModal(false);
                        });
                        setIsDeleteModalOpen(true);
                        hasError = true;
                        break;
                    } else {
                        // Service does not exist for this ATM ID and Service Type, prompt for insert
                        const formData = {
                            servicesDetails: [{
                                ServiceId: serviceId,
                                ServiceType: serviceType,
                                TakeoverDate: startDate,
                                HandoverDate: endDate,
                                CostToClient: costToClient,
                                AtmId: atmId,
                                PayOut: payOut
                            }]
                        };
                        setModalMessage(`Do you want to insert service details for ATM ID ${atmId}?`);
                        setConfirmAction(() => async () => {
                            setModalMessage(`Uploading service details for ATM ID ${atmId}...`);
                            await delay(1000);
                            await axios.post('http://localhost:5000/api/insertServicesData', formData);
                            setModalMessage('Service details submitted successfully');
                            setShowModal(false);
                        });
                        setIsDeleteModalOpen(true);
                        hasError = true;
                        break;
                    }
                }
    
                if (!hasError) {
                    setModalMessage('Service details submitted successfully');
                }
            } catch (error) {
                setModalMessage('Error inserting or updating service details');
                console.error('Error submitting form:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    

    const handleCloseModal = () => {
        setShowModal(false);
        setConfirmAction(null);
    };

    const confirmDeletion = async () => {
        if (confirmAction) {
            await confirmAction();
        }
        setIsDeleteModalOpen(false);
    };

    const cancelDeletion = () => {
        setIsDeleteModalOpen(false);
    };

    return (
        <div className='container-form'>
            <form className="customer-details" onSubmit={handleSubmit}>
                <p className="customer-details-heading">Services Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                    {/* <input
                        type="text"
                        value={serviceId}
                        className="dropdown"
                        placeholder="Service ID (autofill)"
                        disabled
                    /> */}
                    <select
                        value={serviceType}
                        onChange={(e) => handleServiceTypeChange(e.target.value)}
                        className="dropdown"
                        required
                    >
                        <option value="">Select Service Type</option>
                        <option value="HK">HK</option>
                        <option value="BLM">BLM</option>
                        <option value="CT">CT</option>
                        <option value="FIXED RNM">FIXED RNM</option>
                        <option value="FB">FB</option>
                        <option value="AUDIT">AUDIT</option>
                    </select>
                    <input
                        type="number"
                        value={costToClient}
                        onChange={(e) => setcostToClient(e.target.value)}
                        className="dropdown"
                        placeholder="Cost to Client"
                    />
<input
                        type="number"
                        value={payOut}
                        onChange={(e) => setpayOut(e.target.value)}
                        className="dropdown"
                        placeholder="Payout"
                    />

                </div>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                    {isDatePickerStartDate ? (
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="dropdown"
                            onFocus={handleFocusStartDate}
                            onBlur={handleBlurStartDate}
                            required
                        />
                    ) : (
                        <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="dropdown"
                            placeholder="Select Start Date"
                            onFocus={handleFocusStartDate}
                            onBlur={handleBlurStartDate}
                            required
                        />
                    )}
                    {isDatePickerEndDate ? (
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="dropdown"
                            onFocus={handleFocusEndDate}
                            onBlur={handleBlurEndDate}
                            //required
                        />
                    ) : (
                        <input
                            type="text"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="dropdown"
                            placeholder="Select End Date"
                            onFocus={handleFocusEndDate}
                            onBlur={handleBlurEndDate}
                            //required
                        />
                    )}
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

                </div>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                    <Select
                        isMulti
                        value={options.filter((option) => selectedAtmIds.includes(option.value))}
                        options={options}
                        onChange={handleSelectChange}
                        styles={customStyles} required
                    />
                    <label className="mt-2 flex items-center space-x-2 cursor-pointer">
                        {/* Render a checkbox based on the isChecked state */}
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckboxToggle}
                        />
                        <span className="text-gray-800">Select all atms</span>
                    </label>
                </div>

                <button type="submit" className="submit-btn">Submit</button>

                {isDeleteModalOpen && (
            <div
              id="delete-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={cancelDeletion}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg sm:w-full">
                  <div className="p-20">
                    <div className="">
                      <div className="mt-3 text-center">
                        <ErrorOutline
                          style={{ color: "red", fontSize: "2rem" }}
                        />
                        <h2 className="text-xl" id="modal-title" dangerouslySetInnerHTML={{ __html: modalMessage }} />
                       
                        <div className="mt-4 flex justify-center space-x-4">
                          <button
                            onClick={confirmDeletion}
                            className="submit-btn"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDeletion}
                            className="cancel-btn"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                {validationError && <div className="error-message">{validationError}</div>}

                

            </form>
        </div>
    );
};

export default ServicesForm;
