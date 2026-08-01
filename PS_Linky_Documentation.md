# PS Linky — URL Shortener

**PS Linky simplifies URL shortening for efficient sharing.**

PS Linky is a full-stack URL shortening web application that allows registered users to convert long URLs into concise, shareable short links in seconds. It provides a clean, responsive dashboard where users can manage all their shortened links and view per-link as well as aggregate click analytics visualized through interactive bar charts.

Built on a modern production-grade stack — Spring Boot 4 on the backend and React 19 with Vite on the frontend — PS Linky demonstrates a complete separation of concerns across a RESTful API layer with JWT-based stateless authentication, a PostgreSQL database (Neon serverless in production, MySQL locally), and a TailwindCSS-styled frontend enriched with Framer Motion animations, TanStack Query for server-state management, Chart.js for analytics visualization, and Material UI for modal components. The entire backend is containerized with a multi-stage Docker build using Eclipse Temurin Java 26.

---

## Long Description

PS Linky was conceived as a practical, production-ready implementation of one of the most foundational tools of the internet — the URL shortener. The project goes well beyond a simple toy application; it is architected with layered separation of concerns, stateless security, and a polished frontend experience that would feel at home alongside commercial products.

On the backend, the application follows a classic MVC pattern accelerated by Spring Boot 4 running on Java 26. Three controllers handle the distinct domains: authentication (register/login), URL mapping (create, list, analytics), and redirection. These controllers delegate all business logic to service classes, which in turn interact with Spring Data JPA repositories backed by a relational database. This layered architecture ensures each class has a single responsibility and promotes maintainability and testability.

Security is implemented using stateless JWT (JSON Web Token) authentication. On login, the server issues a signed JWT containing the user's username and roles. This token is stored by the client in localStorage and sent with every subsequent API call in the `Authorization: Bearer <token>` header. On the backend, a custom `OncePerRequestFilter` intercepts every request, extracts the token, validates its signature using an HMAC-SHA key derived from a secret stored in environment variables, and populates the Spring Security context. Passwords are never stored in plain text — they are hashed using BCrypt before being persisted.

CORS is configured to only allow requests from the specific frontend origin (configurable via environment variable), preventing unauthorized cross-origin requests. Spring Security's filter chain explicitly defines which endpoints are public (`/api/auth/**` and `/{shortUrl}`) and which require authentication (`/api/urls/**`). Method-level security using `@PreAuthorize("hasRole('USER')")` further enforces that only authenticated users with the correct role can access protected resources.

The URL shortening algorithm generates an 8-character alphanumeric slug by randomly sampling characters from the 62-character set (A-Z, a-z, 0-9), producing over 218 trillion unique combinations. Every time a short URL is resolved, the system atomically increments the click counter on the `UrlMapping` record and creates a new `ClickEvent` record timestamped to the millisecond, enabling precise, date-filtered analytics queries.

The frontend is a single-page application built with React 19 and Vite. State management is deliberately minimal — React Context API is used for global token state, and TanStack React Query is used for all server data fetching, caching, and background re-fetching. The dashboard fetches the user's URLs and total click data in parallel, both with a 5-second stale time to avoid unnecessary re-fetches. The analytics panel for each individual URL is fetched lazily (on demand) when the user clicks the Analytics button, with a loading skeleton (Hourglass spinner) shown during the fetch.

Routing is handled by React Router v7, with a `PrivateRoute` guard component that redirects unauthenticated users away from protected routes (like `/dashboard`) and redirects already-authenticated users away from public-only routes (like `/login` and `/register`). The short-URL redirect route (`/s/:url`) extracts the slug and immediately redirects the browser to the backend redirect endpoint, so the server can record the click and issue the HTTP 302 redirect to the original URL.

The deployment architecture uses Docker with a multi-stage build: the build stage uses Eclipse Temurin 26-JDK to compile the Spring Boot JAR using Maven, and the runtime stage uses a lean Eclipse Temurin 26-JRE image. Environment variables are injected at runtime, with a `.env.prod` file holding production secrets such as the Neon PostgreSQL connection string and JWT secret. The frontend is a static build deployable to any CDN or static hosting service.

---

# Project Objective

## Why was this project built?
PS Linky was built to demonstrate mastery of a full-stack production architecture by solving a real and universally understood problem — URL shortening. It showcases the developer's ability to design and implement end-to-end features: from database modeling and REST API design, through stateless JWT security, all the way to a dynamic, animated frontend with server-state management and data visualization.

## What real-world problem does it solve?
Long URLs are unwieldy, untrustworthy in appearance, and difficult to share verbally or in constrained formats (social media bios, SMS, print). PS Linky solves this by generating compact 8-character slugs that redirect to the original destination. It additionally solves the problem of link tracking — users get actionable analytics (click counts and click-per-day charts) so they know how their shared links are performing.

## Who can use it?
- **Individual developers and creators** who need to share portfolio links, project demos, or blog posts in a compact form.
- **Marketers and content creators** who want to track how many times their shared links are clicked over time.
- **Students and educators** presenting reference material where clean, short URLs are preferable.
- **Businesses** looking for a self-hosted, private alternative to Bitly or TinyURL, with control over their own data and analytics.

---

# Tech Stack

| Category | Technology |
|---|---|
| **Backend** | Spring Boot 4.1.0 (Spring MVC, Spring Data JPA, Spring Security) |
| **Frontend** | React 19, Vite 8 |
| **Database** | PostgreSQL (production via Neon serverless), MySQL (development) |
| **Authentication** | JWT (JSON Web Tokens) via `io.jsonwebtoken` (jjwt) 0.13.0, BCrypt password hashing |
| **Build Tool** | Maven (backend), Vite (frontend) |
| **Deployment** | Docker (multi-stage, Eclipse Temurin Java 26) |
| **Cloud Services** | Neon (serverless PostgreSQL) |
| **Third-party APIs** | None |
| **Libraries (Frontend)** | TanStack React Query v5, Axios, Chart.js, react-chartjs-2, Framer Motion (motion), react-hook-form, react-hot-toast, react-copy-to-clipboard, react-icons, react-loader-spinner, dayjs, MUI (Material UI), react-router-dom v7 |
| **Libraries (Backend)** | Lombok, Jakarta Persistence (JPA), jjwt-api / jjwt-impl / jjwt-jackson |
| **Frameworks** | Spring Boot (backend), React (frontend), TailwindCSS v4 (frontend styling) |
| **Languages** | Java 26 (backend), JavaScript (ESM, React/JSX, frontend) |

---

# Folder Structure

