# Run Application Guide (Step by Step)

This guide runs your **Spring Boot backend + React frontend** for Module A.

## 1) Prerequisites

- Java 17+ installed
- Node.js 18+ and npm installed
- Project path: `e:\PAF assigmeny\resource-service`

## 2) Run Backend (Fastest: H2 mode)

Open a Command Prompt (cmd):

```cmd
cd "D:\PAF\resource-service\resource-service"
set SPRING_PROFILES_ACTIVE=local
.\mvnw spring-boot:run
```

Or run both commands in one line:

```cmd
cd "D:\PAF\resource-service\resource-service" && set SPRING_PROFILES_ACTIVE=local && .\mvnw spring-boot:run
```

Backend starts at:

- `http://localhost:8082`

H2 console:

- `http://localhost:8082/h2-console`
- JDBC URL: `jdbc:h2:file:./data/resource_catalogue`
- User: `sa`
- Password: *(empty)*

SELECT * FROM RESOURCES;


Note:
- H2 is now file-based in local profile, so data survives backend restarts.
- DB files are created under `e:\PAF assigmeny\resource-service\data\`.

## 3) Verify Backend

Open another Command Prompt:

```cmd
curl http://localhost:8082/api/v1/resources
```

Or using PowerShell:

```powershell
Invoke-WebRequest http://localhost:8082/api/v1/resources
```

If it returns status `200`, backend is running correctly.

## 4) Run Frontend

Open another PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the printed URL in browser (usually):

- `http://localhost:3000`
- or `http://localhost:3001` (if 3000 is busy)

## 5) Test Full Flow

1. Open frontend page.
2. Add a resource from the **Add Resource** form.
3. Edit a row using **Edit**.
4. Delete a row using **Delete**.
5. Use filters and search.
6. Check data in H2 console:

```sql
SELECT * FROM RESOURCES ORDER BY ID;
```

## 6) Stop Application

- Backend terminal: `Ctrl + C`
- Frontend terminal: `Ctrl + C`

## 7) Optional: Run with MySQL instead of H2

Use default profile (no `SPRING_PROFILES_ACTIVE=local`) and ensure MySQL is running on `localhost:3306` with valid credentials from `src/main/resources/application.yaml`.

```powershell
cd "e:\PAF assigmeny\resource-service"
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
.\mvnw spring-boot:run
```
