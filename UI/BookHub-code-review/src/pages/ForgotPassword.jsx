import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    user.forgotPassword({
      onSuccess: function (data) {
        console.log('CodeDeliveryData from forgotPassword: ', data);
        toast.success("Password reset code has been sent to your email.");
        setStage(2);
      },
      onFailure: function (err) {
        console.error(err);
        toast.error(err.message || "An error occurred. Please try again.");
      }
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    user.confirmPassword(resetCode, newPassword, {
      onSuccess() {
        toast.success("Password has been reset successfully. You can now sign in with your new password.", {
          duration: 3000,
          onClose: () => navigate('/signin'),
        });
      },
      onFailure(err) {
        console.error(err);
        toast.error(err.message || "An error occurred. Please try again.");
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
            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
              {stage === 1 ? 'Forgot Password' : 'Reset Password'}
            </h3>
            <p className="">
              Remember your password?{' '}
              <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-white shadow p-4 py-6 space-y-8 sm:p-6 sm:rounded-lg">
          {stage === 1 ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
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
              <button
                type="submit"
                className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
              >
                Send Reset Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="font-medium">Reset Code</label>
                <input
                  type="text"
                  required
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />
              </div>
              <div>
                <label className="font-medium">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
              >
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;