FROM eclipse-temurin:21-jre
WORKDIR /opt/darkfactor
COPY platform-boot/target/platform-boot-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/opt/darkfactor/app.jar"]
