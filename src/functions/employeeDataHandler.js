import axios from 'axios';
import { logMessage } from './logger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadEmployeeData(jsonData) {
    try {
        for (let i = 0; i < jsonData.length; i++) {
            const { EmployeeId, EmployeeName, EmployeeRole, EmployeeContactNumber, TypeOfWork, AtmId } = jsonData[i];

            const checkResponseEmployee = await axios.get(`http://localhost:5000/employee?EmployeeId=${EmployeeId}`);
            const existingEmployee = checkResponseEmployee.data && checkResponseEmployee.data.length > 0 ? checkResponseEmployee.data[0] : null;

            if (existingEmployee) {
                const updateEmployeeData = {
                    EmployeeId,
                    EmployeeName,
                    EmployeeRole,
                    EmployeeContactNumber,
                    TypeOfWork
                };

                const needsUpdate = Object.keys(updateEmployeeData).some(key => existingEmployee[key] !== updateEmployeeData[key]);

                if (needsUpdate) {
                   
                    const updateEmployeeResponse = await axios.post('http://localhost:5000/api/updateEmployeeData', { employeeDetails: [updateEmployeeData] });

                    if (updateEmployeeResponse.status !== 200) {
                        throw new Error(`Error updating employee ${EmployeeId}`);
                    }

                    }

                
                const checkResponseEmployeeAtm = await axios.get(`http://localhost:5000/atm_employeedetails`, {
                    params: { AtmId, EmployeeId }
                });

                const employeeAtmExists = checkResponseEmployeeAtm.status === 200;

                if (!employeeAtmExists) {
                   
                    const insertEmployeeAtmData = { AtmId, EmployeeId };
                    const insertEmployeeAtmResponse = await axios.post('http://localhost:5000/api/insertEmployeeIdAtmIdData', insertEmployeeAtmData);

                    if (insertEmployeeAtmResponse.status !== 200) {
                        throw new Error(`Error inserting employee-ATM relationship for EmployeeId ${EmployeeId} and AtmId ${AtmId}`);
                    }

                    } else {
                       }

            } else {
               
                const insertEmployeeData = {
                    EmployeeId,
                    EmployeeName,
                    EmployeeRole,
                    EmployeeContactNumber,
                    TypeOfWork
                };

                const insertEmployeeResponse = await axios.post('http://localhost:5000/api/insertEmployeeData', { employeeDetails: [insertEmployeeData] });

                if (insertEmployeeResponse.status !== 200) {
                    throw new Error(`Error inserting employee ${EmployeeId}`);
                }

                const insertEmployeeAtmData = { AtmId, EmployeeId };
                const insertEmployeeAtmResponse = await axios.post('http://localhost:5000/api/insertEmployeeIdAtmIdData', insertEmployeeAtmData);

                if (insertEmployeeAtmResponse.status !== 200) {
                    throw new Error(`Error inserting employee-ATM relationship for EmployeeId ${EmployeeId} and AtmId ${AtmId}`);
                }

               }
        }

         } catch (error) {
        console.error('Error processing employee data:', error);
    }
}
