package com.sliit.paf.resource_service.service.impl;

import com.sliit.paf.resource_service.dto.ResourceMapper;
import com.sliit.paf.resource_service.dto.ResourceRequest;
import com.sliit.paf.resource_service.dto.ResourceResponse;
import com.sliit.paf.resource_service.entity.CampusResource;
import com.sliit.paf.resource_service.enums.ResourceType;
import com.sliit.paf.resource_service.exception.BadRequestException;
import com.sliit.paf.resource_service.exception.ResourceNotFoundException;
import com.sliit.paf.resource_service.repository.CampusResourceRepository;
import com.sliit.paf.resource_service.service.ResourceService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final CampusResourceRepository resourceRepository;

    public ResourceServiceImpl(CampusResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        validateTimeRange(request);
        CampusResource saved = resourceRepository.save(ResourceMapper.toEntity(request));
        return ResourceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        return ResourceMapper.toResponse(getExistingResource(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(ResourceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> searchResources(ResourceType type, Integer capacity, String location) {
        if (capacity != null && capacity < 1) {
            throw new BadRequestException("capacity must be at least 1");
        }

        String normalizedLocation = StringUtils.hasText(location) ? location.trim() : null;
        return resourceRepository.searchResources(type, capacity, normalizedLocation)
                .stream()
                .map(ResourceMapper::toResponse)
                .toList();
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        validateTimeRange(request);
        CampusResource existing = getExistingResource(id);
        ResourceMapper.updateEntity(existing, request);
        CampusResource updated = resourceRepository.save(existing);
        return ResourceMapper.toResponse(updated);
    }

    @Override
    public void deleteResource(Long id) {
        CampusResource existing = getExistingResource(id);
        resourceRepository.delete(existing);
    }

    private CampusResource getExistingResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id: " + id));
    }

    private void validateTimeRange(ResourceRequest request) {
        if (!request.getAvailableFrom().isBefore(request.getAvailableTo())) {
            throw new BadRequestException("availableFrom must be before availableTo");
        }
    }
}
