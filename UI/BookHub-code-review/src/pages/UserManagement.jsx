import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { API_KEY } from '../utils/config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_KEY}/list-users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("There was an error fetching the users!", error);
      toast.error("Failed to fetch users!");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (email, newRole) => {
    const updatePromise = axios.post(`${API_KEY}/update-role`, {
      email_id: email,
      role: newRole,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(
      updatePromise,
      {
        loading: 'Updating role...',
        success: () => {
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.email_id === email ? { ...user, role: newRole } : user
            )
          );
          return "Role updated successfully!";
        },
        error: "Failed to update role",
      }
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
            User Management
          </h3>
        </div>
        
        <div className="mt-4 mb-6">
          <input
            type="text"
            placeholder="Search by email or name"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Role</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {filteredUsers.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.email_id, e.target.value)}
                      className="px-4 py-2 text-indigo-600 rounded-lg duration-150 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200"
                    >
                      <option value="admin">Admin</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserManagement;