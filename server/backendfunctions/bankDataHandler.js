const axios = require('axios');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadBankData(jsonData) {
    try {
        for (let i = 0; i < jsonData.length; i++) {
            const { BankId, BankName, CustomerId } = jsonData[i];

            const encodedBankName = encodeURIComponent(BankName);
            const checkResponseBank = await axios.get(`http://localhost:5000/bank?name=${encodedBankName}`);
            const existingBank = checkResponseBank.data && checkResponseBank.data.length > 0 ? checkResponseBank.data[0] : null;

            if (existingBank) {
                const bankId = existingBank.BankId;

                // Check if bank data needs to be updated
                if (existingBank.BankName !== BankName) {
                    const updateBankData = {
                        BankId: bankId,
                        BankName: BankName
                    };

                    const updateBankResponse = await axios.post('http://localhost:5000/api/updateBankData', { data: [updateBankData] });

                    if (updateBankResponse.status !== 200) {
                        continue;
                    }
                }

                let bankCustomerExists = false;
                try {
                    const encodedCustomerId = encodeURIComponent(CustomerId);
                    const checkResponseBankCustomer = await axios.get(`http://localhost:5000/bank_customerdetails?bankId=${bankId}&customerId=${encodedCustomerId}`);
                    if (checkResponseBankCustomer.status === 200) {
                        bankCustomerExists = true;
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        bankCustomerExists = false;
                    } else {
                        throw error;
                    }
                }

                if (!bankCustomerExists) {
                    const insertBankCustomerData = {
                        BankId: bankId,
                        CustomerId: CustomerId
                    };

                    const insertBankCustomerResponse = await axios.post('http://localhost:5000/api/insertBankIdCustomerIdData', insertBankCustomerData);

                    if (insertBankCustomerResponse.status !== 200) {
                        continue;
                    }
                }
            } else {
                const insertBankData = {
                    BankId,
                    BankName
                };

                const insertBankResponse = await axios.post('http://localhost:5000/api/insertBankData', insertBankData);

                if (insertBankResponse.status !== 200) {
                    continue;
                }

                const insertBankCustomerData = {
                    BankId: BankId,
                    CustomerId: CustomerId
                };

                const insertBankCustomerResponse = await axios.post('http://localhost:5000/api/insertBankIdCustomerIdData', insertBankCustomerData);

                if (insertBankCustomerResponse.status !== 200) {
                    continue;
                }
            }
        }
        console.log("uploadbankData function completed.");
    } catch (error) {
        console.error('Error processing bank data:', error);
    }
}

module.exports = { uploadBankData };
