import { useState } from "react";
import { create } from "../services/bookingService";

export default function BookingForm() {
  const [data,setData]=useState({});
  const handleSubmit = async () => {
    try {
      await create(data);
      alert("Booking created!");
      setData({});
    } catch(e){}
  }
  return (
    <div className="card">
      <h3>Create Booking</h3>
      <input placeholder="Resource" value={data.resourceId || ""} onChange={e=>setData({...data,resourceId:e.target.value})}/>
      <input type="date" value={data.date || ""} onChange={e=>setData({...data,date:e.target.value})}/>
      <input type="time" value={data.startTime || ""} onChange={e=>setData({...data,startTime:e.target.value})}/>
      <input type="time" value={data.endTime || ""} onChange={e=>setData({...data,endTime:e.target.value})}/>
      <input placeholder="Purpose" value={data.purpose || ""} onChange={e=>setData({...data,purpose:e.target.value})}/>
      <button className="btn primary" onClick={handleSubmit}>Submit</button>
    </div>
  );
}