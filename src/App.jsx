import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Comparison from './pages/Comparison';

import TeamSpace from './pages/TeamSpace';

// Placeholders for other routes
const Settings = () => <div><h1 className="text-h1">Settings</h1><p>Coming soon...</p></div>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="proposals" element={<Proposals />} />
                    <Route path="proposals/compare/:id" element={<Comparison />} />
                    <Route path="team" element={<TeamSpace />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
