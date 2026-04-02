import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / brand */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            BugTracker
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/report" className="hover:text-indigo-200 transition-colors">
              Report Bug
            </Link>
            <Link to="/search" className="hover:text-indigo-200 transition-colors">
              Search
            </Link>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            {userProfile && (
              <span className="hidden sm:block text-sm text-indigo-200">
                {userProfile.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-indigo-800 hover:bg-indigo-900 text-white text-sm px-3 py-1.5 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav links */}
        <div className="sm:hidden flex gap-4 pb-3 text-sm font-medium">
          <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
            Dashboard
          </Link>
          <Link to="/report" className="hover:text-indigo-200 transition-colors">
            Report Bug
          </Link>
          <Link to="/search" className="hover:text-indigo-200 transition-colors">
            Search
          </Link>
        </div>
      </div>
    </nav>
  )
}
