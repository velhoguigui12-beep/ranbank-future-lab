FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/ranbank-api-0.0.1-SNAPSHOT.jar app.jar
ENV PORT=8080
ENV H2_CONSOLE_ENABLED=false
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

