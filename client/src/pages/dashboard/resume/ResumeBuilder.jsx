import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiSave, HiCheck } from 'react-icons/hi';
import { FaMagic } from 'react-icons/fa';
import { resumeAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 'clean', name: 'Clean Professional', color: '#2563eb', desc: 'Minimal, single-column, ATS-friendly', preview: ['Helvetica', 'Blue accents', 'Single column', 'Clear headers'] },
  { id: 'modern', name: 'Modern', color: '#7c3aed', desc: 'Accent colors, contemporary feel', preview: ['Sans-serif', 'Purple accents', 'Modern layout', 'Clean lines'] },
  { id: 'academic', name: 'Academic', color: '#0369a1', desc: 'Education & research focused', preview: ['Formal', 'Teal accents', 'Research-oriented', 'Publication ready'] },
  { id: 'fresher', name: 'Fresher / Student', color: '#059669', desc: 'Skills & projects first', preview: ['Skills-first', 'Green accents', 'Project-focused', 'Internship ready'] },
];

const SKILL_SUGGESTIONS = ['JavaScript','Python','Java','React','Node.js','MongoDB','SQL','Git','Docker','AWS','HTML/CSS','TypeScript','C++','Data Structures','Machine Learning','REST APIs'];

const emptyExp = () => ({ title: '', company: '', dates: '', bullets: [''] });
const emptyEdu = () => ({ degree: '', institution: '', year: '', gpa: '' });
const emptyProj = () => ({ title: '', description: '', tech: '', link: '' });

