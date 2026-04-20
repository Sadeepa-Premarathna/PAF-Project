package com.sliit.paf.resource_service.service;

import com.sliit.paf.resource_service.dto.ResourceRequest;
import com.sliit.paf.resource_service.dto.ResourceResponse;
import com.sliit.paf.resource_service.enums.ResourceType;

import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);

    ResourceResponse getResourceById(Long id);

    List<ResourceResponse> getAllResources();

    List<ResourceResponse> searchResources(ResourceType type, Integer capacity, String location);

    ResourceResponse updateResource(Long id, ResourceRequest request);

    void deleteResource(Long id);
}
