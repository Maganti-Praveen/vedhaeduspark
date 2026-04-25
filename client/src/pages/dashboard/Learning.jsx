import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subjectAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const Learning = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subjectAPI.getAll().then(({ data }) => { setSubjects(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-48"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  if (selectedSubject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedSubject(null)} className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100" style={{ color: 'var(--gray-500)' }}>← Back</button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
              <span>{selectedSubject.icon}</span>{selectedSubject.name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{selectedSubject.description}</p>
          </div>
        </div>

        <div className="flex gap-2" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          {['notes', 'videos', 'roadmap'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 rounded-t-lg text-sm font-medium capitalize transition-all"
              style={{
                color: activeTab === tab ? 'var(--blue-700)' : 'var(--gray-500)',
                background: activeTab === tab ? 'var(--blue-50)' : 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--blue-600)' : '2px solid transparent',
              }}>{tab}</button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {selectedSubject.notes?.length > 0 ? selectedSubject.notes.map((note, i) => (
                <div key={i} className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--blue-700)' }}>{note.title}</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--gray-700)' }}>
                    {note.content}
                  </div>
                </div>
              )) : <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No notes available yet.</div>}
            </div>
          )}
          {activeTab === 'videos' && (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedSubject.videos?.length > 0 ? selectedSubject.videos.map((video, i) => (
                <div key={i} className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                  <div className="aspect-video">
                    <iframe src={video.youtubeUrl} title={video.title} className="w-full h-full" allowFullScreen />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--gray-800)' }}>{video.title}</h3>
                  </div>
                </div>
              )) : <div className="col-span-2 text-center py-12" style={{ color: 'var(--gray-400)' }}>No videos available yet.</div>}
            </div>
          )}
          {activeTab === 'roadmap' && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'var(--gray-200)' }} />
              <div className="space-y-6">
                {selectedSubject.roadmap?.length > 0 ? selectedSubject.roadmap.map((step, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible" className="relative pl-14">
                    <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs z-10 ${
                      step.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>{step.completed ? '✓' : step.step}</div>
                    <div className="bg-white rounded-[16px] p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                      <h3 className="font-bold mb-1" style={{ color: 'var(--gray-900)' }}>{step.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{step.description}</p>
                    </div>
                  </motion.div>
                )) : <div className="text-center py-12 pl-14" style={{ color: 'var(--gray-400)' }}>Roadmap coming soon.</div>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>Learning Hub</h1>
        <p style={{ color: 'var(--gray-500)' }}>Choose a subject to start learning</p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((subject, i) => (
          <motion.div key={subject._id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
            onClick={() => { setSelectedSubject(subject); setActiveTab('notes'); }}
            className="bg-white p-6 rounded-[16px] cursor-pointer text-center shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-lg group"
            style={{ border: '1px solid var(--gray-200)' }}>
            <div className="text-4xl mb-3">{subject.icon}</div>
            <h3 className="font-bold text-lg mb-1 transition-colors group-hover:text-blue-600" style={{ color: 'var(--gray-900)' }}>{subject.name}</h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{subject.description}</p>
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--gray-400)' }}>
              <span>{subject.notes?.length || 0} notes</span>
              <span>{subject.videos?.length || 0} videos</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Learning;
