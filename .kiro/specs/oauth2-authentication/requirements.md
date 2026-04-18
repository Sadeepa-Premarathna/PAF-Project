# Requirements: OAuth2 Authentication & Authorization (Module E)

## Introduction

This document defines the functional and non-functional requirements for Module E of the SLIIT Smart Campus Operations Hub. Module E provides OAuth 2.0-based authentication via Google Sign-In and role-based access control (RBAC) for both the Spring Boot REST API and the React client application.

---

## Requirements

### 1. OAuth2 Login

#### 1.1 Google Sign-In Initiation
The system SHALL provide a "Sign in with Google" entry point that redirects the user to Google's OAuth2 authorization endpoint with the correct `client_id`, `redirect_uri`, `scope` (`openid email profile`), and `response_type=code`.

**Acceptance Criteria**:
- Given a user visits the login page, when they click "Sign in with Google", then the browser is redirected to `accounts.google.com/o/oauth2/auth` with all required query parameters.
- The `redirect_uri` used MUST match one of the URIs registered in the Google Cloud Console.

#### 1.2 Authorization Code Exchange
The system SHALL exchange the OAuth2 authorization code received at the callback endpoint for Google access and ID tokens by calling Google's token endpoint server-side.

**Acceptance Criteria**:
- Given a valid authorization code is received at `POST /api/auth/callback`, when the backend calls Google's token endpoint, then a valid `access_token` and `id_token` are returned.
- Given an invalid or expired authorization code, when the exchange is attempted, then the system returns `400 Bad Request` with `{ "error": "oauth_error" }`.

#### 1.3 User Info Retrieval
The system SHALL retrieve the authenticated user's profile (`sub`, `email`, `name`, `picture`) from Google's UserInfo API using the obtained access token.

**Acceptance Criteria**:
- Given a valid Google access token, when the UserInfo endpoint is called, then `sub`, `email`, `name`, and `picture` fields are returned and stored.
- If `email` is not present in the UserInfo response, the system SHALL reject the login with `400 Bad Request`.

---

### 2. User Provisioning

#### 2.1 First-Time User Creation
The system SHALL automatically create a new `AppUser` record on the first successful OAuth2 login for a given Google account (`sub`).

**Acceptance Criteria**:
- Given a Google account that has never logged in before, when OAuth2 login succeeds, then a new `AppUser` is created with `role = USER` and `active = true`.
- The `googleSub` field MUST be stored as the stable identity anchor (not email alone).

#### 2.2 Returning User Update
The system SHALL update the `name` and `pictureUrl` of an existing user on subsequent logins if they have changed on Google.

**Acceptance Criteria**:
- Given an existing user whose Google display name has changed, when they log in again, then `AppUser.name` is updated to reflect the new value.
- The user's `role` and `id` MUST NOT change on subsequent logins.

#### 2.3 Deactivated Account Rejection
The system SHALL deny login to users whose `AppUser.active` flag is `false`.

**Acceptance Criteria**:
- Given a user with `active = false`, when they complete OAuth2 login, then the system returns `403 Forbidden` with `{ "error": "account_disabled" }`.

---

### 3. JWT Issuance

#### 3.1 Access Token Generation
The system SHALL issue a signed JWT access token upon successful authentication, containing `sub` (userId), `email`, `roles`, `iat`, and `exp` claims, signed with HMAC-SHA256.

**Acceptance Criteria**:
- Given a successful OAuth2 login, when the callback handler completes, then the response includes a `accessToken` field containing a valid JWT.
- The access token MUST expire 900 seconds (15 minutes) from issuance.
- The `roles` claim MUST contain the user's current role prefixed with `ROLE_` (e.g., `ROLE_USER`).

#### 3.2 Refresh Token Generation
The system SHALL issue a refresh token alongside the access token, stored as an `httpOnly`, `Secure`, `SameSite=Strict` cookie.

**Acceptance Criteria**:
- Given a successful login, when the response is sent, then a `refreshToken` cookie is set with `httpOnly=true`, `Secure=true`, `SameSite=Strict`.
- The raw refresh token MUST NOT appear in the JSON response body.
- The refresh token MUST expire 7 days from issuance.

#### 3.3 Refresh Token Persistence
The system SHALL persist a SHA-256 hash of the refresh token in the `refresh_tokens` table, never the raw token.

**Acceptance Criteria**:
- Given a refresh token is issued, when the database is inspected, then only the SHA-256 hash of the token is stored.

---

### 4. Token Validation & Security Filter

#### 4.1 JWT Validation on Every Request
The system SHALL validate the JWT on every incoming request to protected endpoints via a `JwtAuthFilter` that runs before Spring Security's authorization layer.

**Acceptance Criteria**:
- Given a request with a valid JWT in the `Authorization: Bearer <token>` header, when the filter processes it, then `SecurityContextHolder` is populated with the user's authentication.
- Given a request with an expired JWT, when the filter processes it, then `SecurityContextHolder` is NOT populated and the request proceeds to return `401 Unauthorized`.
- Given a request with a tampered JWT (invalid signature), when the filter processes it, then `401 Unauthorized` is returned.

#### 4.2 Stateless Session
The system SHALL NOT create HTTP sessions. All authentication state MUST be carried in the JWT.

**Acceptance Criteria**:
- Given any authenticated API request, when the server processes it, then no `JSESSIONID` cookie is set in the response.
- Spring Security session creation policy MUST be set to `STATELESS`.

---

### 5. Token Refresh

#### 5.1 Access Token Renewal
The system SHALL allow clients to obtain a new access token by presenting a valid, non-revoked refresh token via `POST /api/auth/refresh`.

