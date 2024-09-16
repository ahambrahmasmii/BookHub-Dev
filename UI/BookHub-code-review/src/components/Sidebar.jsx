import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../userSlice'; // Adjust the path as needed
import { adminNavigation, navigation, logoutIcon } from '../helpers/navigationData';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from "../pages/UserPool"; // Make sure to import your UserPool

const Sidebar = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        const cognitoUser = new CognitoUser({
            Username: user.email,
            Pool: UserPool
        });

        cognitoUser.signOut(() => {
            toast.success('Logged out successfully', {
                duration: 1000,
            });
            // Delaying the rest of the logout process to ensure the toast message is shown first
            setTimeout(() => {
                localStorage.removeItem('user');
                dispatch(clearUser());
                navigate('/signin');
            }, 1000);
        });
    };

    return (
        <nav className="fixed top-0 left-0 h-full border-r bg-white transition-all duration-200 ease-in-out z-40 w-16 group hover:w-64">
            <div className="flex flex-col h-full">
                <div className='h-20 flex items-center justify-center'>
                    <img 
                        src="https://image4.owler.com/logo/montycloud_owler_20220421_100109_original.jpg" 
                        width={140} 
                        className="hidden group-hover:block" 
                        alt="MontyCloud logo"
                    />
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQroHj37rinhzSoeBcJDUc351R0wR1r263KHQ&s" 
                        width={32} 
                        className="block group-hover:hidden" 
                        alt="MontyCloud icon"
                    />
                </div>
                <div className="flex-1 flex flex-col h-full overflow-auto">
                    <ul className="px-4 text-sm font-medium flex-1">
                        {(user.userType === 'admin' ? adminNavigation : navigation).map((item, idx) => (
                            <li key={idx}>
                                <Link to={item.href} className="flex items-center gap-x-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 duration-150">
                                    <div className="text-gray-500">{item.icon}</div>
                                    <span className="hidden group-hover:block">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <ul className="px-4 pb-4 text-sm font-medium">
                            <li>
                                <button onClick={handleLogout} className="flex items-center gap-x-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 duration-150">
                                    {logoutIcon}
                                    <span className="hidden group-hover:block">Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;