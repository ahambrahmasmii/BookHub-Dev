import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';

const ConfirmEmail = () => {
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const navigate = useNavigate();

  const handleConfirmSignup = async (e) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    user.confirmRegistration(confirmationCode, true, (err, data) => {
      if (err) {
        console.error(err);
        toast.error(err.message || 'An error occurred. Please try again.');
      } else {
        console.log(data);
        toast.success('Email confirmed successfully. You can now sign in.', {
          duration: 3000,
          onClose: () => navigate('/signin'),
        });
      }
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
            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Confirm your email</h3>
            <p className="">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
            <p className="">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-white shadow p-4 py-6 space-y-8 sm:p-6 sm:rounded-lg">
          <form onSubmit={handleConfirmSignup} className="space-y-5">
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
              <label className="font-medium">Confirmation Code</label>
              <input
                type="text"
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
            >
              Confirm Email
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ConfirmEmail;