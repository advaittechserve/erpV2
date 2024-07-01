const { uploadCustomerData } = require('./backendfunctions/customerDataHandler.js');
const {uploadBankData} = require('./backendfunctions/bankDataHandler.js');
const {uploadAtmData} = require('./backendfunctions/atmDataHandler.js');
const {uploadEmployeeData} = require('./backendfunctions/employeeDataHandler.js');
const {uploadServiceData} = require('./backendfunctions/serviceDataHandler.js');

require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const http = require('http');
const bcrypt = require('bcryptjs');
const socketIo = require('socket.io');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const app = express();
const unlinkAsync = promisify(fs.unlink);
const port = 5000;
process.env.TZ = 'Asia/Kolkata'; // Set the server timezone to IST
const countryStateCity = require("country-state-city");
const server = http.createServer(app);
const io = socketIo(server);

const currentDate = new Date();
currentDate.toLocaleString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hrmsapp'
});

connection.connect();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Specify the file name format
  }
});

const upload = multer({ storage: storage });


if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
app.use((req, res, next) => {
  req.app.io = io;
  next();
});
//log upload
app.post('/api/newUploadLog', (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFileName = `upload-${timestamp}.txt`;
  currentLogFile = path.join(__dirname, 'loguploads', logFileName);
  
  fs.writeFile(currentLogFile, '', (err) => {
    if (err) {
      console.error('Error creating log file:', err);
      return res.status(500).send('Error creating log file');
    }
    res.status(200).send({ logFileName });
  });
});
app.post('/api/log', (req, res) => {
  const logEntry = req.body.message;
  const logFilePath = 'customerDataLog.txt';

  fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
      res.status(500).send('Error appending to log file');
      return;
    }
    res.sendStatus(200);
  });
});
// const asyncForEach = async (array, callback) => {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// };

// app.post('/api/uploadbulk', upload.single('file'), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const workbook = XLSX.readFile(file.path); // Read Excel file
//     const sheetName = workbook.SheetNames[0]; // Get the first sheet name
//     const worksheet = workbook.Sheets[sheetName]; // Get the worksheet
//     const jsonData = XLSX.utils.sheet_to_json(worksheet); // Convert sheet to JSON
    
//     const sequentialFunctions = [
//       uploadCustomerData,
//       uploadBankData,
//       uploadAtmData
//     ];

//     const concurrentFunctions = [
//       uploadEmployeeData,
//       uploadServiceData
//     ];

//     let progress = 0;
//     const totalFunctions = sequentialFunctions.length + concurrentFunctions.length;

//     // Process sequential functions using asyncForEach
//     await asyncForEach(sequentialFunctions, async (uploadFunction) => {
//       await uploadFunction(jsonData);
//       progress++;
//       const percentCompleted = Math.round((progress * 100) / totalFunctions);
//       // Emit progress to client
//       req.app.io.emit('uploadProgress', percentCompleted);
//     });

//     // Process concurrent functions using Promise.all
//     await Promise.all(concurrentFunctions.map(async (uploadFunction) => {
//       await uploadFunction(jsonData);
//       progress++;
//       const percentCompleted = Math.round((progress * 100) / totalFunctions);
//       // Emit progress to client
//       req.app.io.emit('uploadProgress', percentCompleted);
//     }));

//     // Cleanup: Delete the file after processing
//     await unlinkAsync(file.path);

//     return res.json({ message: 'File uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return res.status(500).json({ message: 'Error uploading file' });
//   }
// });

app.post('/api/uploadbulk', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const workbook = XLSX.readFile(file.path); // Read Excel file
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const worksheet = workbook.Sheets[sheetName]; // Get the worksheet
    const jsonData = XLSX.utils.sheet_to_json(worksheet); // Convert sheet to JSON
    // Process jsonData (assuming you have an uploadCustomerData function)
    await uploadCustomerData(jsonData);
    await uploadBankData(jsonData);
    await uploadAtmData(jsonData);
    await uploadEmployeeData(jsonData);
    await uploadServiceData(jsonData);
    return res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});
