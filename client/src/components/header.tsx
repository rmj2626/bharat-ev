import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                EV Database India
              </Link>
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/estimator" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Range Estimator
            </Link>
            <Link href="/compare" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Compare
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg pt-2 pb-3">
          <div className="px-2 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
              Home
            </Link>
            <Link href="/estimator" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50">
              Range Estimator
            </Link>
            <Link href="/compare" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50">
              Compare
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
