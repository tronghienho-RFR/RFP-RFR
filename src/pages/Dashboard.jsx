import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <header className="mb-6" style={{ marginBottom: '1.5rem' }}>
                <h1 className="text-h1">Dashboard</h1>
                <p className="text-muted">Welcome back, Trong Hien. Here's an overview of your team's fee proposals.</p>
            </header>

            <div className="grid-overview" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Stats Cards */}
                <div className="card p-6" style={{ padding: '1.5rem' }}>
                    <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>Total Proposals</h3>
                    <div className="text-h1" style={{ color: 'var(--color-primary)' }}>12</div>
                    <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>+2 this week</p>
                </div>

                <div className="card p-6" style={{ padding: '1.5rem' }}>
                    <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>Pending Review</h3>
                    <div className="text-h1" style={{ color: 'var(--color-warning)' }}>3</div>
                    <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Requires your attention</p>
                </div>

                <div className="card p-6" style={{ padding: '1.5rem' }}>
                    <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>AI Insights</h3>
                    <div className="text-h1" style={{ color: 'var(--color-success)' }}>24</div>
                    <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Risks flagged & identified</p>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                <h2 className="text-h2" style={{ marginBottom: '1rem' }}>Recent Activity</h2>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No recent activity to show.
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
