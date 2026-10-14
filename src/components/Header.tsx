import React, { useState } from 'react';
import { NavTab } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenMatrix: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, onOpenMatrix }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'text', label: 'Text' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="fixed top-0 w-full z-40 bg-[#0e1323]/80 backdrop-blur-2xl border-b border-[#22d3ee]/10 shadow-[0_1px_16px_rgba(34,211,238,0.06)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group focus:outline-none text-left"
        >
          <img
            alt="ASTRA Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6emn03hgKTn-J5gqPeWOI8YUz0z_FZ0H0y0aNU9_4d6WpnRRKTPeP3FrnyU8NRltY0vQ5xwX0KzEFb2pff1O_H8FhS-RKVBdnvTgceETjonst6hC80uAUvG404X8jVu2AcXKcFw9PNvA95iKgDfwrHQvYOMjLDQLzJ-7wWrmGXzdPUwn7b0I7rdjsd-cHuXFPEwyZG3UlYioic8BXDWfzvJAt4kXMLI93YEX-m8rEpw5OMryGLKwoTQ"
          />
          <span className="font-headline-sm text-xl tracking-wider uppercase text-on-surface font-bold">
            ASTRA
          </span>
        </button>

        {/* Desktop Nav Zone */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-lowest/80 p-1 rounded-full border border-surface-container-highest/40">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMatrix}
            className="relative group inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm transition-all duration-200 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:shadow-[0_0_32px_rgba(34,211,238,0.6)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
              <span>New Reconstruction</span>
            </span>
          </button>

          {/* Profile Button with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-primary hover:bg-primary-container transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Researcher Credentials"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface-container/95 backdrop-blur-2xl border border-primary/20 shadow-2xl p-4 z-50 text-left">
                <div className="flex items-center gap-3 pb-3 border-b border-surface-variant/40">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                    ISE
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-on-surface truncate">Telemetry Operator</span>
                    <span className="text-xs text-outline truncate">Dept. of ISE • CIT 2025–26</span>
                  </div>
                </div>
                <div className="pt-3 flex flex-col gap-2 text-xs text-on-surface-variant">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-outline">Node Clearance:</span>
                    <span className="text-primary font-medium">Level 4 Multi-Spectral</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-outline">Active DB:</span>
                    <span className="text-tertiary font-mono">SQLite v3.45 Local</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-outline">Compute Node:</span>
                    <span className="text-secondary font-mono">V100-ASTRA</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-variant/40">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenMatrix();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-primary font-medium text-center transition-colors"
                  >
                    View Reconstruction Matrix
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-variant/40 bg-surface-container-low/95 backdrop-blur-2xl px-4 py-3 flex flex-col gap-1.5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2 rounded-xl text-left text-sm transition-all ${
                activeTab === link.id
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
