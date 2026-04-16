# Tasks: OAuth2 Authentication & Authorization (Module E)

## Implementation Tasks

- [x] 1. Backend: Project Setup & Security Foundation
  - [x] 1.1 Add Spring Security, JJWT, and OAuth2 client dependencies to `pom.xml`
  - [x] 1.2 Create `AppUser` entity with `id`, `email`, `name`, `pictureUrl`, `googleSub`, `role`, `active`, `createdAt`, `updatedAt` fields
  - [x] 1.3 Create `Role` enum with values `USER`, `ADMIN`, `TECHNICIAN`, `MANAGER`
  - [x] 1.4 Create `RefreshToken` entity with `id`, `user`, `tokenHash`, `expiresAt`, `revoked`, `createdAt` fields
  - [x] 1.5 Create JPA repositories for `AppUser` and `RefreshToken`
  - [x] 1.6 Configure `SecurityConfig`: stateless session, CORS, CSRF disabled, public routes for `/api/auth/**`

- [ ] 2. Backend: JWT Service
  - [ ] 2.1 Implement `JwtService.generateAccessToken()` — embed `sub`, `email`, `roles`, `iat`, `exp` (15 min), sign with HMAC-SHA256
  - [ ] 2.2 Implement `JwtService.generateRefreshToken()` — random UUID-based token, 7-day expiry
  - [ ] 2.3 Implement `JwtService.validateToken()` — verify signature and expiry, return boolean
  - [ ] 2.4 Implement `JwtService.extractSubject()` and `JwtService.extractRoles()` claim parsers
  - [ ] 2.5 Load `JWT_SECRET` from environment variable; fail fast on startup if missing or < 32 chars

- [ ] 3. Backend: JWT Auth Filter
  - [ ] 3.1 Implement `JwtAuthFilter extends OncePerRequestFilter` — extract Bearer token from `Authorization` header
  - [ ] 3.2 On valid token: load user details and populate `SecurityContextHolder`
  - [ ] 3.3 On invalid/missing token: clear context and continue filter chain (let Spring Security handle 401)
  - [ ] 3.4 Register `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter` in `SecurityConfig`

- [ ] 4. Backend: User Service
  - [ ] 4.1 Implement `UserService.findOrCreateUser()` — lookup by `googleSub`, create with `role=USER` if not found, update `name`/`pictureUrl` if found
  - [ ] 4.2 Implement `UserService.findById()` for loading user details in filter
  - [ ] 4.3 Implement `UserService.updateRole()` for admin role management
  - [ ] 4.4 Implement `UserService.findAllByRole()` for admin user listing

- [ ] 5. Backend: Refresh Token Service
  - [ ] 5.1 Implement `RefreshTokenService.save()` — persist SHA-256 hash of raw token with expiry
  - [ ] 5.2 Implement `RefreshTokenService.validate()` — lookup by hash, check revoked and expiry
  - [ ] 5.3 Implement `RefreshTokenService.rotate()` — revoke old token, persist new token hash
  - [ ] 5.4 Implement `RefreshTokenService.revokeAllForUser()` — for reuse detection response

- [ ] 6. Backend: Auth Controller
  - [ ] 6.1 Implement `POST /api/auth/callback` — accept `{ code, redirectUri }`, exchange with Google, call `findOrCreateUser`, issue JWT + refresh token cookie
  - [ ] 6.2 Implement `POST /api/auth/refresh` — read `refreshToken` cookie, validate, rotate, return new access token
  - [ ] 6.3 Implement `POST /api/auth/logout` — revoke refresh token, clear cookie with `Max-Age=0`
  - [ ] 6.4 Implement `GET /api/auth/me` — return current user info from `SecurityContext`
  - [ ] 6.5 Implement global exception handler for `OAuthException`, `UnauthorizedException`, `AccessDeniedException` returning proper error JSON

- [ ] 7. Backend: Admin Endpoints
  - [ ] 7.1 Implement `PUT /api/admin/users/{userId}/role` secured with `@PreAuthorize("hasRole('ADMIN')")`
  - [ ] 7.2 Implement `GET /api/admin/users` — list all users, secured with `@PreAuthorize("hasRole('ADMIN')")`

