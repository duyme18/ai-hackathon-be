---
description: "Chạy SonarQube scan FE/BE và trả link kết quả. Dùng: /sonar-scan [fe|be]"
allowed-tools: Bash, Read
---

# /sonar-scan — Chạy SonarQube Scan và Trả Link

**Target (optional):** $ARGUMENTS
(để trống → scan cả BE + FE, "be" → chỉ BE, "fe" → chỉ FE)

## Cấu hình
- Server: https://scan.gem-corp.tech
- Project key: Tendoo-Web-ReactJS
- Token: `squ_afc801b2f7ee5f5081279149b852b05d104727ee`

## Scan FE (TypeScript/React)

Chạy nếu `$ARGUMENTS` là "fe" hoặc trống:

**Bước 1 — Generate coverage:**
```bash
cd "C:/Users/AD/Desktop/GEM WORK/ai-hackathon-be/fe" && npm run test:coverage
```

**Bước 2 — Scan với coverage:**
```bash
cd "C:/Users/AD/Desktop/GEM WORK/ai-hackathon-be/fe" && npx sonar-scanner \
  "-Dsonar.host.url=https://scan.gem-corp.tech" \
  "-Dsonar.token=squ_afc801b2f7ee5f5081279149b852b05d104727ee" \
  "-Dsonar.projectKey=Tendoo-Web-ReactJS" \
  "-Dsonar.projectName=Tendoo Web ReactJS" \
  "-Dsonar.sources=src" \
  "-Dsonar.exclusions=node_modules/**,dist/**,src/test/**" \
  "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info" \
  "-Dsonar.coverage.exclusions=src/components/ui/**,src/main.tsx,src/router.tsx,src/types/**"
```

## Scan BE (Java/Maven)

Chạy nếu `$ARGUMENTS` là "be" hoặc trống:

```bash
cd "C:/Users/AD/Desktop/GEM WORK/ai-hackathon-be/be" && ./mvnw sonar:sonar \
  -Dsonar.host.url=https://scan.gem-corp.tech \
  "-Dsonar.token=squ_afc801b2f7ee5f5081279149b852b05d104727ee" \
  -Dsonar.projectKey=Tendoo-Web-ReactJS \
  "-Dsonar.projectName=Tendoo Web ReactJS" \
  -DskipTests
```

## Output sau khi scan xong

```
✅ Scan hoàn thành!

🔗 Xem kết quả tại:
https://scan.gem-corp.tech/dashboard?id=Tendoo-Web-ReactJS

📊 Issues trực tiếp:
https://scan.gem-corp.tech/project/issues?id=Tendoo-Web-ReactJS&resolved=false

⚠️  Server cần ~1-2 phút xử lý — F5 lại nếu chưa thấy kết quả mới.
```
