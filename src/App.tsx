import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QrCode, LogOut } from 'lucide-react';

import Home from './pages/Home';
import Contact from './pages/Contact';

// Mock auth state
const auth = undefined;
const isAuthenticated = Boolean(auth);

function ScrollToTop() {
  const { pathname } = useLocation();
  // Scroll to top on route change unless it's an anchor link
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#0A0A0B] text-[#EAEAEA] font-sans flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#3B82F6]">
                Tapzy
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/contact" className="text-[#A0A0A0] hover:text-white transition-colors">
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <span className="text-[#EAEAEA]">Bonjour, User</span>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-[#A0A0A0] hover:text-[#3B82F6] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <a
                  href="/#demo"
                  className="px-6 py-2 bg-[#3B82F6] text-white rounded-full hover:bg-[#2563EB] hover:shadow-lg transition-all hover:scale-105 font-medium"
                >
                  Démo
                </a>
              )}
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-[#0A0A0B] py-12 border-t border-[#2A2A2B]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-6 md:mb-0">
                <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#3B82F6]">
                  Tapzy
                </span>
              </div>
              <div className="text-[#A0A0A0] flex gap-8">
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                <span>&copy; 2025 Tapzy. Tous droits réservés.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
