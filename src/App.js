import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import AdminPanel from "./components/AdminPanel";

function App(){
  const [page,setPage]=useState("user");
  return(
    <div className="app">
      <Sidebar setPage={setPage}/>
      <div className="main">
        {page==="user"&&<><BookingForm/><BookingList/></>}
        {page==="admin"&&<AdminPanel/>}
      </div>
    </div>
  );
}
export default App;