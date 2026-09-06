import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smartphone, Menu, X } from 'lucide-react';
import appLogo from '../assets/app-logo.png';
import { config } from '../config/env';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={appLogo}
              alt="PAKKAM Logo"
              className="w-9 h-9 object-contain rounded-lg border border-slate-200"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                PAKKAM
              </span>
              <span className="text-[10px] font-medium tracking-wider text-emerald-600 uppercase mt-0.5">
                Everyday Essentials
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-emerald-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('why-pakkam')}
              className="hover:text-emerald-600 transition-colors"
            >
              Why Pakkam
            </button>
            <button
              onClick={() => scrollToSection('scan-download')}
              className="hover:text-emerald-600 transition-colors"
            >
              Scan & Download
            </button>
            <Link to="/about" className="hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Download App CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href={config.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Smartphone size={16} />
              <span>Download App</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-emerald-600 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-800">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-1 hover:text-emerald-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('why-pakkam')}
              className="text-left py-1 hover:text-emerald-600"
            >
              Why Pakkam
            </button>
            <button
              onClick={() => scrollToSection('scan-download')}
              className="text-left py-1 hover:text-emerald-600"
            >
              Scan & Download
            </button>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Contact
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <a
              href={config.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <Smartphone size={16} />
              <span>Download App</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
