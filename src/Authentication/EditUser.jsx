import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackButton from '../Components/BackButton';
import '../css/customerform.css';
import { getUserRole } from '../functions/userAuth';
import { jwtDecode } from 'jwt-decode';

const EditUser = () => {
    // State variables to store form data
    const { userId } = useParams();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [access, setAccess] = useState('');
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null); // State to hold user's role

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token);
                    const userId = decoded.username;
                    const role = await getUserRole(userId);
                    setUserRole(role[0].access); // Assuming role[0].access gives the user role
                } else {
                    console.error('No token found in localStorage');
                }
            } catch (error) {
                console.error('Error decoding token or fetching user role:', error);
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/userdetails/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const userData = await response.json();
                setName(userData.name);
                setUsername(userData.username);
                setPhonenumber(userData.phonenumber);
                setAccess(userData.access);
            } catch (error) {
                setError('Failed to fetch user details');
                console.error('User details fetch error:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            name,
            username,
            phonenumber,
            access,
        };

        try {
            const response = await fetch(`http://localhost:5000/api/registeruser/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            toast.success('User details updated successfully!');
        } catch (error) {
            setError('Update failed');
            console.error('Update error:', error);
        }
    };

    return (
        <div className='container-form'>
            <div className="customer-details">
                <BackButton />
                <form className="" onSubmit={handleSubmit}>
                    <p className="customer-details-heading">Edit User Details</p>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div className="relative">
                            <label htmlFor="name" className="label_form">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} name="name" id="name" className="form-input" placeholder="Your name" required />
                        </div>
                        <div className="relative">
                            <label htmlFor="username" className="label_form">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} name="username" id="username" className="form-input" placeholder="xyz@company.com"  disabled={userRole === 'Employee' || userRole === 'Admin'} required />
                        </div>
                        <div className="relative">
                            <label htmlFor="phonenumber" className="label_form">Phone Number</label>
                            <input type="number" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} name="phonenumber" id="phonenumber" className="form-input" placeholder="XXXXXXXXXX" required />
                        </div>
                    </div>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div className="relative">
                            <label htmlFor="access" className="label_form">Access</label>
                            <select value={access} onChange={(e) => setAccess(e.target.value)} name="access" id="access" className="form-input" disabled={userRole === 'Employee' || userRole === 'Admin'} required>
                                <option value="">Select Role</option>
                                <option value="SuperAdmin">Super Admin</option>
                                <option value="Admin">Admin</option>
                                <option value="Employee">Employee</option>
                            </select>
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="submit-btn">Edit User</button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};

export default EditUser;
