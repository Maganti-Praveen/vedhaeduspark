import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUser, FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }) };

const typeColors = {
  Webinar: { bg: '#dbeafe', color: '#2563eb' }, Workshop: { bg: '#dcfce7', color: '#16a34a' },
  Hackathon: { bg: '#fef3c7', color: '#d97706' }, Seminar: { bg: '#ede9fe', color: '#7c3aed' },
  Meetup: { bg: '#fce7f3', color: '#db2777' }, Other: { bg: '#f1f5f9', color: '#475569' },
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    eventAPI.getAll().then(({ data }) => { setEvents(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now);
  const past = events.filter(e => new Date(e.date) < now);
  const shown = tab === 'upcoming' ? upcoming : past;

  const handleRegister = async (id) => {
    try { await eventAPI.register(id); toast.success('Registered! 🎉'); eventAPI.getAll().then(({ data }) => setEvents(data)); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const isRegistered = (e) => e.registeredUsers?.includes(user?._id);

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>🎯 Events & Webinars</h1>
        <p style={{ color: 'var(--gray-500)' }}>Join live sessions and workshops</p>
      </motion.div>

      <div className="flex gap-2">
        {['upcoming', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--blue-600)' : 'var(--gray-100)', color: tab === t ? '#fff' : 'var(--gray-500)' }}>
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-[16px]" />)}</div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-5xl mb-3">📅</div>
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No {tab} events</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {shown.map((e, i) => {
            const tc = typeColors[e.type] || typeColors.Other;
            const isPast = new Date(e.date) < now;
            const reg = isRegistered(e);
            return (
              <motion.div key={e._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                className="bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all" style={{ border: '1px solid var(--gray-200)' }}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${tc.color}, ${tc.color}88)` }} />
                {e.image && <img src={e.image} className="w-full h-36 object-cover" alt={e.title} />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: tc.bg, color: tc.color }}>{e.type}</span>
                    {isPast && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Ended</span>}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--gray-900)' }}>{e.title}</h3>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--gray-500)' }}>{e.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs mb-4" style={{ color: 'var(--gray-400)' }}>
                    <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><FaClock /> {e.time} • {e.duration}</span>
                    {e.speaker && <span className="flex items-center gap-1"><FaUser /> {e.speaker}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPast && (
                      reg ? (
                        <span className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1" style={{ background: '#dcfce7', color: '#16a34a' }}>
                          <FaCheckCircle /> Registered
                        </span>
                      ) : (
                        <button onClick={() => handleRegister(e._id)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'var(--gradient-blue)' }}>
                          Register Now
                        </button>
                      )
                    )}
                    {e.link && (
                      <a href={e.link} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                        style={{ border: '1px solid var(--gray-200)', color: 'var(--blue-600)' }}>
                        <FaExternalLinkAlt /> Join
                      </a>
                    )}
                  </div>
                  <div className="mt-3 text-[0.6rem]" style={{ color: 'var(--gray-300)' }}>{e.registeredUsers?.length || 0} registered</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