// File upload route
app.post('/api/uploadFile', upload.single('file'), (req, res) => {
  try {
    const atmId = req.body.atmId;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const query = 'UPDATE atm SET RequestFile = ? WHERE AtmId = ?';
    connection.query(query, [file.path, atmId], (err, results) => {
      if (err) {
        console.error('Error updating ATM file path:', err);
        return res.status(500).send('Error updating ATM file path.');
      }
      res.status(200).send('File uploaded and data updated.');
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});
app.post('/api/uploadfiledata', (req, res) => {
  const { name, uploadedBy, status, uploadedTime } = req.body;
  const insertQuery = `INSERT INTO uploadfiledata (name, uploadedBy, status, uploadedTime) VALUES (?, ?, ?, ?)`;
  connection.query(insertQuery, [name, uploadedBy, status, uploadedTime], (err, result) => {
    if (err) {
      console.error('Error inserting upload file data:', err);
      res.status(500).json({ error: 'Error inserting upload file data' });
    } else {
  
      res.status(201).json({ message: 'Uploaded file data inserted successfully' });
    }
  });
});
//customer upload
app.post('/api/insertCustomerData', async (req, res) => {
  try {
    let customerData;

    if (req.body.data) {
      // If the request body has a `data` property, use it directly
      customerData = req.body.data.map((row) => [
        row.CustomerId,
        row.CustomerName,
        row.CustomerSiteStatus, // Use CustomerStatus instead of CustomerSiteStatus to match the frontend
      ]);
    } else if (Array.isArray(req.body)) {
      // If the request body is already an array, use it as is
      customerData = req.body.map((row) => [
        row.CustomerId,
        row.CustomerName,
        row.CustomerSiteStatus,
      ]);
    } else {
      // Otherwise, map the request body to the desired format
      customerData = [
        [
          req.body.CustomerId,
          req.body.CustomerName,
          req.body.CustomerSiteStatus,
        ]
      ];
    }

    const customerQuery = 'INSERT INTO customer (CustomerId, CustomerName, CustomerSiteStatus) VALUES ?';
    await connection.query(customerQuery, [customerData]); // Note the double array wrapping

    res.status(200).send('Customer data inserted successfully');
  } catch (error) {
    console.error('Error inserting customer data:', error);
    res.status(500).send('Error inserting customer data');
  }
});
app.post('/api/updateCustomerData', async (req, res) => {
  try {
    let customerData;

    if (req.body.data) {
      // If the request body has a `data` property, use it directly
      customerData = req.body.data.map((row) => [
        row.CustomerName,
        row.CustomerSiteStatus,
        row.CustomerId // Add CustomerId to the end of the array
      ]);
    } else if (Array.isArray(req.body)) {
      // If the request body is already an array, use it as is
      customerData = req.body.map((row) => [
        row.CustomerName,
        row.CustomerSiteStatus,
        row.CustomerId // Add CustomerId to the end of the array
      ]);
    } else {
      // Otherwise, map the request body to the desired format
      customerData = [
        [
          req.body.CustomerName,
          req.body.CustomerSiteStatus,
          req.body.CustomerId // Add CustomerId to the end of the array
        ]
      ];
    }

    const customerQuery = 'UPDATE customer SET CustomerName = ?, CustomerSiteStatus = ? WHERE CustomerId = ?';
    for (const data of customerData) {
      await connection.query(customerQuery, data);
    }
    res.status(200).send('Customer data updated successfully');
  } catch (error) {
    res.status(500).send('Error updating customer data');
  }
});
//bank upload
app.post('/api/insertBankData', async (req, res) => {
  try {
    let bankData = [];

    if (req.body.data) {
      req.body.data.forEach((row) => {
        if (row.BankId && row.BankName) {
          bankData.push([row.BankId, row.BankName]);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((row) => {
        if (row.BankId && row.BankName) {
          bankData.push([row.BankId, row.BankName]);
        }
      });
    } else {
      if (req.body.BankId && req.body.BankName) {
        bankData.push([req.body.BankId, req.body.BankName]);
      }
    }

    const bankQuery = 'INSERT INTO bank (BankId, BankName) VALUES ?';

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        if (bankData.length > 0) {
          await new Promise((resolve, reject) => {
            connection.query(bankQuery, [bankData], (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error committing transaction');
            });
          } else {
           
            res.status(200).send('Bank data inserted successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error inserting bank data');
        });
      }
    });
  } catch (error) {
    console.error('Error inserting bank data:', error);
    res.status(500).send('Error inserting bank data');
  }
});
app.post('/api/insertBankIdCustomerIdData', async (req, res) => {
  try {
    let bankCustomerData = [];

    if (req.body.data) {
      req.body.data.forEach((row) => {
        if (row.BankId && row.CustomerId) {
          bankCustomerData.push([row.BankId, row.CustomerId]);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((row) => {
        if (row.BankId && row.CustomerId) {
          bankCustomerData.push([row.BankId, row.CustomerId]);
        }
      });
    } else {
      if (req.body.BankId && req.body.CustomerId) {
        bankCustomerData.push([req.body.BankId, req.body.CustomerId]);
      }
    }

    const bankCustomerQuery = 'INSERT INTO bankid_customerid (BankId, CustomerId) VALUES ?';

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        if (bankCustomerData.length > 0) {
          await new Promise((resolve, reject) => {
            connection.query(bankCustomerQuery, [bankCustomerData], (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error committing transaction');
            });
          } else {
    
            res.status(200).send('Bank-customer data inserted successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error inserting bank-customer data');
        });
      }
    });
  } catch (error) {
    console.error('Error inserting bank-customer data:', error);
    res.status(500).send('Error inserting bank-customer data');
  }
});
app.post('/api/updateBankData', async (req, res) => {
  try {
    let bankData = [];

    if (req.body.data) {
      req.body.data.forEach((row) => {
        if (row.BankId && row.BankName) {
          bankData.push([row.BankName, row.BankId]);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((row) => {
        if (row.BankId && row.BankName) {
          bankData.push([row.BankName, row.BankId]);
        }
      });
    } else {
      if (req.body.BankId && req.body.BankName) {
        bankData.push([req.body.BankName, req.body.BankId]);
      }
    }

    const bankQuery = 'UPDATE bank SET BankName = ? WHERE BankId = ?';  

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        for (const data of bankData) {
          await new Promise((resolve, reject) => {
            connection.query(bankQuery, data, (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error updating bank data');
            });
          } else {
        
            res.status(200).send('Bank data updated successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error updating bank data');
        });
      }
    });
  } catch (error) {
    console.error('Error updating bank data:', error);
    res.status(500).send('Error updating bank data');
  }
});
//atm upload
app.post('/api/insertAtmData', (req, res) => {
  const { atmDetails } = req.body;

  if (!atmDetails || !Array.isArray(atmDetails)) {
    return res.status(400).json({ error: 'Invalid ATM details format' });
  }

  // Prepare the SQL INSERT statement
  const sql = 'INSERT INTO atm (AtmId,Country, State, City, Address, BranchCode, SiteId, Lho,NewAtmId, SiteStatus,SiteType,FromDate,ToDate,RequestedBy,requestFile, BankId, CustomerId) VALUES ?';

  // Extract values from ATM details to be inserted
  const values = atmDetails.map((atm) => [
    atm.AtmId,
    atm.Country,
    atm.State,
    atm.City,
    atm.Address,
    atm.BranchCode,
    atm.SiteId,
    atm.Lho,
    atm.AtmId,
    atm.SiteStatus,
    atm.SiteType,
    atm.FromDate,
    atm.ToDate,
    atm.RequestedBy,
    atm.RequestedFile,
    atm.BankId,
    atm.CustomerId
  ]);

  // Execute the SQL INSERT query
  connection.query(sql, [values], (error, results) => {
    if (error) {
      console.error('Error inserting ATM data:', error);
      return res.status(500).json({ error: 'Failed to insert ATM data' });
    }
    res.status(200).json({ message: 'ATM data inserted successfully', insertedRows: results.affectedRows });
  });
});
app.post('/api/updateAtmData', (req, res) => {
  const { AtmId, Country, State, City, Address, BranchCode, SiteId, Lho, SiteStatus, SiteType, FromDate, ToDate, RequestedBy, RequestFile, BankId, CustomerId } = req.body;

  if (!AtmId) {
    return res.status(400).json({ error: 'AtmId is required' });
  }

  const updateQuery = `
    UPDATE atm SET 
      Country = ?, State = ?, City = ?, Address = ?, BranchCode = ?, SiteId = ?, Lho = ?, 
      SiteStatus = ?, SiteType = ?, FromDate = ?, ToDate = ?, RequestedBy = ?, RequestFile = ?, 
      BankId = ?, CustomerId = ? 
    WHERE AtmId = ?
  `;

  const values = [Country, State, City, Address, BranchCode, SiteId, Lho, SiteStatus, SiteType, FromDate, ToDate, RequestedBy, RequestFile, BankId, CustomerId, AtmId];

  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error updating ATM data:', error);
      return res.status(500).json({ error: 'Failed to update ATM data' });
    }

    res.status(200).json({ message: 'ATM data updated successfully' });
  });
});
//employee upload
app.post('/api/insertEmployeeData', async (req, res) => {
  try {
    let employeeData = [];

    if (req.body.employeeDetails) {
      req.body.employeeDetails.forEach((row) => {
        if (row.EmployeeId && row.EmployeeName && row.EmployeeRole && row.EmployeeContactNumber && row.TypeOfWork) {
          employeeData.push([row.EmployeeId, row.EmployeeName, row.EmployeeRole, row.EmployeeContactNumber, row.TypeOfWork]);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((row) => {
        if (row.EmployeeId && row.EmployeeName && row.EmployeeRole && row.EmployeeContactNumber && row.TypeOfWork) {
          employeeData.push([row.EmployeeId, row.EmployeeName, row.EmployeeRole, row.EmployeeContactNumber, row.TypeOfWork]);
        }
      });
    } else {
      if (req.body.EmployeeId && req.body.EmployeeName && req.body.EmployeeRole && req.body.EmployeeContactNumber && req.body.TypeOfWork) {
        employeeData.push([req.body.EmployeeId, req.body.EmployeeName, req.body.EmployeeRole, req.body.EmployeeContactNumber, req.body.TypeOfWork]);
      }
    }

    const employeeQuery = 'INSERT INTO employee (EmployeeId, EmployeeName, EmployeeRole, EmployeeContactNumber, TypeOfWork) VALUES ?';

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        if (employeeData.length > 0) {
          await new Promise((resolve, reject) => {
            connection.query(employeeQuery, [employeeData], (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error committing transaction');
            });
          } else {
       
            res.status(200).send('Employee data inserted successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error inserting employee data');
        });
      }
    });
  } catch (error) {
    console.error('Error inserting employee data:', error);
    res.status(500).send('Error inserting employee data');
  }
});
app.post('/api/insertEmployeeIdAtmIdData', async (req, res) => {
  try {
    let employeeAtmData = [];

    if (req.body.data) {
      req.body.data.forEach((row) => {
        if (row.AtmId && row.EmployeeId) {
          employeeAtmData.push([row.AtmId, row.EmployeeId]);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((row) => {
        if (row.AtmId && row.EmployeeId) {
          employeeAtmData.push([row.AtmId, row.EmployeeId]);
        }
      });
    } else {
      if (req.body.AtmId && req.body.EmployeeId) {
        employeeAtmData.push([req.body.AtmId, req.body.EmployeeId]);
      }
    }

    const employeeAtmQuery = 'INSERT INTO atm_employee (AtmId, EmployeeId) VALUES ?';

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        if (employeeAtmData.length > 0) {
          await new Promise((resolve, reject) => {
            connection.query(employeeAtmQuery, [employeeAtmData], (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error committing transaction');
            });
          } else {
           
            res.status(200).send('Employee-ATM data inserted successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error inserting employee-ATM data');
        });
      }
    });
  } catch (error) {
    console.error('Error inserting employee-ATM data:', error);
    res.status(500).send('Error inserting employee-ATM data');
  }
});
app.post('/api/updateEmployeeData', async (req, res) => {
  try {
    let employeeDetails = [];

    if (req.body.employeeDetails) {
      req.body.employeeDetails.forEach((employee) => {
        if (employee.EmployeeId && employee.EmployeeName && employee.EmployeeRole && employee.EmployeeContactNumber && employee.TypeOfWork) {
          employeeDetails.push(employee);
        }
      });
    } else if (Array.isArray(req.body)) {
      req.body.forEach((employee) => {
        if (employee.EmployeeId && employee.EmployeeName && employee.EmployeeRole && employee.EmployeeContactNumber && employee.TypeOfWork) {
          employeeDetails.push(employee);
        }
      });
    } else {
      if (req.body.EmployeeId && req.body.EmployeeName && req.body.EmployeeRole && req.body.EmployeeContactNumber && req.body.TypeOfWork) {
        employeeDetails.push(req.body);
      }
    }

    if (employeeDetails.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty employee details provided' });
    }

    const updateEmployeeSQL = 'UPDATE employee SET EmployeeName = ?, EmployeeRole = ?, EmployeeContactNumber = ?, TypeOfWork = ? WHERE EmployeeId = ?';

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).send('Error starting transaction');
      }

      try {
        for (const employee of employeeDetails) {
          const employeeUpdateValues = [
            employee.EmployeeName,
            employee.EmployeeRole,
            employee.EmployeeContactNumber,
            employee.TypeOfWork,
            employee.EmployeeId
          ];

          await new Promise((resolve, reject) => {
            connection.query(updateEmployeeSQL, employeeUpdateValues, (error, results) => {
              if (error) return reject(error);
              resolve(results);
            });
          });
        }

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).send('Error updating employee data');
            });
          } else {
  
            res.status(200).send('Employee data updated successfully');
          }
        });
      } catch (error) {
        connection.rollback(() => {
          console.error('Transaction error:', error);
          res.status(500).send('Error updating employee data');
        });
      }
    });
  } catch (error) {
    console.error('Error updating employee data:', error);
    res.status(500).send('Error updating employee data');
  }
});
//services upload
app.post('/api/insertServicesData', (req, res) => {
  const { servicesDetails } = req.body;

  if (!servicesDetails || !Array.isArray(servicesDetails)) {
    return res.status(400).json({ error: 'Invalid services details format' });
  }

  // Prepare the SQL INSERT statement
  const sql = 'INSERT INTO services (ServiceId, ServiceType, TakeoverDate, HandoverDate,PayOut, CostToClient, AtmId) VALUES ?';

  // Extract values from services details to be inserted
  const values = servicesDetails.map(service => [
    service.ServiceId,
    service.ServiceType,
    service.TakeoverDate,
    service.HandoverDate,
    service.PayOut,
    service.CostToClient,
    service.AtmId
  ]);

  // Execute the SQL INSERT query
  connection.query(sql, [values], (error, results) => {
    if (error) {
      console.error('Error inserting services data:', error);
      return res.status(500).json({ error: 'Failed to insert services data' });
    }


    res.status(200).json({ message: 'Services data inserted successfully', insertedRows: results.affectedRows });
  });
});
app.post('/api/updateServicesData', (req, res) => {
  const { ServiceId, ServiceType, TakeoverDate, HandoverDate, PayOut, CostToClient, AtmId } = req.body;

  if (!ServiceId) {
    return res.status(400).json({ error: 'ServiceId is required' });
  }

  const updateQuery = `
    UPDATE services SET 
       TakeoverDate = ?, HandoverDate = ?, PayOut=?, CostToClient = ?
    WHERE ServiceId = ? AND AtmId = ?
  `;

  const values = [TakeoverDate, HandoverDate, PayOut, CostToClient, ServiceId, AtmId];

  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error updating services data:', error);
      return res.status(500).json({ error: 'Failed to update services data' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'ServiceId not found' });
    }

    res.status(200).json({ message: 'Services data updated successfully' });
  });
});
//user 
app.post('/api/register', async (req, res) => {
  const { name, username, password, phonenumber, access, session_intime, session_outtime } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const access = 'employee';
    
    const query = 'INSERT INTO admin (name, username, password, phonenumber, access, session_intime, session_outtime) VALUES (?,?,?,?,?,?,?)';
    connection.query(query, [name, username, hashedPassword, phonenumber, access, session_intime, session_outtime], (error, results) => {
      if (error) {
        console.error('Error inserting data into admin table:', error);
        res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
    }else {
        res.status(200).json({ success: true, message: 'Registration successful' });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
});
// app.post('/api/registeruser/:userId', async (req, res) => {
//   const userId = req.params.userId;
//   const { name, username, password, phonenumber, access } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const query = 'UPDATE admin SET name = ?, username = ?, password = ?, phonenumber = ?, access = ? WHERE id = ?';

//     connection.query(query, [name, username, hashedPassword, phonenumber, access, userId], (error, results) => {
//       if (error) {
//         console.error('Error updating data in admin table:', error);
//         return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
//       }

//       if (results.affectedRows === 0) {
//         return res.status(404).json({ success: false, error: 'User not found' });
//       }
//       res.status(200).json({ success: true, message: 'User details updated successfully' });
//     });
//   } catch (error) {
//     console.error('Error hashing password:', error);
//     res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
//   }
// }); 
app.post('/api/registeruser/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, username, phonenumber, access } = req.body;

  try {
    const query = 'UPDATE admin SET name = ?, username = ?, phonenumber = ?, access = ? WHERE id = ?';

    connection.query(query, [name, username, phonenumber, access, userId], (error, results) => {
      if (error) {
        console.error('Error updating data in admin table:', error);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.status(200).json({ success: true, message: 'User details updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
});
app.post('/api/changepassword/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE admin SET password = ? WHERE username = ?';

    connection.query(query, [hashedPassword, userId], (error, results) => {
      if (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
});
app.post('/api/changepassword/:username', async (req, res) => {
  const { username } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE admin SET password = ? WHERE username = ?';

    connection.query(query, [hashedPassword, username], (error, results) => {
      if (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
});
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Query to fetch user data based on the provided username
  const query = 'SELECT * FROM admin WHERE username = ?';
  connection.query(query, [username], async (error, results) => {
    if (error) {
      console.error('Error executing login query:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    } else {
      if (results.length > 0) {
        // If user exists, retrieve the user's data
        const user = results[0];
        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // If passwords match, generate JWT
          const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Adjust expiry time as needed

          // Update the session_time to the current timestamp
          const updateQuery = 'UPDATE admin SET session_intime = NOW() WHERE username = ?';
          connection.query(updateQuery, [username], (updateError) => {
            if (updateError) {
              console.error('Error updating session time:', updateError);
              return res.status(500).json({ error: 'An unexpected error occurred.' });
            }

            res.status(200).json({ success: true, message: 'Login successful!', token: token });
          });
        } else {
          // If passwords don't match, send error response
          res.status(401).json({ success: false, error: 'Invalid Password!' });
        }
      } else {
        // If user doesn't exist, send error response
        res.status(401).json({ success: false, error: 'User Does not exist!' });
      }
    }
  });
});
app.post('/api/logout', (req, res) => {
  const { username } = req.body;

  const updateQuery = 'UPDATE admin SET session_outtime = NOW() WHERE username = ?';

  connection.query(updateQuery, [username], (error, results) => {
    if (error) {
      console.error('Error updating session_outtime:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    } else {
      // Assuming successful update
      console.log('Session destroyed successfully');
      res.status(200).json({ message: 'Logout successful' });
    }
  });
});
//invoice
app.post('/api/insertInvoiceData', (req, res) => {
  const { customerName, bankName, stateName, selectedService, fromDate, toDate } = req.body;
  // Debugging: Log the values and types of customerName, bankName, and stateName

  const insertInvoiceQuery = 'INSERT INTO invoices (clientName, bankName, stateName, selectedService, fromDate, toDate) VALUES (?, ?, ?, ?, ?, ?)';
  const invoiceValues = [customerName, bankName, stateName, selectedService, fromDate, toDate];

  connection.query(insertInvoiceQuery, invoiceValues, (err, result) => {
    if (err) {
      console.error('Error inserting invoice data:', err);
      res.status(500).json({ error: 'Error inserting invoice data' });
      return;
    }
      res.status(200).json({ message: 'Invoice data inserted successfully' });
    });
  });
// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ success: false, error: 'Token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
}
app.get('/api/getfiledata', (req, res) => {
  connection.query(`SELECT * FROM uploadfiledata`, (error, results) => {
    if (error) {
      console.error('Error fetching file data:', error);
      res.status(500).json({ error: 'An error occurred while fetching file data' });
    } else {
      res.json(results);
    }
  });
});
app.get('/customer', (req, res) => {
  const { name } = req.query;
  if (name) {
    connection.query(`SELECT * FROM customer WHERE CustomerName LIKE '%${name}%'`, (error, results) => {
      if (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'An error occurred while fetching customers' });
      } else {
        res.json(results);
      }
    });
  }
  else {
    connection.query('SELECT * FROM customer', (error, results) => {
      if (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'An error occurred while fetching customers' });
      } else {
        res.json(results);
      }
    });
  }
});
app.get('/bank', (req, res) => {
  const { name } = req.query;
  if (name) {
    connection.query(`SELECT * FROM bank WHERE BankName LIKE '%${name}%'`, (error, results) => {
      if (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ error: 'An error occurred while fetching banks' });
      } else {
        res.json(results);
      }
    });
  }
  else {
    connection.query('SELECT * FROM bank', (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  }
});
app.get('/bank_customerdetails', (req, res) => {
  const { bankId, customerId } = req.query; // Extract bankId and customerId from query parameters

  // Base query to join bankid_customerid and banks tables
  let query = `
    SELECT bc.*, b.BankName, b.AtmCount
    FROM bankid_customerid bc
    JOIN bank b ON bc.BankId = b.BankId
  `;

  // Array to hold query parameters
  const queryParams = [];

  // Add conditions based on provided parameters
  if (bankId || customerId) {
    query += ' WHERE';
    if (bankId) {
      query += ' bc.BankId = ?';
      queryParams.push(bankId);
    }
    if (bankId && customerId) {
      query += ' AND';
    }
    if (customerId) {
      query += ' bc.CustomerId = ?';
      queryParams.push(customerId);
    }
  }

  // Execute the query
  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error selecting data from bankid_customerid and banks tables:', error);
      res.status(500).json({ error: 'Error selecting data from bankid_customerid and banks tables' });
    } else {
      if (results.length > 0) {
        res.status(200).json({ message: 'Data found in bankid_customerid and banks tables', data: results });
      } else {
        res.status(404).json({ message: 'No data found in bankid_customerid and banks tables', data: results });
      }
    }
  });
});

app.get('/atm', (req, res) => {
  const { AtmId, CustomerId , BankId } = req.query;

  let query = 'SELECT * FROM atm';
  const queryParams = [];

  if (AtmId || CustomerId) {
    query += ' WHERE';
    if (AtmId) {
      query += ' AtmId = ?';
      queryParams.push(AtmId);
    }
    if (CustomerId) {
      query += ' CustomerId = ?';
      queryParams.push(CustomerId);
    }
    if (BankId) {
      query += ' BankId = ?';
      queryParams.push(BankId);
    }
  }

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching ATMs:', error);
      res.status(500).json({ error: 'An error occurred while fetching ATMs' });
    } else {
      res.json(results);
    }
  });
});
app.get('/atmregion', (req, res) => {
  connection.query('SELECT AtmId,RegionId, RegionName, GstStateCode FROM atmregion', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});
app.get('/services', (req, res) => {
  const { ServiceId, AtmId } = req.query;

  let query = 'SELECT * FROM services';
  const queryParams = [];

  if (ServiceId || AtmId) {
    query += ' WHERE';
    if (ServiceId) {
      query += ' ServiceId = ? ';
      queryParams.push(ServiceId);
    }
    if (ServiceId && AtmId) {
      query += ' AND ';
    }
    if (AtmId) {
      query += ' AtmId = ? ';
      queryParams.push(AtmId);
    }
  }
  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'An error occurred while fetching services' });
    } else {
      res.json(results);
    }
  });
});
app.get('/employee', (req, res) => {
  const { EmployeeId } = req.query;

  let query = 'SELECT * FROM employee';
  const queryParams = [];

  if (EmployeeId) {
    query += ' WHERE EmployeeId = ?';
    queryParams.push(EmployeeId);
  }

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'An error occurred while fetching employees' });
    } else {
      res.json(results);
    }
  });
});
app.get('/atm_employeedetails', (req, res) => {
  const { AtmId, EmployeeId } = req.query;

  // Base query to fetch ATM employee details
  let query = `
    SELECT ae.AtmId, e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContactNumber, e.TypeOfWork
    FROM atm_employee ae
    JOIN employee e ON ae.EmployeeId = e.EmployeeId
  `;

  // Array to hold query parameters
  const queryParams = [];

  // Add conditions based on provided parameters
  if (AtmId || EmployeeId) {
    query += ' WHERE';
    if (AtmId) {
      query += ' ae.AtmId = ?';
      queryParams.push(AtmId);
    }
    if (AtmId && EmployeeId) {
      query += ' AND';
    }
    if (EmployeeId) {
      query += ' e.EmployeeId = ?';
      queryParams.push(EmployeeId);
    }
  }

  // Use the connection pool to execute the query
  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching ATM employee details:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Send the query results as JSON response
      res.json(results);
    }
  });
});
app.get('/bank_atmdetails', (req, res) => {
  // Query to fetch ATM employee details
  const query = `
  SELECT bc.*, b.BankName, b.AtmCount
FROM bankid_customerid bc
JOIN bank b ON bc.BankId = b.BankId;

  `;

  // Use the connection pool to execute the query
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching ATM bank details:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Send the query results as JSON response
      res.json(results);
    }
  });
});
app.get('/atm_servicesdetails', (req, res) => {
  // Query to fetch all data from ATM and services tables
  const query = `
    SELECT a.*, s.*
    FROM atm a
    JOIN services s ON a.AtmId = s.AtmId
  `;

  // Use the connection pool to execute the query
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching ATM services details:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Send the query results as JSON response
      res.json(results);
    }
  });
});
app.get('/admindetails', (req, res) => {
  const {username} = req.query;
  if(username)
    {
      const query = 'SELECT * FROM admin WHERE username = ?';
      connection.query(query, [username], (error, results) => {
        if (error) {
          console.error('Error fetching admin details:', error);
         // return res.status(500).json({ error: 'Internal server error' });
        }
        return res.json(results);
        //console.log(results);
      });
    }
    else{
      
  connection.query('SELECT * FROM admin', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
}
});
app.get('/userdetails/:userId', (req, res) => {
  const userId = req.params.userId;

  // Query to fetch user details for the specified userId
  const query = 'SELECT *FROM admin WHERE id = ?';

  // Execute the query with the userId as a parameter
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ' + error.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Send the user details as JSON response
    res.json(results[0]);
  });
});
app.delete('/userdetails/:userId', (req, res) => {
  const userId = req.params.userId;

  // Query to delete user with the specified userId
  const query = 'DELETE FROM admin WHERE id = ?';

  // Execute the delete query with the userId as a parameter
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ' + error.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // User successfully deleted
    res.status(200).json({ message: 'User deleted successfully' });
  });
});
// API endpoint to get countries
app.get('/api/countries', (req, res) => {
  const countries = countryStateCity.Country.getAllCountries();
  res.json(countries.map(country => country.name));
});
// API endpoint to get states for a given country
app.get('/api/states', (req, res) => {
  const { country: countryName } = req.query;
  const country = countryStateCity.Country.getAllCountries().find(country => country.name === countryName);
  const countryCode = country.isoCode;
  const states = countryStateCity.State.getStatesOfCountry(countryCode);
  res.json(states.map(state => state.name));
});
// API endpoint to get cities for a given state
app.get('/api/cities', (req, res) => {
  const { country: countryName, state: stateName } = req.query;
  const country = countryStateCity.Country.getAllCountries().find(country => country.name === countryName);
  if (!country) {
    return res.status(404).json({ error: "Country not found" });
  }
  const state = countryStateCity.State.getAllStates().find(state => state.name === stateName);
  if (!state) {
    return res.status(404).json({ error: "State not found" });
  }
  const countryCode = country.isoCode;
  const stateCode = state.isoCode;
  const cities = countryStateCity.City.getCitiesOfState(countryCode, stateCode);

  res.json(cities.map(city => city.name));
});
// Function to insert data with foreign key constraint check
async function insertWithForeignKeyCheck(connection, query, data) {
  return new Promise((resolve, reject) => {
    connection.query(query, [data], (error, results) => {
      if (error) {
        // Handle foreign key constraint violation error
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          console.error('Foreign key constraint violation:', error);
          // Handle the error appropriately (skip insertion, log, etc.)
          resolve(); // Resolve promise to continue inserting other records
        } else {
          reject(error); // Reject promise for other types of errors
        }
      } else {
        resolve();
      }
    });
  });
}
// to get data from database updated by nitish
app.get('/api/invoices', (req, res) => {
  const { customerName, bankName, stateName, selectedService, fromDate, toDate } = req.query;

  let fetchQuery = 'SELECT * FROM invoices WHERE 1=1'; // Initial query
  const queryParams = [];

  // Append conditions to the query based on provided parameters
  if (customerName) {
    fetchQuery += ' AND clientName = ?';
    queryParams.push(customerName);
  }
  if (bankName) {
    fetchQuery += ' AND bankName = ?';
    queryParams.push(bankName);
  }
  if (stateName) {
    fetchQuery += ' AND stateName = ?';
    queryParams.push(stateName);
  }
  if (selectedService) {
    fetchQuery += ' AND selectedService = ?';
    queryParams.push(selectedService);
  }
  if (fromDate) {
    fetchQuery += ' AND fromDate >= ?';
    queryParams.push(fromDate);
  }
  if (toDate) {
    fetchQuery += ' AND toDate <= ?';
    queryParams.push(toDate);
  }

  connection.query(fetchQuery, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      res.status(500).json({ error: 'Error fetching invoices' });
      return;
    }
    res.status(200).json(results);
  });
});
app.get('/api/totalcost', (req, res) => {
  const query = 'SELECT SUM(CostToClient) AS total_cost FROM services';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results[0]);
  });
});
// Define endpoint for fetching monthly cost updated by Nitish
app.get('/api/monthly-cost', (req, res) => {
  const query = 'SELECT MONTH(TakeoverDate) AS Month, SUM(CostToClient) AS TotalCost FROM services GROUP BY MONTH(TakeoverDate)';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching monthly cost:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});
