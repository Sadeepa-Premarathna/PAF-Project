package com.sliit.paf.resource_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sliit.paf.resource_service.enums.ResourceStatus;
import com.sliit.paf.resource_service.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public class ResourceRequest {

    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name must be at most 120 characters")
    private String name;

    @NotNull(message = "type is required")
    private ResourceType type;

    @NotNull(message = "capacity is required")
    @Min(value = 1, message = "capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "location is required")
    @Size(max = 255, message = "location must be at most 255 characters")
    private String location;

    @NotNull(message = "availableFrom is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableFrom;

    @NotNull(message = "availableTo is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableTo;

    @NotNull(message = "status is required")
    private ResourceStatus status;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}
