package com.soulsync.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(
        name = "soulsync.storage.provider",
        havingValue = "cloudinary"
)
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(
            @Value(
                "${soulsync.storage.cloudinary.cloud-name}"
            )
            String cloudName,

            @Value(
                "${soulsync.storage.cloudinary.api-key}"
            )
            String apiKey,

            @Value(
                "${soulsync.storage.cloudinary.api-secret}"
            )
            String apiSecret
    ) {

        if (cloudName == null
                || cloudName.isBlank()
                || apiKey == null
                || apiKey.isBlank()
                || apiSecret == null
                || apiSecret.isBlank()) {

            throw new IllegalStateException(
                    "Cloudinary configuration is incomplete"
            );
        }

        return new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name",
                        cloudName,

                        "api_key",
                        apiKey,

                        "api_secret",
                        apiSecret,

                        "secure",
                        true
                )
        );
    }
}