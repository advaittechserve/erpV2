const axios = require('axios');

const startNewLogFile = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/newUploadLog');
    if (response.status === 200) {
      console.log('New log file created:', response.data.logFileName);
    } else {
      console.error('Error creating new log file');
    }
  } catch (error) {
    console.error('Error starting new log file:', error);
  }
}

 function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  axios.post('http://localhost:5000/api/log', { message: logEntry })
    .catch(error => console.error('Error logging message:', error));
}
module.exports = startNewLogFile;
