import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiPaperAirplane } from 'react-icons/hi';
import { FaCode, FaBook, FaQuestionCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const modes = [
  { id: 'ask', label: 'Doubt Solver', icon: <FaQuestionCircle />, color: '#6366f1', desc: 'Ask any CS question' },
  { id: 'codeHint', label: 'Code Help', icon: <FaCode />, color: '#22c55e', desc: 'Get hints (not solutions)' },
  { id: 'explain', label: 'Explain', icon: <FaBook />, color: '#f59e0b', desc: 'Explain a concept' },
];

const AIAssistant = () => {
  const [mode, setMode] = useState('ask');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      let res;
      if (mode === 'ask') {
        res = await aiAPI.ask({ messages: updated });
      } else if (mode === 'codeHint') {
        res = await aiAPI.codeHint({ code: input, problem: '', language: '', messages: messages });
      } else {
        res = await aiAPI.explain({ topic: input, messages: messages });
      }
      setMessages([...updated, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'AI unavailable';
      toast.error(msg);
      setMessages([...updated, { role: 'assistant', content: `❌ ${msg}` }]);
    }
    setLoading(false);
  };

  const clearChat = () => { setMessages([]); };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
            <HiLightningBolt style={{ color: '#f59e0b' }} /> AI Assistant
          </h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Powered by Groq AI — ask anything!</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            Clear Chat
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setMessages([]); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: mode === m.id ? `${m.color}15` : 'var(--gray-100)',
              color: mode === m.id ? m.color : 'var(--gray-500)',
              border: mode === m.id ? `1.5px solid ${m.color}40` : '1.5px solid transparent',
            }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-[16px] shadow-sm overflow-y-auto p-4 space-y-4" style={{ border: '1px solid var(--gray-200)' }}>
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--gray-700)' }}>{modes.find(m => m.id === mode)?.desc}</h3>
            <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Type your question below to get started</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {mode === 'ask' && ['What is Big O notation?', 'Explain recursion', 'Difference between stack and queue'].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 rounded-full transition-colors hover:shadow-sm"
                  style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>{q}</button>
              ))}
              {mode === 'codeHint' && ['Why is my code giving TLE?', 'How to optimize this loop?', 'Fix my binary search'].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 rounded-full transition-colors hover:shadow-sm"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>{q}</button>
              ))}
              {mode === 'explain' && ['Dynamic Programming', 'Hash Tables', 'Graph BFS vs DFS'].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 rounded-full transition-colors hover:shadow-sm"
                  style={{ background: '#fef3c7', color: '#d97706' }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-[14px] px-4 py-3 text-sm ${msg.role === 'user' ? 'text-white' : ''}`}
              style={{
                background: msg.role === 'user' ? 'var(--gradient-blue)' : 'var(--gray-50)',
                color: msg.role === 'user' ? '#fff' : 'var(--gray-700)',
                border: msg.role === 'assistant' ? '1px solid var(--gray-200)' : 'none',
              }}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&_pre]:bg-gray-800 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-sm [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[14px] px-4 py-3 text-sm" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--gray-400)' }}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Ask ${modes.find(m => m.id === mode)?.label}...`}
          className="input-light flex-1 !py-3" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button onClick={send} disabled={loading || !input.trim()}
          className="btn-primary !py-3 !px-6 disabled:opacity-50" style={{ borderRadius: 12 }}>
          <HiPaperAirplane className="rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
