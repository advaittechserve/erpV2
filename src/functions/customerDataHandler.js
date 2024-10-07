import axios from 'axios';
import { logMessage } from './logger'; // Adjust the import path as necessary
import { excelDateToJSDate } from './excelDateToJSDate';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadCustomerData(jsonData) {
    try {
        for (let i = 0; i < jsonData.length; i++) {
            const { CustomerId, CustomerName, CustomerSiteStatus, StartDate, EndDate } = jsonData[i];
           
            // Convert Excel date serial numbers to JavaScript Date objects
            const formattedStartDate = typeof StartDate === 'number' ? excelDateToJSDate(StartDate).toISOString().split('T')[0] : StartDate;
            const formattedEndDate = typeof EndDate === 'number' ? excelDateToJSDate(EndDate).toISOString().split('T')[0] : EndDate;
           

            const checkResponseCustomer = await axios.get(`http://localhost:5000/customer?name=${CustomerName}`);
            
            if (checkResponseCustomer.data && checkResponseCustomer.data.length > 0) {
                const existingCustomer = checkResponseCustomer.data[0];
                const customerId = existingCustomer.CustomerId;

                const updateData = {
                    CustomerId: customerId,
                    CustomerName: CustomerName !== existingCustomer.CustomerName ? CustomerName : existingCustomer.CustomerName,
                    CustomerSiteStatus: CustomerSiteStatus !== existingCustomer.CustomerSiteStatus ? CustomerSiteStatus : existingCustomer.CustomerSiteStatus,
                    StartDate: formattedStartDate !== existingCustomer.StartDate ? formattedStartDate : existingCustomer.StartDate,
                    EndDate: formattedEndDate !== existingCustomer.EndDate ? formattedEndDate : existingCustomer.EndDate
                };

                // Check if any updates are necessary
                const hasUpdates = Object.keys(updateData).some(key => updateData[key] !== existingCustomer[key]);

                if (hasUpdates) {

                    const updateResponse = await axios.post('http://localhost:5000/api/updateCustomerData', updateData);

                    if (updateResponse.status !== 200) {
              
                        return;
                    }

     
                } else {
        
                    
                }
            } else {
              

                const insertData = {
                    CustomerId,
                    CustomerName,
                    CustomerSiteStatus,
                    StartDate: formattedStartDate,
                    EndDate: formattedEndDate
                };

                const insertResponse = await axios.post('http://localhost:5000/api/insertCustomerData', insertData);

                if (insertResponse.status !== 200) {
      
                    return;
                }

            }
        }

        } catch (error) {
        console.error('Error processing customer data:', error);
    }
}
