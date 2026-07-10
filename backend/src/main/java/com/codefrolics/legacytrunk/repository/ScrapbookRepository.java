package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Scrapbook;
import com.codefrolics.legacytrunk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrapbookRepository extends JpaRepository<Scrapbook, Long> {
    List<Scrapbook> findByUserOrderByUpdatedAtDesc(User user);
}
