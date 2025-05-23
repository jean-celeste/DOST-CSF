import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Home, MessageSquare, BarChart3, Settings, Star, Users, ChevronLeft, ChevronRight, FileChartColumn } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Responses', href: '/admin/responses', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileChartColumn },
  // { name: 'Ratings', href: '/admin/ratings', icon: Star },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ collapsed: initialCollapsed = false, onCollapse }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const handleCollapse = () => {
    setCollapsed((prev) => !prev);
    if (onCollapse) onCollapse(!collapsed);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg transition-all duration-300 flex flex-col h-full ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Sidebar"
    >
      {/* Logo/Branding */}
      <div className={`flex items-center gap-3 p-4 border-b transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
        <img src="/DOST_Logo.png" alt="Logo" className={`transition-all duration-300 ${collapsed ? 'h-8 w-8' : 'h-10 w-10'}`} />
        {!collapsed && <span className="text-xl font-bold text-gray-800">Admin Panel</span>}
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200">
                  {item.name}
                </span>
              )}
              {/* Divider after certain items */}
              {[1, 4].includes(idx) && (
                <div className="my-2 border-t border-gray-200" />
              )}
            </div>
          );
        })}
      </nav>
      {/* Collapse/Expand Button */}
      <button
        onClick={handleCollapse}
        className={`absolute -right-3 top-24 z-40 bg-white border border-gray-200 rounded-full shadow p-1 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        tabIndex={0}
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
      {/* Logout Button */}
      <div className={`p-4 border-t mt-auto transition-all duration-300 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
      {/* Responsive overlay for mobile (optional, can be added later) */}
    </aside>
  );
} 