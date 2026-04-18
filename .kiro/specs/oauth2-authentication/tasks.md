# Tasks: OAuth2 Authentication & Authorization (Module E)

## Implementation Tasks

- [x] 1. Backend: Project Setup & Security Foundation
  - [x] 1.1 Add Spring Security, JJWT, and OAuth2 client dependencies to `pom.xml`
  - [x] 1.2 Create `AppUser` entity with `id`, `email`, `name`, `pictureUrl`, `googleSub`, `role`, `active`, `createdAt`, `updatedAt` fields
  - [x] 1.3 Create `Role` enum with values `USER`, `ADMIN`, `TECHNICIAN`, `MANAGER`
  - [x] 1.4 Create `RefreshToken` entity with `id`, `user`, `tokenHash`, `expiresAt`, `revoked`, `createdAt` fields
  - [x] 1.5 Create JPA repositories for `AppUser` and `RefreshToken`
  - [x] 1.6 Configure `SecurityConfig`: stateless session, CORS, CSRF disabled, public routes for `/api/auth/**`

- [x] 2. Backend: JWT Service
  - [x] 2.1 Implement `JwtService.generateAccessToken()` — embed `sub`, `email`, `roles`, `iat`, `exp` (15 min), sign with HMAC-SHA256
  - [x] 2.2 Implement `JwtService.generateRefreshToken()` — random UUID-based token, 7-day expiry
  - [x] 2.3 Implement `JwtService.validateToken()` — verify signature and expiry, return boolean
  - [x] 2.4 Implement `JwtService.extractSubject()` and `JwtService.extractRoles()` claim parsers
  - [x] 2.5 Load `JWT_SECRET` from environment variable; fail fast on startup if missing or < 32 chars

- [x] 3. Backend: JWT Auth Filter
  - [x] 3.1 Implement `JwtAuthFilter extends OncePerRequestFilter` — extract Bearer token from `Authorization` header
  - [x] 3.2 On valid token: load user details and populate `SecurityContextHolder`
  - [x] 3.3 On invalid/missing token: clear context and continue filter chain (let Spring Security handle 401)
  - [x] 3.4 Register `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter` in `SecurityConfig`

- [x] 4. Backend: User Service
  - [x] 4.1 Implement `UserService.findOrCreateUser()` — lookup by `googleSub`, create with `role=USER` if not found, update `name`/`pictureUrl` if found
  - [x] 4.2 Implement `UserService.findById()` for loading user details in filter
  - [x] 4.3 Implement `UserService.updateRole()` for admin role management
  - [x] 4.4 Implement `UserService.findAllByRole()` for admin user listing

- [x] 5. Backend: Refresh Token Service
  - [x] 5.1 Implement `RefreshTokenService.save()` — persist SHA-256 hash of raw token with expiry
  - [x] 5.2 Implement `RefreshTokenService.validate()` — lookup by hash, check revoked and expiry
  - [x] 5.3 Implement `RefreshTokenService.rotate()` — revoke old token, persist new token hash
  - [x] 5.4 Implement `RefreshTokenService.revokeAllForUser()` — for reuse detection response

- [x] 6. Backend: Auth Controller
  - [x] 6.1 Implement `POST /api/auth/callback` — accept `{ code, redirectUri }`, exchange with Google, call `findOrCreateUser`, issue JWT + refresh token cookie
  - [x] 6.2 Implement `POST /api/auth/refresh` — read `refreshToken` cookie, validate, rotate, return new access token
  - [x] 6.3 Implement `POST /api/auth/logout` — revoke refresh token, clear cookie with `Max-Age=0`
  - [x] 6.4 Implement `GET /api/auth/me` — return current user info from `SecurityContext`
  - [x] 6.5 Implement global exception handler for `OAuthException`, `UnauthorizedException`, `AccessDeniedException` returning proper error JSON

