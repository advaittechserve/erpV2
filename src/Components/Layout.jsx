
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../css/layout.css';

const Layout = ({ children }) => {
    return (
        <div>
            <Navbar className="navbar" />
            <Sidebar className="sidebar" />
            <div className="content">
                <div className="">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
