import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CalendarPage.module.css';

const API = import.meta.env.VITE_API_BASE_URL;

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  organizer: string;
  isBooking?: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  Workshop: '#3b82f6',
  Seminar: '#8b5cf6',
  Sports: '#ef4444',
  Social: '#f59e0b',
  Technical: '#10b981',
  Booking: '#64748b',
  Holiday: '#ef4444',
};


export default function CalendarPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch Campus Events
      const eventRes = await fetch(`${API}/api/events`, { headers });
      const eventData = await eventRes.json();
      
      // Fetch All Bookings (to show occupancy)
      const bookingRes = await fetch(`${API}/api/bookings`, { headers });
      const bookingData = await bookingRes.json();

      const formattedBookings = bookingData
        .filter((b: any) => b.status === 'APPROVED')
        .map((b: any) => ({
          id: b.id,
          title: `Booked: ${b.resourceName}`,
          description: b.purpose,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          location: b.resourceName,
          type: 'Booking',
          organizer: 'Student',
          isBooking: true
        }));

      setEvents([...eventData, ...formattedBookings]);
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className={styles.dayEmpty} />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    days.push(
      <div 
        key={d} 
        className={`${styles.day} ${selectedDay === d ? styles.selected : ''} ${isToday ? styles.today : ''}`}
        onClick={() => setSelectedDay(d)}
      >
        <span className={styles.dayNumber}>{d}</span>
        <div className={styles.eventDots}>
          {dayEvents.slice(0, 3).map((e, i) => (
            <span key={i} className={styles.dot} style={{ backgroundColor: EVENT_TYPE_COLORS[e.type] || '#cbd5e1' }} />
          ))}
          {dayEvents.length > 3 && <span className={styles.moreDots}>+</span>}
        </div>
      </div>
    );
  }

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedEvents = events.filter(e => e.date === selectedDateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div className={styles.calendarNav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <h1 className={styles.monthTitle}>{monthName} <span>{year}</span></h1>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>
        <div className={styles.headerActions}>
          {(user?.role === 'ADMIN' || user?.role === 'STAFF_MEMBER') && (
            <button className={styles.addEventBtn}>+ Add Event</button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Calendar Grid */}
        <div className={styles.calendarCard}>
          <div className={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.weekDay}>{day}</div>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {days}
          </div>
        </div>

        {/* Details Panel */}
        <div className={styles.detailsPanel}>
          <div className={styles.detailsHeader}>
            <h2 className={styles.detailsTitle}>
              {selectedDay} {monthName}
            </h2>
            <p className={styles.detailsSubtitle}>
              {selectedEvents.length} {selectedEvents.length === 1 ? 'Event' : 'Events'} Scheduled
            </p>
          </div>

          <div className={styles.eventList}>
            {loading ? (
              <div className={styles.loader}>Loading events...</div>
            ) : selectedEvents.length > 0 ? (
              selectedEvents.map(event => (
                <div key={event.id} className={`${styles.eventCard} ${event.isBooking ? styles.bookingCard : ''}`}>
                  <div className={styles.eventTime}>
                    <span className={styles.time}>{event.startTime}</span>
                    <span className={styles.duration}>to {event.endTime}</span>
                  </div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventType} style={{ color: EVENT_TYPE_COLORS[event.type], borderColor: EVENT_TYPE_COLORS[event.type] }}>
                        {event.type}
                      </span>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                    </div>
                    <p className={styles.eventDesc}>{event.description}</p>
                    <div className={styles.eventMeta}>
                      <span>📍 {event.location}</span>
                      {event.organizer && <span>👤 {event.organizer}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🗓️</span>
                <p>No events or bookings for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
