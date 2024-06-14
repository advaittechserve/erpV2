import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import '../css/customerform.css';
import axios from 'axios';
import BackButton from '../Components/BackButton';

const AtmForm = () => {
    const { atmId } = useParams();
    const [countries, setCountries] = useState([]);
    const [newAtmId, setNewAtmId] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [atms, setAtms] = useState([]);
    const [services, setServices] = useState([]);
    const [address, setAddress] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [siteId, setSiteId] = useState('');
    const [lho, setLho] = useState('');
    const [siteStatus, setSiteStatus] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDatePickerStartDate, setIsDatePickerStartDate] = useState(false);
    const [isDatePickerEndDate, setIsDatePickerEndDate] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [costToClient, setcostToClient] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceIdToDelete, setServiceIdToDelete] = useState(null);




    useEffect(() => {
        const fetchAtmServices = async () => {
            try {
                const response = await fetch('http://localhost:5000/atm');
                const data = await response.json();
                const filteredAtm = data.filter((item) => item.AtmId === atmId);
                setAtms(filteredAtm);
                console.log('Fetched ATM Services:', filteredAtm);
            } catch (error) {
                console.error('Error fetching ATM services:', error);
            }
        };

        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:5000/services');
                const data = await response.json();
                const filteredServices = data.filter((item) => item.AtmId === atmId);
                setServices(filteredServices);
                console.log('Fetched ATM Services:', filteredServices);
            } catch (error) {
                console.error('Error fetching ATM services:', error);
            }
        };

        const fetchCountries = async () => {
            const response = await fetch("http://localhost:5000/api/countries");
            const data = await response.json();
            setCountries(data);
        };

        const fetchData = async () => {
            await fetchAtmServices();
            await fetchServices();
            await fetchCountries();
            setLoading(false); // Set loading to false once all data is fetched
        };

        fetchData();
    }, [atmId]);


    const fetchStates = async (country) => {
        setSelectedCountry(country);
        const response = await fetch(`http://localhost:5000/api/states?country=${country}`);
        const data = await response.json();
        setStates(data);
    };

    const fetchCities = async (state, country) => {
        const response = await fetch(`http://localhost:5000/api/cities?state=${state}&country=${country}`);
        const data = await response.json();
        setCities(data);
    };

    const serviceIdMap = {
        HK: 'HK123',
        BLM: 'BLM456',
        CT: 'CT789',
        'FIXED RNM': 'RNM123',
        FB: 'FB456',
        AUDIT: 'AUDIT789',
    };

    const handleServiceTypeChange = (selectedType) => {
        setServiceType(selectedType);
        setServiceId(serviceIdMap[selectedType] || ''); // Update Service ID based on selected service type
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
        const isValid = validateDates();

        if (isValid) {

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

            console.log('Form Data:', formData);
            const insertResponseService = await axios.post('http://localhost:5000/api/insertServicesData', formData);
            if (insertResponseService.status === 200) {
                console.log('Employee details submitted successfully');
            } else {
                console.log('Error inserting Employee details');
            }
        }
    };
    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
    };
    if (loading) {
        return <div className="text-center">
            <div role="status">
                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>; // Show a loading indicator while data is being fetched
    }

    return (
        <div className='container-form'>
            <div className="customer-details">
                <BackButton />
                <form className="" onSubmit={handleSubmit}>
                    <p className="customer-details-heading">Atm Details</p>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Atm ID</label>
                            <input
                                type="text"
                                value={atmId}
                                onChange={(e) => setNewAtmId(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Address</label>
                            <input
                                type="text"
                                value={atms[0].Address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Branch Code</label>
                            <input
                                type="text"
                                value={atms[0].BranchCode}
                                onChange={(e) => setBranchCode(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Site ID</label>
                            <input
                                type="text"
                                value={atms[0].SiteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">LHO</label>
                            <input
                                type="text"
                                value={atms[0].Lho}
                                onChange={(e) => setLho(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Site Status</label>
                            <select
                                name="SiteStatus"
                                value={atms[0].SiteStatus}
                                onChange={(e) => setSiteStatus(e.target.value)}
                                className="dropdown"
                                disabled={!isEditMode}
                            >
                                <option value="" disabled>Site Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div>
                            <select
                                id="countries"
                                className="dropdown"
                                value={atms.country}
                                onChange={(e) => fetchStates(e.target.value)}
                                required disabled={!isEditMode}
                            >
                                <option value="" disabled>
                                    Choose a country
                                </option>
                                {/* Render options dynamically for countries */}
                                {countries.map((country, index) => (
                                    <option key={index} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                id="states"
                                className="dropdown"
                                value={atms.state}
                                onChange={(e) => fetchCities(e.target.value, atmServices.country)}
                                required disabled={!isEditMode}
                            >
                                <option value="" disabled>
                                    Choose a State
                                </option>
                                {/* Render options dynamically for states */}
                                {states.map((state, index) => (
                                    <option key={index} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                id="cities"
                                className="dropdown"
                                value={atms.city}
                                required disabled={!isEditMode}
                            >
                                <option value="" disabled>
                                    Choose a City
                                </option>
                                {/* Render options dynamically for cities */}
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <hr /><hr />
                    <div>
                        {services.map((service, index) => (
                            <div key={index} className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                                <div className="relative">
                                    <label htmlFor={`serviceId_${index}`} className="label_form">
                                        Service ID
                                    </label>
                                    <input
                                        type="text"
                                        id={`serviceId_${index}`}
                                        value={service.ServiceId}
                                        className="dropdown"
                                        placeholder="Service Id (autofill)"
                                        disabled={!isEditMode}
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor={`serviceType_${index}`} className="label_form">
                                        Service Type
                                    </label>
                                    <select
                                        id={`serviceType_${index}`}
                                        value={service.ServiceType}
                                        onChange={(e) => handleServiceTypeChange(e.target.value)}
                                        className="dropdown"
                                        required
                                        disabled={!isEditMode}
                                    >
                                        <option value="">Select Service Type</option>
                                        <option value="HK">HK</option>
                                        <option value="BLM">BLM</option>
                                        <option value="CT">CT</option>
                                        <option value="FIXED RNM">FIXED RNM</option>
                                        <option value="FB">FB</option>
                                        <option value="AUDIT">AUDIT</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <label htmlFor={`costToClient_${index}`} className="label_form">
                                        Cost To Client
                                    </label>
                                    <input
                                        type="number"
                                        id={`costToClient_${index}`}
                                        value={service.CostToClient}
                                        onChange={(e) => handleCostToClientChange(e.target.value)}
                                        className="dropdown"
                                        placeholder="Cost to Client"
                                        disabled={!isEditMode}
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor={`startDate_${index}`} className="label_form">
                                        Takeover Date
                                    </label>
                                    <input
                                        type="date"
                                        id={`startDate_${index}`}
                                        value={service.TakeoverDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className="dropdown"
                                        onFocus={handleFocusStartDate}
                                        onBlur={handleBlurStartDate}
                                        required
                                        disabled={!isEditMode}
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor={`endDate_${index}`} className="label_form">
                                        Handover Date
                                    </label>
                                    <input
                                        type="date"
                                        id={`endDate_${index}`}
                                        value={service.HandoverDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        className="dropdown"
                                        onFocus={handleFocusEndDate}
                                        onBlur={handleBlurEndDate}
                                        required
                                        disabled={!isEditMode}
                                    />
                                </div>
                                <button onClick={() => handleDeletion(tableMeta.rowData[0])} className="delete-btn">
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    {isEditMode ? (
                        <div>
                            <button type="button" className="cancel-btn " onClick={handleCancelClick}>Cancel</button>
                            <button type="submit" className="submit-btn ml-2 ">Submit</button>
                        </div>
                    ) : (
                        <button type="button" className="submit-btn" onClick={handleEditClick}>Edit</button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AtmForm;
