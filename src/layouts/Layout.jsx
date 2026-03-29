import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, MessageSquare } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/proposals', icon: <FileText size={20} />, label: 'Proposals' },
        { path: '/team', icon: <Users size={20} />, label: 'Team Space' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">FP</span>
                        <h2>FeeProX</h2>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">TH</div>
                        <div className="user-info">
                            <span className="user-name">Trong Hien</span>
                            <span className="user-role">Administrator</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-search">
                        <input type="text" placeholder="Search proposals, clients..." />
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-ghost notification-btn">
                            <MessageSquare size={20} />
                            <span className="badge-count">3</span>
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
