package com.sliit.paf.resource_service.dto;

import com.sliit.paf.resource_service.entity.CampusResource;

public final class ResourceMapper {

    private ResourceMapper() {
    }

    public static CampusResource toEntity(ResourceRequest request) {
        CampusResource resource = new CampusResource();
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());
        return resource;
    }

    public static void updateEntity(CampusResource resource, ResourceRequest request) {
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());
    }

    public static ResourceResponse toResponse(CampusResource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setType(resource.getType());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setAvailableFrom(resource.getAvailableFrom());
        response.setAvailableTo(resource.getAvailableTo());
        response.setStatus(resource.getStatus());
        return response;
    }
}
