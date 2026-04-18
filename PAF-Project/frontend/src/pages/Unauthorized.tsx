import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
      background: '#f5f2ee',
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5vw', height: '64px', background: '#0f2618',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: '22px', letterSpacing: '2px', color: 'white',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: '#f97316', fontSize: '11px' }}>●</span>
          SMART<span style={{ color: '#f97316' }}>CAMPUS</span>
        </div>
        <Link to="/dashboard" style={{
          padding: '9px 22px', background: '#f97316', color: 'white',
          borderRadius: '6px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', letterSpacing: '0.5px',
        }}>Back to Dashboard</Link>
      </nav>

      {/* Hero — dark green */}
      <div style={{
        background: '#0f2618',
        padding: '72px 5vw 80px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'center',
      }}>
        {/* Decorative leaf */}
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: '300px', height: '300px', opacity: 0.5,
          background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10,100 Q60,10 150,50 Q200,80 160,160 Q100,200 40,160 Q-10,130 10,100Z' fill='%23163320' /%3E%3C/svg%3E\") no-repeat center/cover",
          pointerEvents: 'none',
        }} />

        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: '#f97316', textTransform: 'uppercase' }}>
          ▸ ACCESS DENIED
        </p>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: '96px', lineHeight: 0.9,
          color: 'white', textTransform: 'uppercase', letterSpacing: '-2px',
          position: 'relative', zIndex: 1,
        }}>
          4<span style={{ color: '#f97316' }}>0</span>3
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '28px', color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>
          RESTRICTED ZONE
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '420px', fontWeight: 300 }}>
          You don't have the permissions required to access this area.
          {user ? ` You're logged in as ${user.role?.toLowerCase()}.` : ' Please log in first.'}
        </p>
      </div>

      {/* White section */}
      <div style={{
        background: '#fff',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 5vw',
        gap: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: '#f97316', textTransform: 'uppercase' }}>
          ▸ WHAT TO DO
        </p>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: '40px',
          color: '#111827', textTransform: 'uppercase', lineHeight: 0.95,
        }}>
          GO BACK TO YOUR<br /><span style={{ color: '#f97316' }}>HUB</span>
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7, maxWidth: '360px', fontWeight: 300 }}>
          The page you're looking for requires elevated permissions. Return to your dashboard or contact your administrator.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard" style={{
            padding: '13px 32px',
            background: '#0f2618', color: 'white', borderRadius: '8px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '18px', letterSpacing: '1px',
            textDecoration: 'none', textTransform: 'uppercase',
            transition: 'background 0.2s',
          }}>
            Go to Dashboard →
          </Link>
          <Link to="/login" style={{
            padding: '13px 32px',
            background: 'transparent', color: '#374151',
            border: '1.5px solid #d1d5db', borderRadius: '8px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '18px', letterSpacing: '1px',
            textDecoration: 'none', textTransform: 'uppercase',
          }}>
            Sign In Again
          </Link>
        </div>

        {/* Decorative circles */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0f2618', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🔒</div>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>⚠️</div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1a2535', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🏛️</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}