// Define endpoint for fetching yearly cost updated by nitish
app.get('/api/yearly-cost', (req, res) => {
  const query = 'SELECT YEAR(TakeoverDate) AS Year, SUM(CostToClient) AS TotalCost FROM services GROUP BY YEAR(TakeoverDate)';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching yearly cost:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});
app.get('/api/customer/count', (req, res) => {
  // Perform a query to fetch the count from your database updated by nitish
  connection.query('SELECT COUNT(CustomerId) as customerCount FROM customer', (error, results) => {
    if (error) {
      console.error('Error fetching customer count:', error);
      res.status(500).json({ error: 'An error occurred while fetching customer count' });
    } else {
      // Return the count as JSON
      res.json(results[0]);
    }
  });
});
// Fetch monthly sales data updated by nitish
app.get('/api/costtoclient/monthly', (req, res) => {
  const query = 'SELECT MONTH(TakeoverDate) AS Month, SUM(CostToClient) AS TotalCost FROM services GROUP BY MONTH(TakeoverDate)'; // Adjust query based on your table structure
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching monthly sales data:', error);
      res.status(500).json({ error: 'Error fetching monthly sales data' });
    } else {
      res.json(results);
    }
  });
});
// Fetch yearly sales data updated by nitish
app.get('/api/costtoclient/yearly', (req, res) => {
  const query = 'SELECT YEAR(TakeoverDate) AS Year, SUM(CostToClient) AS TotalCost FROM services GROUP BY YEAR(TakeoverDate)'; // Adjust query based on your table structure
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching yearly sales data:', error);
      res.status(500).json({ error: 'Error fetching yearly sales data' });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
