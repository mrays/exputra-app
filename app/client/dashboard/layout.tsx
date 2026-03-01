'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Globe, Server, FileText, User, LogOut, Menu, X, Home, Wrench } from 'lucide-react';

const menuItems = [
    { href: '/client/dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { href: '/client/dashboard/packages', label: 'My Package', iconName: 'package' },
    { href: '/client/dashboard/domains', label: 'My Domains', iconName: 'globe' },
    { href: '/client/dashboard/servers', label: 'My Servers', iconName: 'server' },
    { href: '/client/dashboard/services', label: 'My Services', iconName: 'wrench' },
    { href: '/client/dashboard/invoices', label: 'My Invoices', iconName: 'filetext' },
    { href: '/client/dashboard/profile', label: 'My Profile', iconName: 'user' },
];

const IconComponent = ({ name, className }: { name: string; className: string }) => {
    switch (name) {
        case 'dashboard':
            return <LayoutDashboard className={className} />;
        case 'package':
            return <Package className={className} />;
        case 'globe':
            return <Globe className={className} />;
        case 'server':
            return <Server className={className} />;
        case 'wrench':
            return <Wrench className={className} />;
        case 'filetext':
            return <FileText className={className} />;
        case 'user':
            return <User className={className} />;
        default:
            return null;
    }
};

export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [clientName, setClientName] = useState('');

    useEffect(() => {
        // Basic check for session/name from cookies or session storage if needed
        // For now, we'll try to get it from our profile API or just wait for children to load
        fetch('/api/client/profile')
            .then(res => res.json())
            .then(data => {
                if (data.name) setClientName(data.name);
            })
            .catch(() => { });
    }, []);

    const handleLogout = async () => {
        await fetch('/api/client/logout', { method: 'POST' });
        router.push('/client/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop & Mobile */}
            <aside className={`fixed inset-y-0 left-0 bg-gradient-to-b from-blue-600 to-blue-700 w-64 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:block shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo/Brand Section */}
                    <div className="p-6 border-b border-blue-500 border-opacity-20">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-500 bg-opacity-30 rounded-lg">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Client Area</h2>
                                <p className="text-xs text-blue-100 uppercase tracking-widest font-semibold">Website Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-white bg-opacity-20 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <IconComponent
                                        name={item.iconName}
                                        className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'}`}
                                    />
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Info */}
                    <div className="p-4 border-t border-blue-500 border-opacity-20 space-y-3">
                        <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                                    {clientName ? clientName[0].toUpperCase() : 'C'}
                                </div>
                                <div className="overflow-hidden flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{clientName || 'Client'}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"></span>
                                        <p className="text-xs text-green-200 font-semibold">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-blue-100 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-md"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar - Mobile Only */}
                <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white lg:hidden px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
                    <div className="flex items-center gap-3">
                        <Home className="w-5 h-5" />
                        <h2 className="font-bold">Client Dashboard</h2>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