```
URL_Shortener/
├── Schematic Diagram.png               # Architecture/flow diagram
├── urlshortener/                       # Backend (Spring Boot)
│   ├── .env                            # Local dev environment variables
│   ├── .env.prod                       # Production environment variables
│   ├── Dockerfile                      # Multi-stage Docker build
│   ├── pom.xml                         # Maven build configuration & dependencies
│   ├── mvnw / mvnw.cmd                 # Maven wrapper scripts
│   └── src/
│       ├── main/
│       │   ├── java/dev/pranavsharma/urlshortener/
│       │   │   ├── UrlshortenerApplication.java     # Spring Boot entry point
│       │   │   ├── controller/                      # REST controllers (HTTP layer)
│       │   │   │   ├── AuthController.java          # Login & Register endpoints
│       │   │   │   ├── UrlMappingController.java    # URL CRUD & Analytics endpoints
│       │   │   │   └── RedirectController.java      # Short URL redirect endpoint
│       │   │   ├── service/                         # Business logic layer
│       │   │   │   ├── UrlMappingService.java       # URL shortening & analytics logic
│       │   │   │   ├── UserService.java             # User registration & authentication
│       │   │   │   ├── UserDetailsImpl.java         # Spring Security UserDetails impl
│       │   │   │   └── UserDetailsServiceImpl.java  # UserDetailsService impl (DB lookup)
│       │   │   ├── models/                          # JPA Entity classes
│       │   │   │   ├── User.java                   # User entity (users table)
│       │   │   │   ├── UrlMapping.java              # URL mapping entity
│       │   │   │   └── ClickEvent.java              # Click event entity
│       │   │   ├── repository/                      # Spring Data JPA repositories
│       │   │   │   ├── UserRepository.java          # User DB queries
│       │   │   │   ├── UrlMappingRepository.java    # URL mapping DB queries
│       │   │   │   └── ClickEventRepository.java   # Click event DB queries
│       │   │   ├── dtos/                            # Data Transfer Objects
│       │   │   │   ├── LoginRequest.java            # Login payload
│       │   │   │   ├── RegisterRequest.java         # Register payload
│       │   │   │   ├── UrlMappingDTO.java           # URL mapping response DTO
│       │   │   │   └── ClickEventDTO.java           # Click analytics DTO
│       │   │   └── security/                        # Security configuration
│       │   │       ├── WebSecurityConfig.java       # SecurityFilterChain, BCrypt, AuthManager
│       │   │       ├── WebConfig.java               # CORS configuration
│       │   │       └── jwt/
│       │   │           ├── JwtUtils.java            # Token generation, parsing, validation
│       │   │           ├── JwtAuthenticationFilter.java  # OncePerRequestFilter for JWT
│       │   │           └── JwtAuthenticationResponse.java # JWT response wrapper DTO
│       │   └── resources/
│       │       └── application.properties           # App config (datasource, JWT, CORS)
│       └── test/                                    # Test directory (unit/integration)
│
└── urlshortener-frontend/              # Frontend (React + Vite)
    ├── .env                            # Frontend env variables (VITE_BACKEND_URL)
    ├── index.html                      # HTML entry point
    ├── vite.config.js                  # Vite build configuration
    ├── tailwind.config.js              # TailwindCSS configuration
    ├── package.json                    # NPM dependencies & scripts
    └── src/
        ├── main.jsx                    # React DOM root render
        ├── App.jsx                     # Root App component (QueryClient, Router, Context)
        ├── AppRouter.jsx               # Route definitions
        ├── PrivateRoute.jsx            # Auth guard for protected/public routes
        ├── api/
        │   └── api.js                  # Axios instance (baseURL from env)
        ├── contextApi/
        │   └── ContextApi.jsx          # Global auth token context (localStorage)
        ├── hooks/
        │   └── useQuery.js             # Custom TanStack Query hooks (useFetchMyShortUrls, useFetchTotalClicks)
        ├── components/
        │   ├── Navbar.jsx              # Sticky gradient navbar with mobile menu
        │   ├── Footer.jsx              # Footer with social links
        │   ├── LandingPage.jsx         # Hero section + feature cards
        │   ├── AboutPage.jsx           # About page with feature descriptions
        │   ├── LoginPage.jsx           # Login form with react-hook-form
        │   ├── RegisterPage.jsx        # Registration form with react-hook-form
        │   ├── ShortenUrlPage.jsx      # Redirect handler page (/s/:url)
        │   ├── ErrorPage.jsx           # Generic error/404 page
        │   ├── Loader.jsx              # Full-page rotating lines loader
        │   ├── TextField.jsx           # Reusable controlled input component
        │   ├── Card.jsx                # Feature card with Framer Motion animation
        │   └── Dashboard/
        │       ├── DashboardLayout.jsx     # Main dashboard with graph + URL list
        │       ├── ShortenPopUp.jsx        # MUI Modal wrapper for create form
        │       ├── CreateNewShorten.jsx    # URL creation form (react-hook-form + API)
        │       ├── ShortenUrlList.jsx      # List renderer for ShortenItems
        │       ├── ShortenItem.jsx         # Individual URL card with analytics toggle
        │       └── Graph.jsx               # Chart.js Bar chart component
        ├── dummyData/                  # Static placeholder data
        └── utils/                      # Utility helpers
```

### Purpose of Major Folders

| Folder | Purpose |
|---|---|
| `controller/` | Receives HTTP requests, validates principal, delegates to service, returns HTTP responses |
| `service/` | Contains all business logic; orchestrates repository calls and domain object transformations |
| `models/` | JPA entities that map directly to database tables via Hibernate |
| `repository/` | Spring Data JPA interfaces for CRUD + custom JPQL/derived queries against the DB |
| `dtos/` | Plain data objects used for request deserialization and response serialization, decoupling the API contract from the domain model |
| `security/` | All Spring Security configuration: filter chain rules, CORS, JWT generation/validation, BCrypt |
| `src/components/` | All React UI components, both page-level and reusable |
| `src/hooks/` | Custom React hooks wrapping TanStack Query for data fetching |
| `src/api/` | Centralized Axios instance with base URL from environment |
| `src/contextApi/` | React Context for global JWT token state (persisted to localStorage) |

---

# Features

## Authentication
- User registration with username, email, and password
- User login with username and password
- Passwords hashed with BCrypt before storage
- JWT issued on successful login (expiry: 48 hours / 172,800,000 ms)
- JWT stored in client localStorage, sent in `Authorization: Bearer` header
- Token-based session persistence across browser refreshes
- Logout clears token from both React state and localStorage
- Route guards redirect unauthenticated users to `/login`
- Route guards redirect authenticated users away from `/login` and `/register`

## User Features
- Shorten any valid URL into an 8-character alphanumeric short link
- View personal dashboard with all created short URLs
- Short URLs displayed with original URL, click count, and creation date
- One-click copy of shortened URL to clipboard with visual feedback
- Open short URL in new tab via external link icon
- Short URLs sorted by most recently created (descending)
- Delete or manage links via dashboard UI
- View aggregate daily click chart for all personal links
- View per-link daily click analytics via inline expandable bar chart
- Toast notifications for success/failure of all actions

## Admin Features
- Unknown (no separate admin role or admin panel was detected in the codebase)

## Analytics
- Total click count per URL (stored as integer on `UrlMapping`, incremented on each redirect)
- Per-click event recorded as a `ClickEvent` row with precise `LocalDateTime` timestamp
- Aggregate total clicks grouped by date for the authenticated user (all links combined)
- Per-link clicks grouped by date for a specified date range
- Both analytics endpoints support `startDate` and `endDate` query parameters (ISO 8601)
- Analytics data visualized as an interactive bar chart (Chart.js) showing "Total Clicks" vs "Date"
- Placeholder ghost bar chart displayed when no data is available (empty state UX)
- Analytics panel lazy-loaded per URL (only fetches when the Analytics button is clicked)
- Hourglass spinner shown during analytics fetch

## Security
- BCrypt password hashing (Spring Security default strength: 10 rounds)
- JWT signed with HMAC-SHA256 using a Base64-encoded secret key
- JWT contains username and roles claims
- `JwtAuthenticationFilter` runs on every request before Spring Security processes it
- CSRF disabled (stateless API with JWT is not vulnerable to CSRF)
- CORS configured to allow only the specific frontend origin
- `@PreAuthorize("hasRole('USER')")` method-level authorization on all protected endpoints
- OPTIONS preflight requests permitted globally for CORS handshake

## Performance
- TanStack React Query with 5-second `staleTime` for caching URL list and total clicks data
- React Query prevents redundant API calls within the stale window
- Analytics per URL fetched lazily (on-demand, not on page load)
- Chart.js renders client-side with `maintainAspectRatio: false` and `responsive: true`
- Vite builds optimized static assets with tree-shaking and code splitting
- Multi-stage Docker build produces a lean runtime image (JRE-only, no JDK in production)
- Maven dependency pre-caching layer in Dockerfile (`dependency:go-offline`) to speed up rebuilds

## Database
- JPA/Hibernate with `ddl-auto=update` (auto-migrates schema on startup)
- Three normalized tables: `users`, `url_mapping`, `click_event`
- Derived queries via Spring Data JPA (no raw SQL)
- Date-range queries on `ClickEvent` using `findByUrlMappingAndClickDateBetween`
- Bulk date-range queries for multiple URL mappings at once (`findByUrlMappingInAndClickDateBetween`)
- Foreign key relationships enforced at the database level
- Neon serverless PostgreSQL in production (connection pooling handled by Neon)

