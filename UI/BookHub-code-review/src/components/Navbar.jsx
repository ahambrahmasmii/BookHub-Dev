import React from 'react'
import { useState } from "react"
import * as Avatar from "@radix-ui/react-avatar";
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux';

 
const Navbar = () => {
    const [menuState, setMenuState] = useState(false);
    const user = useSelector((state) => state.user);
 
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-16"> {/* Add margin-left to account for the sidebar width */}
          <nav className="bg-white border-b">
              <div className="flex items-center justify-between py-3 px-4 max-w-8xl mx-auto md:px-4">
                  <div className="flex items-center space-x-8">
                      <div className="flex-none">
                          <a href="">
                              <img
                                  src="https://image4.owler.com/logo/montycloud_owler_20220421_100109_original.jpg"
                                  width={120}
                                  height={50}
                                  alt="MontyCloud logo"
                                  className="hidden lg:block"
                              />
                          </a>
                      </div>
                      <div className="hidden lg:block">
                      </div>
                  </div>
                  <div className="flex items-center space-x-4">
                      <div className="hidden lg:block">
                          <Avatar.Root className="flex items-center space-x-3">
                              <Avatar.Image
                                  src="https://e7.pngegg.com/pngimages/550/997/png-clipart-user-icon-foreigners-avatar-child-face.png"
                                  className="w-12 h-12 rounded-full object-cover"
                              />
                              <Avatar.Fallback
                                  delayMs={600}
                                  className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"
                              >
                                  CT
                              </Avatar.Fallback>
                              <div>
                                  <span className="text-gray-700 text-sm font-medium">{user.name}</span>
                                  <span className="block text-gray-700 text-xs">
                                      {user.email}
                                  </span>
                              </div>
                          </Avatar.Root>
                      </div>
                  </div>
              </div>
              <div className={`bg-white absolute z-20 w-full top-16 left-0 p-4 border-b lg:hidden ${menuState ? '' : 'hidden'}`}>
              <h2 className="text-gray-600 hover:text-gray-900">Digital Books</h2>
                  <div className="mt-5 pt-5 border-t">
                      AVATAR
                  </div>
              </div>
          </nav>
          <main className="p-4">
            
           
          </main>
        </div>
      </div>
    )
}
 
export default Navbar