import { useEffect, useState } from "react";
import { getAll, updateStatus } from "../services/bookingService";

export default function AdminPanel() {
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date"); // date or status

  const load = () => getAll().then(setData);
  useEffect(() => { load() }, []);

  // Filter & sort
  const filtered = data
    .filter(b => filterStatus === "ALL" || b.status === filterStatus)
    .sort((a,b) => {
      if(sortBy === "date") return new Date(a.date) - new Date(b.date);
      if(sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  // Summary counts
  const total = data.length;
  const pending = data.filter(b=>b.status==="PENDING").length;
  const approved = data.filter(b=>b.status==="APPROVED").length;
  const rejected = data.filter(b=>b.status==="REJECTED").length;

  return (
    <div>
      {/* Dashboard summary cards */}
      <div style={{ display:"flex", gap:"20px", marginBottom:"20px" }}>
        <div className="card" style={{flex:1,background:"#f39c12",color:"white"}}>Pending: {pending}</div>
        <div className="card" style={{flex:1,background:"#27ae60",color:"white"}}>Approved: {approved}</div>
        <div className="card" style={{flex:1,background:"#c0392b",color:"white"}}>Rejected: {rejected}</div>
        <div className="card" style={{flex:1,background:"#34495e",color:"white"}}>Total: {total}</div>
      </div>

      {/* Filter & Sort */}
      <div style={{ marginBottom:"10px" }}>
        <label>Status Filter: </label>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="ALL">ALL</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <label style={{marginLeft:"20px"}}>Sort By: </label>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="date">Date</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Bookings Table */}
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(b=>(
            <tr key={b.id}>
              <td>{b.resourceId}</td>
              <td>{b.date}</td>
              <td>{b.startTime} - {b.endTime}</td>
              <td><span className={`status ${b.status?.toLowerCase()}`}>{b.status}</span></td>
              <td>
                {b.status==="PENDING" && <>
                  <button className="btn success" onClick={()=>{updateStatus(b.id,"APPROVED"); load()}}>Approve</button>
                  <button className="btn danger" onClick={()=>{updateStatus(b.id,"REJECTED"); load()}}>Reject</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}