## API
- RESTful JSON API over HTTP
- Clean URL structure with resource-based naming (`/api/auth`, `/api/urls`)
- HTTP 302 redirect for short URL resolution
- DTO pattern ensures stable API contract independent of entity changes
- Consistent `ResponseEntity<?>` responses with proper HTTP status codes

## Deployment
- Dockerized backend with multi-stage build
- Environment variable–driven configuration (no hardcoded secrets in code)
- Separate `.env` (local/MySQL) and `.env.prod` (production/Neon PostgreSQL) files
- Frontend configurable via `VITE_BACKEND_URL` and `VITE_REACT_FRONT_END_URL` env vars

## Others
- Responsive design (mobile, tablet, desktop) with TailwindCSS breakpoint classes
- Framer Motion entrance animations on landing page hero text, buttons, image, and feature cards
- `viewport={{ once: true }}` prevents repeated re-animations on scroll
- Sticky gradient navbar with hamburger menu for mobile
- Active route highlighting in navbar
- Conditional navbar/footer hiding on redirect pages (`/s/:url`)
- React Hot Toast for non-intrusive bottom-center notifications
- SubDomainRouter export in AppRouter for potential subdomain-based redirect routing

---

# REST APIs

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|:---:|---|---|
| `POST` | `/api/auth/public/register` | Register a new user account | No | `{ username, email, password, role }` | `200 OK` — `"User has been registered successfully!"` |
| `POST` | `/api/auth/public/login` | Authenticate user and return JWT | No | `{ username, password }` | `200 OK` — `{ token: "<JWT>" }` |
| `POST` | `/api/urls/shorten` | Create a new shortened URL | Yes | `{ originalUrl: "<URL>" }` | `200 OK` — `UrlMappingDTO` |
| `GET` | `/api/urls/myurls` | Get all shortened URLs for the authenticated user | Yes | — | `200 OK` — `List<UrlMappingDTO>` |
| `GET` | `/api/urls/analytics/{shortUrl}?startDate=&endDate=` | Get click data grouped by day for a specific short URL | Yes | — | `200 OK` — `List<ClickEventDTO>` |
| `GET` | `/api/urls/totalClicks?startDate=&endDate=` | Get total clicks grouped by day for all user links | Yes | — | `200 OK` — `Map<LocalDate, Long>` |
| `GET` | `/{shortUrl}` | Resolve a short URL and redirect to original | No | — | `302 Found` with `Location` header, or `404 Not Found` |

### UrlMappingDTO Response Schema
```json
{
  "id": 1,
  "originalUrl": "https://example.com/very/long/path",
  "shortUrl": "Ab3Cd8Ef",
  "clickCount": 42,
  "createdDate": "2025-01-15T10:30:00",
  "username": "john_doe"
}
```

### ClickEventDTO Response Schema
```json
{ "clickDate": "2025-01-15", "count": 12 }
```

---

# Database

## Table: `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique user identifier |
| `email` | `VARCHAR` | — | User's email address |
| `username` | `VARCHAR` | — | Login username |
| `password` | `VARCHAR` | — | BCrypt-hashed password |
| `role` | `VARCHAR` | `DEFAULT 'ROLE_USER'` | Spring Security role string |

## Table: `url_mapping`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique mapping identifier |
| `original_url` | `VARCHAR` | — | The full original long URL |
| `short_url` | `VARCHAR` | — | The 8-character generated slug |
| `click_count` | `INT` | `DEFAULT 0` | Running total click counter |
| `created_date` | `TIMESTAMP` | — | Timestamp of creation |
| `user_id` | `BIGINT` | `FOREIGN KEY → users.id` | Owner of this URL mapping |

## Table: `click_event`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique click event identifier |
| `click_date` | `TIMESTAMP` | — | Precise timestamp when the click occurred |
| `url_mapping_id` | `BIGINT` | `FOREIGN KEY → url_mapping.id` | Which URL was clicked |

## Relationships
- `users` ←→ `url_mapping`: **One-to-Many** (one user has many URL mappings; `@ManyToOne` on `UrlMapping.user` with `@JoinColumn(name="user_id")`)
- `url_mapping` ←→ `click_event`: **One-to-Many** (one URL mapping has many click events; `@OneToMany(mappedBy="urlMapping")` on `UrlMapping.clickEvents`)

## Indexes
- `users.id` — Primary Key index (auto-generated)
- `url_mapping.id` — Primary Key index
- `url_mapping.user_id` — Foreign Key index
- `click_event.id` — Primary Key index
- `click_event.url_mapping_id` — Foreign Key index
- Additional indexes on `url_mapping.short_url` recommended for production (lookup by short URL is in the critical redirect path)

---

# Architecture

## Overview
PS Linky follows a **Three-Layer (Layered Architecture)** pattern on the backend, combined with a **SPA + REST API** pattern overall:

```
Browser (React SPA)
    │
    │  HTTPS / HTTP
    ▼
Spring Boot REST API (Port 8080)
    │
    ├─ Security Layer (JwtAuthenticationFilter → SecurityFilterChain)
    │
    ├─ Controller Layer (HTTP in/out, routing, principal extraction)
    │
    ├─ Service Layer (business logic, data transformation)
    │
    └─ Repository Layer (Spring Data JPA → Hibernate ORM)
         │
         ▼
     PostgreSQL / MySQL Database
```

## Request Flow

### Protected API Request (e.g., POST /api/urls/shorten)
1. **Client** sends `POST /api/urls/shorten` with `Authorization: Bearer <JWT>` header and JSON body `{ "originalUrl": "..." }`
2. **`JwtAuthenticationFilter`** intercepts the request (runs `doFilterInternal`):
   - Calls `JwtUtils.getJwtFromHeader()` to strip `Bearer ` prefix
   - Calls `JwtUtils.validateToken()` — verifies HMAC signature using the secret key
   - Calls `JwtUtils.getUsernameFromJwtToken()` — parses the `sub` claim
   - Loads `UserDetails` via `UserDetailsServiceImpl.loadUserByUsername()` (DB lookup)
   - Sets `UsernamePasswordAuthenticationToken` into `SecurityContextHolder`
3. **`WebSecurityConfig.filterChain`** evaluates `.requestMatchers("/api/urls/**").authenticated()` — passes because authentication is set
4. **`UrlMappingController.createShortUrl()`** is invoked:
   - `@PreAuthorize("hasRole('USER')")` checks role — passes
   - Extracts `originalUrl` from request body
   - Resolves `User` from `Principal` via `UserService.findByUsername()`
5. **`UrlMappingService.createShortUrl()`**:
   - Calls `generateShortUrl()` — produces 8-char random alphanumeric string
   - Creates and populates `UrlMapping` entity
   - Saves via `UrlMappingRepository.save()`
   - Converts to `UrlMappingDTO` and returns
6. **Controller** wraps in `ResponseEntity.ok(urlMappingDTO)` → `200 OK` with JSON body
7. **Client** receives the DTO, closes the modal, shows a toast, and optionally refetches the URL list

### Redirect Request (GET /{shortUrl})
1. **User** opens the short URL in a browser (e.g., `https://api.pslinky.com/Ab3Cd8Ef`)
2. Or the frontend `/s/:url` page sets `window.location.href = BACKEND_URL + "/" + url`
3. **`RedirectController.redirect()`** is invoked (no auth required):
   - Calls `UrlMappingService.getOriginalUrl(shortUrl)`
4. **`UrlMappingService.getOriginalUrl()`**:
   - Looks up `UrlMapping` by `shortUrl`
   - Increments `clickCount` and saves the updated entity
   - Creates a new `ClickEvent` with `LocalDateTime.now()` and saves it
   - Returns the `UrlMapping`
5. **Controller** builds `HttpHeaders` with `Location: <originalUrl>` and returns `ResponseEntity.status(302).headers(...).build()`
6. **Browser** follows the `302` redirect to the original URL

---

# Authentication

