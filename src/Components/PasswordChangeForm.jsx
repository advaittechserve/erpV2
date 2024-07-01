import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/customerform.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const PasswordChangeForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.username;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/changepassword/${userId}`,
        {
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage(" ");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password changed successfully!");
        
      } else {
        throw new Error(response.data.error || "Password change failed");
      }
    } catch (error) {
      setError("Password change failed");
      console.error("Password change error:", error);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        navigate("/Dashboard");
      }, 3000); // Redirect to dashboard after 3 seconds (adjust as needed)

      return () => clearTimeout(timeout);
    }
  }, [successMessage, navigate]);

  return (
    <div className="container-form">
      <form onSubmit={handleSubmit} className="customer-details">
        <p className="customer-details-heading">Change Password Details</p>
        <div className="grid gap-4 mb-6 md:grid-cols-3 mt-4">
          <div className="relative">
            <label htmlFor="Username" className="label_form">
              Username
            </label>

            <input
              className="dropdown"
              type="text"
              value={userId}
              // Assuming userId is passed as a prop and readonly
              readOnly
            />
          </div>
          <div className="relative">
            <label htmlFor="Password" className="label_form">
              Password
            </label>

            <input
              className="dropdown"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="Confirm Password" className="label_form">
              Confirm Password
            </label>

            <input
              className="dropdown"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <button type="submit" className="submit-btn">Change Password</button>

        <ToastContainer />
      </form>
    </div>
  );
};

export default PasswordChangeForm;
