const axios = require('axios');
const { excelDateToJSDate } = require('./excelDateToJSDate');

async function uploadCustomerData(jsonData) {
  try {
    if (jsonData.length > 0) {
    for (let i = 0; i < jsonData.length; i++) {
      const { CustomerId, CustomerName, CustomerSiteStatus} = jsonData[i];


      try {
        const checkResponseCustomer = await axios.get(`http://localhost:5000/customer?name=${CustomerName}`);

        if (checkResponseCustomer.status !== 200) {
          console.error(`Error fetching customer data: ${checkResponseCustomer.data}`);
          continue;
        }

        const existingCustomer = checkResponseCustomer.data && checkResponseCustomer.data.length > 0 ? checkResponseCustomer.data[0] : null;

        if (existingCustomer) {
          const customerId = existingCustomer.CustomerId;

          const updateData = {
            CustomerId: customerId,
            CustomerName: CustomerName !== existingCustomer.CustomerName ? CustomerName : existingCustomer.CustomerName,
            CustomerSiteStatus: CustomerSiteStatus !== existingCustomer.CustomerSiteStatus ? CustomerSiteStatus : existingCustomer.CustomerSiteStatus,
          };
          const updateResponse = await axios.post('http://localhost:5000/api/updateCustomerData', updateData);

          if (updateResponse.status !== 200) {
            console.error(`Error updating customer data: ${updateResponse.data}`);
            continue;
          }
        } else {
          const insertData = {
            CustomerId,
            CustomerName,
            CustomerSiteStatus
          };

          const insertResponse = await axios.post('http://localhost:5000/api/insertCustomerData', insertData);

          if (insertResponse.status !== 200) {
            console.error(`Error inserting customer data: ${insertResponse.data}`);
            continue;
          }
        }
      } catch (error) {
        console.error(`Error processing customer ${CustomerName}:`, error.message);
      }
    }
  }else {
      console.log("No data found in jsonData");
    }

    console.log("uploadCustomerData function completed.");
  } catch (error) {
    console.error('Error processing customer data:', error);
  }
}

module.exports = { uploadCustomerData };