## Flow
1. **Registration**: Client POSTs `{ username, email, password }` to `/api/auth/public/register`. `UserService.registerUser()` encodes the password with `BCryptPasswordEncoder` and saves the `User` entity. Returns `200 OK` with success message.
2. **Login**: Client POSTs `{ username, password }` to `/api/auth/public/login`. `UserService.authenticateUser()` delegates to `AuthenticationManager.authenticate()` with a `UsernamePasswordAuthenticationToken`. Spring Security internally calls `UserDetailsServiceImpl.loadUserByUsername()` which fetches the user from DB and builds a `UserDetailsImpl`. BCrypt verification happens internally. On success, `JwtUtils.generateToken()` creates a signed JWT.
3. **Token Storage**: Client stores the JWT in `localStorage` under the key `"JWT_TOKEN"`.
4. **Token Usage**: On every API call, the client reads the token from context (seeded from `localStorage`) and adds it to the `Authorization: Bearer <token>` header.
5. **Token Validation**: The `JwtAuthenticationFilter` intercepts every request, validates the token, and populates the `SecurityContextHolder`.
6. **Logout**: Client calls `setToken(null)` and `localStorage.removeItem("JWT_TOKEN")`, then redirects to `/login`. No server-side token invalidation (stateless JWT).

## JWT Details
| Property | Value |
|---|---|
| Library | `io.jsonwebtoken` (jjwt) v0.13.0 |
| Algorithm | HMAC-SHA (auto-selected based on key length — HS256/HS384/HS512) |
| Claims | `sub` (username), `roles` (comma-separated), `iat` (issued at), `exp` (expiry) |
| Expiry | **172,800,000 ms = 48 hours** |
| Secret | Base64-encoded string injected via `${JWT_SECRET}` environment variable |
| Storage (client) | `localStorage` (key: `"JWT_TOKEN"`) |
| Transmission | `Authorization: Bearer <token>` HTTP header |
| Refresh Tokens | **Not implemented** — token expires after 48 hours; user must log in again |
| Cookies | **Not used** |
| Sessions | **Not used** (fully stateless) |

## Authorization Flow
- All endpoints under `/api/urls/**` require an authenticated principal (validated JWT)
- Method-level `@PreAuthorize("hasRole('USER')")` provides a second layer of role-based authorization on `createShortUrl`, `getUserUrls`, `getUrlAnalytics`, and `getTotalClicksByDate`
- The redirect endpoint `/{shortUrl}` is fully public (no auth required to follow a short link)

---

# Validation

| Layer | Field | Validation Rule |
|---|---|---|
| **Frontend (react-hook-form)** | `username` (login/register) | Required |
| **Frontend** | `email` (register) | Required, regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` |
| **Frontend** | `password` (login/register) | Required, minimum 6 characters |
| **Frontend** | `originalUrl` (shorten form) | Required, regex: `^(https?:\/\/)?(([a-zA-Z0-9\u00a1-\uffff-]+\.)+[a-zA-Z\u00a1-\uffff]{2,})(:\d{2,5})?(\/[^\s]*)?$`, input type=`url` |
| **Frontend** | All fields | Touched/dirty validation (mode: `"onTouched"`) — errors only shown after user interaction |
| **Backend (Spring Security)** | `username` | Must exist in the database (`UsernameNotFoundException` thrown otherwise) |
| **Backend** | JWT token | Signature verified, expiry checked, malformed token caught (`JwtException`, `IllegalArgumentException`) |
| **Backend** | `Principal` | All `@PreAuthorize` checks verify `ROLE_USER` before executing |
| **Backend** | `startDate` / `endDate` | ISO 8601 datetime/date format enforced by `DateTimeFormatter.ISO_LOCAL_DATE_TIME` and `ISO_LOCAL_DATE` |

---

# Exception Handling

## Backend Exception Handling

| Scenario | Exception Type | HTTP Status | Response |
|---|---|---|---|
| User not found by username | `UsernameNotFoundException` (Spring Security) | `401 Unauthorized` (handled by Spring Security) | Standard Spring Security error response |
| Invalid / expired JWT token | `JwtException` wrapped in `RuntimeException` | `401 Unauthorized` (filter catches, clears context) | Unknown (filter swallows and continues chain unauthenticated) |
| Short URL not found | Returns `null` from service | `404 Not Found` | Empty body |
| Missing authentication on protected route | Blocked by `SecurityFilterChain` | `403 Forbidden` | Standard Spring Security response |
| Wrong role on method | `@PreAuthorize` check fails | `403 Forbidden` | Standard Spring Security response |

> **Note:** No custom `@ExceptionHandler` or `@ControllerAdvice` global exception handler was found in the codebase. Error responses rely on Spring Security's default behavior. This is a future improvement opportunity.

## Frontend Error Handling
- `try/catch` blocks around all API calls
- `react-hot-toast` used to display user-friendly error messages (`toast.error(...)`)
- Navigation to `/error` page on unexpected fetch failures (e.g., in `ShortenItem.fetchMyShortUrl`)
- `ErrorPage` component accepts an optional `message` prop for custom error text
- Wildcard route `path="*"` renders `ErrorPage` with "We can't seem to find the page you're looking for"

---

# Security

## Input Validation
- Frontend enforces URL format with a regex pattern before submission
- Email validated with RFC-compliant regex
- Password minimum length enforced at 6 characters on the client
- `type="url"` and `type="email"` HTML attributes provide browser-native validation as a first pass

## Password Encryption
- Passwords are hashed using **BCrypt** via Spring Security's `BCryptPasswordEncoder`
- BCrypt is an adaptive one-way hash function — brute-force attacks are computationally expensive
- Hashed password is stored in the `users` table; the plaintext password is never stored or logged

## JWT Security
- Secret key is injected from environment variable (`${JWT_SECRET}`) — never hardcoded in source
- Tokens are signed with HMAC-SHA using a `SecretKey` derived from the Base64-decoded secret
- `JwtUtils.validateToken()` catches `JwtException`, `IllegalArgumentException`, and any other `Exception`, preventing token forgery
- Token expiry (48 hours) limits the window of exposure if a token is compromised

## Rate Limiting
- **Not implemented** — no rate limiting on the API endpoints. This is a future improvement.

## CORS
- Configured in `WebConfig.java` using Spring MVC's `CorsRegistry`
- Allowed origin: value of `${FRONTEND_URL}` environment variable only (not `*`)
- Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- `allowCredentials(true)` enables cookies/auth headers
- `maxAge(3600)` caches preflight responses for 1 hour

## CSRF
- **CSRF is disabled** (`http.csrf(AbstractHttpConfigurer::disable)`)
- This is standard and secure for stateless JWT APIs, because:
  - The JWT is sent in the `Authorization` header (not a cookie)
  - Browsers do not automatically send the `Authorization` header cross-origin
  - CSRF attacks exploit automatic cookie sending — inapplicable here

## SQL Injection Prevention
- **Spring Data JPA with Hibernate ORM** is used for all database operations
- All queries use derived query methods or Spring Data interfaces — no raw SQL strings
- Hibernate uses parameterized queries internally — user input is never interpolated into SQL strings

## XSS Prevention
- React's JSX inherently escapes all values rendered in JSX (`{}` interpolation) — no `dangerouslySetInnerHTML` was found in the codebase
- User-supplied URLs are displayed as text content, not injected as raw HTML

---

# Business Logic

## URL Creation
- Only authenticated users with `ROLE_USER` can create short URLs
- The `originalUrl` is stored as-is (no normalization or deduplication — the same long URL can produce multiple different short slugs)
- A new `UrlMapping` is created with `createdDate = LocalDateTime.now()` and `clickCount = 0`
- The generated short URL is saved directly as a string slug (not the full short URL — the domain is prepended only on the frontend)

## Click Counting
- Every time `/{shortUrl}` is hit, two operations occur atomically within `getOriginalUrl()`:
  1. `urlMapping.setClickCount(urlMapping.getClickCount() + 1)` and `urlMappingRepository.save(urlMapping)`
  2. A new `ClickEvent` with `clickDate = LocalDateTime.now()` is created and saved
- Both the cumulative counter (`clickCount`) and the raw event log (`ClickEvent` table) are maintained simultaneously, enabling both quick total-count display and detailed date-range analytics

## Analytics Aggregation
- For per-link analytics: `ClickEvent` records are fetched by `urlMapping` and `clickDate` range, then grouped by `clickDate.toLocalDate()` using Java Streams `Collectors.groupingBy(..., Collectors.counting())`, producing a `List<ClickEventDTO>` with `{ clickDate, count }` per day
- For total (all-links) analytics: All the user's `UrlMapping` entities are fetched, then all `ClickEvent`s belonging to those mappings within the date range are fetched in a single IN-clause query, then grouped and counted the same way — producing a `Map<LocalDate, Long>`

## Authentication State (Frontend)
- On login, the JWT is stored in both React Context state and `localStorage`
- On app load, `ContextApi.jsx` initializes the token state from `localStorage` (`JSON.parse(localStorage.getItem("JWT_TOKEN"))`) — this enables session persistence across page refreshes
- The `PrivateRoute` component reads the token from context: if `token` is null and the route is protected, redirect to `/login`; if `token` is set and the route is public-only, redirect to `/dashboard`

## URL Sorting
- The `useFetchMyShortUrls` hook's `select` transformer sorts the returned URLs by `createdDate` descending: `data.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))` — so the most recently created link always appears at the top of the dashboard list

---

# URL Shortening Logic

## Slug Generation Algorithm
```
characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
// 62 characters total

