import { useState, useEffect } from 'react';
import '../css/customerform.css';
import GenerateRandomId from '../functions/GenerateRandomId';
import axios from 'axios';
import StatusModal from '../Components/StatusModal';
import { uploadCustomerData } from '../functions/customerDataHandler';
import { uploadBankData } from '../functions/bankDataHandler';
import { uploadAtmData } from '../functions/atmDataHandler';

const CustomerForm = () => {
    const [customerName, setCustomerName] = useState('');
    const [customerStatus, setCustomerStatus] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [bankName, setBankName] = useState('');
    const [bankSuggestions, setBankSuggestions] = useState([]);
    const [atmSuggestions, setAtmSuggestions] = useState([]);
    const [selectedAtmDetails, setSelectedAtmDetails] = useState(null);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [atmDetails, setAtmDetails] = useState([{
        id: 1, AtmId: '', Address: '', BranchCode: '', SiteId: '', Lho: '', SiteStatus: '', BankId: '', CustomerId: '', SiteType: '',
        RequestedBy: '', FromDate: '', ToDate: '', RequestFile: null, RequestFileName: null, sameAsAbove: false, isDatePickerFromDate: false, isDatePickerToDate: false
    }]);
    const [isDatePickerStartDate, setIsDatePickerStartDate] = useState(false);
    const [isDatePickerEndDate, setIsDatePickerEndDate] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateStatusMessage = (message) => {
        setStatusMessage(message);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setStatusMessage('');
    };


    const handleAddAtm = () => {
        const newId = atmDetails[atmDetails.length - 1].id + 1;
        setAtmDetails([...atmDetails, {
            id: newId, AtmId: '', Address: '', BranchCode: '', SiteId: '', Lho: '', SiteStatus: '', BankId: '', CustomerId: '', SiteType: '',
            RequestedBy: '', FromDate: '', ToDate: '', RequestFile: null, RequestFileName: null, sameAsAbove: false, isDatePickerFromDate: false, isDatePickerToDate: false
        }]);
    };

    const handleDeleteAtm = (index) => {
        const updatedAtmDetails = [...atmDetails];
        updatedAtmDetails.splice(index, 1);
        setAtmDetails(updatedAtmDetails);
    };

    const handleCheckboxChange = (index) => {
        const newAtmDetails = [...atmDetails];
        newAtmDetails[index].sameAsAbove = !newAtmDetails[index].sameAsAbove;
        if (newAtmDetails[index].sameAsAbove) {
            // Copy details from the first ATM
            const firstAtm = atmDetails[0];
            Object.assign(newAtmDetails[index], firstAtm);
            newAtmDetails[index].sameAsAbove = true;
        }
        setAtmDetails(newAtmDetails);
    };

    const handleInputChange = (index, event) => {
        const { name, value, files } = event.target;
        const newAtmDetails = [...atmDetails];
        if (name === "RequestFile" && files) {
            newAtmDetails[index][name] = files[0]; // Save the file object
            newAtmDetails[index]['RequestFileName'] = files[0].name;
        } else {
            newAtmDetails[index][name] = value;
        }
        setAtmDetails(newAtmDetails);
    };

    useEffect(() => {
        const fetchCountries = async () => {
            const response = await fetch("http://localhost:5000/api/countries");
            const data = await response.json();
            setCountries(data);
        };
        fetchCountries();
    }, []);

    const fetchStates = async (country) => {
        setSelectedCountry(country);
        const response = await fetch(`http://localhost:5000/api/states?country=${country}`);
        const data = await response.json();
        setStates(data);
    };

    const fetchCities = async (state, country) => {
        setSelectedState(state);
        const response = await fetch(`http://localhost:5000/api/cities?state=${state}&country=${country}`);
        const data = await response.json();
        setCities(data);
    };

    const handleCustomerNameChange = (e) => {
        setCustomerName(e.target.value);
        fetchCustomerSuggestions(e.target.value);
    };

    const handleBankNameChange = (e) => {
        setBankName(e.target.value);
        fetchBankSuggestions(e.target.value);
    };

    const handleAtmIdChange = (index, event) => {
        const { value } = event.target;
        // Update ATM Id in state
        const newAtmDetails = [...atmDetails];
        newAtmDetails[index].AtmId = value;
        setAtmDetails(newAtmDetails);

        // Fetch suggestions based on ATM Id input
        fetchAtmSuggestions(value);
    };

    const fetchCustomerSuggestions = async (query) => {
        if (query.length > 1) {
            const response = await axios.get(`http://localhost:5000/customer?name=${query}`);
            setCustomerSuggestions(response.data);
        } else {
            setCustomerSuggestions([]);
        }
    };

    const fetchBankSuggestions = async (query) => {
        if (query.length > 1) {
            const response = await axios.get(`http://localhost:5000/bank?name=${query}`);
            setBankSuggestions(response.data);
        } else {
            setBankSuggestions([]);
        }
    };

    const fetchAtmSuggestions = async (query) => {
        if (query.length > 1) {
            const response = await axios.get(`http://localhost:5000/atm?AtmId=${query}`);
            setAtmSuggestions(response.data);
        } else {
            setAtmSuggestions([]);
        }
    };

    const handleCustomerSuggestionClick = async (suggestion) => {
        setCustomerName(suggestion);
        setCustomerSuggestions([]);
        try {
            // Fetch customer details based on customer name (assuming an API endpoint for this)
            const response = await fetch(`http://localhost:5000/customer?name=${suggestion}`);
            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }
            const data = await response.json();
            if (data.length > 0) {
                const { CustomerSiteStatus, StartDate, EndDate } = data[0]; // Adjust based on API response structure
                setCustomerStatus(CustomerSiteStatus);
                setStartDate(StartDate);
                setEndDate(EndDate);
            } else {
                // Handle case where no details are found for the selected customer
                setCustomerStatus('');
                setStartDate('');
                setEndDate('');
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            // Handle error fetching customer details
        }
    };

    const handleBankSuggestionClick = (suggestion) => {
        setBankName(suggestion);
        setBankSuggestions([]);
    };

    const handleAtmSuggestionClick = async (suggestion, index) => {
        try {
            // Create a copy of atmDetails state
            const newAtmDetails = [...atmDetails];

            // Check if the index is within the bounds of newAtmDetails
            if (index >= 0 && index < newAtmDetails.length) {
                // Update AtmId in the specified index
                newAtmDetails[index] = {
                    ...newAtmDetails[index],
                    AtmId: suggestion.AtmId,
                };

                // Update other fields based on fetched data (if applicable)
                const response = await fetch(`http://localhost:5000/atm?AtmId=${suggestion.AtmId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ATM details');
                }
                const data = await response.json();

                if (data.length > 0) {
                    const { Address, BranchCode, SiteId, Lho, SiteStatus, SiteType, FromDate, ToDate, RequestedBy } = data[0];
                    newAtmDetails[index] = {
                        ...newAtmDetails[index],
                        Address,
                        BranchCode,
                        SiteId,
                        Lho,
                        SiteStatus,
                        SiteType,
                        FromDate,
                        ToDate,
                        RequestedBy,
                    };
                } else {
                    console.error('No details found for ATM ID:', suggestion.AtmId);
                    // Handle case where no details are found for the selected ATM (optional)
                }

                // Update atmDetails state with the modified copy
                setAtmDetails(newAtmDetails);

                // Optionally store selected ATM details for display or further use
                setSelectedAtmDetails(data[0]);
            } else {
                console.error('Index out of bounds:', index);
                // Handle the case where the index is invalid (optional)
            }
        } catch (error) {
            console.error('Error fetching or updating ATM details:', error);
            // Handle error as needed
        }
        setAtmSuggestions([]);
    };

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

    const handleFocusFromDate = (index) => {
        const updatedAtmDetails = [...atmDetails];
        updatedAtmDetails[index].isDatePickerFromDate = true;
        setAtmDetails(updatedAtmDetails);
    };

    const handleBlurFromDate = (index) => {
        const updatedAtmDetails = [...atmDetails];
        updatedAtmDetails[index].isDatePickerFromDate = false;
        setAtmDetails(updatedAtmDetails);
    };

    const handleFocusToDate = (index) => {
        const updatedAtmDetails = [...atmDetails];
        updatedAtmDetails[index].isDatePickerToDate = true;
        setAtmDetails(updatedAtmDetails);
    };

    const handleBlurToDate = (index) => {
        const updatedAtmDetails = [...atmDetails];
        updatedAtmDetails[index].isDatePickerToDate = false;
        setAtmDetails(updatedAtmDetails);
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
    const handleSubmit = async (event) => {
        event.preventDefault();
        setShowModal(true);
        setIsUploading(true);

        if (!validateDates()) {
            updateStatusMessage('Invalid date range.');
            setIsUploading(false);
            return;
        }

        let customerId = GenerateRandomId(12);
        const bankId = document.getElementById('BankName').value;
        const bankName = document.getElementById('BankName').value;
        const customerSiteStatus = document.getElementById('CustomerSiteStatus').value;

        try {
            updateStatusMessage('Checking if customer exists...');
            await delay(500);

            const customerData = [{
                CustomerId: customerId,
                CustomerName: customerName,
                CustomerSiteStatus: customerSiteStatus,
                StartDate: startDate,
                EndDate: endDate,
            }];

            await uploadCustomerData(customerData);
            updateStatusMessage('Customer data processed successfully');
            await delay(500);

            updateStatusMessage('Checking if bank exists...');
            await delay(500);

            const bankData = {
                BankId: bankId,
                BankName: bankName,
            };

            await uploadBankData(bankData);
            updateStatusMessage('Fetching existing ATM IDs...');
            await delay(500);

            const existingAtmIdsResponse = await axios.get('http://localhost:5000/atm');
            const existingAtmIds = existingAtmIdsResponse.data.map((atm) => atm.AtmId);

            const updatedAtmDetails = atmDetails.map((atmDetail) => {
                const { AtmId, RequestFile, ...rest } = atmDetail;
                if (existingAtmIds.includes(AtmId)) {
                    return null;
                }
                return {
                    ...rest,
                    AtmId,
                    Country: selectedCountry,
                    State: selectedState,
                    City: selectedCity,
                    BankId: bankId,
                    CustomerId: customerId,
                    RequestFileName: RequestFile ? RequestFile.name : null,
                };
            }).filter((atmDetail) => atmDetail !== null);

            if (updatedAtmDetails.length > 0) {
                updateStatusMessage('Inserting ATM details...');
                await delay(500);
                await uploadAtmData(updatedAtmDetails);

                updateStatusMessage('ATM details submitted successfully');
                await delay(500);
            } else {
                updateStatusMessage('No new ATM details to insert.');
                await delay(500);
            }

            updateStatusMessage('Handling file uploads...');
            await delay(500);

            for (const atmDetail of atmDetails) {
                if (atmDetail.RequestFile) {
                    const formData = new FormData();
                    formData.append('file', atmDetail.RequestFile);
                    formData.append('atmId', atmDetail.AtmId);

                    const fileUploadResponse = await axios.post('http://localhost:5000/api/uploadFile', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (fileUploadResponse.status !== 200) {
                        updateStatusMessage(`Error uploading file for ATM ID: ${atmDetail.AtmId}`);
                        console.error('File upload error:', fileUploadResponse.data);
                        await delay(500);
                    } else {
                        updateStatusMessage(`File uploaded successfully for ATM ID: ${atmDetail.AtmId}`);
                        await delay(500);
                    }
                }
            }

            updateStatusMessage('Successfully uploaded data!');
            await delay(500);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            updateStatusMessage('An error occurred during submission.');
        } finally {
            setIsUploading(false);
        }
    };

    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     setShowModal(true);
    //     setIsUploading(true);
    //     if (!validateDates()) {
    //         updateStatusMessage('Invalid date range.');
    //         return;
    //     }

    //     let customerId = GenerateRandomId(12);
    //     const bankId = GenerateRandomId(7);
    //     const bankName = document.getElementById('BankName').value;
    //     const customerSiteStatus = document.getElementById('CustomerSiteStatus').value;

    //     try {
    //         // Check and insert customer data
    //         updateStatusMessage('Checking if customer exists...');
    //         await delay(500);
    //         const checkResponseCustomer = await axios.get(`http://localhost:5000/customer?name=${customerName}`);
    //         if (checkResponseCustomer.data && checkResponseCustomer.data.length > 0) {
    //             customerId = checkResponseCustomer.data[0].CustomerId;
    //             updateStatusMessage('Customer already exists');
    //             await delay(500);
    //         } else {
    //             updateStatusMessage('Inserting new customer data...');
    //             await delay(500);
    //             const customerData = {
    //                 CustomerId: customerId,
    //                 CustomerName: customerName,
    //                 CustomerSiteStatus: customerSiteStatus,
    //                 StartDate: startDate,
    //                 EndDate: endDate
    //             };
    //             const insertResponseCustomer = await axios.post('http://localhost:5000/api/insertCustomerData', customerData);
    //             if (insertResponseCustomer.status !== 200) {
    //                 updateStatusMessage('Error inserting customer data');
    //                 await delay(500);
    //                 return;
    //             }
    //             updateStatusMessage('Customer data inserted successfully');
    //             await delay(500);
    //         }

    //         // Check and insert bank data
    //         updateStatusMessage('Checking if bank exists...');
    //         await delay(500);
    //         const checkResponseBank = await axios.get(`http://localhost:5000/bank?name=${bankName}`);
    //         let bankIdToUse = bankId;
    //         if (checkResponseBank.data && checkResponseBank.data.length > 0) {
    //             bankIdToUse = checkResponseBank.data[0].BankId;
    //             updateStatusMessage(`Bank already exists with ID: ${bankIdToUse}`);
    //             await delay(500);
    //         } else {
    //             updateStatusMessage('Inserting new bank data...');
    //             await delay(500);
    //             const bankData = {
    //                 BankId: bankIdToUse,
    //                 BankName: bankName,
    //             };
    //             const insertResponseBank = await axios.post('http://localhost:5000/api/insertBankData', bankData);
    //             const response = await axios.post('http://localhost:5000/api/insertBankIdCustomerIdData', {
    //                 BankId: bankIdToUse, CustomerId: customerId
    //             });
    //             if (insertResponseBank.status !== 200 && response.status !== 200) {
    //                 updateStatusMessage('Error inserting bank data');
    //                 await delay(500);
    //                 return;
    //             }
    //             updateStatusMessage('Bank data inserted successfully');
    //             await delay(500);
    //         }

    //         // Insert ATM data
    //         updateStatusMessage('Fetching existing ATM IDs...');
    //         await delay(500);
    //         const existingAtmIdsResponse = await axios.get('http://localhost:5000/atm');
    //         const existingAtmIds = existingAtmIdsResponse.data.map((atm) => atm.AtmId);
    //         const updatedAtmDetails = atmDetails.map((atmDetail) => {
    //             const { AtmId, RequestFile, ...rest } = atmDetail;
    //             if (existingAtmIds.includes(AtmId)) {
    //                 return null;
    //             }
    //             return {
    //                 ...rest,
    //                 AtmId,
    //                 Country: selectedCountry,
    //                 State: selectedState,
    //                 City: selectedCity,
    //                 BankId: bankIdToUse,
    //                 CustomerId: customerId,
    //                 RequestFileName: RequestFile ? RequestFile.name : null // Correctly assign the file name
    //             };
    //         }).filter((atmDetail) => atmDetail !== null);

    //         if (updatedAtmDetails.length > 0) {
    //             updateStatusMessage('Inserting ATM details...');
    //             await delay(500);
    //             const insertResponseAtm = await axios.post('http://localhost:5000/api/insertAtmData', { atmDetails: updatedAtmDetails });
    //             if (insertResponseAtm.status !== 200) {
    //                 updateStatusMessage('Error inserting ATM details');
    //                 await delay(500);
    //                 return;
    //             }
    //             updateStatusMessage('ATM details submitted successfully');
    //             await delay(500);
    //         } else {
    //             updateStatusMessage('No new ATM details to insert.');
    //             await delay(500);
    //         }

    //         // Handle file uploads
    //         updateStatusMessage('Handling file uploads...');
    //         await delay(500);
    //         for (const atmDetail of atmDetails) {
    //             if (atmDetail.RequestFile) {
    //                 const formData = new FormData();
    //                 formData.append('file', atmDetail.RequestFile);
    //                 formData.append('atmId', atmDetail.AtmId);

    //                 const fileUploadResponse = await axios.post('http://localhost:5000/api/uploadFile', formData, {
    //                     headers: {
    //                         'Content-Type': 'multipart/form-data'
    //                     }
    //                 });

    //                 if (fileUploadResponse.status !== 200) {
    //                     updateStatusMessage(`Error uploading file for ATM ID: ${atmDetail.AtmId}`);
    //                     await delay(500);
    //                 } else {
    //                     updateStatusMessage(`File uploaded successfully for ATM ID: ${atmDetail.AtmId}`);
    //                     await delay(500);
    //                     updateStatusMessage(`Successfully uploaded data!`);
    //                     await delay(500);
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error in handleSubmit:', error);
    //         updateStatusMessage('An error occurred during submission.');
    //     }
    //     finally {
    //         setIsUploading(false); // Stop the uploading animation
    //     }
    // };

    return (
        <div className='container-form'>
            <form className="customer-details" onSubmit={handleSubmit}>
                <p className="customer-details-heading">Customer Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-4 mt-4">
                    <div>
                        <input
                            type="text"
                            id="CustomerName"
                            className="dropdown"
                            placeholder="Customer Name"
                            value={customerName}
                            onChange={handleCustomerNameChange}
                            required
                        />
                        <ul className='ul-suggestion'>
                            {customerSuggestions.map((suggestion, index) => (
                                <li className='li-suggestion' key={index} onClick={() => handleCustomerSuggestionClick(suggestion.CustomerName)}>
                                    {suggestion.CustomerName}
                                </li>
                            ))}
                        </ul>

                    </div>
                    <div >
                        <select
                            name="CustomerSiteStatus"
                            id="CustomerSiteStatus"
                            className="dropdown"
                            value={customerStatus}
                            onChange={(e) => setCustomerStatus(e.target.value)}
                        >
                            <option value="" disabled>Customer Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    {/* <div>
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
                    </div> */}
                    {/* <div>
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
                    </div> */}

                </div>
                <p className="customer-details-heading">Region Details</p>

                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                    <div>
                        <select id="countries" className="dropdown" onChange={(e) => fetchStates(e.target.value)} required>
                            <option value="" selected disabled>Choose a country</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select id="states" className="dropdown" onChange={(e) => fetchCities(e.target.value, selectedCountry)} required>
                            <option value="" selected disabled>Choose a State</option>
                            {states.map((state, index) => (
                                <option key={index} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select id="cities" className="dropdown" value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            required>
                            <option value="" selected disabled>Choose a City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                </div>
                <p className="customer-details-heading">Bank Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-4 mt-4">
                    <div>
                        <div className='suggestion-container'>
                            <input
                                type="text"
                                id="BankName"
                                className="dropdown"
                                placeholder="Bank Name"
                                value={bankName}
                                onChange={handleBankNameChange}
                                required
                            />
                            <ul className='ul-suggestion'>
                                {bankSuggestions.map((suggestion, index) => (
                                    <li className='li-suggestion' key={index} onClick={() => handleBankSuggestionClick(suggestion.BankName)}>
                                        {suggestion.BankName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
                <p className="customer-details-heading">Atm Details</p>
                <div>

                    {atmDetails.map((atm, index) => (
                        <><hr></hr>
                    {index !== 0 && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', cursor: 'pointer', color: '#ff0000', fontSize: '1.5rem' }} onClick={() => handleDeleteAtm(index)}>
    ✖ {/* Cross (×) icon */}
  </div>
)}

                            <div key={atm.id} className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                                <div>
                                    <input
                                        type="text"
                                        name="AtmId"
                                        value={atm.AtmId}
                                        onChange={(event) => handleAtmIdChange(index, event)}
                                        className="dropdown"
                                        placeholder="Atm ID"
                                        required
                                    />
                                    <ul className='ul-suggestion'>
                                        {atmSuggestions.map((suggestion, index) => (
                                            <li className='li-suggestion' key={index} onClick={() => handleAtmSuggestionClick(suggestion, index)}>
                                                {suggestion.AtmId} {/* Adjust based on your suggestion structure */}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="Address"
                                        value={atm.Address}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Address"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="BranchCode"
                                        value={atm.BranchCode}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Branch Code"
                                        //required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="SiteId"
                                        value={atm.SiteId}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Site ID"
                                        //required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="Lho"
                                        value={atm.Lho}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="LHO"
                                        //required
                                    />
                                </div>
                                <div>
                                    <select
                                        name="SiteStatus"
                                        value={atm.SiteStatus}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                    >
                                        <option value="" disabled>Site Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        name="SiteType"
                                        value={atm.SiteType}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                    >
                                        <option value="" disabled>Site Type</option>
                                        <option value="Onsite">Back Office</option>
                                        <option value="Offsite">Field</option>
                                    </select>
                                </div>
                                <div>
                                    {atm.isDatePickerFromDate ? (
                                        <input
                                            type="date"
                                            name="FromDate"
                                            value={atm.FromDate}
                                            onChange={(event) => handleInputChange(index, event)}
                                            className="dropdown"
                                            onFocus={() => handleFocusFromDate(index)}
                                            onBlur={() => handleBlurFromDate(index)}
                                            required
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            name="FromDate"
                                            value={atm.FromDate}
                                            onChange={(event) => handleInputChange(index, event)}
                                            className="dropdown"
                                            placeholder="From Date"
                                            onFocus={() => handleFocusFromDate(index)}
                                            onBlur={() => handleBlurFromDate(index)}
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    {atm.isDatePickerToDate ? (
                                        <input
                                            type="date"
                                            name="ToDate"
                                            value={atm.ToDate}
                                            onChange={(event) => handleInputChange(index, event)}
                                            className="dropdown"
                                            onFocus={() => handleFocusToDate(index)}
                                            onBlur={() => handleBlurToDate(index)}
                                            //required
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            name="ToDate"
                                            value={atm.ToDate}
                                            onChange={(event) => handleInputChange(index, event)}
                                            className="dropdown"
                                            placeholder="To Date"
                                            onFocus={() => handleFocusToDate(index)}
                                            onBlur={() => handleBlurToDate(index)}
                                            //required
                                        />
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="RequestedBy"
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Requested By"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        name="RequestFile"
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Upload Request File"
                                        required
                                    />
                                </div>
                                {index !== 0 && (
                                    
                                    <div>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={atm.sameAsAbove}
                                                onChange={() => handleCheckboxChange(index)}
                                            />
                                            Details same as first atm
                                        </label>
                                        
                                    </div>
                                    
                                )}
                                
                            </div>
                        
                        </>
                        
                    ))}
                    <button className="add-btn" onClick={handleAddAtm}>Add ATM</button>
                   
                </div>
                {validationError && <div className="error-message">{validationError}</div>}

                <button type="submit" className="submit-btn">Submit</button>
            </form>
            <StatusModal show={showModal} handleClose={handleCloseModal} message={statusMessage} isUploading={isUploading} />
        </div>

    );
};

export default CustomerForm;
