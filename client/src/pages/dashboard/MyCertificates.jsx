import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiDocumentText, HiDownload } from 'react-icons/hi';
import { FaAward } from 'react-icons/fa';
import { certificateAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const MyCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    certificateAPI.getAll().then(({ data }) => { setCerts(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const download = async (enrollmentId, title) => {
    setDownloading(enrollmentId);
    try {
      const { data } = await certificateAPI.generate(enrollmentId);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `VES-Certificate-${title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch { toast.error('Download failed'); }
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📜 My Certificates</h1>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Download your course completion certificates</p>
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-[16px]" />)}</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <FaAward className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No certificates yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-400)' }}>Complete a course to earn your first certificate!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((cert, i) => (
            <motion.div key={cert._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
              className="bg-white rounded-[16px] overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: '1px solid var(--gray-200)' }}>
              {/* Certificate top gradient */}
              <div className="h-3" style={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b)' }} />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', color: '#6366f1' }}>
                    <FaAward className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--gray-900)' }}>{cert.courseTitle}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                      {cert.instructor || 'VedhaEduSpark'} • {cert.level || 'General'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--gray-100)' }}>
                  <div>
                    <div className="text-[0.6rem] uppercase font-semibold tracking-wider" style={{ color: 'var(--gray-400)' }}>Completed</div>
                    <div className="text-xs font-medium" style={{ color: 'var(--gray-600)' }}>
                      {new Date(cert.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {cert.certificateId && (
                    <div className="text-right">
                      <div className="text-[0.6rem] uppercase font-semibold tracking-wider" style={{ color: 'var(--gray-400)' }}>ID</div>
                      <div className="text-xs font-mono font-semibold" style={{ color: 'var(--blue-600)' }}>{cert.certificateId}</div>
                    </div>
                  )}
                </div>

                <button onClick={() => download(cert._id, cert.courseTitle)} disabled={downloading === cert._id}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'var(--gradient-blue)', color: '#fff' }}>
                  {downloading === cert._id ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><HiDownload /> Download Certificate</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