shortUrl = StringBuilder(capacity=8)
for i in 0..7:
    shortUrl.append(characters[random.nextInt(62)])

return shortUrl.toString()
```

- **Length**: 8 characters
- **Alphabet**: 62 characters (26 uppercase + 26 lowercase + 10 digits)
- **Search space**: 62⁸ = **218,340,105,584,896** unique combinations (~218 trillion)
- **Generator**: `java.util.Random` (non-cryptographic, sufficient for slug generation)
- **Encoding**: Pure character sampling — no Base64, no hashing, no encoding

## Collision Handling
- **No explicit collision handling is implemented** in the current codebase
- The probability of collision is extremely low at 62⁸ combinations
- If a collision occurs, the `save()` call would silently overwrite if `shortUrl` is not unique-constrained, or throw a DB constraint violation if it is
- **Future improvement**: Add a uniqueness check (`findByShortUrl(shortUrl) != null`) and regenerate if collision detected

## Expiration
- **No expiration is implemented** — created URLs live indefinitely in the database
- **Future improvement**: Add an `expiresAt` timestamp field and check it during redirect resolution

---

# Redirect Flow

When a user opens a short URL, the following exact sequence of events occurs:

1. **User opens the short link** (e.g., shared on social media as `https://app.pslinky.com/s/Ab3Cd8Ef`)
2. **React Router** on the frontend matches the `/s/:url` route pattern and renders `ShortenUrlPage`
3. **`ShortenUrlPage` useEffect** fires immediately on mount: `window.location.href = VITE_BACKEND_URL + "/" + url` — this redirects the browser directly to the backend server (e.g., `https://api.pslinky.com/Ab3Cd8Ef`)
4. **Browser sends `GET /Ab3Cd8Ef`** to the Spring Boot backend
5. **`JwtAuthenticationFilter`** runs — no JWT found, proceeds unauthenticated (the endpoint is public)
6. **`SecurityFilterChain`** evaluates `/{shortUrl}` — matches `.requestMatchers("/{shortUrl}").permitAll()` — passes
7. **`RedirectController.redirect("Ab3Cd8Ef")`** is invoked
8. **`UrlMappingService.getOriginalUrl("Ab3Cd8Ef")`**:
   - Queries DB: `urlMappingRepository.findByShortUrl("Ab3Cd8Ef")`
   - If found: increments `clickCount` by 1 and saves
   - Creates new `ClickEvent(clickDate=now(), urlMapping=found)` and saves
   - Returns the `UrlMapping`
9. **Controller** checks: if `urlMapping != null`:
   - Builds `HttpHeaders` with `Location: https://example.com/very/long/path`
   - Returns `ResponseEntity.status(302).headers(httpHeaders).build()`
10. **Browser follows the 302 redirect** — user arrives at the original destination URL
11. If `urlMapping == null`: returns `ResponseEntity.notFound().build()` → `404 Not Found`

---

# Analytics

## What is tracked:

| Metric | Implementation | Storage |
|---|---|---|
| **Click Count** | Incremented on every redirect resolution in `getOriginalUrl()` | `url_mapping.click_count` (cumulative integer) |
| **Click Timestamp** | `LocalDateTime.now()` saved as `click_event.click_date` on every redirect | `click_event` table row |
| **Clicks Per Day (Per URL)** | Java Stream grouping: `Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting())` | Computed at query time from `click_event` |
| **Total Clicks Per Day (All User URLs)** | Same stream grouping applied across all of the user's URLs in one IN-clause DB query | Computed at query time |

## What is NOT currently tracked:
- Country / geolocation
- Browser (User-Agent parsing)
- Operating system
- Device type (mobile/desktop)
- Referrer (HTTP `Referer` header)
- Unique visitors (IP deduplication)
- Bot/crawler filtering

> These are all future improvement opportunities that would make the analytics system significantly more powerful.

## Analytics Date Range
- Date ranges are passed as ISO 8601 query parameters: `?startDate=2024-01-01&endDate=2026-12-31`
- Per-URL analytics uses `ISO_LOCAL_DATE_TIME` format (includes time component)
- Total clicks uses `ISO_LOCAL_DATE` format (date only)
- The frontend currently hard-codes a wide date range (2024–2027) to effectively fetch all history

---

# Screens

| Screen | Route | Description |
|---|---|---|
| **Landing Page** | `/` | Hero section with animated headline ("PS Linky Simplifies URL Shortening For Efficient Sharing"), description text, "Manage Links" and "Create Short Link" CTA buttons, hero image, and a 4-column grid of animated feature Cards. Fully responsive. |
| **About Page** | `/about` | Static informational page describing PS Linky's four core features (Simple URL Shortening, Powerful Analytics, Enhanced Security, Fast and Reliable) with icon-prefixed sections. |
| **Register Page** | `/register` | Centered card with a branded header, Username, Email, and Password fields (react-hook-form validated), a gradient submit button, and a link to the Login page. Redirects authenticated users to `/dashboard`. |
| **Login Page** | `/login` | Centered card with a branded header, Username and Password fields (react-hook-form validated), a gradient submit button, and a link to the Register page. On success, stores JWT and navigates to `/dashboard`. Redirects authenticated users to `/dashboard`. |
| **Dashboard** | `/dashboard` | Protected page showing a full-width `Graph` (bar chart of total clicks per day for all user links), a "Create a New Short URL" button, and a list of all shortened URLs. Shows empty state if no links exist. |
| **Shorten URL Page** | `/s/:url` | Invisible redirect page — shows "Redirecting..." text briefly while executing `window.location.href` to the backend redirect endpoint. No navbar or footer shown. |
| **Error Page** | `/error` or any unknown path | Centered card with a red exclamation triangle icon, "Oops! Something went wrong." heading, a configurable message prop, and a "Go back to home" button. |

## Modal / Overlay Screens
| Screen | Trigger | Description |
|---|---|---|
| **Create Short URL Modal** | "Create a New Short URL" button on Dashboard | MUI Modal overlay containing the `CreateNewShorten` form component. URL input with validation, Create button, and close (×) button. On success, copies the new short URL to clipboard and shows a toast. |
| **Per-URL Analytics Panel** | "Analytics" button on each `ShortenItem` | Inline collapsible section below each URL card that reveals a `Graph` bar chart showing click data for that specific URL. Shows a Hourglass spinner during data fetch and an empty-state message if no clicks recorded. |

---

# UI Components

