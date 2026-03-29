import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Info, FileText, List, Edit2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './Comparison.css';
import ChatWidget from '../components/ChatWidget';

const MOCK_COMPARISON_DATA = {
    baseline: {
        name: 'RFR Fee Proposal',
        scope: 'Concept & Basic Design for High/Low rise, Commercial, Social Housing',
        exclusions: 'Architecture\nLandscape\nInfrastructure design\nPCCC appraisal fee\nSite visit fees',
        timeline: '12 weeks (Excluding holidays, weekends, approval time)',
        payment: '20% Adv / 20% Concept / 60% Basic',
        penalties: 'Can suspend work if payment delayed > 30 days. No penalty for consultant delay mentioned.'
    },
    newProposal: {
        name: 'Aedas Concept Proposal',
        scope: 'Concept & Basic Design for High/Low rise, Commercial ONLY (Missing Social Housing)',
        exclusions: ['Architecture', 'Landscape', 'Infrastructure design'],
        timeline: '14 weeks',
        payment: '30% Adv / 30% Concept / 40% Basic',
        penalties: 'Can suspend work if delayed > 15 days. \nSite visits billed at 120M VND/trip.'
    }
};

const TOC_ITEMS = [
    { id: 'scope', title: '1. Scope of Work', ref: 'Page 2, Section 1.1' },
    { id: 'exclusions', title: '2. Exclusions', ref: 'Page 3, Section 1.4' },
    { id: 'timeline', title: '3. Timeline & Schedule', ref: 'Page 5, Section 3.0' },
    { id: 'payment', title: '4. Payment Terms', ref: 'Page 6, Section 4.2' },
    { id: 'penalties', title: '5. Penalties & Variations', ref: 'Page 8, Section 5.1' }
];

