require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();
const port = 5000;
process.env.TZ = 'Asia/Kolkata'; // Set the server timezone to IST
const countryStateCity = require("country-state-city");

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

const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

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
      console.log('Uploaded file data inserted successfully');
      res.status(201).json({ message: 'Uploaded file data inserted successfully' });
    }
  });
});
app.post('/api/insertData', async (req, res) => {
  const data = req.body;
  try {
    try {
      // Insert data into 'customer' table
      const customerData = data.map((row) => [row.CustomerId, row.CustomerName]);
      const customercheckQuery = 'SELECT * FROM customer WHERE CustomerId = ?';
      const customerExists = await checkIfExists(connection, customercheckQuery, data.map((row) => [row.CustomerId]));

      if (!customerExists) {
        const customerQuery = 'INSERT INTO customer (CustomerId, CustomerName , CustomerSiteStatus , StartDate , EndDate) VALUES ?';
        await insertWithForeignKeyCheck(connection, customerQuery, customerData).catch(error => {
          console.error('Error inserting customer data:', error);
          throw error;

        });
      }

      // Insert data into 'bank' table
      const bankData = data.map((row) => [row.BankId, row.BankName, row.AtmCount, row.Field, row.CustomerId]);
      const bankQuery = 'INSERT INTO bank (BankId, BankName, AtmCount, Field, CustomerId) VALUES ?';
      await insertWithForeignKeyCheck(connection, bankQuery, bankData).catch(error => {
        console.error('Error inserting bank data:', error);
        throw error;
      });

      // Insert data into 'atm' table
      const atmData = data.map((row) => [row.AtmId, row.State, row.City, row.Address, row.BranchCode, row.SiteId, row.Lho, row.Region, row.OldAtmId, row.NewAtmId, row.SiteStatus, row.BankId]);
      const atmQuery = 'INSERT INTO atm (AtmId, Country, State, City, Address, BranchCode, SiteId, Lho, Region, OldAtmId, NewAtmId, SiteStatus, BankId) VALUES ?';
      await insertWithForeignKeyCheck(connection, atmQuery, atmData).catch(error => {
        console.error('Error inserting atm data:', error);
        throw error;
      });

      // Insert data into 'region' table
      const regionData = data.map((row) => [row.RegionId, row.RegionName, row.GstStateCode, row.AtmId]);
      const regionQuery = 'INSERT INTO atmregion (RegionId, RegionName, GstStateCode, AtmId) VALUES ?';
      await insertWithForeignKeyCheck(connection, regionQuery, regionData).catch(error => {
        console.error('Error inserting region data:', error);
        throw error;
      });

      // Insert data into 'employee' table
      const employeeData = data.map((row) => [row.EmployeeId, row.EmployeeName, row.EmployeeRole, row.EmployeeContactNumber, row.TypeOfWork, row.AtmId]);
      const employeeQuery = 'INSERT INTO employee (EmployeeId, EmployeeName, EmployeeRole, EmployeeContactNumber, TypeOfWork, AtmId) VALUES ?';
      await insertWithForeignKeyCheck(connection, employeeQuery, employeeData).catch(error => {
        console.error('Error inserting employee data:', error);
        throw error;
      });

      // Insert data into 'services' table
      const servicesData = data.map((row) => [row.ServiceId, row.ServiceType, row.TakeoverDate, row.HandoverDate, row.CostToClient, row.AtmId]);
      const servicesQuery = 'INSERT INTO services (ServiceId, ServiceType, TakeoverDate, HandoverDate, CostToClient, AtmId) VALUES ?';
      await insertWithForeignKeyCheck(connection, servicesQuery, servicesData).catch(error => {
        console.error('Error inserting services data:', error);
        throw error;
      });

      res.status(200).send('Data inserted successfully');
    } catch (error) {
      console.log('Data:', data);
      res.status(500).send('Error inserting data');
    }



    res.status(200).send('Data inserted successfully');
  } catch (error) {
    // res.status(500).send('Error inserting data');
  }
});
app.post('/api/insertCustomerData', async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];
    const customerData = data.map((row) => [row.CustomerId, row.CustomerName, row.CustomerSiteStatus, row.StartDate, row.EndDate]);

    const customerQuery = 'INSERT INTO customer (CustomerId, CustomerName, CustomerSiteStatus, StartDate, EndDate) VALUES ?';
    await insertWithForeignKeyCheck(connection, customerQuery, customerData);
    console.log('Customer data inserted successfully');
    res.status(200).send('Customer data inserted successfully');
  } catch (error) {
    console.error('Error inserting customer data:', error);
    res.status(500).send('Error inserting customer data');
  }
});
app.post('/api/insertBankData', async (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [req.body];
  const bankData = data.map((row) => [row.BankId, row.BankName]);
  const bankCustomerData = data.map((row) => [row.BankId, row.CustomerId]);

  connection.beginTransaction(async (err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send('Error starting transaction');
    }

    try {
      const bankQuery = 'INSERT INTO bank (BankId, BankName) VALUES ?';
      const bankCustomerQuery = 'INSERT INTO bankid_customerid (BankId, CustomerId) VALUES ?';

      // Insert data into the bank table
      await insertWithForeignKeyCheck(connection, bankQuery, bankData);

      // Insert data into the bankid_customerid table
      await insertWithForeignKeyCheck(connection, bankCustomerQuery, bankCustomerData);

      connection.commit((err) => {
        if (err) {
          connection.rollback(() => {
            console.error('Error committing transaction:', err);
            return res.status(500).send('Error committing transaction');
          });
        } else {
          res.status(200).send('Data inserted successfully');
        }
      });
    } catch (error) {
      connection.rollback(() => {
        console.error('Transaction error:', error);
        res.status(500).send('Error inserting data');
      });
    }
  });
});
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

    console.log('ATM data inserted successfully');
    res.status(200).json({ message: 'ATM data inserted successfully', insertedRows: results.affectedRows });
  });
});
app.post('/api/insertEmployeeData', (req, res) => {
  const { employeeDetails } = req.body;

  // Check if employeeDetails is an array and not empty
  if (!Array.isArray(employeeDetails) || employeeDetails.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty employee details provided' });
  }

  // Validate each employee object in the array
  const isValidEmployeeDetails = employeeDetails.every((employee) =>
    employee &&
    typeof employee === 'object' &&
    'EmployeeId' in employee &&
    'EmployeeName' in employee &&
    'EmployeeRole' in employee &&
    'EmployeeContactNumber' in employee &&
    'TypeOfWork' in employee
  );

  if (!isValidEmployeeDetails) {
    return res.status(400).json({ error: 'Invalid employee details format' });
  }

  // Prepare the SQL INSERT statements
  const employeeInsertSQL = 'INSERT INTO employee (EmployeeId, EmployeeName, EmployeeRole, EmployeeContactNumber, TypeOfWork) VALUES ?';
  const atmEmployeeInsertSQL = 'INSERT INTO atm_employee (AtmId, EmployeeId) VALUES ?';

  // Extract values from employee details to be inserted into the employee table
  const employeeValues = employeeDetails.map((employee) => [
    employee.EmployeeId,
    employee.EmployeeName,
    employee.EmployeeRole,
    employee.EmployeeContactNumber,
    employee.TypeOfWork,
  ]);

  // Extract ATM ID and Employee ID pair for insertion into atm_employee table
  const atmId = employeeDetails[0].AtmId; // Assuming AtmId is a property of employeeDetails
  const employeeId = employeeDetails[0].EmployeeId;
  const atmEmployeeValues = [[atmId, employeeId]]; // Create a single pair [AtmId, EmployeeId]

  // Start a database transaction
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Failed to start transaction' });
    }

    // Check if EmployeeId already exists in the employee table
    connection.query('SELECT EmployeeId FROM employee WHERE EmployeeId = ?', [employeeId], (selectErr, selectResults) => {
      if (selectErr) {
        console.error('Error checking existing EmployeeId:', selectErr);
        connection.rollback(() => {
          console.error('Transaction rolled back due to select error.');
          return res.status(500).json({ error: 'Failed to check existing EmployeeId' });
        });
      }

      if (selectResults.length > 0) {
        // EmployeeId already exists, skip inserting into employee table
        console.log(`EmployeeId '${employeeId}' already exists in the database. Skipping insertion into employee table.`);
        proceedWithAtmEmployeeInsert();
      } else {
        // Insert into employee table
        connection.query(employeeInsertSQL, [employeeValues], (error, employeeResults) => {
          if (error) {
            console.error('Error inserting employee data:', error);
            connection.rollback(() => {
              console.error('Transaction rolled back due to employee insertion error.');
              return res.status(500).json({ error: 'Failed to insert employee data' });
            });
          } else {
            // Proceed to insert into atm_employee table
            proceedWithAtmEmployeeInsert(employeeResults);
          }
        });
      }
    });

    // Function to insert into atm_employee table
    function proceedWithAtmEmployeeInsert(employeeResults) {
      connection.query(atmEmployeeInsertSQL, [atmEmployeeValues], (atmEmployeeError, atmEmployeeResults) => {
        if (atmEmployeeError) {
          console.error('Error inserting atm_employee data:', atmEmployeeError);
          connection.rollback(() => {
            console.error('Transaction rolled back due to atm_employee insertion error.');
            return res.status(500).json({ error: 'Failed to insert atm_employee data' });
          });
        }

        // Commit the transaction if both queries are successful
        connection.commit((commitError) => {
          if (commitError) {
            console.error('Error committing transaction:', commitError);
            connection.rollback(() => {
              console.error('Transaction rolled back due to commit error.');
              return res.status(500).json({ error: 'Failed to commit transaction' });
            });
          }

          console.log('Transaction committed successfully');
          res.status(200).json({
            message: 'Employee and atm_employee data inserted successfully',
            insertedEmployeeRows: employeeResults ? employeeResults.affectedRows : 0,
            insertedAtmEmployeeRows: atmEmployeeResults.affectedRows,
          });
        });
      });
    }
  });
});
app.post('/api/insertServicesData', (req, res) => {
  const { servicesDetails } = req.body;

  if (!servicesDetails || !Array.isArray(servicesDetails)) {
    return res.status(400).json({ error: 'Invalid services details format' });
  }

  // Prepare the SQL INSERT statement
  const sql = 'INSERT INTO services (ServiceId,ServiceType, TakeoverDate, HandoverDate, CostToClient, AtmId) VALUES ?';

  // Extract values from ATM details to be inserted
  const values = servicesDetails.map((service) => [
    service.ServiceId,
    service.ServiceType,
    service.TakeoverDate,
    service.HandoverDate,
    service.CostToClient,
    service.AtmId,
  ]);

  // Execute the SQL INSERT query
  connection.query(sql, [values], (error, results) => {
    if (error) {
      console.error('Error inserting services data:', error);
      return res.status(500).json({ error: 'Failed to insert services data' });
    }

    console.log('Services data inserted successfully');
    res.status(200).json({ message: 'services data inserted successfully', insertedRows: results.affectedRows });
  });
});
app.post('/api/register', async (req, res) => {
  const { name, username, password, phonenumber, access, session_intime, session_outtime } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO admin (name, username, password, phonenumber, access, session_intime, session_outtime) VALUES (?,?,?,?,?,?,?)';
    connection.query(query, [name, username, hashedPassword, phonenumber, access, session_intime, session_outtime], (error, results) => {
      if (error) {
        console.error('Error inserting data into admin table:', error);
        res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
      } else {
        console.log('Data inserted successfully into admin table');
        res.status(200).json({ success: true, message: 'Registration successful' });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
});
app.post('/api/registeruser/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, username, password, phonenumber, access } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'UPDATE admin SET name = ?, username = ?, password = ?, phonenumber = ?, access = ? WHERE id = ?';

    connection.query(query, [name, username, hashedPassword, phonenumber, access, userId], (error, results) => {
      if (error) {
        console.error('Error updating data in admin table:', error);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      console.log('Data updated successfully in admin table');
      res.status(200).json({ success: true, message: 'User details updated successfully' });
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
          res.status(200).json({ success: true, message: 'Login successful!', token: token });
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
app.post('/api/logout', verifyToken, (req, res) => {
  const { username } = req.body;
  const updateQuery = 'UPDATE admin SET session_outtime = ? WHERE username = ?';
  const session_outtime = new Date().toISOString(); // Set current time as session_outtime
  connection.query(updateQuery, [session_outtime, username], (error, results) => {
    if (error) {
      console.error('Error updating session_outtime:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    } else {
      // Assuming successful update
      console.log('Session Destroyed successfully');
      res.status(200).json({ message: 'Logout successful' });
    }
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
app.get('/atm', (req, res) => {
  const { Id } = req.query;
  if (Id) {
    connection.query(`SELECT * FROM atm WHERE CustomerId ='${Id}'`, (error, results) => {
      if (error) {
        console.error('Error fetching atms:', error);
        res.status(500).json({ error: 'An error occurred while fetching atms' });
      } else {
        res.json(results);
      }
    });
  }
  else {
    connection.query('SELECT * FROM atm', (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  }
});
app.get('/atmregion', (req, res) => {
  connection.query('SELECT AtmId,RegionId, RegionName, GstStateCode FROM atmregion', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});
app.get('/services', (req, res) => {
  connection.query('SELECT * FROM services', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});
app.get('/employee', (req, res) => {
  connection.query('SELECT * FROM employee', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});
app.get('/atm_employeedetails', (req, res) => {
  // Query to fetch ATM employee details
  const query = `
    SELECT ae.AtmId,e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContactNumber, e.TypeOfWork
    FROM atm_employee ae
    JOIN employee e ON ae.EmployeeId = e.EmployeeId
  `;

  // Use the connection pool to execute the query
  connection.query(query, (error, results) => {
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
  connection.query('SELECT * FROM admin', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
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
        console.log('Data inserted successfully');
        resolve();
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
