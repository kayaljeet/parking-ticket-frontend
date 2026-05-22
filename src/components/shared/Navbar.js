"use client";

import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MapPin, Activity, Clock, LogOut, Menu, X } from 'react-feather';
import { useApp } from '../../context/AppContext';

export default function Navbar({ isOpen, setIsOpen }) {
  const { role, setRole, demoMode } = useApp();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const handleRoleToggle = () => {
    const newRole = isAdmin ? 'reportee' : 'admin';
    setRole(newRole);
    navigate(`/${newRole}/map`);
  };

  const handleSignOut = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = 'http://localhost:3002/parking-ticket';
    } else {
      window.location.href = '/parking-ticket';
    }
  };

  const base = `/${role}`;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded-full"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav
        className={`
          bg-black text-white p-6
          fixed md:static
          h-full md:h-screen
          w-64 md:w-20 lg:w-64
          flex-shrink-0
          transition-all duration-300 ease-in-out
          ${isOpen ? 'left-0' : '-left-64'}
          z-50 flex flex-col
        `}
      >
        <div className="flex flex-col h-full">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-gray-600 rounded-full overflow-hidden">
              <img src={`${process.env.PUBLIC_URL}/user.jpg`} alt="User" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-semibold md:hidden lg:block">{isAdmin ? 'DemoAdmin' : 'Joe'}</h2>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex flex-col items-center mb-6">
            <span className="text-xs text-gray-400 mb-2 md:hidden lg:block">
              {isAdmin ? 'Admin Mode' : 'Reportee Mode'}
              {demoMode && <span className="ml-1 text-yellow-400">(Demo)</span>}
            </span>
            <button
              onClick={handleRoleToggle}
              title={`Switch to ${isAdmin ? 'Reportee' : 'Admin'} mode`}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                isAdmin ? 'bg-blue-600 focus:ring-blue-500' : 'bg-emerald-500 focus:ring-emerald-400'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center text-xs font-bold ${
                  isAdmin ? 'translate-x-0 text-blue-600' : 'translate-x-7 text-emerald-600'
                }`}
              >
                {isAdmin ? 'A' : 'R'}
              </span>
            </button>
          </div>

          {/* Nav links */}
          <div className="space-y-2 flex-grow">
            <NavLink
              to={`${base}/map`}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
              }
              onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
            >
              <MapPin className="h-5 w-5" />
              <span className="ml-3 md:hidden lg:inline">Map</span>
            </NavLink>
            <NavLink
              to={`${base}/active`}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
              }
              onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
            >
              <Activity className="h-5 w-5" />
              <span className="ml-3 md:hidden lg:inline">{isAdmin ? "Active & Pending" : "Active"}</span>
            </NavLink>
            <NavLink
              to={`${base}/history`}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
              }
              onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
            >
              <Clock className="h-5 w-5" />
              <span className="ml-3 md:hidden lg:inline">History</span>
            </NavLink>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center p-2 rounded-lg hover:bg-gray-800 w-full justify-start mt-auto"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 md:hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
