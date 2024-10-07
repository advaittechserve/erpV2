import axios from 'axios';
import { excelDateToJSDate } from './excelDateToJSDate';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadServiceData(jsonData) {
    try {
        for (let i = 0; i < jsonData.length; i++) {
            const {
                ServiceId, ServiceType, TakeoverDate, HandoverDate, PayOut, CostToClient, AtmId
            } = jsonData[i];

            // Convert Excel date serial numbers to JavaScript Date objects
            const formattedTakeoverDate = typeof TakeoverDate === 'number' ? excelDateToJSDate(TakeoverDate).toISOString().split('T')[0] : TakeoverDate;
            const formattedHandoverDate = typeof HandoverDate === 'number' ? excelDateToJSDate(HandoverDate).toISOString().split('T')[0] : HandoverDate;

            let checkResponseService;
            try {
                const checkResponseService = await axios.get('http://localhost:5000/services',{params: { ServiceId, AtmId }});
            } catch (error) {
                console.error('Error checking service data:', error.response ? error.response.data : error.message);
                continue;  // Skip to the next iteration
            }

            if (checkResponseService.data && checkResponseService.data.length > 0) {
                const existingService = checkResponseService.data[0];

                const updateData = {
                    ServiceId,
                    ServiceType: ServiceType !== existingService.ServiceType ? ServiceType : existingService.ServiceType,
                    TakeoverDate: formattedTakeoverDate !== existingService.TakeoverDate ? formattedTakeoverDate : existingService.TakeoverDate,
                    HandoverDate: formattedHandoverDate !== existingService.HandoverDate ? formattedHandoverDate : existingService.HandoverDate,
                    PayOut: PayOut !== existingService.PayOut ? PayOut : existingService.PayOut,
                    CostToClient: CostToClient !== existingService.CostToClient ? CostToClient : existingService.CostToClient,
                    AtmId: AtmId !== existingService.AtmId ? AtmId : existingService.AtmId
                };

                // Check if any updates are necessary
                const hasUpdates = Object.keys(updateData).some(key => updateData[key] !== existingService[key]);

                if (hasUpdates) {
                    try {
                        const updateResponse = await axios.post('http://localhost:5000/api/updateServicesData', updateData);

                        if (updateResponse.status !== 200) {
                            console.error('Error updating service data:', updateResponse.data);
                            continue;
                        }
                    } catch (error) {
                        console.error('Error updating service data:', error.response ? error.response.data : error.message);
                        continue;
                    }
                }
            } else {
                const insertData = [{
                    ServiceId,
                    ServiceType,
                    TakeoverDate: formattedTakeoverDate,
                    HandoverDate: formattedHandoverDate,
                    PayOut,
                    CostToClient,
                    AtmId
                }];

                try {
                    const insertResponse = await axios.post('http://localhost:5000/api/insertServicesData', { servicesDetails: insertData });

                    if (insertResponse.status !== 200) {
                        console.error('Error inserting service data:', insertResponse.data);
                        continue;
                    }
                } catch (error) {
                    console.error('Error inserting service data:', error.response ? error.response.data : error.message);
                    continue;
                }
            }

        }

    } catch (error) {
        console.error('Error processing service data:', error.response ? error.response.data : error.message);
    }
}
