import React, { useState } from 'react';
import { Send, Bot, User, Command, ChevronDown } from 'lucide-react';
import './ChatWidget.css';

const MOCK_MESSAGES = [
    { id: 1, sender: 'ai', text: 'Hi! I am analyzing the Aedas Concept Proposal. I noticed 4 discrepancies compared to our RFR Baseline. How can I help?' },
    { id: 2, sender: 'user', text: 'Why is the Advance payment highlighted in red?' },
    { id: 3, sender: 'ai', text: 'The baseline allows a 20% advance payment. Aedas is requesting 30%. This increases our initial financial risk.' }
];

const ChatWidget = () => {
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        // Add user message
        const newUserMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages([...messages, newUserMsg]);
        setInput('');

        // Fake AI response
        setTimeout(() => {
            const isTraining = newUserMsg.text.toLowerCase().includes('rule') || newUserMsg.text.toLowerCase().includes('remember');
            const aiResponse = isTraining
                ? "Got it! I will update the baseline rules to include this new condition for future proposals."
                : "I am currently a prototype, but in the final version I will use the baseline parameters to answer your specific query about this proposal.";

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponse }]);
        }, 1000);
    };

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="chat-title">
                    <div className="status-dot"></div>
                    <h3>AI Assistant & Team Chat</h3>
                </div>
                <button className="btn btn-ghost"><ChevronDown size={20} /></button>
            </div>

            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                        <div className={`message-avatar ${msg.sender}`}>
                            {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                        </div>
                        <div className={`message-bubble ${msg.sender}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input-area">
                <div className="suggestion-chips">
                    <button className="chip" onClick={() => setInput('Explain the penalty risks')}>Explain risks</button>
                    <button className="chip" onClick={() => setInput('/rule Add site visits to exclusions baseline')}>+ Add Rule</button>
                </div>
                <div className="input-wrapper">
                    <button className="btn-icon"><Command size={18} /></button>
                    <input
                        type="text"
                        placeholder="Ask AI or chat with team..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn-send" onClick={handleSend} disabled={!input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
