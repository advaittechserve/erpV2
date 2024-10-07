// userAuth.js

import axios from 'axios';

export const getUserRole = async (userId) => {
  try {
    const response = await axios.get('http://localhost:5000/admindetails', {
      params: { username: userId }
    });
    const userType = response.data; // Assuming 'access' is the field you need
    return userType;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest'; // Default role in case of error
  }
};