- [ ] 8. Backend: Google OAuth2 Client
  - [ ] 8.1 Implement `GoogleOAuthClient.exchangeCode()` — POST to `https://oauth2.googleapis.com/token`
  - [ ] 8.2 Implement `GoogleOAuthClient.getUserInfo()` — GET `https://www.googleapis.com/oauth2/v3/userinfo`
  - [ ] 8.3 Load `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from environment variables

- [ ] 9. Frontend: Auth Infrastructure
  - [ ] 9.1 Create `AuthContext` with `user`, `accessToken`, `isAuthenticated`, `isLoading`, `login`, `logout`, `refreshToken`
  - [ ] 9.2 Implement `login()` — redirect to `GET /api/auth/google` (or construct Google OAuth URL directly)
  - [ ] 9.3 Implement `/auth/callback` route handler — POST code to `/api/auth/callback`, store access token in memory, update context
  - [ ] 9.4 Implement `logout()` — call `POST /api/auth/logout`, clear in-memory token, redirect to `/login`
  - [ ] 9.5 Wrap app in `AuthProvider`; restore session on page load via `GET /api/auth/me` using refresh token cookie

- [ ] 10. Frontend: Axios API Client
  - [ ] 10.1 Create `apiClient` Axios instance with base URL from env var
  - [ ] 10.2 Add request interceptor to attach `Authorization: Bearer <token>` from in-memory store
  - [ ] 10.3 Add response interceptor to handle `401`: attempt token refresh, retry original request, redirect to `/login` on refresh failure
  - [ ] 10.4 Implement request queue to prevent multiple simultaneous refresh calls

- [ ] 11. Frontend: Route Guards
  - [ ] 11.1 Implement `PrivateRoute` component — redirect unauthenticated users to `/login` preserving `from` state
  - [ ] 11.2 Add `requiredRoles` prop to `PrivateRoute` — redirect role-insufficient users to `/unauthorized`
  - [ ] 11.3 Create `/unauthorized` page component
  - [ ] 11.4 Wrap all protected routes in `PrivateRoute` in the React Router config
  - [ ] 11.5 Apply role-specific guards: `ADMIN`-only routes, `TECHNICIAN`/`MANAGER` routes

- [ ] 12. Frontend: Login UI
  - [ ] 12.1 Create `/login` page with "Sign in with Google" button
  - [ ] 12.2 Show loading state during OAuth redirect and callback processing
  - [ ] 12.3 Display error message if OAuth callback returns an error

- [ ] 13. Testing
  - [ ] 13.1 Unit test `JwtService`: valid token, expired token, tampered token, claim extraction
  - [ ] 13.2 Unit test `UserService.findOrCreateUser()`: new user, returning user, deactivated user
  - [ ] 13.3 Unit test `RefreshTokenService`: rotation, reuse detection, expiry
  - [ ] 13.4 Unit test `JwtAuthFilter`: valid token populates context, invalid token clears context
  - [ ] 13.5 Integration test `POST /api/auth/callback` with WireMock stubbing Google endpoints
  - [ ] 13.6 Integration test `POST /api/auth/refresh`: valid rotation, reuse detection
  - [ ] 13.7 Integration test role enforcement: 200 for correct role, 403 for insufficient role, 401 for no token
  - [ ] 13.8 Unit test `PrivateRoute`: unauthenticated redirect, role-insufficient redirect, authorized render
  - [ ] 13.9 Unit test Axios interceptor: 401 triggers refresh, failed refresh triggers logout

- [ ] 14. Configuration & Environment
  - [ ] 14.1 Document all required environment variables: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_ORIGIN`, `FRONTEND_URL`
  - [ ] 14.2 Create `.env.example` for both backend and frontend
  - [ ] 14.3 Configure CORS in `SecurityConfig` using `ALLOWED_ORIGIN` env var
  - [ ] 14.4 Add Google OAuth2 redirect URI to Google Cloud Console (document the step)