- [x] 7. Backend: Admin Endpoints
  - [x] 7.1 Implement `PUT /api/admin/users/{userId}/role` secured with `@PreAuthorize("hasRole('ADMIN')")`
  - [x] 7.2 Implement `GET /api/admin/users` — list all users, secured with `@PreAuthorize("hasRole('ADMIN')")`

- [x] 8. Backend: Google OAuth2 Client
  - [x] 8.1 Implement `GoogleOAuthClient.exchangeCode()` — POST to `https://oauth2.googleapis.com/token`
  - [x] 8.2 Implement `GoogleOAuthClient.getUserInfo()` — GET `https://www.googleapis.com/oauth2/v3/userinfo`
  - [x] 8.3 Load `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from environment variables

- [x] 9. Frontend: Auth Infrastructure
  - [x] 9.1 Create `AuthContext` with `user`, `accessToken`, `isAuthenticated`, `isLoading`, `login`, `logout`, `refreshToken`
  - [x] 9.2 Implement `login()` — redirect to `GET /api/auth/google` (or construct Google OAuth URL directly)
  - [x] 9.3 Implement `/auth/callback` route handler — POST code to `/api/auth/callback`, store access token in memory, update context
  - [x] 9.4 Implement `logout()` — call `POST /api/auth/logout`, clear in-memory token, redirect to `/login`
  - [x] 9.5 Wrap app in `AuthProvider`; restore session on page load via `GET /api/auth/me` using refresh token cookie

- [x] 10. Frontend: Axios API Client
  - [x] 10.1 Create `apiClient` Axios instance with base URL from env var
  - [x] 10.2 Add request interceptor to attach `Authorization: Bearer <token>` from in-memory store
  - [x] 10.3 Add response interceptor to handle `401`: attempt token refresh, retry original request, redirect to `/login` on refresh failure
  - [x] 10.4 Implement request queue to prevent multiple simultaneous refresh calls

- [x] 11. Frontend: Route Guards
  - [x] 11.1 Implement `PrivateRoute` component — redirect unauthenticated users to `/login` preserving `from` state
  - [x] 11.2 Add `requiredRoles` prop to `PrivateRoute` — redirect role-insufficient users to `/unauthorized`
  - [x] 11.3 Create `/unauthorized` page component
  - [x] 11.4 Wrap all protected routes in `PrivateRoute` in the React Router config
  - [x] 11.5 Apply role-specific guards: `ADMIN`-only routes, `TECHNICIAN`/`MANAGER` routes

- [x] 12. Frontend: Login UI
  - [x] 12.1 Create `/login` page with "Sign in with Google" button
  - [x] 12.2 Show loading state during OAuth redirect and callback processing
  - [x] 12.3 Display error message if OAuth callback returns an error

- [x] 13. Testing
  - [x] 13.1 Unit test `JwtService`: valid token, expired token, tampered token, claim extraction
  - [x] 13.2 Unit test `UserService.findOrCreateUser()`: new user, returning user, deactivated user
  - [x] 13.3 Unit test `RefreshTokenService`: rotation, reuse detection, expiry
  - [x] 13.4 Unit test `JwtAuthFilter`: valid token populates context, invalid token clears context
  - [x] 13.5 Integration test `POST /api/auth/callback` with WireMock stubbing Google endpoints
  - [x] 13.6 Integration test `POST /api/auth/refresh`: valid rotation, reuse detection
  - [x] 13.7 Integration test role enforcement: 200 for correct role, 403 for insufficient role, 401 for no token
  - [x] 13.8 Unit test `PrivateRoute`: unauthenticated redirect, role-insufficient redirect, authorized render
  - [x] 13.9 Unit test Axios interceptor: 401 triggers refresh, failed refresh triggers logout

- [x] 14. Configuration & Environment
  - [x] 14.1 Document all required environment variables: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_ORIGIN`, `FRONTEND_URL`
  - [x] 14.2 Create `.env.example` for both backend and frontend
  - [x] 14.3 Configure CORS in `SecurityConfig` using `ALLOWED_ORIGIN` env var
  - [x] 14.4 Add Google OAuth2 redirect URI to Google Cloud Console (document the step)
