# Run Spring Boot BE (dev mode)
# Usage: .\run.ps1 [DB_PASSWORD=xxx]

param(
    [string]$DbUrl      = "jdbc:mariadb://localhost:3306/ai_hackathon",
    [string]$DbUsername = "root",
    [string]$DbPassword = "",
    [string]$JwtSecret  = "change-me-in-production-must-be-at-least-32-characters-long",
    [string]$Profile    = "local"
)

$env:DB_URL      = $DbUrl
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword
$env:JWT_SECRET  = $JwtSecret

Write-Host "Starting BE on http://localhost:8080 (profile=$Profile)" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan

Set-Location $PSScriptRoot
./mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=$Profile"