const Comparison = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const { newProposal } = MOCK_COMPARISON_DATA;
    const [editedBaseline, setEditedBaseline] = useState(MOCK_COMPARISON_DATA.baseline);
    const [isEditing, setIsEditing] = useState(false);

    const handleEditChange = (field, value) => {
        setEditedBaseline(prev => ({ ...prev, [field]: value }));
    };

    const scrollToSection = (sectionId) => {
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-section');
            setTimeout(() => el.classList.remove('highlight-section'), 2000);
        }
    };

    return (
        <div className="comparison-container with-index">
            <div className="comparison-index-sidebar">
                <h3 className="text-h3 border-b pb-4 mb-4 flex items-center gap-2"><List size={20}/> Index</h3>
                <div className="toc-list">
                    {TOC_ITEMS.map(item => (
                        <button key={item.id} className="toc-item" onClick={() => scrollToSection(item.id)}>
                            <div className="toc-title">{item.title}</div>
                            <div className="toc-ref text-muted"><FileText size={12} className="inline-icon"/> {item.ref}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="comparison-main">
                <header className="comparison-header">
                    <button className="btn btn-ghost" onClick={() => navigate('/proposals')}>
                        <ArrowLeft size={20} /> Back to Proposals
                    </button>
                    <div className="header-titles mt-4">
                        <h1 className="text-h1">Proposal Analysis</h1>
                        <p className="text-muted">Comparing {newProposal.name} vs {editedBaseline.name}</p>
                    </div>
                    <div className="analysis-summary mt-4">
                        <div className="summary-badge warning">
                            <AlertTriangle size={16} /> 4 Missing Requirements
                        </div>
                        <div className="summary-badge danger">
                            <AlertTriangle size={16} /> 2 High Risk Terms
                        </div>
                    </div>
                </header>

                <div className="comparison-content">
                    <div className="docs-header grid-2">
                        <div className="doc-col baseline-col flex items-center" style={{justifyContent: 'space-between', width: '100%'}}>
                            <div className="doc-label border-success">
                                <FileText size={18} /> Baseline (Prototype)
                            </div>
                            <button className={`btn btn-small ${isEditing ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? <Save size={16} /> : <Edit2 size={16} />} 
                                {isEditing ? 'Save Baseline' : 'Edit Baseline'}
                            </button>
                        </div>
                        <div className="doc-col new-col">
                            <div className="doc-label border-primary">
                                <FileText size={18} /> New Proposal ({newProposal.name})
                            </div>
                        </div>
                    </div>

                    <div className="comparison-grid">
                        {/* Section 1: Scope */}
                        <div id="section-scope" className="comp-row-header">1. Scope of Work</div>
                        <div className="comp-row grid-2">
                            <div className="comp-cell">
                                {isEditing ? (
                                    <textarea className="edit-textarea" value={editedBaseline.scope} onChange={(e) => handleEditChange('scope', e.target.value)} />
                                ) : (
                                    editedBaseline.scope
                                )}
                            </div>
                            <div className="comp-cell warning-bg">
                                {newProposal.scope}
                                <div className="flagged-note warning-text">
                                    <AlertTriangle size={14} /> Missing Social Housing scope found in baseline.
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Exclusions */}
                        <div id="section-exclusions" className="comp-row-header">2. Exclusions</div>
                        <div className="comp-row grid-2">
                            <div className="comp-cell">
                                {isEditing ? (
                                    <textarea className="edit-textarea" value={editedBaseline.exclusions} onChange={(e) => handleEditChange('exclusions', e.target.value)} rows={5} />
                                ) : (
                                    <ul className="whitespace-pre-wrap">{editedBaseline.exclusions.split('\n').map(ex => <li key={ex}>{ex}</li>)}</ul>
                                )}
                            </div>
                            <div className="comp-cell">
                                <ul>{newProposal.exclusions.map(ex => <li key={ex}>{ex}</li>)}</ul>
                                <div className="flagged-note info-text">
                                    <Info size={14} /> Fails to exclude PCCC and Site visit fees. May be included in base price. Clarify!
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Timeline */}
                        <div id="section-timeline" className="comp-row-header">3. Timeline & Schedule</div>
                        <div className="comp-row grid-2">
                            <div className="comp-cell">
                                {isEditing ? (
                                    <textarea className="edit-textarea" value={editedBaseline.timeline} onChange={(e) => handleEditChange('timeline', e.target.value)} />
                                ) : editedBaseline.timeline}
                            </div>
                            <div className="comp-cell warning-bg">
                                {newProposal.timeline}
                                <div className="flagged-note warning-text">
                                    <AlertTriangle size={14} /> 2 weeks longer than baseline.
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Payment */}
                        <div id="section-payment" className="comp-row-header">4. Payment Terms</div>
                        <div className="comp-row grid-2">
                            <div className="comp-cell">
                                {isEditing ? (
                                    <textarea className="edit-textarea" value={editedBaseline.payment} onChange={(e) => handleEditChange('payment', e.target.value)} />
                                ) : editedBaseline.payment}
                            </div>
                            <div className="comp-cell danger-bg">
                                {newProposal.payment}
                                <div className="flagged-note danger-text">
                                    <AlertTriangle size={14} /> High advance (30%) compared to baseline (20%).
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Penalties */}
                        <div id="section-penalties" className="comp-row-header">5. Penalties & Variations</div>
                        <div className="comp-row grid-2">
                            <div className="comp-cell">
                                {isEditing ? (
                                    <textarea className="edit-textarea" value={editedBaseline.penalties} onChange={(e) => handleEditChange('penalties', e.target.value)} />
                                ) : editedBaseline.penalties}
                            </div>
                            <div className="comp-cell danger-bg">
                                <div className="whitespace-pre-wrap">{newProposal.penalties}</div>
                                <div className="flagged-note danger-text">
                                    <AlertTriangle size={14} /> Strict suspension terms (15 days vs 30 days). High site visit fee (120M vs 90M).
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="comparison-sidebar">
                <ChatWidget />
            </div>
        </div>
    );
};

export default Comparison;
