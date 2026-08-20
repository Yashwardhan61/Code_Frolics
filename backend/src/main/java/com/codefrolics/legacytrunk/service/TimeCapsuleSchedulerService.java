package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.model.Story;
import com.codefrolics.legacytrunk.model.StoryShare;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.NotificationRepository;
import com.codefrolics.legacytrunk.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeCapsuleSchedulerService {

    private final StoryRepository storyRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 30000) // Runs every 30 seconds
    @Transactional
    public void checkUnlockingStories() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Check stories unlocking today
        checkRevealDayStories(now);

        // 2. Find stories unlocking within the next 2 minutes
        LocalDateTime twoMinutesFromNow = now.plusMinutes(2);
        List<Story> soonUnlockingStories = storyRepository.findByUnlockDateTimeBetween(now, twoMinutesFromNow);

        for (Story story : soonUnlockingStories) {
            // Notify owner
            notifyUser(story.getUser(), story);

            // Notify all users the story is shared with
            if (story.getShares() != null) {
                for (StoryShare share : story.getShares()) {
                    if (share.getSharedWithUser() != null) {
                        notifyUser(share.getSharedWithUser(), story);
                    }
                }
            }
        }
    }

    private void checkRevealDayStories(LocalDateTime now) {
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = now.toLocalDate().atTime(23, 59, 59, 999999999);

        List<Story> todayStories = storyRepository.findByUnlockDateTimeBetween(startOfToday, endOfToday);

        for (Story story : todayStories) {
            // Notify owner
            notifyUserForRevealDay(story.getUser(), story);

            // Notify shared users
            if (story.getShares() != null) {
                for (StoryShare share : story.getShares()) {
                    if (share.getSharedWithUser() != null) {
                        notifyUserForRevealDay(share.getSharedWithUser(), story);
                    }
                }
            }
        }
    }

    private void notifyUserForRevealDay(User user, Story story) {
        String type = "time_capsule_reveal_day";
        boolean alreadyNotified = notificationRepository.existsByUserIdAndStoryIdAndType(user.getId(), story.getId(), type);

        if (!alreadyNotified) {
            String timeFormatted = story.getUnlockDateTime().toLocalTime().toString().substring(0, 5); // HH:mm
            notificationService.createNotification(
                    user,
                    type,
                    "Time Capsule Unlocks Today! 📅",
                    "Today is the day! The memory '" + story.getTitle() + "' is set to reveal itself today at " + timeFormatted + ".",
                    story,
                    "/story/" + story.getId()
            );
            log.info("Created time capsule reveal day notification for user: {} and story: {}", user.getEmail(), story.getId());
        }
    }

    private void notifyUser(User user, Story story) {
        String type = "time_capsule_warning";
        boolean alreadyNotified = notificationRepository.existsByUserIdAndStoryIdAndType(user.getId(), story.getId(), type);

        if (!alreadyNotified) {
            notificationService.createNotification(
                    user,
                    type,
                    "Time Capsule Unlocking Soon 🔒",
                    "The memory '" + story.getTitle() + "' will reveal itself in less than 2 minutes!",
                    story,
                    "/story/" + story.getId()
            );
            log.info("Created time capsule unlock warning notification for user: {} and story: {}", user.getEmail(), story.getId());
        }
    }
}
