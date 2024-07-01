import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import RegisterbyAdmin from "../Authentication/RegisterbyAdmin";
import "../css/toastStyles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "./Breadcrumb";
import breadcrumbData from "../functions/breadcrumbData";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ErrorOutline } from "@mui/icons-material";

const UserProfile = () => {
  const [data, setData] = useState([]);
  const [searchBtn] = useState(true);
  const [downloadBtn] = useState(true);
  const [filterBtn] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleEdituser = (rowData) => {
    const userId = rowData[0];
    navigate(`/EditUser/${userId}`);
  };

  const handleDeletion = (userId) => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/userdetails/${userIdToDelete}`
      );
      if (response.status === 200) {
        toast.success("Successfully Deleted!");
        fetchData();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Delete user error:", error);
    }
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
  };

  const cancelDeletion = () => {
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admindetails");
      const admindetailsData = response.data;
      setData(admindetailsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "id", label: "User ID" },
    { name: "name", label: "Name" },
    { name: "username", label: "Username" },
    { name: "phonenumber", label: "Phone number" },
    { name: "access", label: "Access" },
    { name: "session_intime", label: "Session In Time" },
    { name: "session_outtime", label: "Session Out Time" },
    {
      name: "edit",
      label: "Edit User",
      options: {
        customBodyRender: (value, tableMeta) => (
          <button
            onClick={() => handleEdituser(tableMeta.rowData)}
            className="add-btn"
          >
            Edit
          </button>
        ),
      },
    },
    {
      name: "delete",
      label: "Delete User",
      options: {
        customBodyRender: (value, tableMeta) => (
          <button
            onClick={() => handleDeletion(tableMeta.rowData[0])}
            className="delete-btn"
          >
            Delete
          </button>
        ),
      },
    },
  ];

  const options = {
    search: searchBtn,
    download: downloadBtn,
    print: {
      text: "Print Table", // Custom text for print button
      exportOptions: {
        columns: ":visible", // Export visible columns only
      },
    },
    viewColumns: false,
    filter: filterBtn,
    responsive: "standard",
    scrollX: true,
    selectableRows: "none",
  };

  const getMuiTheme = () =>
    createTheme({
      typography: {
        fontFamily: "Calibri",
      },

      palette: {
        background: {
          paper: "#fff",
          default: "",
        },
      },
      components: {
        MuiTableCell: {
          styleOverrides: {
            head: {
              whiteSpace: "nowrap",
              padding: "5px",
              fontWeight: "bold",
            },
            body: {
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: "none",
            },
          },
        },
      },
    });

  return (
    <div className="container-form">
      <div className="customer-details">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb items={breadcrumbData.User} />
          </div>
          <div className="sm:flex">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              All users
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              <button
                type="button"
                onClick={toggleModal}
                className="submit-btn"
              >
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              data={data}
              columns={columns}
              options={options}
              className="muitable"
            />
          </ThemeProvider>
        </div>
        <ToastContainer />

        <div>
          {isModalOpen && (
            <div
              id="authentication-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={toggleModal}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg sm:w-full">
                  <div className="p-20">
                    <div className="">
                      <div className="mt-3">
                        <h2 className="text-xl" id="modal-title">
                          Register new User
                        </h2>
                        <div className="mt-2">
                          <RegisterbyAdmin />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          {isDeleteModalOpen && (
            <div
              id="delete-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={cancelDeletion}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg sm:w-full">
                  <div className="p-20">
                    <div className="">
                      <div className="mt-3 text-center">
                        <ErrorOutline
                          style={{ color: "red", fontSize: "2rem" }}
                        />
                        <h2 className="text-xl" id="modal-title">
                          Confirm Deletion
                        </h2>
                        <p className="mt-2">
                          Are you sure you want to delete this user?
                        </p>
                        <div className="mt-4 flex justify-center space-x-4">
                          <button
                            onClick={confirmDeletion}
                            className="submit-btn"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDeletion}
                            className="cancel-btn"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
