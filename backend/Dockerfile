FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build with prod profile (no embedded MongoDB)
RUN mvn clean package -DskipTests -Pprod

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/crickx-backend-1.0.0.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
