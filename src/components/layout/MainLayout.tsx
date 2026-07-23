import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardList,
  Scale,
  FileText,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCircle,
  BarChart3
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // 1. Invalidate on backend
    await authService.logout();
    // 2. Clear local context and storage
    logout();
    // 3. Redirect to login
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER'] },
    { name: 'Cases', path: '/cases', icon: FolderOpen, roles: ['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER', 'POLICE_OFFICER'] },
    { name: 'Postmortems', path: '/postmortems', icon: ClipboardList, roles: ['ADMIN', 'JMO', 'MEDICAL_OFFICER'] },
    { name: 'Evidence', path: '/evidence', icon: Scale, roles: ['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER'] },
    { name: 'Staff Management', path: '/staff', icon: ShieldCheck, roles: ['ADMIN'] },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  // Filter routes based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white w-64 border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900 tracking-tight">ForenSys</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center space-x-4">
            <NavLink to="/profile" className="text-sm text-gray-700 font-medium hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
              <span className="hidden sm:inline">Logged in as: </span>
              <span className="text-gray-900 font-bold">{user?.email || 'Unknown User'}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                {user?.role || 'No Role'}
              </span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Nested Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
