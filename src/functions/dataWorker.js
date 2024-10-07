// dataWorker.js

// Import necessary functions or dependencies if needed
import { uploadCustomerData } from '../functions/customerDataHandler';
import { uploadBankData } from '../functions/bankDataHandler';
import { uploadAtmData } from '../functions/atmDataHandler';
import { uploadEmployeeData } from '../functions/employeeDataHandler';
import { uploadServiceData } from '../functions/serviceDataHandler';

// Define the function to process each batch of data
const processBatch = async (batch, progressCallback) => {
    try {
        // Call the upload functions for different types of data
        await uploadCustomerData(batch);
        await uploadBankData(batch);
        await uploadAtmData(batch);
        await uploadEmployeeData(batch);
        await uploadServiceData(batch);

        // Update progress using the progress callback function
        progressCallback(100, 'Batch processed');
        self.postMessage({ progress: ((i / jsonData.length) * 100).toFixed(1), message: 'Batch processed' });
    } catch (error) {
        // Handle errors if any
        console.error('Error processing data:', error);
        // Send an error message back to the main thread
        progressCallback(0, 'Error processing data');
    }
};

// Export the processBatch function
export { processBatch };
