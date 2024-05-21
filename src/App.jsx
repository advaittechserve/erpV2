import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Layout';
import DetailsPage from './Components/DetailsPage';
import InsertData from './Components/InsertData';
import CustomerForm from './Form/CustomerForm';
import EmployeeForm from './Form/EmployeeForm';
import Login from './Authentication/Login';
import Register from './Authentication/Register';
import DetailsTable from './Components/DetailsTable';
import UserProfile from './Components/UserProfile';
import EditUser from './Authentication/EditUser';
import BankDetailsTable from './Components/BankDetailsTable';
import AtmDetailsTable from './Components/AtmDetailsTable';
import ServicesForm from './Form/ServicesForm';
import AtmForm from './Form/AtmForm';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route
          path="/"
          element={isAuthenticated() ? <Layout><DetailsTable /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/Dashboard"
          element={isAuthenticated() ? <Layout><DetailsTable /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/DetailsPage"
          element={isAuthenticated() ? <Layout><DetailsPage /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/InsertData"
          element={isAuthenticated() ? <Layout><InsertData /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/CustomerForm"
          element={isAuthenticated() ? <Layout><CustomerForm /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/EmployeeForm"
          element={isAuthenticated() ? <Layout><EmployeeForm /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/ServicesForm"
          element={isAuthenticated() ? <Layout><ServicesForm /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/UserSettings"
          element={isAuthenticated() ? <Layout><UserProfile /></Layout> : <Navigate to="/Login" replace />}
        />
         <Route
          path="/EditUser/:userId"
          element={isAuthenticated() ? <Layout><EditUser /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/BankDetails/:customerId"
          element={isAuthenticated() ? <Layout><BankDetailsTable /></Layout> : <Navigate to="/Login" replace />}
        />
            <Route
          path="/AtmDetails/:bankId"
          element={isAuthenticated() ? <Layout><AtmDetailsTable /></Layout> : <Navigate to="/Login" replace />}
        />
          <Route
          path="/AtmDetailsEdit/:atmId"
          element={isAuthenticated() ? <Layout><AtmForm /></Layout> : <Navigate to="/Login" replace />}
        />
        <Route
          path="/Logout"
          element={<Navigate to="/Login" replace state={{ from: '/Dashboard' }} />} 
          onClick={handleLogout}
        />
      </Routes>
    </Router>
  );
};

export default App;
