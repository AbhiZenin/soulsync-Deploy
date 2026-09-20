package com.soulsync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class CoreFlowIntegrationTest {

  @Container
  static final PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:17-alpine")
          .withDatabaseName("soulsync_test")
          .withUsername("soulsync")
          .withPassword("soulsync_test");

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry registry) {
    registry.add(
        "spring.datasource.url",
        postgres::getJdbcUrl
    );

    registry.add(
        "spring.datasource.username",
        postgres::getUsername
    );

    registry.add(
        "spring.datasource.password",
        postgres::getPassword
    );

    registry.add(
        "soulsync.dev-mode",
        () -> "true"
    );

    registry.add(
        "soulsync.seed-demo",
        () -> "false"
    );

    registry.add(
        "soulsync.mail-enabled",
        () -> "false"
    );

    registry.add(
        "soulsync.jwt.secret",
        () ->
            "test-only-secret-that-is-at-least-thirty-two-bytes-long"
    );
  }

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper json;

  @Test
  void coreMatrimonialJourneyWorksEndToEnd()
      throws Exception {

    Account alice = registerVerifyAndLogin(
        "alice@soulsync.test",
        "Alice Test",
        "Password123!"
    );

    Account bob = registerVerifyAndLogin(
        "bob@soulsync.test",
        "Bob Test",
        "Password123!"
    );

    updateProfile(
        alice.accessToken(),
        "Alice Test",
        "FEMALE",
        "Austin"
    );

    updateProfile(
        bob.accessToken(),
        "Bob Test",
        "MALE",
        "Dallas"
    );

    String interestBody =
        mvc.perform(
                post(
                    "/api/v1/interests/{targetId}",
                    bob.userId()
                )
                    .header(
                        "Authorization",
                        bearer(alice.accessToken())
                    )
            )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.status")
                    .value("PENDING")
            )
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID interestId =
        UUID.fromString(
            json.readTree(interestBody)
                .get("id")
                .asText()
        );

    mvc.perform(
            patch(
                "/api/v1/interests/{id}/accept",
                interestId
            )
                .header(
                    "Authorization",
                    bearer(bob.accessToken())
                )
        )
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.status")
                .value("ACCEPTED")
        );

    String conversationBody =
        mvc.perform(
                post(
                    "/api/v1/conversations/with/{targetId}",
                    bob.userId()
                )
                    .header(
                        "Authorization",
                        bearer(alice.accessToken())
                    )
            )
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID conversationId =
        UUID.fromString(
            json.readTree(conversationBody)
                .get("id")
                .asText()
        );

    mvc.perform(
            post(
                "/api/v1/conversations/{id}/messages",
                conversationId
            )
                .header(
                    "Authorization",
                    bearer(alice.accessToken())
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(
                    "{\"body\":\"Hello from the integration test\"}"
                )
        )
        .andExpect(status().isCreated())
        .andExpect(
            jsonPath("$.body")
                .value(
                    "Hello from the integration test"
                )
        );

    mvc.perform(
            get(
                "/api/v1/conversations/{id}/messages",
                conversationId
            )
                .header(
                    "Authorization",
                    bearer(bob.accessToken())
                )
        )
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$[0].body")
                .value(
                    "Hello from the integration test"
                )
        );

    mvc.perform(
            post(
                "/api/v1/blocks/{targetId}",
                bob.userId()
            )
                .header(
                    "Authorization",
                    bearer(alice.accessToken())
                )
        )
        .andExpect(status().isOk());

    mvc.perform(
            post(
                "/api/v1/conversations/{id}/messages",
                conversationId
            )
                .header(
                    "Authorization",
                    bearer(bob.accessToken())
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(
                    "{\"body\":\"This must be rejected\"}"
                )
        )
        .andExpect(status().isForbidden());
  }

  private Account registerVerifyAndLogin(
      String email,
      String displayName,
      String password
  ) throws Exception {

    String registerBody =
        mvc.perform(
                post("/api/v1/auth/register")
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        json.writeValueAsString(
                            new Register(
                                email,
                                password,
                                displayName
                            )
                        )
                    )
            )
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

    JsonNode registration =
        json.readTree(registerBody);

    UUID userId =
        UUID.fromString(
            registration
                .get("userId")
                .asText()
        );

    String verificationCode =
        registration
            .get("devVerificationCode")
            .asText();

    assertThat(verificationCode)
        .matches("\\d{6}");

    mvc.perform(
            post("/api/v1/auth/verify-email")
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(
                    json.writeValueAsString(
                        new VerifyEmail(
                            email,
                            verificationCode
                        )
                    )
                )
        )
        .andExpect(status().isOk());

    String loginBody =
        mvc.perform(
                post("/api/v1/auth/login")
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        json.writeValueAsString(
                            new Login(
                                email,
                                password
                            )
                        )
                    )
            )
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    String accessToken =
        json.readTree(loginBody)
            .get("accessToken")
            .asText();

    assertThat(accessToken)
        .isNotBlank();

    /*
     * Email verification is now the only required
     * account verification step.
     */
    mvc.perform(
            get("/api/v1/account/me")
                .header(
                    "Authorization",
                    bearer(accessToken)
                )
        )
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.emailVerified")
                .value(true)
        );

    return new Account(
        userId,
        accessToken
    );
  }

  private void updateProfile(
      String accessToken,
      String name,
      String gender,
      String city
  ) throws Exception {

    String body = """
        {
          "displayName":"%s",
          "dateOfBirth":"1998-05-10",
          "gender":"%s",
          "heightCm":170,
          "maritalStatus":"Never Married",
          "motherTongue":"Telugu",
          "religion":"Hindu",
          "community":"",
          "country":"USA",
          "state":"Texas",
          "city":"%s",
          "education":"MS Computer Science",
          "occupation":"Software Engineer",
          "incomeRange":"$80k-$120k",
          "diet":"Vegetarian",
          "smoking":"No",
          "drinking":"No",
          "about":"Integration test profile",
          "profileCreatedBy":"SELF",
          "visibility":"MEMBERS"
        }
        """.formatted(
            name,
            gender,
            city
        );

    mvc.perform(
            put("/api/v1/profile/me")
                .header(
                    "Authorization",
                    bearer(accessToken)
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(body)
        )
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.city")
                .value(city)
        );
  }

  private String bearer(String token) {
    return "Bearer " + token;
  }

  record Register(
      String email,
      String password,
      String displayName
  ) {}

  record Login(
      String email,
      String password
  ) {}

  record VerifyEmail(
      String email,
      String code
  ) {}

  record Account(
      UUID userId,
      String accessToken
  ) {}
}