| Component | File | Description |
|---|---|---|
| `Navbar` | `Navbar.jsx` | Sticky gradient (blue→purple) navbar with logo (image + text), navigation links (Home, About, Dashboard conditional on auth), SignUp/LogOut button. Mobile hamburger menu that slides the nav links down. Active route highlighting. |
| `Footer` | `Footer.jsx` | Full-width gradient footer with brand name, tagline, copyright, and social media icon links (GitHub, LinkedIn, Instagram, personal website). |
| `Card` | `Card.jsx` | Feature info card with title and description text, animated in from below using Framer Motion (`initial: { opacity: 0, y: 120 }`). Used in the Landing Page feature grid. |
| `TextField` | `TextField.jsx` | Reusable controlled input component integrating with `react-hook-form`. Accepts `label`, `id`, `type`, `placeholder`, `required`, `min`, `message`, `register`, `errors` props. Auto-applies email, URL, and minLength validation rules. Renders inline error messages in red. |
| `Loader` | `Loader.jsx` | Full-screen centered `RotatingLines` spinner (from `react-loader-spinner`). Used as a page-level loading state for the Dashboard. |
| `PrivateRoute` | `PrivateRoute.jsx` | HOC-style route guard. Accepts `publicPage` boolean prop. Redirects unauthenticated users from protected routes to `/login`, and authenticated users from public-only routes to `/dashboard`. |
| `DashboardLayout` | `DashboardLayout.jsx` | Orchestrates the dashboard: fetches URL list and total clicks in parallel via `useFetchMyShortUrls` and `useFetchTotalClicks`, renders the `Graph`, "Create" button, `ShortenUrlList`, and `ShortenPopUp`. |
| `ShortenPopUp` | `ShortenPopUp.jsx` | MUI `Modal` wrapper that renders `CreateNewShorten` centered on screen. Handles open/close state. |
| `CreateNewShorten` | `CreateNewShorten.jsx` | URL creation form with `react-hook-form`, validated URL input, loading state management, success clipboard copy + toast, and a close button. |
| `ShortenUrlList` | `ShortenUrlList.jsx` | Renders a list of `ShortenItem` components by mapping over the URL array data. |
| `ShortenItem` | `ShortenItem.jsx` | Individual URL card showing: clickable short URL with external link icon, original URL, click count badge, creation date, Copy button (with clipboard + isCopied feedback), Analytics toggle button, and an expandable `Graph` panel for per-link analytics. |
| `Graph` | `Graph.jsx` | Chart.js `Bar` chart wrapper. Renders "Total Clicks" (y-axis) vs "Date" (x-axis). Displays placeholder ghost bars when no data is present. Responsive, non-aspect-ratio-locked. |
| `AppRouter` | `AppRouter.jsx` | Main route configuration with `<Routes>` and all `<Route>` definitions. Conditionally hides Navbar and Footer on `/s/` routes. Also exports `SubDomainRouter` for subdomain-based routing. |
| `ContextApi` / `ContextProvider` | `ContextApi.jsx` | React Context providing global `{ token, setToken }` state, seeded from `localStorage` on app load. |

---

# Challenges Solved

1. **Stateless JWT Authentication Integration**: Implementing a custom `OncePerRequestFilter` that correctly intercepts every request, parses the Bearer token from the `Authorization` header, validates the HMAC signature without a session store, and populates the Spring Security context — all without breaking the filter chain for unauthenticated public routes.

2. **CORS Configuration for SPA + API Separation**: Getting the CORS preflight (`OPTIONS`) requests to pass correctly when the frontend (port 5173 in dev) hits the backend (port 8080). Required both permitting `OPTIONS` requests in `SecurityFilterChain` and configuring `CorsRegistry` in `WebConfig`, and injecting the allowed origin from environment variable.

3. **TanStack React Query v5 Migration**: The `onError` callback was removed in React Query v5. Required restructuring error handling to use `useEffect` with `isError`/`error` instead of the callback pattern. Also required understanding the new `queryKey` array format.

