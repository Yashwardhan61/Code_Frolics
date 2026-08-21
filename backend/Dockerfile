# Multi-stage Dockerfile for Spring Boot backend
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080 10000

# Tuned for Render Free Tier (512MB RAM limit) with fast startup
ENV JAVA_OPTS="-Xms128m -Xmx300m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
