"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings,
  LogOut,
  Home,
  MessageSquare
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  // If on the login page, render children directly (no sidebar, no session provider)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <SessionProvider>
      <Toaster
        position="top-right"
        duration={5000}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'w-80 min-h-[40px] p-4 shadow-lg rounded-lg bg-green-100 text-green-900 flex items-center gap-2',
            title: 'text-base font-semibold text-green-900',
            description: 'text-sm text-green-800',
          },
        }}
      />
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}

function AdminLayoutContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const [headerTitle, setHeaderTitle] = useState('Admin');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/admin/login');
    } else if (status === "authenticated") {
      setIsAuthenticated(true);
    }
  }, [status, router]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch the header title from the API
    async function fetchHeaderTitle() {
      try {
        const res = await fetch('/api/admin/identity');
        if (res.ok) {
          const data = await res.json();
          setHeaderTitle(data.name ? `${data.name} Admin` : 'Admin');
        } else {
          setHeaderTitle('Admin');
        }
      } catch {
        setHeaderTitle('Admin');
      }
    }
    fetchHeaderTitle();
  }, [status]);

  if (status === "loading") return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  // Get division_name from session
  const divisionName = session?.user?.division_name;
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Responses', href: '/admin/responses', icon: MessageSquare },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Determine header title based on route
  const getHeaderTitle = () => {
    if (pathname === '/admin') return 'Admin Dashboard';
    if (pathname.startsWith('/admin/responses')) return 'Responses';
    if (pathname.startsWith('/admin/analytics')) return 'Analytics';
    if (pathname.startsWith('/admin/ratings')) return 'Ratings';
    if (pathname.startsWith('/admin/clients')) return 'Clients';
    if (pathname.startsWith('/admin/settings')) return 'Settings';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      {/* Main Content */}
      <div className={`transition-all duration-300 flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-0 flex flex-col bg-gray-50 min-h-screen`}>
        {/* Header */}
        <AdminHeader headerTitle={headerTitle} />
        <main className="flex-1 p-4 md:p-8 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
} 