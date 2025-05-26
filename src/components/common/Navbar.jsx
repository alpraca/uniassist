import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Universities', href: '/universities' },
  { name: 'Mentors', href: '/mentors' },
  { name: 'Roommates', href: '/roommates' },
  { name: 'Academic Profile', href: '/academic-profile' },
  { name: 'Opportunities', href: '/opportunities' },
  { name: 'Network', href: '/network' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn } = useClerk();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">UniAssist</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <SignedOut>
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#universities" className="text-gray-600 hover:text-primary transition-colors">Universities</a>
              <a href="#mentorship" className="text-gray-600 hover:text-primary transition-colors">Mentorship</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/universities" className="text-gray-600 hover:text-primary transition-colors">Universities</Link>
              <Link to="/mentors" className="text-gray-600 hover:text-primary transition-colors">Mentors</Link>
              <Link to="/roommates" className="text-gray-600 hover:text-primary transition-colors">Roommates</Link>
            </SignedIn>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedIn>
              {/* This content will only be shown to signed-in users */}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              {/* This content will only be shown to signed-out users */}
              <button
                onClick={() => openSignIn()} 
                className="btn btn-outline"
              >
                Log In
              </button>
              <button 
                onClick={() => openSignIn({ initialView: 'sign_up' })} 
                className="btn btn-primary"
              >
                Sign Up
              </button>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <SignedOut>
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
                <a href="#universities" className="text-gray-600 hover:text-primary transition-colors">Universities</a>
                <a href="#mentorship" className="text-gray-600 hover:text-primary transition-colors">Mentorship</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/universities" className="text-gray-600 hover:text-primary transition-colors">Universities</Link>
                <Link to="/mentors" className="text-gray-600 hover:text-primary transition-colors">Mentors</Link>
                <Link to="/roommates" className="text-gray-600 hover:text-primary transition-colors">Roommates</Link>
              </SignedIn>
              <div className="pt-4 flex flex-col space-y-3">
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Your Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
                <SignedOut>
                  <button
                    onClick={() => openSignIn()} 
                    className="btn btn-outline w-full"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => openSignIn({ initialView: 'sign_up' })} 
                    className="btn btn-primary w-full"
                  >
                    Sign Up
                  </button>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 