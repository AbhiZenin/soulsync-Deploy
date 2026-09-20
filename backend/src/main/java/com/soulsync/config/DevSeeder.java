package com.soulsync.config;

import com.soulsync.domain.*;
import com.soulsync.domain.Enums.*;
import com.soulsync.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DevSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevSeeder.class);
    private static final int DEMO_PROFILE_COUNT = 200;
    private static final String DEMO_PASSWORD = "Password123!";

    private final UserRepository users;
    private final ProfileRepository profiles;
    private final PartnerPreferenceRepository prefs;
    private final SubscriptionRepository subscriptions;
    private final ProfilePhotoRepository profilePhotos;
    private final com.soulsync.storage.PhotoStorageService photoStorage;
    private final PasswordEncoder encoder;

    @Value("${soulsync.seed-demo}")
    boolean seed;

    private static final List<String> MALE_NAMES = List.of(
        "Arjun Reddy", "Aditya Rao", "Karthik Reddy", "Rahul Verma",
        "Vikram Rao", "Rohan Sharma", "Nikhil Reddy", "Siddharth Iyer",
        "Varun Nair", "Akash Patel", "Vivek Kumar", "Sai Kiran",
        "Harsha Reddy", "Abhinav Gupta", "Pranav Menon", "Akhil Rao",
        "Rohit Sharma", "Naveen Kumar", "Vishal Patel", "Surya Teja",
        "Krishna Chaitanya", "Sandeep Reddy", "Manish Verma", "Tarun Rao",
        "Aravind Nair"
    );

    private static final List<String> FEMALE_NAMES = List.of(
        "Ananya Reddy", "Kavya Nair", "Sneha Iyer", "Meera Sharma",
        "Priya Reddy", "Divya Rao", "Aishwarya Nair", "Nandini Reddy",
        "Pooja Sharma", "Sanjana Iyer", "Keerthana Rao", "Neha Patel",
        "Swathi Reddy", "Anjali Menon", "Shruti Verma", "Deepika Rao",
        "Riya Sharma", "Lakshmi Reddy", "Ishita Gupta", "Bhavana Nair",
        "Sravani Reddy", "Harini Rao", "Meghana Iyer", "Tanvi Patel",
        "Nitya Menon"
    );

    private static final List<String[]> LOCATIONS = List.of(
        new String[]{"Dallas", "Texas"},
        new String[]{"Austin", "Texas"},
        new String[]{"Plano", "Texas"},
        new String[]{"Richardson", "Texas"},
        new String[]{"Irving", "Texas"},
        new String[]{"Houston", "Texas"},
        new String[]{"Frisco", "Texas"},
        new String[]{"San Jose", "California"},
        new String[]{"San Francisco", "California"},
        new String[]{"Los Angeles", "California"},
        new String[]{"Seattle", "Washington"},
        new String[]{"Bellevue", "Washington"},
        new String[]{"New York", "New York"},
        new String[]{"Jersey City", "New Jersey"},
        new String[]{"Chicago", "Illinois"},
        new String[]{"Boston", "Massachusetts"},
        new String[]{"Atlanta", "Georgia"},
        new String[]{"Phoenix", "Arizona"},
        new String[]{"Raleigh", "North Carolina"},
        new String[]{"Charlotte", "North Carolina"}
    );

    private static final List<String> EDUCATIONS = List.of(
        "MS Computer Science",
        "MS Data Science",
        "MS Information Systems",
        "MS Electrical Engineering",
        "MS Business Analytics",
        "MBA",
        "B.Tech Computer Science",
        "B.Tech Information Technology",
        "Master of Engineering",
        "Master of Finance"
    );

    private static final List<String> OCCUPATIONS = List.of(
        "Software Engineer",
        "Data Analyst",
        "Data Engineer",
        "Product Manager",
        "Business Analyst",
        "Cloud Engineer",
        "DevOps Engineer",
        "Machine Learning Engineer",
        "Financial Analyst",
        "Cybersecurity Engineer",
        "Solutions Architect",
        "Consultant",
        "Research Engineer",
        "QA Engineer",
        "Systems Engineer"
    );

    private static final List<String> TONGUES = List.of(
        "Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"
    );

    private static final List<String> DIETS = List.of(
        "Vegetarian", "Non-Vegetarian", "Vegetarian", "Non-Vegetarian"
    );

    private static final List<String> ABOUT = List.of(
        "Family-oriented and ambitious, with a positive outlook on life. Looking for a kind and compatible life partner.",
        "I enjoy traveling, trying new food and spending time with family. I value honesty, communication and mutual respect.",
        "Career-focused but strongly connected to family values. Looking for someone with whom I can build a happy and supportive life.",
        "Easygoing, thoughtful and optimistic. I enjoy fitness, movies, weekend trips and meaningful conversations.",
        "I believe a strong relationship is built on friendship, trust and respect. Looking for someone with similar values.",
        "I enjoy exploring new places, staying active and spending time with friends and family. Looking for a genuine life partner.",
        "Independent, caring and family-oriented. I value personal growth, kindness and a good sense of humor.",
        "A technology professional who enjoys travel, music and staying active. Looking for a supportive and understanding partner."
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seed) {
            log.info("SoulSync demo seeding is disabled");
            return;
        }

        log.info("Preparing {} fictional SoulSync demo profiles", DEMO_PROFILE_COUNT);

        for (int i = 1; i <= DEMO_PROFILE_COUNT; i++) {
            seedDemoUser(i);
        }

        seedAdmin();

        log.info(
            "SoulSync demo seeding complete: {} fictional profiles available",
            DEMO_PROFILE_COUNT
        );
    }

    private void seedDemoUser(int index) {
        boolean male = index % 2 == 1;

        List<String> names = male ? MALE_NAMES : FEMALE_NAMES;

        String name = names.get(((index - 1) / 2) % names.size());
        String gender = male ? "MALE" : "FEMALE";

        String email = String.format("demo-%03d@soulsync.dev", index);

        int age = 24 + ((index * 7) % 12);
        int height = male
            ? 165 + ((index * 3) % 22)
            : 152 + ((index * 3) % 22);

        String[] location = LOCATIONS.get((index * 7) % LOCATIONS.size());

        String tongue = TONGUES.get((index * 3) % TONGUES.size());
        String education = EDUCATIONS.get((index * 5) % EDUCATIONS.size());
        String occupation = OCCUPATIONS.get((index * 7) % OCCUPATIONS.size());
        String diet = DIETS.get((index * 11) % DIETS.size());
        String about = ABOUT.get((index * 13) % ABOUT.size());

        User user = users.findByEmailIgnoreCase(email)
            .orElseGet(() -> User.builder().email(email).build());

        user.setPasswordHash(encoder.encode(DEMO_PASSWORD));
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(Role.USER);

        User savedUser = users.save(user);

        Profile profile = profiles.findByUserId(savedUser.getId())
            .orElseGet(() -> Profile.builder().user(savedUser).build());

        profile.setDisplayName(name);
        profile.setDateOfBirth(
            LocalDate.now()
                .minusYears(age)
                .minusMonths((index * 5) % 12)
                .minusDays((index * 3) % 25)
        );

        profile.setGender(gender);
        profile.setHeightCm(height);
        profile.setMaritalStatus("Never Married");
        profile.setMotherTongue(tongue);
        profile.setReligion("Hindu");
        profile.setCountry("USA");
        profile.setState(location[1]);
        profile.setCity(location[0]);
        profile.setEducation(education);
        profile.setOccupation(occupation);
        profile.setDiet(diet);
        profile.setAbout(about);
        profile.setCompletionPercent(90);

        profiles.save(profile);

        PartnerPreference preference = prefs.findByUserId(savedUser.getId())
            .orElseGet(() ->
                PartnerPreference.builder()
                    .user(savedUser)
                    .build()
            );

        if (male) {
            preference.setMinAge(Math.max(21, age - 5));
            preference.setMaxAge(age + 2);
        } else {
            preference.setMinAge(Math.max(21, age - 2));
            preference.setMaxAge(age + 5);
        }

        preference.setCountry("USA");
        preference.setReligion("Hindu");

        // Give some profiles a state preference while allowing others
        // to match across the USA.
        if (index % 3 == 0) {
            preference.setState(location[1]);
        } else {
            preference.setState(null);
        }

        prefs.save(preference);

        Subscription subscription = subscriptions
            .findByUserId(savedUser.getId())
            .orElseGet(() ->
                Subscription.builder()
                    .user(savedUser)
                    .build()
            );

        subscription.setPlan(
            index % 20 == 0
                ? Plan.PREMIUM_PLUS
                : index % 10 == 0
                    ? Plan.PREMIUM
                    : Plan.FREE
        );

        subscriptions.save(subscription);

        seedDemoPhoto(savedUser, index);
    }


    private void seedDemoPhoto(User user, int index) {
        // Do not create duplicates when the backend restarts.
        if (!profilePhotos
                .findByUserIdOrderBySortOrderAsc(user.getId())
                .isEmpty()) {
            return;
        }

        // 40 fictional portraits are reused deterministically
        // across the 200 fictional demo accounts.
        int photoNumber = ((index - 1) % 40) + 1;

        String filename =
                String.format("demo-%03d.jpg", photoNumber);

        String resourcePath =
                "demo-photos/" + filename;

        String storageKey = null;

        try {
            ClassPathResource resource =
                    new ClassPathResource(resourcePath);

            if (!resource.exists()) {
                log.warn(
                        "Demo portrait not found: {}",
                        resourcePath
                );
                return;
            }

            byte[] data;

            try (var input = resource.getInputStream()) {
                data = input.readAllBytes();
            }

            storageKey = photoStorage.store(
                    data,
                    "jpg",
                    user.getId()
            );

            UUID photoId = UUID.randomUUID();

            ProfilePhoto photo = ProfilePhoto.builder()
                    .id(photoId)
                    .user(user)
                    .storageKey(storageKey)
                    .url(
                        "/api/v1/photos/"
                        + photoId
                        + "/content"
                    )
                    .sortOrder(0)
                    .primary(true)
                    .visibility(PhotoVisibility.PUBLIC)
                    .originalFilename(filename)
                    .contentType("image/jpeg")
                    .fileSize((long) data.length)
                    .moderationStatus(
                        PhotoModerationStatus.APPROVED
                    )
                    .build();

            profilePhotos.save(photo);

        } catch (IOException e) {
            cleanupDemoPhoto(storageKey);

            log.warn(
                    "Could not seed demo portrait for {}",
                    user.getEmail(),
                    e
            );

        } catch (RuntimeException e) {
            cleanupDemoPhoto(storageKey);
            throw e;
        }
    }

    private void cleanupDemoPhoto(String storageKey) {
        if (storageKey == null) {
            return;
        }

        try {
            photoStorage.delete(storageKey);
        } catch (IOException e) {
            log.warn(
                    "Could not clean up demo photo {}",
                    storageKey,
                    e
            );
        }
    }

    private void seedAdmin() {
        User admin = users.findByEmailIgnoreCase("admin@soulsync.dev")
            .orElseGet(() ->
                User.builder()
                    .email("admin@soulsync.dev")
                    .build()
            );

        admin.setPasswordHash(encoder.encode("Admin123!"));
        admin.setEmailVerified(true);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setRole(Role.ADMIN);

        User savedAdmin = users.save(admin);

        Profile profile = profiles.findByUserId(savedAdmin.getId())
            .orElseGet(() ->
                Profile.builder()
                    .user(savedAdmin)
                    .build()
            );

        profile.setDisplayName("SoulSync Admin");
        profile.setVisibility(ProfileVisibility.HIDDEN);

        profiles.save(profile);

        if (prefs.findByUserId(savedAdmin.getId()).isEmpty()) {
            prefs.save(
                PartnerPreference.builder()
                    .user(savedAdmin)
                    .build()
            );
        }

        Subscription subscription = subscriptions
            .findByUserId(savedAdmin.getId())
            .orElseGet(() ->
                Subscription.builder()
                    .user(savedAdmin)
                    .build()
            );

        subscription.setPlan(Plan.PREMIUM_PLUS);
        subscriptions.save(subscription);
    }
}
