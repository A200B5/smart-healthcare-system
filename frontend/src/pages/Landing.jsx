import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '500+', label: 'Expert Doctors' },
  { value: '50K+', label: 'Happy Patients' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

const specialties = ['Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Ophthalmology','Gynecology','Psychiatry'];

const Landing = () => {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%)',
        color: 'white', padding: '100px 24px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(240,165,0,0.15) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="fade-in">
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '8px 18px', borderRadius: 50, fontSize: '0.85rem', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
              🏆 Egypt's #1 Healthcare Platform
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', lineHeight: 1.2, marginBottom: 20 }}>
              Your Health,<br /><span style={{ color: 'var(--accent-light)' }}>Our Priority</span>
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Book appointments with Egypt's top specialists. Smart scheduling, instant confirmation, and seamless healthcare management.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-accent" style={{ fontSize: '1rem', padding: '14px 32px' }}>Get Started Free</Link>
              <Link to="/doctors" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '1rem', padding: '14px 32px', backdropFilter: 'blur(8px)' }}>Browse Doctors</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stats.map((s, i) => (
              <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s`, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius)', padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-light)' }}>{s.value}</div>
                <div style={{ opacity: 0.85, marginTop: 4, fontSize: '0.9rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">Medical Specialties</h2>
          <p className="section-subtitle">Find the right specialist for your needs</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            {specialties.map((s, i) => (
              <Link key={i} to="/doctors" style={{
                padding: '12px 24px', background: 'var(--white)', borderRadius: 50,
                border: '2px solid var(--border)', textDecoration: 'none', color: 'var(--text)',
                fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                boxShadow: 'var(--shadow)'
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text)'; }}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Book your appointment in 3 simple steps</p>
          <div className="grid-3" style={{ marginTop: 48 }}>
            {[
              { step: '01', icon: '🔍', title: 'Find Your Doctor', desc: 'Browse our network of verified specialists filtered by specialty, rating, and availability.' },
              { step: '02', icon: '📅', title: 'Book Appointment', desc: 'Choose your preferred date and time slot. Get instant confirmation via email.' },
              { step: '03', icon: '✅', title: 'Get Treatment', desc: 'Visit the doctor and receive the care you deserve. Track your health history.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, fontFamily: 'Playfair Display, serif', fontSize: '5rem', fontWeight: 700, color: 'var(--surface2)', lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: 16, position: 'relative' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 12, position: 'relative' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, position: 'relative' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: 16 }}>Ready to Take Control of Your Health?</h2>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: 36 }}>Join thousands of patients who trust MediCare Pro for their healthcare needs.</p>
          <Link to="/register" className="btn btn-accent" style={{ fontSize: '1.05rem', padding: '16px 40px' }}>Create Free Account</Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
