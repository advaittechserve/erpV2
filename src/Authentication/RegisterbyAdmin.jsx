import { useState, useEffect } from 'react';
import '../css/login.css'; // Import the CSS file
import '../css/toastStyles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const RegisterbyAdmin = () => {  
    // State variables to store form data
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [data, setData] = useState([]);
  
    // Function to handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
  
      // Construct data object to be sent in the request body
      const formData = {
        username,
        password: password,
      };
  
      // Make a POST request to the backend endpoint to register the user
      fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Registration failed');
          }
          return response.json();
        })
        .then(() => {
            toast.success('Successfully Registered!');
            fetchData();
        })
        .catch((error) => {
          setError('Registration failed');
          console.error('Registration error:', error);
        });
    };
    const fetchData = async () => {
      try {
          const response = await axios.get('http://localhost:5000/admindetails');
          const admindetailsData = response.data;
          setData(admindetailsData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

  useEffect(() => {
      fetchData();
    }, []);
  
  return (
    <div>
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} name="username" id="username" className="form-input" placeholder="Your username" required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" id="password" className="form-input" placeholder="••••••••" required />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} name="confirm-password" id="confirm-password" className="form-input" placeholder="••••••••" required />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Create an account</button>
        </form>
        <ToastContainer/>
        </div>
    
  );
};

export default RegisterbyAdmin;
