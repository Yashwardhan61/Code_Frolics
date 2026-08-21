package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.StoredMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoredMediaRepository extends JpaRepository<StoredMedia, String> {
}
