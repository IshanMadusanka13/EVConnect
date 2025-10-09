// src/components/Navbar.jsx
import React, { useContext, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Zap } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const Navbar = () => {
  const { darkMode, toggleTheme, getColor } = useContext(ThemeContext);

  const navRef = useRef(null);

  useEffect(() => {
    const setNavHeight = () => {
      const height = navRef.current ? navRef.current.clientHeight : 0;
      // set a CSS variable so other components can reference the navbar height
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      // also set body padding so fixed navbar doesn't overlap page content
      try {
        document.body.style.paddingTop = `${height}px`;
      } catch (e) {
        // ignore in environments where body is not writable
      }
    };

    setNavHeight();
    window.addEventListener('resize', setNavHeight);
    return () => {
      window.removeEventListener('resize', setNavHeight);
      // cleanup
      try {
        document.body.style.paddingTop = '';
        document.documentElement.style.removeProperty('--navbar-height');
      } catch (e) {}
    };
  }, []);

  return (
    <>
      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-40 ${getColor('background.elevated')} backdrop-blur-xl border-b ${getColor('border.primary')}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${getColor('text.primary')}`}>
                  EV Charge<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Hub</span>
                </h1>
                <p className={`text-xs ${getColor('text.secondary')}`}>Booking Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors relative`}>
                <Bell className={`w-5 h-5 ${getColor('text.secondary')}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getColor('gradient.bluePurple')} flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform`}>
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for older/layouts that rely on document flow. The CSS var --navbar-height will be the authoritative value. */}
      <div aria-hidden="true" style={{ height: 'var(--navbar-height, 80px)' }} />
    </>
  );
};

export default Navbar;