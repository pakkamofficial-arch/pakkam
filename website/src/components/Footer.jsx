import React from 'react';
import { Link } from 'react-router-dom';
import appLogo from '../assets/app-logo.png';
import { config } from '../config/env';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={appLogo}
                alt="PAKKAM Logo"
                className="w-8 h-8 object-contain rounded-lg bg-white p-0.5"
              />
              <span className="font-extrabold text-xl text-white tracking-tight">PAKKAM</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Everyday essentials, delivered simply. Built for convenient local shopping and quick delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#why-pakkam" className="hover:text-emerald-400 transition-colors">
                  Why Pakkam
                </a>
              </li>
              <li>
                <a href="/#scan-download" className="hover:text-emerald-400 transition-colors">
                  Scan & Download
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href={config.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Download App
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} Pakkam. All rights reserved.</p>
          <p>Local Grocery & Delivery Application</p>
        </div>
      </div>
    </footer>
  );
};
