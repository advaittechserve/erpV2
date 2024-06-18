import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css'; 
// Import the CSS file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password ,currentDate}),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.reload();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      console.log('Login');
      navigate('/Dashboard');
    }
  }, []);
  return (
    <div className="form-container1">
      <div className="form-container2">
        <img src="/src/assets/logo.jpg" className="logo" alt="Advait Logo" />
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} name="username" id="username" className="form-input" placeholder="name@company.com" required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" id="password" className="form-input" placeholder="••••••••" required />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Login to your account</button>
          <div className="register-text">
            Not registered? <a href="/Register" className="navigate-link">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