**Acceptance Criteria**:
- Given a valid refresh token cookie, when `POST /api/auth/refresh` is called, then a new access token is returned in the response body.
- Given an expired refresh token, when the endpoint is called, then `401 Unauthorized` is returned.

#### 5.2 Refresh Token Rotation
The system SHALL rotate refresh tokens on every use: the presented token is revoked and a new one is issued.

**Acceptance Criteria**:
- Given a refresh token is used once, when it is presented a second time, then `401 Unauthorized` is returned.

#### 5.3 Refresh Token Reuse Detection
The system SHALL detect refresh token reuse (potential theft) and revoke ALL refresh tokens for the affected user when a previously-rotated token is presented.

**Acceptance Criteria**:
- Given a refresh token that has already been rotated is presented, when the system detects reuse, then all refresh tokens for that user are revoked and `401 Unauthorized` is returned.
- After reuse detection, the user MUST re-authenticate via OAuth2 login.

---

### 6. Role-Based Access Control (RBAC)

#### 6.1 Role Definitions
The system SHALL support four roles: `USER`, `ADMIN`, `TECHNICIAN`, and `MANAGER`.

**Acceptance Criteria**:
- The `Role` enum MUST contain exactly: `USER`, `ADMIN`, `TECHNICIAN`, `MANAGER`.
- New users MUST be assigned `USER` by default.

#### 6.2 Endpoint Authorization
The system SHALL enforce role-based access on all API endpoints using Spring Security's `@PreAuthorize` or `HttpSecurity` configuration.

**Acceptance Criteria**:
- Given a `USER` role token, when accessing an `ADMIN`-only endpoint, then `403 Forbidden` is returned.
- Given an `ADMIN` role token, when accessing any endpoint, then access is granted (subject to other business rules).
- Given a `TECHNICIAN` role token, when accessing maintenance ticket endpoints, then access is granted.
- Given a `MANAGER` role token, when accessing management endpoints, then access is granted.
- Public endpoints (`/api/auth/**`, `/actuator/health`) MUST be accessible without authentication.

#### 6.3 Admin Role Management
The system SHALL allow `ADMIN` users to change the role of any other user via `PUT /api/admin/users/{userId}/role`.

**Acceptance Criteria**:
- Given an `ADMIN` token, when `PUT /api/admin/users/{id}/role` is called with a valid role, then the user's role is updated.
- Given a non-`ADMIN` token, when the same endpoint is called, then `403 Forbidden` is returned.

---

### 7. Frontend Route Protection

#### 7.1 Unauthenticated Route Guard
The React application SHALL redirect unauthenticated users to `/login` when they attempt to access any protected route.

**Acceptance Criteria**:
- Given an unauthenticated user, when they navigate to any route other than `/login` or `/auth/callback`, then they are redirected to `/login` with the original path preserved in state.

#### 7.2 Role-Based Route Guard
The React application SHALL redirect authenticated users to `/unauthorized` when they attempt to access a route that requires a role they do not have.

**Acceptance Criteria**:
- Given a `USER` role user, when they navigate to an `ADMIN`-only route, then they are redirected to `/unauthorized`.
- Given an `ADMIN` role user, when they navigate to any route, then they are not redirected.

#### 7.3 Automatic Token Refresh in Client
The React application SHALL automatically attempt to refresh the access token when an API call returns `401 Unauthorized`, and retry the original request with the new token.

**Acceptance Criteria**:
- Given an expired access token, when an API call returns `401`, then the client calls `POST /api/auth/refresh`, obtains a new token, and retries the original request transparently.
- Given a failed refresh (refresh token also expired/revoked), when the retry fails, then the user is redirected to `/login`.

#### 7.4 Secure Token Storage
The React application SHALL store the access token in memory only (not `localStorage` or `sessionStorage`).

**Acceptance Criteria**:
- Given a logged-in user, when `localStorage` and `sessionStorage` are inspected, then no access token is present.
- The access token MUST be stored in a React context or in-memory variable only.

---

### 8. Logout

#### 8.1 Server-Side Logout
The system SHALL provide a `POST /api/auth/logout` endpoint that revokes the user's current refresh token and clears the refresh token cookie.

**Acceptance Criteria**:
- Given a logged-in user calls `POST /api/auth/logout`, when the server processes it, then the refresh token is marked as revoked in the database and the cookie is cleared (`Max-Age=0`).

#### 8.2 Client-Side Logout
The React application SHALL clear the in-memory access token and redirect to `/login` when logout is triggered.

**Acceptance Criteria**:
- Given a user clicks logout, when the logout action completes, then the in-memory access token is cleared and the user is on the `/login` page.

---

### 9. Security & Non-Functional Requirements

#### 9.1 HTTPS Only
All OAuth2 redirects and API communications MUST use HTTPS in production.

#### 9.2 CORS Configuration
The Spring Boot backend SHALL only accept cross-origin requests from the configured React client origin (`ALLOWED_ORIGIN` environment variable).

**Acceptance Criteria**:
- Given a request from an unlisted origin, when the CORS preflight is processed, then the request is rejected.

#### 9.3 Secret Management
`JWT_SECRET` and `GOOGLE_CLIENT_SECRET` MUST be loaded from environment variables and MUST NOT be hardcoded in source code.

**Acceptance Criteria**:
- Given the application source code, when it is inspected, then no secrets are present as string literals.

#### 9.4 Token Expiry
- Access tokens MUST expire in 15 minutes.
- Refresh tokens MUST expire in 7 days.
