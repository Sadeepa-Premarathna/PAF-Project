package com.example.booking.model;

import jakarta.persistence.*;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resourceId;
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private String status;

    // Add getters and setters

    public Long getId() { return id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }          // ✅ add this
    public void setEndTime(String endTime) { this.endTime = endTime; } // ✅ add this

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}