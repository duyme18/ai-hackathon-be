@echo off
REM Run Spring Boot BE (dev mode)
REM Edit env vars below or set them before calling this script

if "%DB_URL%"==""      set DB_URL=jdbc:mariadb://localhost:3306/ai_hackathon
if "%DB_USERNAME%"=="" set DB_USERNAME=root
if "%DB_PASSWORD%"=="" set DB_PASSWORD=
if "%JWT_SECRET%"==""  set JWT_SECRET=change-me-in-production-must-be-at-least-32-characters-long

echo Starting BE on http://localhost:8080
echo Swagger: http://localhost:8080/swagger-ui.html

cd /d "%~dp0"
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
