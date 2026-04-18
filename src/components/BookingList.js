import { useEffect,useState } from "react";
import { getAll } from "../services/bookingService";

export default function BookingList() {
  const [data,setData]=useState([]);
  useEffect(()=>{getAll().then(setData)},[]);
  return (
    <div className="card">
      <h3>My Bookings</h3>
      <table>
        <thead><tr><th>Resource</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>
          {data.map(b=>(
            <tr key={b.id}>
              <td>{b.resourceId}</td>
              <td>{b.date}</td>
              <td>{b.startTime} - {b.endTime}</td>
              <td><span className={`status ${b.status?.toLowerCase()}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}