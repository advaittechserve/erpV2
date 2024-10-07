import axios from 'axios';
import { logMessage } from './logger'; // Adjust the import path as necessary
import { excelDateToJSDate } from './excelDateToJSDate';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadAtmData(jsonData) {
    try {
        for (let i = 0; i < jsonData.length; i++) {
            const {
                AtmId, Country, State, City, Address, BranchCode, SiteId,
                Lho, SiteStatus, SiteType, FromDate, ToDate, RequestedBy, RequestFile, BankId, CustomerId
            } = jsonData[i];

            // Convert Excel date serial numbers to JavaScript Date objects
            const formattedFromDate = typeof FromDate === 'number' ? excelDateToJSDate(FromDate).toISOString().split('T')[0] : FromDate;
            const formattedToDate = typeof ToDate === 'number' ? excelDateToJSDate(ToDate).toISOString().split('T')[0] : ToDate;  

            const checkResponseAtm = await axios.get(`http://localhost:5000/atm?AtmId=${AtmId}`);

            if (checkResponseAtm.data && checkResponseAtm.data.length > 0) {
                const existingAtm = checkResponseAtm.data[0];
                const atmId = existingAtm.AtmId;

                const updateData = {
                    AtmId: atmId,
                    Country: Country !== existingAtm.Country ? Country : existingAtm.Country,
                    State: State !== existingAtm.State ? State : existingAtm.State,
                    City: City !== existingAtm.City ? City : existingAtm.City,
                    Address: Address !== existingAtm.Address ? Address : existingAtm.Address,
                    BranchCode: BranchCode !== existingAtm.BranchCode ? BranchCode : existingAtm.BranchCode,
                    SiteId: SiteId !== existingAtm.SiteId ? SiteId : existingAtm.SiteId,
                    Lho: Lho !== existingAtm.Lho ? Lho : existingAtm.Lho,
                    SiteStatus: SiteStatus !== existingAtm.SiteStatus ? SiteStatus : existingAtm.SiteStatus,
                    SiteType: SiteType !== existingAtm.SiteType ? SiteType : existingAtm.SiteType,
                    FromDate: formattedFromDate !== existingAtm.FromDate ? formattedFromDate : existingAtm.FromDate,
                    ToDate: formattedToDate !== existingAtm.ToDate ? formattedToDate : existingAtm.ToDate,
                    RequestedBy: RequestedBy !== existingAtm.RequestedBy ? RequestedBy : existingAtm.RequestedBy,
                    RequestFile: RequestFile !== existingAtm.RequestFile ? RequestFile : existingAtm.RequestFile,
                    BankId: BankId !== existingAtm.BankId ? BankId : existingAtm.BankId,
                    CustomerId: CustomerId !== existingAtm.CustomerId ? CustomerId : existingAtm.CustomerId
                };

                // Check if any updates are necessary
                const hasUpdates = Object.keys(updateData).some(key => updateData[key] !== existingAtm[key]);

                if (hasUpdates) {
    
                    const updateResponse = await axios.post('http://localhost:5000/api/updateAtmData', updateData);

                    if (updateResponse.status !== 200) {

                        console.error('Error updating ATM data:', updateResponse.data);
                        continue;
                    }
                } else {
                   
                }
            } else {             

                const insertData = [{
                    AtmId,
                    Country,
                    State,
                    City,
                    Address,
                    BranchCode,
                    SiteId,
                    Lho,
                    SiteStatus,
                    SiteType,
                    FromDate: formattedFromDate,
                    ToDate: formattedToDate,
                    RequestedBy,
                    RequestFile,
                    BankId,
                    CustomerId
                }];

                const insertResponse = await axios.post('http://localhost:5000/api/insertAtmData', { atmDetails: insertData });

                if (insertResponse.status !== 200) {
                  
                    console.error('Error inserting ATM data:', insertResponse.data);
                    continue;
                }
            }
        }
        
    } catch (error) {
        
        console.error('Error processing ATM data:', error.response ? error.response.data : error.message);
    }
}
