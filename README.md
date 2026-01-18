**Angular Users ReqRes**

A modern Angular 20 application that displays paginated user data from the ReqRes API with advanced features including instant search, caching, loading states, and comprehensive testing.

## 📋 Table of Contents

- [📋 Table of Contents](#-table-of-contents)
- [✨ Features](#-features)
- [🔧 Prerequisites](#-prerequisites)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
  - [API Key Configuration](#api-key-configuration)
  - [Cache TTL Configuration](#cache-ttl-configuration)
- [🚀 Running the Application](#-running-the-application)
- [🧪 Testing](#-testing)
  - [Unit Tests](#unit-tests)
- [🗄️ Caching Logic](#️-caching-logic)
  - [Overview](#overview)
  - [How It Works](#how-it-works)
  - [Cache Behavior](#cache-behavior)
  - [Benefits](#benefits)
- [📁 Project Structure](#-project-structure)
- [🏗️ Architecture](#️-architecture)
  - [Design Patterns](#design-patterns)
  - [Key Technologies](#key-technologies)
  - [State Management](#state-management)
- [📚 Additional Information](#-additional-information)
  - [Browser Support](#browser-support)
  - [API Endpoints Used](#api-endpoints-used)
  - [Performance Optimizations](#performance-optimizations)
  - [Known Limitations](#known-limitations)

## ✨ Features

- **Paginated User List**: Browse users with responsive pagination controls
- **User Details**: Click on any user card to view detailed information
- **Instant Search**: Real-time search by User ID with debouncing (400ms)
- **Smart Caching**: Automatic caching with configurable TTL to minimize API requests
- **Loading Indicators**: Visual feedback during network requests via HTTP interceptor
- **Responsive Design**: responsive design using Angular Material
- **Animations**: Smooth transitions and hover effects
- **Back Navigation**: Easy navigation back to the user list
- **Error Handling**: Graceful error states with user-friendly messages
- **Type Safety**: Full TypeScript implementation with strict mode
- **Unit Tests**: Comprehensive test coverage with Jasmine/Karma

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or v20.x (recommended: v20.18.0 or later)
- **npm**: v9.x or v10.x (comes with Node.js)
- **Angular CLI**: v20.x

```bash
# Check your versions
node --version
npm --version

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@20
```

## 📦 Installation

1. **Clone & navigate to the project directory**:

```bash
git clone https://github.com/Hadi-AlKammouni/angular-users-reqres.git
cd angular-users-reqres/angular-users-reqres
```

2. **Install dependencies**:

```bash
npm install
```

This will install all required packages including:
- Angular 20 framework
- Angular Material UI components
- RxJS for reactive programming
- TypeScript
- Testing frameworks (Jasmine, Karma)

## ⚙️ Configuration

### API Key Configuration

The application uses the ReqRes API.

1. **Create the environment file**:

Windows PowerShell
```bash
Copy-Item src/environments/environment.template.ts src/environments/environment.ts
```

Linux/Mac
```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

2. **Update `src/environments/environment.ts`** with your configuration:

```typescript
export const environment = {
  production: false,
  apiKey: 'Your API key',
  apiUrl: 'https://reqres.in/api',
};
```

**Important Note**:
- The `environment.ts` file is gitignored to prevent exposing sensitive keys

### Cache TTL Configuration

The cache Time-To-Live (TTL) can be configured in `src/app/core/constants.ts`:

```typescript
export const CACHE_CONFIG = {
  // Default cache expiration time: 5 minutes (in milliseconds)
  EXPIRATION_MS: 5 * 60 * 1000,
};
```

**To modify the cache duration**:

1. Open `src/app/core/constants.ts`
2. Update `EXPIRATION_MS` value:
   - 1 minute: `1 * 60 * 1000`
   - 5 minutes: `5 * 60 * 1000` (default)
   - 10 minutes: `10 * 60 * 1000`
   - 30 minutes: `30 * 60 * 1000`
   - 1 hour: `60 * 60 * 1000`

The caching system uses this value globally for all API responses.

## 🚀 Running the Application

Start the development server with live reload:

```bash
npm start
# or
ng serve
```

The application will be available at:
- **URL**: http://localhost:4200
- **Auto-reload**: Yes (watches for file changes)


## 🧪 Testing

### Unit Tests

The project includes comprehensive unit tests for all services, components, and interceptors.

**Run all unit tests**:

```bash
npm test
# or
ng test
```

This will:
- Launch Karma test runner
- Open Chrome browser
- Run tests with live reload
- Display coverage report in the console


**Test Coverage**:
- Services: 100% (API, Cache, Loading)
- Interceptors: 100% (Loading Interceptor)
- Components: Comprehensive coverage for all UI components

## 🗄️ Caching Logic

### Overview

The application implements a sophisticated caching mechanism to minimize API requests and improve performance.

### How It Works

1. **Cache Service** (`src/app/core/services/cache.service.ts`):
   - Generic key-value store with TTL support
   - Automatic expiration checking
   - Memory-based storage (clears on page refresh)

2. **Integration with API Service**:
   ```typescript
   // On first request
   getUsers(page: number) {
     const cacheKey = `users_page_${page}`;
     const cached = this.cache.get(cacheKey);
     
     if (cached) {
       return of(cached); // Return cached data immediately
     }
     
     return this.http.get(url).pipe(
       tap(response => this.cache.set(cacheKey, response))
     );
   }
   ```

3. **Cache Keys**:
   - User list: `users_page_{pageNumber}` (e.g., `users_page_1`, `users_page_2`)
   - Single user: `user_{userId}` (e.g., `user_1`, `user_7`)

### Cache Behavior

**First Request**:
1. Check cache → Not found
2. Fetch from API
3. Store in cache with TTL
4. Return data

**Subsequent Requests** (within TTL):
1. Check cache → Found & not expired
2. Return cached data immediately
3. No API request made

**After TTL Expires**:
1. Check cache → Found but expired
2. Delete expired entry
3. Fetch from API
4. Store fresh data with new TTL

### Benefits

- ⚡ **Faster Load Times**: Instant data retrieval for cached requests
- 🌐 **Reduced Network Usage**: Fewer HTTP requests to API
- 💰 **API Rate Limit Protection**: Prevents hitting API limits
- 📱 **Better UX**: Seamless navigation without repeated loading states
- 🔋 **Lower Resource Usage**: Less bandwidth and processing

## 📁 Project Structure

```
angular-users-reqres/
├── src/
│   ├── app/
│   │   ├── core/                           # Core functionality
│   │   │   ├── constants.ts                # App-wide constants (Cache TTL)
│   │   │   ├── interceptors/               # HTTP interceptors
│   │   │   │   ├── loading.interceptor.ts  # Loading state management
│   │   │   │   └── loading.interceptor.spec.ts
│   │   │   ├── models/                     # TypeScript interfaces
│   │   │   │   ├── user.model.ts           # User data structure
│   │   │   │   └── api-response.model.ts   # API response types
│   │   │   └── services/                   # Core services
│   │   │       ├── api.service.ts          # HTTP requests + caching
│   │   │       ├── api.service.spec.ts
│   │   │       ├── cache.service.ts        # Caching logic
│   │   │       ├── cache.service.spec.ts
│   │   │       ├── loading.service.ts      # Global loading state
│   │   │       └── loading.service.spec.ts
│   │   ├── features/                       # Feature modules
│   │   │   └── users/
│   │   │       ├── users-list/             # User list component
│   │   │       │   ├── users-list.component.ts
│   │   │       │   ├── users-list.component.html
│   │   │       │   ├── users-list.component.scss
│   │   │       │   └── users-list.component.spec.ts
│   │   │       └── user-details/           # User details component
│   │   │           ├── user-details.component.ts
│   │   │           ├── user-details.component.html
│   │   │           ├── user-details.component.scss
│   │   │           └── user-details.component.spec.ts
│   │   ├── shared/                         # Shared components
│   │   │   └── components/
│   │   │       └── header/                 # Header with search
│   │   │           ├── header.component.ts
│   │   │           ├── header.component.html
│   │   │           ├── header.component.scss
│   │   │           └── header.component.spec.ts
│   │   ├── app.ts                          # Root component
│   │   ├── app.html                        # Root template
│   │   ├── app.scss                        # Global styles
│   │   ├── app.routes.ts                   # Route configuration
│   │   └── app.config.ts                   # App configuration
│   ├── environments/
│   │   ├── environment.ts                  # Development config (gitignored)
│   │   └── environment.template.ts         # Template for environment file
│   ├── index.html                          # Main HTML file
│   ├── main.ts                             # Application entry point
│   └── styles.scss                         # Global styles
├── angular.json                            # Angular CLI configuration
├── karma.conf.js                           # Karma test runner config
├── tsconfig.json                           # TypeScript configuration
├── package.json                            # Dependencies and scripts
└── README.md                               # This file
```

## 🏗️ Architecture

### Design Patterns

1. **Smart/Presentational Components**:
   - Smart components handle data fetching and state management
   - Presentational components focus on UI rendering

2. **Reactive Programming**:
   - Uses RxJS Observables for asynchronous operations
   - Angular Signals for reactive state management
   - Debouncing for search input optimization

3. **Dependency Injection**:
   - Services injected via Angular's DI system
   - Singleton services at root level

4. **Interceptor Pattern**:
   - HTTP interceptor for loading state management
   - Automatic tracking of all HTTP requests

### Key Technologies

- **Angular 20**: Latest version with standalone components
- **TypeScript 5.9**: Strict type checking enabled
- **Angular Material**: UI component library
- **RxJS 7.8**: Reactive extensions for async operations
- **Signals**: Angular's new reactive primitive
- **Jasmine/Karma**: Unit testing framework

### State Management

- **Loading State**: Managed via `LoadingService` with signals
- **Cache State**: In-memory cache via `CacheService`
- **Component State**: Local signals and observables
- **No external state library**: Leverages Angular's built-in features

## 📚 Additional Information

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### API Endpoints Used

- **User List**: `GET https://reqres.in/api/users?page={page}`
  - Returns paginated user data
  - 6 users per page
  - Total 2 pages (12 users)

- **Single User**: `GET https://reqres.in/api/users/{id}`
  - Returns detailed user information
  - Valid IDs: 1-12

### Performance Optimizations

1. **Caching**: Reduces redundant API calls
2. **Debouncing**: Search input delayed by 400ms
3. **Lazy Loading**: Components loaded on-demand
5. **Image Optimization**: NgOptimizedImage directive

### Known Limitations

- Cache is memory-based (cleared on page refresh)
- ReqRes API has limited data (only 12 users, 2 pages)
- No authentication/authorization implemented
- No persistent storage

---

**Built with ❤️ using Angular 20**
