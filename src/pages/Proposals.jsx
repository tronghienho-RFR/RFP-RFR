import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Proposals.css'; // Add this line!

const MOCK_PROPOSALS = [
    { id: '1', name: 'RFR_FeeProposal_ThienHuong_V1.pdf', client: 'Thien Huong', date: '2025-02-26', status: 'baseline', type: 'Baseline' },
    { id: '2', name: 'Aedas_Concept_Proposal_2025.pdf', client: 'Aedas', date: '2025-03-01', status: 'needs-review', type: 'New Proposal', risks: 4 },
    { id: '3', name: 'WATG_Landscape_Fee_Draft.pdf', client: 'WATG', date: '2025-03-02', status: 'reviewed', type: 'New Proposal', risks: 1 },
];

const Proposals = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const processFileInput = (file) => {
        if(!file) return;
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setIsModalOpen(false);
            navigate('/proposals/compare/2'); // Navigate to a mock comparison view
        }, 1500);
    };

    const handleFileChange = (e) => {
        processFileInput(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        processFileInput(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleProposalClick = (id) => {
        navigate(`/proposals/compare/${id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="proposals-page"
        >
            <header className="page-header">
                <div>
                    <h1 className="text-h1">Proposals Management</h1>
                    <p className="text-muted">Upload, manage, and compare fee proposals.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    New Proposal
                </button>
            </header>

            {isModalOpen && (
                <div className="upload-modal-backdrop">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="upload-modal card"
                    >
                        <h2 className="text-h2 mb-4">Upload Proposal</h2>
                        <div
                            className="dropzone"
                            onClick={handleUploadClick}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                                accept=".pdf,.docx"
                            />
                            <Upload size={48} className="text-muted mb-4" />
                            <h3 className="text-h3">Click or drag & drop to upload</h3>
                            <p className="text-muted">Support PDF, DOCX (Max 20MB)</p>

                            {isUploading && (
                                <div className="uploading-state mt-4">
                                    <div className="spinner"></div>
                                    <p>AI is analyzing the document...</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions mt-6">
                            <button
                                className="btn btn-ghost"
                                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); setIsUploading(false); }}
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="proposals-content">
                <div className="card proposals-list-card">
                    <div className="list-header">
                        <div className="search-bar">
                            <Search size={18} className="text-muted" />
                            <input 
                                type="text" 
                                placeholder="Search proposals by name or client..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-ghost"><Filter size={18} /> Filter</button>
                    </div>

                    <div className="proposals-list">
                        {MOCK_PROPOSALS.filter(p => 
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.client.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(proposal => (
                            <div
                                key={proposal.id}
                                className="proposal-item"
                                onClick={() => handleProposalClick(proposal.id)}
                            >
                                <div className="proposal-icon">
                                    <FileText size={24} className={proposal.status === 'baseline' ? 'text-primary' : 'text-muted'} />
                                </div>
                                <div className="proposal-info">
                                    <h4 className="proposal-name">{proposal.name}</h4>
                                    <div className="proposal-meta">
                                        <span className="client">{proposal.client}</span>
                                        <span className="dot">•</span>
                                        <span className="date">{proposal.date}</span>
                                    </div>
                                </div>
                                <div className="proposal-status">
                                    {proposal.status === 'baseline' && <span className="badge badge-success">Baseline</span>}
                                    {proposal.status === 'needs-review' && (
                                        <span className="badge badge-warning">
                                            <AlertCircle size={14} className="mr-1" />
                                            {proposal.risks} Risks Found
                                        </span>
                                    )}
                                    {proposal.status === 'reviewed' && (
                                        <span className="badge badge-success">
                                            <CheckCircle2 size={14} className="mr-1" />
                                            Reviewed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Proposals;
