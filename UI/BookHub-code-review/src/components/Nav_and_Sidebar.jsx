import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'


const Nav_and_Sidebar = () => {
  return (
    <>
    <Navbar />
    <div className="flex">
        <Sidebar />
            <div className="flex-1 ml-16"> {/* Add margin-left to account for the sidebar width */}
                <main className="p-4">
                        {/* Add Main Content  */}
                        
                 </main>
            </div>
    </div>
    </>
  )
}

export default Nav_and_Sidebar