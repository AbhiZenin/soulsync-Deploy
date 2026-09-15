FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -r -u 10001 soulsync \
    && mkdir -p /app/uploads \
    && chown -R soulsync:soulsync /app
COPY --from=build /app/target/*.jar app.jar
USER soulsync
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
