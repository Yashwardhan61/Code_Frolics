package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.ScrapbookRequest;
import com.codefrolics.legacytrunk.dto.ScrapbookResponse;
import com.codefrolics.legacytrunk.model.Scrapbook;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.ScrapbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScrapbookService {

    private final ScrapbookRepository scrapbookRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<ScrapbookResponse> getAllScrapbooksForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        List<Scrapbook> scrapbooks = scrapbookRepository.findByUserOrderByUpdatedAtDesc(currentUser);
        return scrapbooks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScrapbookResponse getScrapbookById(Long id) {
        User currentUser = userService.getCurrentUser();
        Scrapbook scrapbook = scrapbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scrapbook not found"));
        
        // Ensure user owns this scrapbook
        if (!scrapbook.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied to this scrapbook");
        }
        
        return mapToResponse(scrapbook);
    }

    @Transactional
    public ScrapbookResponse createScrapbook(ScrapbookRequest request) {
        User currentUser = userService.getCurrentUser();

        Scrapbook scrapbook = Scrapbook.builder()
                .user(currentUser)
                .title(request.getTitle())
                .description(request.getDescription())
                .canvasData(request.getCanvasData())
                .build();

        Scrapbook saved = scrapbookRepository.save(scrapbook);
        return mapToResponse(saved);
    }

    @Transactional
    public ScrapbookResponse updateScrapbook(Long id, ScrapbookRequest request) {
        User currentUser = userService.getCurrentUser();
        Scrapbook scrapbook = scrapbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scrapbook not found"));

        if (!scrapbook.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied to update this scrapbook");
        }

        scrapbook.setTitle(request.getTitle());
        scrapbook.setDescription(request.getDescription());
        scrapbook.setCanvasData(request.getCanvasData());

        Scrapbook updated = scrapbookRepository.save(scrapbook);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteScrapbook(Long id) {
        User currentUser = userService.getCurrentUser();
        Scrapbook scrapbook = scrapbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scrapbook not found"));

        if (!scrapbook.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied to delete this scrapbook");
        }

        scrapbookRepository.delete(scrapbook);
    }

    private ScrapbookResponse mapToResponse(Scrapbook scrapbook) {
        return ScrapbookResponse.builder()
                .id(scrapbook.getId())
                .userId(scrapbook.getUser().getId())
                .authorName(scrapbook.getUser().getDisplayName() != null ? scrapbook.getUser().getDisplayName() : scrapbook.getUser().getUsername())
                .title(scrapbook.getTitle())
                .description(scrapbook.getDescription())
                .canvasData(scrapbook.getCanvasData())
                .createdAt(scrapbook.getCreatedAt())
                .updatedAt(scrapbook.getUpdatedAt())
                .build();
    }
}
