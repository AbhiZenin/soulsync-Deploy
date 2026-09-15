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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DevSeeder implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(DevSeeder.class);

  private final UserRepository users;
  private final ProfileRepository profiles;
  private final PartnerPreferenceRepository prefs;
  private final SubscriptionRepository subscriptions;
  private final PasswordEncoder encoder;

  @Value("${soulsync.seed-demo}")
  boolean seed;

  record Demo(
      String email,
      String name,
      String gender,
      int age,
      int height,
      String city,
      String state,
      String country,
      String religion,
      String tongue,
      String education,
      String occupation,
      String diet,
      String phone) {}

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (!seed) {
      log.info("SoulSync demo seeding is disabled");
      return;
    }

    List<Demo> demos = List.of(
        new Demo("arjun@soulsync.dev", "Arjun Rao", "MALE", 29, 178, "Dallas", "Texas", "USA", "Hindu", "Telugu", "MS Computer Science", "Software Engineer", "Non-Vegetarian", "+15550000001"),
        new Demo("ananya@soulsync.dev", "Ananya Reddy", "FEMALE", 26, 165, "Austin", "Texas", "USA", "Hindu", "Telugu", "MS Data Science", "Data Analyst", "Vegetarian", "+15550000002"),
        new Demo("meera@soulsync.dev", "Meera Sharma", "FEMALE", 28, 162, "Irving", "Texas", "USA", "Hindu", "Hindi", "MBA", "Product Manager", "Vegetarian", "+15550000003"),
        new Demo("kavya@soulsync.dev", "Kavya Nair", "FEMALE", 27, 168, "Plano", "Texas", "USA", "Hindu", "Malayalam", "MS Information Systems", "Business Analyst", "Non-Vegetarian", "+15550000004"),
        new Demo("rahul@soulsync.dev", "Rahul Verma", "MALE", 30, 181, "Houston", "Texas", "USA", "Hindu", "Hindi", "MS Electrical Engineering", "Engineer", "Vegetarian", "+15550000005"),
        new Demo("sneha@soulsync.dev", "Sneha Iyer", "FEMALE", 25, 160, "Richardson", "Texas", "USA", "Hindu", "Tamil", "MS Computer Science", "Software Developer", "Vegetarian", "+15550000006")
    );

    for (Demo demo : demos) {
      seedDemoUser(demo);
    }
    seedAdmin();
    log.info("SoulSync demo accounts are ready. Sign in with ananya@soulsync.dev / Password123!");
  }

  private void seedDemoUser(Demo x) {
    User u = users.findByEmailIgnoreCase(x.email()).orElseGet(() -> User.builder().email(x.email()).build());
    // Demo credentials are deterministic only when SEED_DEMO=true.
    u.setPasswordHash(encoder.encode("Password123!"));
    u.setEmailVerified(true);
    u.setPhoneNumber(x.phone());
    u.setPhoneVerified(true);
    u.setStatus(UserStatus.ACTIVE);
    u.setRole(Role.USER);
    final User savedUser = users.save(u);

    Profile p = profiles.findByUserId(savedUser.getId()).orElseGet(() -> Profile.builder().user(savedUser).build());
    p.setDisplayName(x.name());
    p.setDateOfBirth(LocalDate.now().minusYears(x.age()).minusMonths(3));
    p.setGender(x.gender());
    p.setHeightCm(x.height());
    p.setMaritalStatus("Never Married");
    p.setMotherTongue(x.tongue());
    p.setReligion(x.religion());
    p.setCountry(x.country());
    p.setState(x.state());
    p.setCity(x.city());
    p.setEducation(x.education());
    p.setOccupation(x.occupation());
    p.setDiet(x.diet());
    p.setAbout("Looking for a kind, compatible life partner who values family, growth and mutual respect.");
    p.setCompletionPercent(90);
    profiles.save(p);

    PartnerPreference pref = prefs.findByUserId(savedUser.getId()).orElseGet(() -> PartnerPreference.builder().user(savedUser).build());
    pref.setMinAge(24);
    pref.setMaxAge(34);
    pref.setCountry("USA");
    pref.setState("Texas");
    pref.setReligion("Hindu");
    prefs.save(pref);

    Subscription sub = subscriptions.findByUserId(savedUser.getId()).orElseGet(() -> Subscription.builder().user(savedUser).build());
    sub.setPlan(Plan.FREE);
    subscriptions.save(sub);
  }

  private void seedAdmin() {
    User admin = users.findByEmailIgnoreCase("admin@soulsync.dev")
        .orElseGet(() -> User.builder().email("admin@soulsync.dev").build());
    admin.setPasswordHash(encoder.encode("Admin123!"));
    admin.setEmailVerified(true);
    admin.setPhoneNumber("+15550000999");
    admin.setPhoneVerified(true);
    admin.setStatus(UserStatus.ACTIVE);
    admin.setRole(Role.ADMIN);
    final User savedAdmin = users.save(admin);

    Profile profile = profiles.findByUserId(savedAdmin.getId()).orElseGet(() -> Profile.builder().user(savedAdmin).build());
    profile.setDisplayName("SoulSync Admin");
    profile.setVisibility(ProfileVisibility.HIDDEN);
    profiles.save(profile);

    if (prefs.findByUserId(savedAdmin.getId()).isEmpty()) {
      prefs.save(PartnerPreference.builder().user(savedAdmin).build());
    }
    Subscription sub = subscriptions.findByUserId(savedAdmin.getId()).orElseGet(() -> Subscription.builder().user(savedAdmin).build());
    sub.setPlan(Plan.PREMIUM_PLUS);
    subscriptions.save(sub);
  }
}
