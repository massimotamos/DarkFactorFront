# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY auth-service/pom.xml auth-service/
COPY profile-service/pom.xml profile-service/
COPY portfolio-engine/pom.xml portfolio-engine/
COPY risk-engine/pom.xml risk-engine/
COPY market-data-service/pom.xml market-data-service/
COPY platform-persistence/pom.xml platform-persistence/
COPY platform-rest-api/pom.xml platform-rest-api/
COPY platform-boot/pom.xml platform-boot/
RUN mvn dependency:go-offline -q
COPY . .
RUN mvn package -DskipTests -q

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/platform-boot/target/platform-boot-*.jar app.jar
EXPOSE 8180
ENTRYPOINT ["java", "-jar", "app.jar"]
