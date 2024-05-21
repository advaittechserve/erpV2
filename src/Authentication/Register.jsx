import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/toastStyles.css';
import '../css/login.css';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const formData = {
      username,
      password,
    };

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error) {
          // Username already exists, show toast
          toast.error('Username already exists. Please choose a different username.');
        } else {
          throw new Error('Registration failed');
        }
      } else {
        // Registration successful, show success toast and navigate to login
        toast.success('Registration successful!');
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      }
    } catch (error) {
      setError('Registration failed');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="form-container1">
      <div className="form-container2">
        <img src="/src/assets/logo.jpg" className="logo" alt="Advait Logo" />
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="username"
              id="username"
              className="form-input"
              placeholder="Your username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              name="confirm-password"
              id="confirm-password"
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Create an account</button>
          <div className="register-text">
            Already have an account? <a href="/Login" className="navigate-link">Login here</a>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
