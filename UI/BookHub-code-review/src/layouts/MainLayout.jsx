import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-16">
          <main className="p-4">{children}</main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;