4. **Dual-Mode Analytics Queries**: Implementing both per-URL analytics (a single URL's clicks over a date range) and aggregate user analytics (all of a user's URLs' clicks over a date range) efficiently. The latter required a single `findByUrlMappingInAndClickDateBetween` JPA query using an IN clause to avoid N+1 query problems.

5. **Real-time Click Counting + Event Logging**: Maintaining both a cumulative counter (`click_count` on the URL mapping) and an immutable event log (`click_event` rows) in the same transaction on every redirect, to enable both O(1) count display and O(n) date-filtered analytics.

6. **Redirect Flow Across Frontend and Backend**: Engineering the two-hop redirect (frontend `/s/:url` → backend `/{shortUrl}` → original URL) correctly, including hiding the Navbar/Footer on the redirect page by checking `location.pathname.startsWith("/s")`, and ensuring the redirect is immediate via `window.location.href` in a `useEffect`.

7. **Chart.js Integration with Dynamic Data**: Registering Chart.js components globally (`ChartJS.register(...)`), handling the empty-state gracefully (showing ghost placeholder bars instead of an empty chart), and configuring the bar chart to display integer-only Y-axis ticks with `Number.isInteger(value)` callback.

8. **Multi-Stage Docker Build for Java 26**: Using Eclipse Temurin 26-JDK for the build stage and 26-JRE for the runtime stage, pre-caching Maven dependencies with `dependency:go-offline` to avoid re-downloading on every build, and skipping tests in the Docker build (`-DskipTests`).

9. **Dual Database Environments**: Maintaining two `.env` files — one for local MySQL development and one for production Neon PostgreSQL — with Hibernate `ddl-auto=update` and dialect switching via environment variable, without code changes.

10. **Route-based Navbar/Footer Toggle**: Conditionally rendering the Navbar and Footer based on the current path (hidden on redirect pages) using React Router's `location.pathname`, preventing UI elements from appearing during the redirect experience.

---

# Performance Optimizations

## Caching
- **TanStack React Query**: URL list and total clicks data are cached with `staleTime: 5000` ms, preventing redundant API calls within the stale window during the same session.

## Lazy Loading
- **Per-URL Analytics**: Analytics data is fetched on demand only when the user clicks the "Analytics" button (`analyticToggle === true`), triggered by `useEffect` on `selectedUrl` state change — not pre-loaded for every URL in the list.

## Pagination
- **Not implemented** in the current version. All user URLs are returned in a single API response. This should be addressed as user link counts grow.

## Compression
- **Not explicitly configured** at the application level. Neon PostgreSQL handles connection-level compression. Vite's build output is optimized with tree-shaking and minification.

## Database Optimization
- **Bulk IN-clause query**: `findByUrlMappingInAndClickDateBetween(List<UrlMapping>, ...)` fetches click events for all user URLs in a single DB round-trip instead of N separate queries.
- **JPA lazy loading**: `@OneToMany(mappedBy = "urlMapping")` on `UrlMapping.clickEvents` defaults to `LAZY` fetch type in JPA — click events are not loaded when fetching URL mappings for the dashboard list.
- **`ddl-auto=update`**: Schema is only migrated on startup, not on every query.

## Connection Pooling
- **Neon serverless** provides built-in connection pooling at the cloud infrastructure level (PgBouncer-compatible).
- **Spring Boot** uses HikariCP (the default connection pool for Spring Boot Data JPA) for efficient JDBC connection reuse.

## Build Optimization
- **Vite build**: ES module tree-shaking, chunk splitting, minified output in `dist/`
- **Multi-stage Docker**: Final image contains only the JRE and the JAR — no build tools, Maven, or JDK in production
- **Maven dependency caching**: `RUN ./mvnw dependency:go-offline` in a separate Docker layer ensures dependencies are cached between builds

---

# Deployment

## Frontend Hosting
- Static build output (`dist/`) — can be hosted on any static hosting platform (Vercel, Netlify, GitHub Pages, S3 + CloudFront, etc.)
- Unknown (specific frontend hosting platform not determined from codebase)

## Backend Hosting
- Dockerized Spring Boot application
- Unknown (specific backend hosting platform not determined from codebase — could be Railway, Render, Fly.io, AWS EC2, etc.)

## Database Hosting
- **Production**: Neon serverless PostgreSQL (`ep-silent-paper-azh8yn8e.c-3.ap-southeast-1.aws.neon.tech`)
- **Development**: MySQL on `localhost:3306` (database: `urlshortenerdb`)

## Docker
- Backend is fully containerized via `Dockerfile`
- Environment variables injected at container runtime

## Environment Variables

### Backend
| Variable | Description | Dev Value | Prod Value |
|---|---|---|---|
| `DATABASE_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/urlshortenerdb` | Neon PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | DB username | `root` | `neondb_owner` |
| `DATABASE_PASSWORD` | DB password | `root` | (secret) |
| `DATABASE_DIALECT` | Hibernate dialect class | `MySQLDialect` | `PostgreSQLDialect` |
| `JWT_SECRET` | Base64-encoded HMAC signing secret | (same for dev/prod in repo) | (secret) |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` | Production frontend URL |

### Frontend
| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the Spring Boot API |
| `VITE_REACT_FRONT_END_URL` | Frontend origin URL (used to construct short link display and clipboard copy) |

---

# Docker

## Dockerfile Analysis

```dockerfile
# Stage 1: Build
FROM eclipse-temurin:26-jdk AS build
WORKDIR /app
COPY mvnw ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw              # Make Maven wrapper executable
COPY pom.xml ./
RUN ./mvnw dependency:go-offline   # Pre-cache all dependencies (Docker layer cache)
COPY src ./src
RUN ./mvnw clean package -DskipTests  # Build the JAR, skip tests

# Stage 2: Runtime
FROM eclipse-temurin:26-jre        # Lean JRE-only image (no JDK in production)
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar  # Copy only the final JAR
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

## Container Configuration
| Property | Value |
|---|---|
| **Build Base Image** | `eclipse-temurin:26-jdk` |
| **Runtime Base Image** | `eclipse-temurin:26-jre` |
| **Exposed Port** | `8080` |
| **Entry Point** | `java -jar /app/app.jar` |
| **Build Tool** | Maven Wrapper (`mvnw`) |
| **Build Command** | `mvn clean package -DskipTests` |

## Docker Compose
- **Not found** in the repository. A `docker-compose.yml` could be created to orchestrate the backend container + a PostgreSQL container for local development.

## Volumes
- **Not configured** in the Dockerfile. A production deployment would typically mount a volume for logs if file-based logging is used.

---

# Testing

## Unit Tests
- A `src/test/` directory exists in the backend project (created by Spring Initializr)
- No test files were found in the directory during analysis
- **Status**: No unit tests implemented (tests are skipped in Docker build with `-DskipTests`)

## Integration Tests
- **Not implemented**

## Manual Testing
- The application was manually tested by running the frontend dev server and backend locally
- User flows tested: registration, login, URL shortening, copying short URLs, analytics viewing, logout

## Postman
- **Unknown** — No Postman collection file was found in the repository. API endpoints can be easily tested with Postman given the documented REST API table above.

## Spring Security Test
- `spring-boot-starter-security-test` dependency is included in `pom.xml` (test scope), indicating intent to write security integration tests in the future.

---

# Future Improvements

1. **Custom Short URL Slugs** — Allow users to specify their own desired slug instead of using the auto-generated random string (with uniqueness validation)
2. **URL Expiration** — Add an `expiresAt` field to `UrlMapping` and check expiry during redirect resolution, returning `410 Gone` for expired links
3. **Collision Detection** — Add a uniqueness check in `generateShortUrl()` to handle the rare case where a randomly generated slug already exists in the database
4. **Global Exception Handler** — Implement a `@ControllerAdvice` class to produce consistent, structured JSON error responses (with `status`, `message`, `timestamp`) for all exception types instead of relying on Spring's default error format
5. **JWT Refresh Token** — Implement a refresh token flow so users are not logged out after 48 hours; access tokens expire quickly (e.g., 15 minutes), refresh tokens last longer and are used to issue new access tokens silently
6. **Rate Limiting** — Add rate limiting (e.g., using Bucket4j or Spring Boot's `resilience4j`) on the URL creation and redirect endpoints to prevent abuse
7. **Extended Analytics (Browser, OS, Device, Country)** — Parse the `User-Agent` header and resolve the client IP to a country using a GeoIP database (e.g., MaxMind GeoLite2) on each redirect, storing these as additional columns in `ClickEvent`
8. **Unique Visitor Tracking** — Track unique visitors by hashing the client IP + User-Agent, storing a `visitorHash` on each `ClickEvent` to distinguish unique vs. repeat clicks
9. **Referrer Tracking** — Record the HTTP `Referer` header on each redirect to analytics, showing users where their traffic comes from
10. **QR Code Generation** — Generate a QR code for each shortened URL that can be downloaded directly from the dashboard (using a library like `qrcode` on the frontend or `zxing` on the backend)
11. **Link Management (Edit/Delete)** — Add `PUT /api/urls/{id}` and `DELETE /api/urls/{id}` endpoints so users can update the original URL or delete links they no longer want
12. **Search and Filtering on Dashboard** — Add a search bar to filter the user's URL list by original URL or short slug, and a date-range picker for the analytics chart
13. **Pagination of URL List** — Implement server-side pagination (`Page<UrlMappingDTO>` via Spring Data `Pageable`) to handle users with large numbers of links efficiently
14. **Admin Panel** — Add an `ROLE_ADMIN` role with a separate admin dashboard to view all users, all URLs, system-wide analytics, and the ability to ban or delete any URL
15. **Email Verification** — Send a confirmation email on registration using Spring Mail, requiring users to verify their email before their account is activated
16. **Password Reset Flow** — Implement a "Forgot Password" flow using a time-limited reset token sent via email
17. **Docker Compose Setup** — Add a `docker-compose.yml` file to spin up the backend container + PostgreSQL container + optionally a frontend container in one command for easy local development and CI
18. **Automated Tests (Unit + Integration)** — Write JUnit 5 unit tests for `UrlMappingService` and `UserService`, and Spring MockMvc integration tests for all API endpoints with `@WebMvcTest` and `@SpringBootTest`

---

# Project Statistics

| Metric | Approximate Value |
|---|---|
| **Lines of Code (Backend Java)** | ~700 LOC |
| **Lines of Code (Frontend JSX/JS)** | ~900 LOC |
| **Total LOC** | ~1,600 LOC |
| **Number of REST API Endpoints** | 7 |
| **Number of React Components** | 17 |
| **Number of Database Tables** | 3 |
| **Number of Java Classes** | 18 |
| **Number of DTOs** | 4 |
| **Number of JPA Entities** | 3 |
| **Number of Repositories** | 3 |
| **Number of Controllers** | 3 |
| **Number of Services** | 4 |
| **Commits** | Unknown |
| **Branches** | Unknown |
| **Docker Build Stages** | 2 |
| **Environment Configurations** | 2 (dev + prod) |

---

# Links

| Resource | URL |
|---|---|
| **Repository** | https://github.com/Pranav-Sharma-Official/ (exact repo URL Unknown) |
| **Frontend Repository** | Unknown (same monorepo or separate — Unknown) |
| **Backend Repository** | Unknown (same monorepo — `urlshortener/` folder) |
| **Live Demo** | Unknown |
| **Swagger / OpenAPI** | Not implemented |
| **Postman Collection** | Unknown |
| **Docker Hub** | Unknown |
| **Video Demo** | Unknown |
| **Developer GitHub** | https://github.com/Pranav-Sharma-Official/ |
| **Developer LinkedIn** | https://www.linkedin.com/in/-pranav--sharma-/ |
| **Developer Instagram** | https://www.instagram.com/pranav_sharma.official/ |
| **Developer Website** | https://pranav-sharma.dev/ |

---

# Screenshots

No screenshot files were found in the repository directories scanned. The repository contains a `Schematic Diagram.png` in the root `URL_Shortener/` directory and references `/images/img2.png` as a public asset in the frontend, but no UI screenshots are stored in the project.

**Recommended screenshots to capture for the portfolio:**
1. Landing page (hero section with animation)
2. Login page
3. Register page
4. Dashboard — URL list with click counts and creation dates
5. Dashboard — Total clicks bar chart
6. "Create New Short URL" modal
7. Per-URL analytics panel with bar chart
8. Mobile responsive view of the navbar (hamburger open)
9. Empty state dashboard (no links yet)
10. Error page

---

# Resume Description

- **Engineered PS Linky**, a full-stack URL shortening platform using **Spring Boot 4 (Java 26)**, **React 19**, and **PostgreSQL (Neon serverless)**, featuring stateless **JWT authentication** with BCrypt password hashing, a **RESTful API** with 7 endpoints, and a multi-stage **Dockerized** backend deployed to production.

- **Architected a real-time click analytics system** collecting per-click event timestamps stored in a normalized relational schema (3 tables), with server-side Java Streams aggregation producing date-grouped click data, visualized as interactive **Chart.js bar charts** on a responsive React dashboard with **TanStack React Query** caching and lazy-loaded analytics panels.

- **Implemented production-grade security** with a custom `OncePerRequestFilter` JWT interceptor, role-based `@PreAuthorize` method-level authorization, environment-variable–driven secret management, and dynamic CORS restriction to a configurable allowed origin — eliminating hardcoded secrets across two deployment environments (MySQL/dev, Neon PostgreSQL/prod).

---

# GitHub Description

> **PS Linky** — A full-stack URL shortener built with Spring Boot 4 (Java 26) + React 19. Features JWT authentication, BCrypt password hashing, click analytics with Chart.js bar charts, TanStack React Query, and a multi-stage Dockerized backend connected to Neon serverless PostgreSQL in production.
>
> `Spring Boot` `React` `JWT` `PostgreSQL` `Docker` `TailwindCSS` `Chart.js` `TanStack Query` `Framer Motion`

---

# Portfolio Description

**PS Linky** is a production-ready, full-stack URL shortening application that demonstrates end-to-end software engineering — from database design through REST API development to a polished, animated frontend.

On the backend, PS Linky uses Spring Boot 4 with a three-layer architecture (Controller → Service → Repository), stateless JWT authentication secured with HMAC-SHA signing, BCrypt password hashing, dynamic CORS configuration, and method-level role-based authorization. The URL shortening algorithm generates 8-character alphanumeric slugs from a 62-character alphabet, providing over 218 trillion unique combinations. Every redirect atomically records both a cumulative click counter and a timestamped click event, enabling powerful date-range analytics.

The frontend is a fast Vite + React 19 SPA with TailwindCSS styling, Framer Motion entrance animations, TanStack React Query for server-state caching, Chart.js for interactive click analytics bar charts, and `react-hook-form` for validated form management. The project is containerized with a multi-stage Docker build and deploys to production using Neon serverless PostgreSQL.

---

# Elevator Pitch

> "PS Linky is a full-stack URL shortener I built from scratch using Spring Boot on the backend and React on the frontend.
>
> Users register and log in — their passwords are BCrypt-hashed and sessions are managed with JWTs that I validate using a custom Spring Security filter on every request. Once logged in, they can shorten any URL — the backend generates an 8-character random alphanumeric slug with over 218 trillion possible combinations, saves it to a PostgreSQL database, and returns it. When someone opens the short link, the backend records the click as a timestamped event and issues a 302 redirect to the original URL.
>
> The dashboard is built with React Query for smart caching, shows an interactive Chart.js bar chart of total daily clicks, and lets users expand any link to see a per-link analytics chart — all lazily loaded on demand.
>
> The entire backend is containerized with a multi-stage Docker build using Eclipse Temurin Java 26, and it connects to a Neon serverless PostgreSQL instance in production. The project covers security, architecture, DevOps, and UX — the full spectrum of production software engineering."

---

# Interview Questions

1. **Why did you choose JWT over session-based authentication? What are the trade-offs?**
2. **Walk me through exactly what happens when a user logs in — from the HTTP request to the JWT being returned.**
3. **How does `OncePerRequestFilter` work in Spring Security and why is it important for your JWT filter?**
4. **How does BCrypt work and why is it better than MD5 or SHA-256 for password storage?**
5. **You disabled CSRF protection — explain why this is safe in the context of your application.**
6. **What is the probability of a slug collision in your current implementation? How would you fix it?**
7. **Why do you maintain both a `click_count` integer on `UrlMapping` AND a separate `ClickEvent` table?**
8. **Explain the N+1 query problem. How did you avoid it in your analytics service?**
9. **What is the difference between `@PreAuthorize` and configuring rules in `SecurityFilterChain`? When would you use each?**
10. **Why does TanStack React Query v5 remove the `onError` callback? How did you handle this?**
11. **Explain the purpose of `staleTime` in React Query. What value did you choose and why?**
12. **How does CORS work? What is a preflight request and why did you need to `permitAll()` OPTIONS requests in Spring Security?**
13. **Walk me through the two-hop redirect flow from the user clicking the short link to arriving at the destination.**
14. **Why use a multi-stage Docker build? What would happen if you only had one stage?**
15. **How does Spring Data JPA translate `findByUrlMappingAndClickDateBetween()` into SQL?**
16. **What is `HikariCP` and why does Spring Boot use it by default?**
17. **What does `@Transactional` on `loadUserByUsername` do? Why is it necessary?**
18. **How does your `PrivateRoute` component work? What problem does it solve?**
19. **Why store the JWT in `localStorage` instead of an HttpOnly cookie? What are the security implications of each?**
20. **What is `ddl-auto=update` and what are the risks of using it in production?**
21. **How would you add URL expiration? What changes would be required at the DB, service, and API layers?**
22. **How would you implement rate limiting on the URL creation endpoint?**
23. **How would you scale this application to handle 10 million redirects per day?**
24. **Explain the `@ManyToOne` and `@OneToMany` relationship between your entities. What SQL does Hibernate generate?**
25. **If you had to add geographic analytics (tracking country of the click), how would you implement it end-to-end?**

---

# Hidden Engineering Highlights

> **Things that signal genuine experience to senior engineers and technical recruiters:**

1. **Dual-environment `.env` separation** — Using `.env` (MySQL, local) and `.env.prod` (Neon PostgreSQL) with Hibernate dialect switching via environment variable shows understanding of deployment lifecycle and configuration management.

2. **`OncePerRequestFilter` implementation** — Writing a custom JWT filter that extends `OncePerRequestFilter` instead of using a generic `Filter` shows knowledge of the Spring Security filter chain internals and awareness of the "once per request" guarantee.

3. **IN-clause batch analytics query** — Using `findByUrlMappingInAndClickDateBetween(List<UrlMapping>, ...)` fetches all click events for a user's links in a single SQL query instead of one query per link, demonstrating awareness of N+1 query problems.

4. **Dual-record strategy on redirect** — Simultaneously incrementing the `click_count` counter AND creating a `ClickEvent` row on every redirect is an event-sourcing pattern: the counter enables O(1) display, and the event log enables flexible future analytics — this design decision shows forward-thinking architecture.

5. **React Query `select` for client-side transformation** — Using `select` in `useFetchMyShortUrls` to sort the API response client-side (by `createdDate` descending) is the idiomatic React Query pattern — it shows familiarity with the library's advanced API.

6. **`viewport={{ once: true }}` on Framer Motion animations** — Preventing repeated animations on scroll re-entry is a UX polish detail that shows attention to production quality beyond just making things work.

7. **`SubDomainRouter` export** — Exporting a secondary `SubDomainRouter` from `AppRouter.jsx` suggests forward thinking toward subdomain-based short URL resolution (e.g., `xyz.pslinky.com` instead of `pslinky.com/s/xyz`), indicating architectural planning beyond the current implementation.

8. **Environment-variable CORS origin** — Injecting the allowed CORS origin from `${FRONTEND_URL}` instead of hardcoding `"http://localhost:5173"` makes the backend deployment-agnostic and follows the Twelve-Factor App methodology.

9. **Maven dependency pre-caching in Docker** — `RUN ./mvnw dependency:go-offline` as a separate layer before copying source code means Docker's layer cache is used on rebuilds — only the source copy and compile steps re-run if source changes, not the dependency download. This is a professional Docker optimization.

10. **Ghost bar chart for empty state** — Rendering placeholder phantom bars (`[1,2,3,4,5,6,7,6,5,4,3,2,1]` with very low opacity) when no click data exists is a professional UX pattern (used by tools like Google Analytics and Stripe) that avoids a jarring empty white box.

---

# Suggested Badges

Add these to the top of your `README.md`:

```markdown
![Java](https://img.shields.io/badge/Java-26-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)
```
