import { useState, useEffect } from 'react';
import '../css/customerform.css';
import axios from 'axios';
import Select from 'react-select';
import StatusModal from '../Components/StatusModal';

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
    const [isChecked, setIsChecked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


    // Mapping of service types to service IDs
    const serviceIdMap = {
        HK: 'HK123',
        BLM: 'BLM456',
        CT: 'CT789',
        'FIXED RNM': 'RNM123',
        FB: 'FB456',
        AUDIT: 'AUDIT789',
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
                setValidationError('end date must be greater that start date!');
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
            setIsUploading(true);

            try {
                for (const atmId of selectedAtmIds) {
                    const formData = {
                        servicesDetails: [{
                            ServiceId: serviceId,
                            ServiceType: serviceType,
                            TakeoverDate: startDate,
                            HandoverDate: endDate,
                            CostToClient: costToClient,
                            AtmId: atmId
                        }]
                    };
                    setModalMessage(`Uploading services details for ${atmId}...`);
                    await delay(1000);
                    await axios.post('http://localhost:5000/api/insertServicesData', formData);

                }

                setModalMessage('Services details submitted successfully');
            } catch (error) {
                setModalMessage('Error inserting Services details');
                console.error('Error submitting form:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className='container-form'>
            <form className="customer-details" onSubmit={handleSubmit}>
                <p className="customer-details-heading">Services  Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                    <input
                        type="text"
                        value={serviceId}
                        className="dropdown"
                        placeholder="Service Id (autofill)"
                        disabled
                    />
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
                            required
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
                            required
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
                <div className="grid gap-4 mb-6 md:grid-cols-2 mt-4">

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

                {validationError && <div className="error-message">{validationError}</div>}

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

export default ServicesForm;
