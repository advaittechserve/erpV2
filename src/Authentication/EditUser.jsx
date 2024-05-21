import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackButton from '../Components/BackButton';
import '../css/customerform.css';

const EditUser = () => {
    // State variables to store form data
    const { userId } = useParams();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [password, setPassword] = useState('');
    const [access, setAccess] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const handleRoleChange = (e) => {
        setAccess(e.target.value);
    };
    useEffect(() => {
        // Fetch user details based on userId
        fetch(`http://localhost:5000/userdetails/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }
                return response.json();
            })
            .then((userData) => {
                // Update state with the fetched user data
                setName(userData.name);
                setUsername(userData.username);
                setPhonenumber(userData.phonenumber);
                setAccess(userData.access);
                setPassword(userData.password);
                setConfirmPassword(userData.password);
                // Assuming you don't want to prepopulate password fields
            })
            .catch((error) => {
                setError('Failed to fetch user details');
                console.error('User details fetch error:', error);
            });
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const formData = {
            name: name,
            username: username,
            phonenumber: phonenumber,
            access: access,
            password: password,
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
                throw new Error('Registration failed');
            }

            // Assuming you have a toast notification library like 'toast' available
            toast.success('Successfully Updated!');
        } catch (error) {
            setError('Registration failed');
            console.error('Registration error:', error);
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
                            <label htmlFor="floating_outlined" className="label_form">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} name="name" id="name" className="form-input" placeholder="Your name" required />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} name="username" id="username" className="form-input" placeholder="xyz@company.com" required />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Phone Number</label>
                            <input type="number" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} name="phonenumber" id="phonenumber" className="form-input" placeholder="XXXXXXXXXX" required />
                        </div>
                    </div>
                    <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">
                                Access
                            </label>
                            <select value={access} onChange={handleRoleChange} name="access" id="access" className="form-input" required>
                                <option value="">Select Role</option>
                                <option value="SuperAdmin" selected={access === 'SuperAdmin'}>Super Admin</option>
                                <option value="Admin" selected={access === 'Admin'}>Admin</option>
                                <option value="Employee" selected={access === 'Employee'}>Employee</option>

                            </select> </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" id="password" className="form-input" placeholder="••••••••" required />
                        </div>
                        <div className="relative">
                            <label htmlFor="floating_outlined" className="label_form">Confirm password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} name="confirm-password" id="confirm-password" className="form-input" placeholder="••••••••" required />
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="submit-btn">Edit user</button>
                </form>
                <ToastContainer />
            </div>
        </div>

    );
};

export default EditUser;
