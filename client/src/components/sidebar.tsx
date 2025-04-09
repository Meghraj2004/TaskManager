import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const [location] = useLocation();
  
  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const initials = displayName.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`bg-white shadow-md lg:w-64 lg:fixed lg:h-full lg:overflow-y-auto ${isOpen ? 'fixed inset-0 z-50' : 'hidden lg:block'}`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">TaskFlow</h1>
          <button className="lg:hidden text-gray-500 focus:outline-none" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <div>
              <h3 className="font-medium">{displayName}</h3>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          
          <nav className="mt-4 space-y-2">
            <Link href="/dashboard" onClick={onClose}>
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === '/dashboard' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Tasks</span>
              </a>
            </Link>
            <Link href="/calendar" onClick={onClose}>
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === '/calendar' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
              </a>
            </Link>
            <Link href="/analytics" onClick={onClose}>
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === '/analytics' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Analytics</span>
              </a>
            </Link>
            <Link href="/settings" onClick={onClose}>
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === '/settings' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </a>
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-5 mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-gray-600 hover:text-red-500 transition duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
