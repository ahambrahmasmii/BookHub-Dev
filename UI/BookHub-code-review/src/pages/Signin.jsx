// Signin.jsx
import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../userSlice';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from "./UserPool.jsx";

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please fill in both fields.');
      return;
    }

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log("onSuccess: ", data);
        const userData = {
          name: data.idToken.payload.name,
          email: data.idToken.payload.email,
          userType: data.idToken.payload['custom:role'],
          idToken: data.idToken.jwtToken, // Add idToken
          accessToken: data.accessToken.jwtToken, // Add accessToken
        };
        dispatch(setUser(userData));
        toast.success('Login successful!', {
          duration: 2000,
          onClose: () => navigate('/books'),
        });
      },
      onFailure: (err) => {
        console.error(err);
        toast.error(err.message || 'An error occurred. Please try again.');
      },
    });
  };

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
      <Toaster 
        position="top-right"
        toastOptions={{
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
      <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
        <div className="text-center">
          <img
            src="https://pbs.twimg.com/media/FrTRdgQWYAAbHZ3?format=png&name=4096x4096"
            width={150}
            className="mx-auto"
            alt="logo"
          />
          <div className="mt-5 space-y-2">
            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Sign in to your account</h3>
            <p className="">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-white shadow p-4 py-6 space-y-8 sm:p-6 sm:rounded-lg">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium">Password</label>
              <input
                type="password"
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
            >
              Sign in
            </button>
          </form>
          <div className="text-center">
              <Link to="/forgot-password" className="hover:text-indigo-600 mr-4">
                Forgot password?
              </Link>
              <Link to="/verify-email" className="hover:text-indigo-600">
                Verify Email?
              </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signin;
