import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';
import PasswordChangeForm from './PasswordChangeForm';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);

    const menuItems = [
        {
            title: "Dashboard",
            link: "/Dashboard",
            icon: "M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002ZM12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"
        },
        {
            title: "Upload Excel",
            link: "/InsertData",
            icon: "M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        },
        {
            title: "Forms",
            icon: "M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5ZM6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397ZM8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z",
            children: [
                { title: "Customer Form", link: "/CustomerForm" },
                { title: "Employee Form", link: "/EmployeeForm" },
                { title: "Services Form", link: "/ServicesForm" },
            ]
        },
        {
            title: "User Settings",
            link: "/UserSettings",
            //icon: "M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5ZM6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397ZM8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"

            icon: "M9 13.829A3.004 3.004 0 0 0 11 11a3.003 3.003 0 0 0-2-2.829V0H7v8.171A3.004 3.004 0 0 0 5 11c0 1.306.836 2.417 2 2.829V16h2v-2.171zm-5-6A3.004 3.004 0 0 0 6 5a3.003 3.003 0 0 0-2-2.829V0H2v2.171A3.004 3.004 0 0 0 0 5c0 1.306.836 2.417 2 2.829V16h2V7.829zm10 0A3.004 3.004 0 0 0 16 5a3.003 3.003 0 0 0-2-2.829V0h-2v2.171A3.004 3.004 0 0 0 10 5c0 1.306.836 2.417 2 2.829V16h2V7.829zM12 6V4h2v2h-2zM2 6V4h2v2H2zm5 6v-2h2v2H7z"

        },
        {
            title: "Generate Report",
            link: "/GenerateReport",

            icon: "M21.5,21H20V9.5a.5.5,0,0,0-.5-.5h-3a.5.5,0,0,0-.5.5V21H14V13.5a.5.5,0,0,0-.5-.5h-3a.5.5,0,0,0-.5.5V21H8V14.5a.5.5,0,0,0-.5-.5h-3a.5.5,0,0,0-.5.5V21H2.5a.5.5,0,0,0,0,1h19a.5.5,0,0,0,0-1ZM7,21H5V15H7Zm6,0H11V14h2Zm6,0H17V10h2Z M2.5,13a.47.47,0,0,0,.35-.15l4.7-4.69L11.2,10.9a.49.49,0,0,0,.65-.05L19,3.71V5.5a.5.5,0,0,0,1,0v-3a.41.41,0,0,0,0-.19A.51.51,0,0,0,19.69,2a.41.41,0,0,0-.19,0h-3a.5.5,0,0,0,0,1h1.79L11.45,9.84,7.8,7.1a.49.49,0,0,0-.65.05l-5,5a.48.48,0,0,0,0,.7A.47.47,0,0,0,2.5,13Z"
        },
        // {
        //     title: "Sign Out",
        //     link: "/SignOut",
        //     //icon: "M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5ZM6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397ZM8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"

        //     icon: "M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H17C17.5523 21 18 20.5523 18 20C18 19.4477 17.5523 19 17 19H6C5.44772 19 5 18.5523 5 18V6C5 5.44772 5.44772 5 6 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H6ZM15.7071 7.29289C15.3166 6.90237 14.6834 6.90237 14.2929 7.29289C13.9024 7.68342 13.9024 8.31658 14.2929 8.70711L16.5858 11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16.5858L14.2929 15.2929C13.9024 15.6834 13.9024 16.3166 14.2929 16.7071C14.6834 17.0976 15.3166 17.0976 15.7071 16.7071L19.7071 12.7071C20.0976 12.3166 20.0976 11.6834 19.7071 11.2929L15.7071 7.29289Z"
        // }
        {
            title: 'Reset Password',
            icon:      
       "M17.408 3.412a1.974 1.974 0 0 0 0-2.82 1.973 1.973 0 0 0-2.819 0l-.29.29-.59-.59a1.009 1.009 0 0 0-1.65.35l-.35-.35a1.004 1.004 0 1 0-1.42 1.42l.35.35a1.033 1.033 0 0 0-.58.58l-.35-.35a1.004 1.004 0 0 0-1.42 1.42L9.879 5.3l-3.02 3.01c-.01.01-.02.03-.03.04A4.885 4.885 0 0 0 5 8a5 5 0 1 0 5 5 4.885 4.885 0 0 0-.35-1.83c.01-.01.03-.02.04-.03l7.718-7.728zM5 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" ,
            link: "/PasswordChangeForm",
        },


    ];
    const handleMenuItemClick = (link) => {
        navigate(link);
    };

    return (
        <aside className={`fixed top-0 left-0 z-40 w-50 min-h-screen pt-20 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
            } bg-gray-800 border-r-4 xl:translate-x-0 dark:bg-yellow-800 dark:border-yellow-700 mt-5 p-1`} id="logo-sidebar">
            <div className="h-full px-2 pb-4 overflow-y-auto bg-gray-800 dark:bg-gray-800">
                <ul className="space-y-2 font-semibold text-sm ">
                    {menuItems.map((menuItem, index) => (
                        <li key={index}>
                            {menuItem.children ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="sidebar-list flex items-center justify-between text-white rounded-xl dark:text-white hover:text-black dark:hover:bg-gray-700 group focus:outline-none"
                                        onClick={() => setIsFormMenuOpen(!isFormMenuOpen)}
                                        aria-expanded={isFormMenuOpen}
                                    >
                                        <div className="flex items-center">
                                            <svg className="flex-shrink-0 w-5 h-8 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path clipRule="evenodd" fillRule="evenodd" d={menuItem.icon} />
                                            </svg>
                                            <span className="ms-3">{menuItem.title}</span>
                                        </div>
                                        <svg className={`w-5 h-8 ${isFormMenuOpen ? 'transform rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 8l4 4 4-4z" />
                                        </svg>
                                    </button>
                                    {isFormMenuOpen && (
                                        <ul className="py-2 space-y-2">
                                            {menuItem.children.map((childItem, childIndex) => (
                                                <li key={childIndex}>
                                                    <button
                                                        type="button"
                                                        className="sidebar-list text-white rounded-xl dark:text-white hover:text-black"
                                                        onClick={() => handleMenuItemClick(childItem.link)}
                                                    >
                                                        {childItem.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="sidebar-list flex items-center text-white rounded-xl dark:text-white hover:text-black dark:hover:bg-gray-700 group"
                                    onClick={() => handleMenuItemClick(menuItem.link)}
                                >
                                    <svg className="flex-shrink-0 w-5 h-8 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path clipRule="evenodd" fillRule="evenodd" d={menuItem.icon} />
                                    </svg>
                                    <span className="ms-3">{menuItem.title}</span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
