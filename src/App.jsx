import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./Components/Layout";
import DetailsPage from "./Components/DetailsPage";
import InsertData from "./Components/InsertData";
import CustomerForm from "./Form/CustomerForm";
import EmployeeForm from "./Form/EmployeeForm";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import DetailsTable from "./Components/DetailsTable";
import UserProfile from "./Components/UserProfile";
import EditUser from "./Authentication/EditUser";
import BankDetailsTable from "./Components/BankDetailsTable";
import AtmDetailsTable from "./Components/AtmDetailsTable";
import ServicesForm from "./Form/ServicesForm";
import AtmForm from "./Form/AtmForm";
import ReportGeneration from "./Components/ReportGeneration";
import TestUpload from "./Components/test_upload";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import PasswordChangeForm from "./Components/PasswordChangeForm";
import ScrollToTop from "./Components/ScrollToTop";


const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};
const token = localStorage.getItem("token");
let userId;

try {
  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.username;
  } 
} catch (error) {
  console.error("Failed to decode token:", error.message);
}

const App = () => {
  const [userAccess, setUserAccess] = useState(null);
  const [userIdtemp, setUserIdtemp] = useState(null);
  useEffect(() => {
    const fetchData = async (userId) => {
      try {
        const response = await axios.get("http://localhost:5000/admindetails", {
          params: { username: userId },
        });
        setUserIdtemp(response.data[0].id);
        setUserAccess(response.data[0].access);
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };
    if (isAuthenticated()) {
      fetchData(userId); // Fetch data only if user is authenticated
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Layout>
                <DetailsTable />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/Dashboard"
          element={
            isAuthenticated() ? (
              <Layout>
                <DetailsTable />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/DetailsPage"
          element={
            isAuthenticated() ? (
              <Layout>
                <DetailsPage />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/InsertData"
          element={
            isAuthenticated() ? (
              <Layout>
                <InsertData />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/CustomerForm"
          element={
            isAuthenticated() ? (
              <Layout>
                <CustomerForm />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/EmployeeForm"
          element={
            isAuthenticated() ? (
              <Layout>
                <EmployeeForm />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/ServicesForm"
          element={
            isAuthenticated() ? (
              <Layout>
                <ServicesForm />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/UserSettings"
          element={
            isAuthenticated() ? (
              userAccess === "SuperAdmin" ? (
                <Layout>
                  <UserProfile />
                </Layout>
              ) : (
                <Navigate to={`/EditUser/${userIdtemp}`} />
              )
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/PasswordChangeForm"
          element={
            isAuthenticated() ? (
              <Layout>
                <PasswordChangeForm />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/EditUser/:userId"
          element={
            isAuthenticated() ? (
              <Layout>
                <EditUser />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/BankDetails/:customerId"
          element={
            isAuthenticated() ? (
              <Layout>
                <BankDetailsTable />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/AtmDetails/:bankId/:customerId"
          element={
            isAuthenticated() ? (
              <Layout>
                <AtmDetailsTable />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/AtmDetailsEdit/:atmId"
          element={
            isAuthenticated() ? (
              <Layout>
                <AtmForm />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/GenerateReport"
          element={
            isAuthenticated() ? (
              <Layout>
                <ReportGeneration />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/TestUpload"
          element={
            isAuthenticated() ? (
              <Layout>
                <TestUpload />
              </Layout>
            ) : (
              <Navigate to="/Login" replace />
            )
          }
        />
        <Route
          path="/Logout"
          element={
            <Navigate to="/Login" replace state={{ from: "/Dashboard" }} />
          }
          onClick={handleLogout}
        />
      </Routes>
    </Router>
  );
};

export default App;
