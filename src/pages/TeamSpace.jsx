import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Send, Bell } from 'lucide-react';
import './TeamSpace.css';

const MOCK_TEAM = [
    { id: 1, name: 'Alice Wong', role: 'Lead Architect', status: 'online', avatar: 'AW' },
    { id: 2, name: 'Bob Smith', role: 'Project Manager', status: 'online', avatar: 'BS' },
    { id: 3, name: 'Charlie Davis', role: 'Cost Estimator', status: 'away', avatar: 'CD' },
    { id: 4, name: 'Diana King', role: 'Legal Advisor', status: 'online', avatar: 'DK' },
];

const MOCK_MESSAGES = [
    { id: 1, sender: 'Alice Wong', text: 'Hey team, I just uploaded the Aedas Concept Proposal. Can someone review the exclusions?', time: '10:30 AM' },
    { id: 2, sender: 'Bob Smith', text: 'I am taking a look now. Seems they missed the Social Housing scope.', time: '10:35 AM' },
    { id: 3, sender: 'Diana King', text: 'Also note the penalty terms are very strict in this one.', time: '10:40 AM' },
];

const TeamSpace = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MOCK_MESSAGES);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            sender: 'You',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessage('');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="team-space-page">
           <header className="page-header">
                <div>
                    <h1 className="text-h1">Team Space</h1>
                    <p className="text-muted">Collaborate with your team in real-time.</p>
                </div>
                <button className="btn btn-ghost"><Bell size={20} /> Notifications</button>
            </header>

            <div className="team-space-content">
                <div className="chat-section card">
                    <div className="chat-header">
                        <h2 className="text-h2"><MessageSquare size={20} className="inline-icon"/> Project Discussions</h2>
                    </div>
                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                                <div className="message-sender">{msg.sender} <span className="message-time">{msg.time}</span></div>
                                <div className="message-bubble">{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="btn btn-primary" onClick={handleSend}><Send size={18} /></button>
                    </div>
                </div>

                <div className="members-section card">
                    <h2 className="text-h2 mb-4"><Users size={20} className="inline-icon"/> Online Team (4)</h2>
                    <div className="members-list">
                        {MOCK_TEAM.map(member => (
                            <div key={member.id} className="member-item">
                                <div className={`avatar ${member.status}`}>{member.avatar}</div>
                                <div className="member-info">
                                    <div className="member-name">{member.name}</div>
                                    <div className="member-role text-muted">{member.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TeamSpace;
