import { useState, useEffect } from 'react';
import '../css/customerform.css';
import GenerateRandomId from '../functions/GenerateRandomId';
import axios from 'axios';

const CustomerForm = () => {
    const [customerName, setCustomerName] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [atmDetails, setAtmDetails] = useState([{ id: 1, AtmId: '', Address: '', BranchCode: '', SiteId: '', Lho: '', SiteStatus: '', BankId:'', CustomerId:'', Country:'',State:'',City:''}]);

    const handleAddAtm = () => {
        const newId = atmDetails[atmDetails.length - 1].id + 1;
        setAtmDetails([...atmDetails, { id: newId, AtmId: '', Address: '', BranchCode: '', SiteId: '', Lho: '', SiteStatus: '', BankId:'', CustomerId:'', Country:'',State:'',City:'' }]);
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
        const { name, value } = event.target;
        const newAtmDetails = [...atmDetails];
        newAtmDetails[index][name] = value;
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
        const response = await fetch(`http://localhost:5000/api/cities?state=${state}&country=${country}`);
        const data = await response.json();
        setCities(data);
    };

    const handleCustomerNameChange = async (event) => {
        const input = event.target.value;
        setCustomerName(input);

        // Fetch suggestions from backend API
        const response = await fetch(`http://localhost:5000/customer?name=${input}`);
        const data = await response.json();
        setSuggestions(data);
    };

    const handleSuggestionClick = (suggestion) => {
        setCustomerName(suggestion);
        setSuggestions([]); // Clear suggestions
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        var customerId = GenerateRandomId(12);
        var bankId = GenerateRandomId(7);
        var bankName = document.getElementById('BankName').value;
        var atmCount = document.getElementById('AtmCount').value;
        var field = document.getElementById('Field').value;

        try {
            const checkResponseCustomer = await axios.get(`http://localhost:5000/customer?name=${customerName}`);

            if (checkResponseCustomer.data && checkResponseCustomer.data.length > 0) {
                customerId = checkResponseCustomer.data[0].CustomerId;
                console.log(`Customer already exists`);
            } else {
                const CustomerData = {
                    CustomerId: customerId,
                    CustomerName: customerName
                };

                const insertResponseCustomer = await axios.post('http://localhost:5000/api/insertCustomerData', CustomerData);

                if (insertResponseCustomer.status === 200) {
                    
                    console.log('Data inserted successfully');
                } else {
                    console.log('Error inserting data');
                }
            }
        } catch (error) {
            console.error('Error checking/inserting customer data:', error);
        }

        try {
            const checkResponseBank = await axios.get(`http://localhost:5000/bank?name=${bankName}`);

            if (checkResponseBank.data && checkResponseBank.data.length > 0) {
                bankId = checkResponseBank.data[0].BankId;
                console.log(`bank already exists with ID`);
            } else {
                const BankData = {
                    BankId: bankId,
                    BankName: bankName,
                    AtmCount: atmCount,
                    Field: field,
                    CustomerId: customerId
                };
                const insertResponseBank = await axios.post('http://localhost:5000/api/insertBankData', BankData);

                if (insertResponseBank.status === 200) {
                    console.log('Data inserted successfully');
                } else {
                    console.log('Error inserting data');
                }
            }
        } catch (error) {
            console.error('Error checking/inserting Bank data:', error);
        }

        try {        
            // Fetch existing ATM IDs from backend
            const existingAtmIdsResponse = await axios.get('http://localhost:5000/atm');
            const existingAtmIds = existingAtmIdsResponse.data.map((atm) => atm.AtmId);
            console.log('Existing ATM IDs:', existingAtmIds);
        
            // Prepare updated ATM details with BankId and CustomerId
            const updatedAtmDetails = atmDetails.map((atmDetail) => {
              const { atmId, ...rest } = atmDetail;
        
              if (existingAtmIds.includes(atmId)) {
                //console.log(`Skipping existing ATM ID: ${atmId}`);
                return null;
              }
        
              return {
                ...rest,
                atmId: atmId, // Ensure atmId remains unchanged
                BankId: bankId,
                CustomerId: customerId
              };
            }).filter((atmDetail) => atmDetail !== null);
            console.log('Updated ATM details:', updatedAtmDetails);
        
            // Submit updated ATM details to backend for insertion
            const insertResponseAtm = await axios.post('http://localhost:5000/api/insertAtmData', { atmDetails: updatedAtmDetails });
        
            if (insertResponseAtm.status === 200) {
              console.log('ATM details submitted successfully');
            } else {
              console.log('Error inserting ATM details');
            }
          } catch (error) {
            console.error('Error checking/inserting ATM data:', error);
          }

    };
    
    return (
        <div className='container-form'>
            <form className="customer-details" onSubmit={handleSubmit}>
                <p className="customer-details-heading">Customer Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
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
                        <ul className='ul-customersuggestion'>
                            {suggestions.map((suggestion, index) => (
                                <li className='li-customersuggestion' key={index} onClick={() => handleSuggestionClick(suggestion.CustomerName)}>
                                    {suggestion.CustomerName}
                                </li>
                            ))}
                        </ul>
                    </div>
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
                        <select id="cities" className="dropdown" required>
                            <option value="" selected disabled>Choose a City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                </div>
                <p className="customer-details-heading">Bank Details</p>
                <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                    <div>
                        <input type="text" id="BankName" className="dropdown" placeholder="Bank Name" required />
                    </div>
                    <div >
                        <input type="text" id="AtmCount" className="dropdown" placeholder="Atm Count" required />
                    </div>
                    <div>
                        <input type="text" id="Field" className="dropdown" placeholder="Field" required />
                    </div>
                </div>
                <p className="customer-details-heading">Atm Details</p>
                <div>

                    {atmDetails.map((atm, index) => (
                        <><hr></hr>
                            <div key={atm.id} className="grid gap-4 mb-6 md:grid-cols-3 mt-4">

                                <div>
                                    <input
                                        type="text"
                                        name="AtmId"
                                        value={atm.AtmId}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Atm Id"
                                        required
                                    />
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
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="SiteId"
                                        value={atm.SiteId}
                                        onChange={(event) => handleInputChange(index, event)}
                                        className="dropdown"
                                        placeholder="Site Id"
                                        required
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
                                        required
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
                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>

    );
};

export default CustomerForm;