const ResumeBuilder = () => {
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState('clean');
  const [generating, setGenerating] = useState(false);
  const [genSummary, setGenSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
    summary: '',
    experience: [emptyExp()],
    education: [emptyEdu()],
    skills: [],
    projects: [emptyProj()],
    certifications: [],
    languages: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [langInput, setLangInput] = useState('');

  // Load saved resume on mount
  useEffect(() => {
    resumeAPI.getSaved().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name || '', title: data.title || '', email: data.email || '',
          phone: data.phone || '', location: data.location || '', linkedin: data.linkedin || '',
          portfolio: data.portfolio || '', summary: data.summary || '',
          experience: data.experience?.length ? data.experience : [emptyExp()],
          education: data.education?.length ? data.education : [emptyEdu()],
          skills: data.skills || [],
          projects: data.projects?.length ? data.projects : [emptyProj()],
          certifications: data.certifications || [],
          languages: data.languages || [],
        });
        setTemplate(data.selectedTemplate || 'clean');
        setLoaded(true);
        toast.success('Saved resume loaded!');
      }
    }).catch(() => {});
  }, []);

  const u = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); };

  const addItem = (key, factory) => u(key, [...form[key], factory()]);
  const removeItem = (key, i) => u(key, form[key].filter((_, idx) => idx !== i));
  const updateItem = (key, i, field, val) => {
    const arr = [...form[key]]; arr[i] = { ...arr[i], [field]: val }; u(key, arr);
  };

  const addSkill = (s) => { const t = s.trim(); if (t && !form.skills.includes(t)) u('skills', [...form.skills, t]); setSkillInput(''); };
  const addLang = (s) => { const t = s.trim(); if (t && !form.languages.includes(t)) u('languages', [...form.languages, t]); setLangInput(''); };

  // Save to DB
  const saveResume = useCallback(async () => {
    setSaving(true);
    try {
      await resumeAPI.saveData({ ...form, selectedTemplate: template });
      setSaved(true);
      toast.success('Resume saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  }, [form, template]);

  const aiSummary = async () => {
    setGenSummary(true);
    try {
      const { data } = await resumeAPI.generateSummary({
        name: form.name, title: form.title,
        experience: form.experience.map(e => e.title).filter(Boolean).join(', ') || 'Fresher',
        skills: form.skills.join(', '),
        education: form.education.map(e => e.degree).filter(Boolean).join(', '),
      });
      u('summary', data.summary);
      toast.success('Summary generated!');
    } catch { toast.error('Failed to generate'); }
    setGenSummary(false);
  };

  const downloadPdf = async () => {
    setGenerating(true);
    try {
      await saveResume(); // auto-save before download
      const { data } = await resumeAPI.generatePdf(form, template);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `${(form.name || 'Resume').replace(/\s/g, '_')}_Resume.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
    setGenerating(false);
  };

  const steps = ['Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Template'];

  const inputCls = "input-light !text-sm";
  const labelCls = "block text-xs font-semibold mb-1";
  const labelStyle = { color: 'var(--gray-700)' };

  return (
    <div className="space-y-5">
      {/* Header with save button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto pb-2 flex-1">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{ background: step === i ? 'var(--blue-600)' : 'var(--gray-100)', color: step === i ? '#fff' : 'var(--gray-500)' }}>
              {i + 1}. {s}
            </button>
          ))}
        </div>
        <button onClick={saveResume} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white ml-3 flex-shrink-0 transition-all"
          style={{ background: saved ? '#16a34a' : 'var(--blue-600)' }}>
          {saving ? '⏳' : saved ? <HiCheck /> : <HiSave />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {loaded && (
        <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
          <HiCheck className="text-base" /> <span className="font-semibold">Resume data loaded from your saved profile. Edit any section below.</span>
        </div>
      )}

      <div className="bg-white p-5 rounded-[16px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-3">
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>👤 Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls} style={labelStyle}>Full Name *</label>
                <input value={form.name} onChange={e => u('name', e.target.value)} className={inputCls} placeholder="John Doe" /></div>
              <div><label className={labelCls} style={labelStyle}>Job Title</label>
                <input value={form.title} onChange={e => u('title', e.target.value)} className={inputCls} placeholder="Software Developer" /></div>
              <div><label className={labelCls} style={labelStyle}>Email *</label>
                <input value={form.email} onChange={e => u('email', e.target.value)} className={inputCls} placeholder="john@email.com" /></div>
              <div><label className={labelCls} style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={e => u('phone', e.target.value)} className={inputCls} placeholder="+91 9876543210" /></div>
              <div><label className={labelCls} style={labelStyle}>Location</label>
                <input value={form.location} onChange={e => u('location', e.target.value)} className={inputCls} placeholder="Hyderabad, India" /></div>
              <div><label className={labelCls} style={labelStyle}>LinkedIn</label>
                <input value={form.linkedin} onChange={e => u('linkedin', e.target.value)} className={inputCls} placeholder="linkedin.com/in/johndoe" /></div>
            </div>
          </div>
        )}

        {/* Step 1: Summary */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>📝 Professional Summary</h3>
              <button onClick={aiSummary} disabled={genSummary} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                <FaMagic /> {genSummary ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea value={form.summary} onChange={e => u('summary', e.target.value)} rows={4} className={inputCls + ' resize-y'}
              placeholder="Motivated software developer with 2+ years of experience..." />
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>💼 Experience</h3>
              <button onClick={() => addItem('experience', emptyExp)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}><HiPlus /> Add</button>
            </div>
            {form.experience.map((exp, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: 'var(--gray-500)' }}>Experience {i + 1}</span>
                  {form.experience.length > 1 && <button onClick={() => removeItem('experience', i)} className="text-red-400 hover:text-red-600"><HiTrash /></button>}
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  <input value={exp.title} onChange={e => updateItem('experience', i, 'title', e.target.value)} className={inputCls} placeholder="Job Title" />
                  <input value={exp.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} className={inputCls} placeholder="Company" />
                  <input value={exp.dates} onChange={e => updateItem('experience', i, 'dates', e.target.value)} className={inputCls} placeholder="Jan 2023 - Present" />
                </div>
                {exp.bullets.map((b, j) => (
                  <div key={j} className="flex gap-2">
                    <input value={b} onChange={e => { const bs = [...exp.bullets]; bs[j] = e.target.value; updateItem('experience', i, 'bullets', bs); }}
                      className={inputCls + ' flex-1'} placeholder={`Achievement ${j + 1} (use numbers & action verbs)`} />
                    {j === exp.bullets.length - 1 && <button onClick={() => updateItem('experience', i, 'bullets', [...exp.bullets, ''])}
                      className="px-2 rounded-lg text-xs" style={{ background: 'var(--gray-200)' }}><HiPlus /></button>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>🎓 Education</h3>
              <button onClick={() => addItem('education', emptyEdu)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}><HiPlus /> Add</button>
            </div>
            {form.education.map((edu, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: 'var(--gray-500)' }}>Education {i + 1}</span>
                  {form.education.length > 1 && <button onClick={() => removeItem('education', i)} className="text-red-400"><HiTrash /></button>}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={edu.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} className={inputCls} placeholder="B.Tech in Computer Science" />
                  <input value={edu.institution} onChange={e => updateItem('education', i, 'institution', e.target.value)} className={inputCls} placeholder="University Name" />
                  <input value={edu.year} onChange={e => updateItem('education', i, 'year', e.target.value)} className={inputCls} placeholder="2020 - 2024" />
                  <input value={edu.gpa} onChange={e => updateItem('education', i, 'gpa', e.target.value)} className={inputCls} placeholder="GPA: 8.5/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Skills + Languages */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>🛠️ Skills</h3>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                className={inputCls + ' flex-1'} placeholder="Type a skill and press Enter..." />
              <button onClick={() => addSkill(skillInput)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'var(--blue-600)' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                  {s} <button onClick={() => u('skills', form.skills.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--gray-400)' }}>Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                  <button key={s} onClick={() => addSkill(s)} className="text-[0.65rem] px-2.5 py-1 rounded-full transition-all hover:scale-105"
                    style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>+ {s}</button>
                ))}
              </div>
            </div>
            <h3 className="font-bold pt-2" style={{ color: 'var(--gray-900)' }}>🌐 Languages</h3>
            <div className="flex gap-2">
              <input value={langInput} onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLang(langInput); } }}
                className={inputCls + ' flex-1'} placeholder="English, Hindi, Telugu..." />
              <button onClick={() => addLang(langInput)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'var(--blue-600)' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.languages.map((l, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  {l} <button onClick={() => u('languages', form.languages.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Projects */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>🚀 Projects</h3>
              <button onClick={() => addItem('projects', emptyProj)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}><HiPlus /> Add</button>
            </div>
            {form.projects.map((p, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: 'var(--gray-500)' }}>Project {i + 1}</span>
                  {form.projects.length > 1 && <button onClick={() => removeItem('projects', i)} className="text-red-400"><HiTrash /></button>}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={p.title} onChange={e => updateItem('projects', i, 'title', e.target.value)} className={inputCls} placeholder="Project Name" />
                  <input value={p.tech} onChange={e => updateItem('projects', i, 'tech', e.target.value)} className={inputCls} placeholder="React, Node.js, MongoDB" />
                </div>
                <textarea value={p.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} className={inputCls + ' resize-none'} rows={2} placeholder="Brief description of the project..." />
                <input value={p.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} className={inputCls} placeholder="https://github.com/..." />
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Template Selection & Download */}
        {step === 6 && (
          <div className="space-y-5">
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>🎨 Choose Template & Download</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <motion.div key={t.id} whileTap={{ scale: 0.98 }}
                  onClick={() => { setTemplate(t.id); setSaved(false); }}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{
                    border: template === t.id ? `2px solid ${t.color}` : '2px solid var(--gray-200)',
                    background: template === t.id ? `${t.color}08` : '#fff',
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: t.color }}>{t.name[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--gray-900)' }}>{t.name}</p>
                      <p className="text-[0.65rem]" style={{ color: 'var(--gray-400)' }}>{t.desc}</p>
                    </div>
                    {template === t.id && <span className="text-lg" style={{ color: t.color }}>✓</span>}
                  </div>
                  {/* Template Preview */}
                  <div className="p-3 rounded-lg" style={{ background: '#fafbff', border: '1px solid var(--gray-100)' }}>
                    <div className="space-y-1.5">
                      <div className="h-2 rounded-full w-2/3" style={{ background: t.color, opacity: 0.8 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ background: t.color, opacity: 0.3 }} />
                      <div className="h-px w-full my-1" style={{ background: t.color, opacity: 0.2 }} />
                      <div className="flex gap-1.5">
                        <div className="h-1 rounded-full flex-1" style={{ background: '#e2e8f0' }} />
                        <div className="h-1 rounded-full flex-1" style={{ background: '#e2e8f0' }} />
                      </div>
                      <div className="h-1 rounded-full w-4/5" style={{ background: '#e2e8f0' }} />
                      <div className="h-1 rounded-full w-3/5" style={{ background: '#e2e8f0' }} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.preview.map((p, j) => (
                        <span key={j} className="text-[0.55rem] px-1.5 py-0.5 rounded" style={{ background: `${t.color}15`, color: t.color }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={saveResume} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: saved ? '#dcfce7' : 'var(--gray-100)', color: saved ? '#16a34a' : 'var(--gray-600)', border: '1px solid var(--gray-200)' }}>
                {saved ? <><HiCheck /> Saved</> : <><HiSave /> Save Resume</>}
              </button>
              <button onClick={downloadPdf} disabled={generating || !form.name}
                className="btn-primary flex-1 !py-3 disabled:opacity-50">
                {generating ? '⏳ Generating PDF...' : '📥 Download Resume PDF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-30" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>← Previous</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30" style={{ background: 'var(--blue-600)' }}>Next →</button>
      </div>
    </div>
  );
};

export default ResumeBuilder;
