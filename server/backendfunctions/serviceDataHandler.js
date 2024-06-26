const axios = require('axios');
const { excelDateToJSDate } = require('./excelDateToJSDate');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

 async function uploadServiceData(jsonData) {
  try {
    for (let i = 0; i < jsonData.length; i++) {
      const { ServiceId, ServiceType, TakeoverDate, HandoverDate, PayOut, CostToClient, AtmId } = jsonData[i];

      const formattedTakeoverDate = typeof TakeoverDate === 'number' ? excelDateToJSDate(TakeoverDate).toISOString().split('T')[0] : TakeoverDate;
      const formattedHandoverDate = typeof HandoverDate === 'number' ? excelDateToJSDate(HandoverDate).toISOString().split('T')[0] : HandoverDate;

      try {
        const checkResponseService = await axios.get(`http://localhost:5000/services?ServiceId=<span class="math-inline">\{ServiceId\}&AtmId\=</span>{AtmId}`);
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

          const hasUpdates = Object.keys(updateData).some(key => updateData[key] !== existingService[key]);
          if (hasUpdates) {
            const updateResponse = await axios.post('http://localhost:5000/api/updateServicesData', updateData);
            if (updateResponse.status !== 200) {
              throw new Error(`Error updating service data: ${updateResponse.data}`);
            }
          }
          continue;
        }

        const insertData = [{
          ServiceId,
          ServiceType,
          TakeoverDate: formattedTakeoverDate,
          HandoverDate: formattedHandoverDate,
          PayOut,
          CostToClient,
          AtmId
        }];

        const insertResponse = await axios.post('http://localhost:5000/api/insertServicesData', { servicesDetails: insertData });
        if (insertResponse.status !== 200) {
          throw new Error(`Error inserting service data: ${insertResponse.data}`);
        }
      } catch (error) {
        console.error('Error processing service data:', error.message);
      }
    }
  } catch (error) {
        console.error('Error processing service data:', error.response ? error.response.data : error.message);
    }
}
module.exports = { uploadServiceData };