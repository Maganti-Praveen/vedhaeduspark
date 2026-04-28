import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronDown, HiChevronRight, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { FaVideo, FaFilePdf, FaStickyNote, FaCheck, FaStar } from 'react-icons/fa';
import { courseAPI, enrollmentAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const typeIcon = { video: <FaVideo />, pdf: <FaFilePdf />, notes: <FaStickyNote /> };
const typeColor = { video: { bg: '#ede9fe', color: '#7c3aed' }, pdf: { bg: '#fee2e2', color: '#ef4444' }, notes: { bg: '#dcfce7', color: '#16a34a' } };

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [activeContent, setActiveContent] = useState(0);
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    Promise.all([
      courseAPI.getById(id),
      enrollmentAPI.getAll(),
    ]).then(([courseRes, enrollRes]) => {
      setCourse(courseRes.data);
      const enr = enrollRes.data.find(e => e.courseId?._id === id || e.courseId === id);
      if (!enr) { toast.error('Not enrolled in this course'); navigate('/dashboard/my-courses'); return; }
      setEnrollment(enr);
      setLoading(false);
      loadReviews();
    }).catch(() => { toast.error('Course not found'); navigate('/dashboard/my-courses'); });
  }, [id]);

  const loadReviews = () => {
    reviewAPI.getByCourse(id).then(({ data }) => {
      setReviews(data.reviews); setReviewAvg(data.average);
      const mine = data.reviews.find(r => r.userId?._id === user?._id);
      if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ''); }
    }).catch(() => {});
  };

  const submitReview = async () => {
    if (!myRating) return toast.error('Select a rating');
    try {
      await reviewAPI.create({ courseId: id, rating: myRating, comment: myComment });
      toast.success('Review submitted!');
      loadReviews();
    } catch { toast.error('Failed to submit review'); }
  };

  const toggleSection = (idx) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const selectContent = (si, ci) => {
    setActiveSection(si);
    setActiveContent(ci);
    if (!expandedSections.has(si)) {
      setExpandedSections(prev => new Set(prev).add(si));
    }
  };

  const isCompleted = (contentId) => enrollment?.completedContents?.includes(contentId);

  const toggleComplete = async (contentId) => {
    if (!enrollment) return;
    try {
      const done = isCompleted(contentId);
      const { data } = done
        ? await enrollmentAPI.uncompleteContent(enrollment._id, contentId)
        : await enrollmentAPI.completeContent(enrollment._id, contentId);
      setEnrollment(data);
      if (!done) toast.success('Marked as complete!');
    } catch { toast.error('Failed to update progress'); }
  };

  const goNext = () => {
    const section = course.sections[activeSection];
    if (activeContent < section.contents.length - 1) {
      setActiveContent(activeContent + 1);
    } else if (activeSection < course.sections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveContent(0);
      setExpandedSections(prev => new Set(prev).add(activeSection + 1));
    }
  };

  const goPrev = () => {
    if (activeContent > 0) {
      setActiveContent(activeContent - 1);
    } else if (activeSection > 0) {
      const prevSection = course.sections[activeSection - 1];
      setActiveSection(activeSection - 1);
      setActiveContent(prevSection.contents.length - 1);
      setExpandedSections(prev => new Set(prev).add(activeSection - 1));
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48"></div>
      <div className="skeleton h-96 rounded-[16px]"></div>
    </div>
  );

  const currentSection = course?.sections?.[activeSection];
  const currentContent = currentSection?.contents?.[activeContent];
  const totalContents = course?.sections?.reduce((s, sec) => s + (sec.contents?.length || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard/my-courses')} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: 'var(--gray-500)' }}>
          <HiArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate" style={{ color: 'var(--gray-900)' }}>{course?.title}</h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--gray-400)' }}>
            <span>{enrollment?.completedContents?.length || 0}/{totalContents} lessons</span>
            <span>•</span>
            <span className="font-semibold" style={{ color: enrollment?.progress === 100 ? '#16a34a' : 'var(--blue-600)' }}>
              {enrollment?.progress || 0}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--gray-200)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${enrollment?.progress || 0}%`, background: enrollment?.progress === 100 ? '#22c55e' : 'var(--gradient-blue)' }} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Sidebar — Section List */}
        <div className="lg:col-span-1 bg-white rounded-[16px] shadow-sm overflow-y-auto" style={{ border: '1px solid var(--gray-200)', maxHeight: 'calc(100vh - 220px)' }}>
          <div className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)' }}>
            Course Content
          </div>
          {course?.sections?.map((section, si) => {
            const sectionDone = section.contents.every(c => isCompleted(c._id));
            const sectionCount = section.contents.filter(c => isCompleted(c._id)).length;
            return (
              <div key={si}>
                <button onClick={() => toggleSection(si)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {sectionDone ? (
                      <HiCheckCircle className="text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[0.55rem] font-bold flex-shrink-0"
                        style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-400)' }}>{si + 1}</div>
                    )}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--gray-800)' }}>{section.sectionTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>{sectionCount}/{section.contents.length}</span>
                    {expandedSections.has(si) ? <HiChevronDown className="text-gray-400" /> : <HiChevronRight className="text-gray-400" />}
                  </div>
                </button>
                {expandedSections.has(si) && (
                  <div className="bg-gray-50/50">
                    {section.contents.map((content, ci) => {
                      const isActive = si === activeSection && ci === activeContent;
                      const done = isCompleted(content._id);
                      return (
                        <button key={ci} onClick={() => selectContent(si, ci)}
                          className="w-full flex items-center gap-2.5 px-4 pl-10 py-2.5 text-left text-sm transition-colors"
                          style={{
                            background: isActive ? 'var(--blue-50)' : 'transparent',
                            color: isActive ? 'var(--blue-700)' : 'var(--gray-600)',
                            borderLeft: isActive ? '3px solid var(--blue-600)' : '3px solid transparent',
                          }}>
                          {done ? (
                            <HiCheckCircle className="text-green-500 flex-shrink-0 text-sm" />
                          ) : (
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: typeColor[content.type]?.bg, color: typeColor[content.type]?.color, fontSize: '0.55rem' }}>
                              {typeIcon[content.type]}
                            </div>
                          )}
                          <span className="truncate text-xs">{content.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {currentContent ? (
            <>
              <motion.div key={`${activeSection}-${activeContent}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[16px] shadow-sm flex-1 overflow-y-auto" style={{ border: '1px solid var(--gray-200)' }}>
                {/* Content Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: typeColor[currentContent.type]?.bg, color: typeColor[currentContent.type]?.color }}>
                      {typeIcon[currentContent.type]}
                    </div>
                    <div>
                      <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>{currentContent.title}</h2>
                      <span className="text-xs capitalize" style={{ color: 'var(--gray-400)' }}>{currentContent.type}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleComplete(currentContent._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: isCompleted(currentContent._id) ? '#dcfce7' : 'var(--gray-100)',
                      color: isCompleted(currentContent._id) ? '#16a34a' : 'var(--gray-500)',
                    }}>
                    <FaCheck className="text-xs" /> {isCompleted(currentContent._id) ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>

                {/* Content Body */}
                <div className="p-6">
                  {currentContent.type === 'video' && currentContent.videoUrl && (
                    <div className="aspect-video rounded-xl overflow-hidden" style={{ background: '#000' }}>
                      <iframe
                        src={currentContent.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={currentContent.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}
                  {currentContent.type === 'pdf' && currentContent.pdfUrl && (() => {
                    const url = currentContent.pdfUrl;
                    // Google Drive links → use native Drive embed (read-only preview)
                    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (driveMatch) {
                      return (
                        <div className="space-y-2">
                          <div className="text-xs font-medium px-1" style={{ color: 'var(--gray-400)' }}>📄 Read-only preview</div>
                          <iframe
                            src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`}
                            title={currentContent.title}
                            className="w-full rounded-xl"
                            style={{ height: 600, border: '1px solid var(--gray-200)' }}
                            allow="autoplay"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                          />
                        </div>
                      );
                    }
                    // Direct URLs (Cloudinary etc.) → Google Docs Viewer
                    return (
                      <div className="space-y-2">
                        <div className="text-xs font-medium px-1" style={{ color: 'var(--gray-400)' }}>📄 Read-only preview</div>
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                          title={currentContent.title}
                          className="w-full rounded-xl"
                          style={{ height: 600, border: '1px solid var(--gray-200)' }}
                          sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                      </div>
                    );
                  })()}
                  {currentContent.type === 'notes' && (
                    <div className="prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>
                      {currentContent.contentText || 'No content yet.'}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button onClick={goPrev} disabled={activeSection === 0 && activeContent === 0}
                  className="btn-outline !py-2 !px-5 !text-sm disabled:opacity-30">
                  ← Previous
                </button>
                <button onClick={goNext}
                  disabled={activeSection === course.sections.length - 1 && activeContent === currentSection.contents.length - 1}
                  className="btn-primary !py-2 !px-5 !text-sm disabled:opacity-30">
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[16px] shadow-sm flex items-center justify-center flex-1" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="text-center py-16">
                <HiCheckCircle className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
                <p className="font-medium" style={{ color: 'var(--gray-500)' }}>Select a lesson to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========= REVIEWS SECTION ========= */}
      <div className="mt-6 bg-white rounded-[16px] p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setShowReviews(!showReviews)}>
          <div className="flex items-center gap-3">
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>⭐ Ratings & Reviews</h3>
            <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{reviewAvg}/5</span>
            <span className="text-xs" style={{ color: 'var(--gray-400)' }}>({reviews.length} reviews)</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--blue-600)' }}>{showReviews ? 'Hide' : 'Show'}</span>
        </div>

        {showReviews && (
          <div className="space-y-4">
            {/* Write Review */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--gray-50)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Your Rating</p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setMyRating(s)} className="text-xl transition-transform hover:scale-110">
                    <FaStar style={{ color: s <= myRating ? '#f59e0b' : '#d1d5db' }} />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold" style={{ color: 'var(--gray-500)' }}>{myRating}/5</span>
              </div>
              <div className="flex gap-2">
                <input value={myComment} onChange={e => setMyComment(e.target.value)} className="input-light !text-xs !py-2 flex-1" placeholder="Write a review (optional)..." />
                <button onClick={submitReview} className="btn-primary !py-2 !px-4 !text-xs">Submit</button>
              </div>
            </div>

            {/* Review List */}
            {reviews.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reviews.map(r => (
                  <div key={r._id} className="flex gap-3 pb-3" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
                      {r.userId?.avatar ? <img src={r.userId.avatar} className="w-full h-full object-cover" /> : r.userId?.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: 'var(--gray-800)' }}>{r.userId?.name}</span>
                        <div className="flex">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className="text-[0.55rem]" style={{ color: i < r.rating ? '#f59e0b' : '#e5e7eb' }} />)}</div>
                      </div>
                      {r.comment && <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;
