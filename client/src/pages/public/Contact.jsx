import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaGlobe, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', course: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const contacts = [
    { icon: <FaPhoneAlt />, label: 'Phone', value: '+91 93916 40022', href: 'tel:+919391640022', colorClass: 'fi-blue' },
    { icon: <FaGlobe />, label: 'Website', value: 'www.vedhaeduspark.com', href: 'https://www.vedhaeduspark.com', colorClass: 'fi-orange' },
    { icon: <FaEnvelope />, label: 'Email', value: 'info@vedhaeduspark.com', href: 'mailto:info@vedhaeduspark.com', colorClass: 'fi-green' },
    { icon: <FaMapMarkerAlt />, label: 'Location', value: 'Vedha EduSpark Centre, India', colorClass: 'fi-purple' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: 'var(--white)' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
          <span className="badge-blue mb-4 inline-block">Reach Out</span>
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--gray-900)' }}>
            Get <span className="gradient-text">In Touch</span>
          </h1>
          <p className="text-lg max-w-[600px] mx-auto" style={{ color: 'var(--gray-500)' }}>
            Ready to start your tech journey? Contact us today and we'll guide you to the right course
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>Let's Connect</h3>
            <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--gray-500)' }}>
              Have questions about our courses? Want to know more about enrollment? We'd love to hear from you!
            </p>

            <div className="space-y-6">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${c.colorClass}`}>
                    {c.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--gray-900)' }}>{c.label}</h4>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                        className="text-sm transition-colors hover:text-blue-600" style={{ color: 'var(--gray-500)' }}>
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mt-6 rounded-xl overflow-hidden shadow-md h-[200px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.345!2d78.486!3d17.385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OMKwMjknMDkuNiJF!5e0!3m2!1sen!2sin!4v1"
                className="w-full h-full border-0" loading="lazy" title="Location"
              />
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="rounded-[20px] p-10 shadow-md"
            style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--gray-900)' }}>
              <FaPaperPlane className="inline mr-2.5" style={{ color: 'var(--blue-600)' }} />
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Your Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name" className="input-light" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email" className="input-light" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter your phone number" className="input-light" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Interested Course</label>
                <input type="text" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
                  placeholder="e.g. Data Analytics, Web Development" className="input-light" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Your Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your goals..." className="input-light resize-y min-h-[120px]" />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full justify-center !text-base">
                {sending ? '✓ Sending...' : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
