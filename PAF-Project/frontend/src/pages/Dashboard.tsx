import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

// Simple SVG Icons for the UI
const Icons = {
  Dashboard: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Facility: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Booking: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Ticket: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Logout: () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ArrowRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Icons.Dashboard /> },
    { id: 'facilities', label: 'Facilities Catalogue', icon: <Icons.Facility /> },
    { id: 'bookings', label: 'My Bookings', icon: <Icons.Booking /> },
    { id: 'tickets', label: 'Incident Tickets', icon: <Icons.Ticket /> },
  ];

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            {/* Campus Leaf or Minimal Logo */}
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          </div>
          SmartCampus
        </div>

        <nav className={styles.navMenu}>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter} onClick={logout}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userRole}>Log Out</span>
          </div>
          <div style={{ marginLeft: 'auto', color: '#8b95a5' }}>
            <Icons.Logout />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT PORTION */}
      <main className={styles.mainContent}>
        {/* TOPBAR */}
        <header className={styles.topbar}>
          <div className={styles.greeting}>
            <h1>Hello, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p>Welcome back to operations hub</p>
          </div>

          <div className={styles.topActions}>
            <div className={styles.searchBar}>
              <Icons.Search />
              <input type="text" placeholder="Search resources, tickets..." />
            </div>
            
            <div className={styles.notificationIcon}>
              <Icons.Bell />
              <span className={styles.badge}>3</span>
            </div>
          </div>
        </header>

        {/* OVERVIEW CONTENT */}
        <div className={styles.contentArea}>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Available Facilities</h3>
                <p className={styles.statValue}>124</p>
              </div>
              <div className={styles.statIcon}>
                <Icons.Facility />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Active Bookings</h3>
                <p className={styles.statValue}>3</p>
              </div>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <Icons.Booking />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Pending Tickets</h3>
                <p className={styles.statValue}>1</p>
              </div>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                <Icons.Ticket />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Notifications</h3>
                <p className={styles.statValue}>3</p>
              </div>
              <div className={`${styles.statIcon} ${styles.purple}`}>
                <Icons.Bell />
              </div>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Access Modules</h2>
          </div>

          <div className={styles.moduleGrid}>
            {/* MODULE A: CATALOGUE */}
            <div className={styles.moduleCard} onClick={() => setActiveTab('facilities')}>
              <div className={styles.moduleCardHeader}>
                <div className={styles.iconBox}><Icons.Facility /></div>
                <h3>Facilities & Assets</h3>
              </div>
              <p className={styles.moduleDesc}>
                Browse the complete catalogue of lecture halls, labs, meeting rooms, and equipment.
              </p>
              <div className={styles.moduleAction}>
                Browse Catalogue <Icons.ArrowRight />
              </div>
            </div>

            {/* MODULE B: BOOKING */}
            <div className={styles.moduleCard} onClick={() => setActiveTab('bookings')}>
              <div className={styles.moduleCardHeader}>
                <div className={styles.iconBox} style={{ color: '#3b82f6' }}><Icons.Booking /></div>
                <h3>Booking Management</h3>
              </div>
              <p className={styles.moduleDesc}>
                Request dates, check expected availability windows, and view your approved reservations.
              </p>
              <div className={styles.moduleAction}>
                Manage Bookings <Icons.ArrowRight />
              </div>
            </div>

            {/* MODULE C: TICKETING */}
            <div className={styles.moduleCard} onClick={() => setActiveTab('tickets')}>
              <div className={styles.moduleCardHeader}>
                <div className={styles.iconBox} style={{ color: '#f97316' }}><Icons.Ticket /></div>
                <h3>Incident Ticketing</h3>
              </div>
              <p className={styles.moduleDesc}>
                Report a broken projector or facility damage. Add details, priority, and photo evidence.
              </p>
              <div className={styles.moduleAction}>
                Report Incident <Icons.ArrowRight />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
