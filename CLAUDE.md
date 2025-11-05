# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm ci` - Full CI pipeline (typecheck + lint + build)

## Testing Commands

- `pnpm test` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:run` - Run tests once (CI mode)
- `pnpm test:coverage` - Generate coverage reports

### Testing Setup

- **Framework**: Vitest with jsdom environment
- **Utilities**: React Testing Library
- **Test Files**: Located alongside source files with `.test.ts` or `.test.tsx` extension
- **Mocks**: Configured in [test/setup.ts](./test/setup.ts) (localStorage, matchMedia, IntersectionObserver)
- **Existing Tests**:
  - `app/utils/rut-utils.test.ts` - Chilean RUT validation
  - `app/utils/date-formatter.test.ts` - Date formatting utilities
  - `app/utils/auth-utils.test.ts` - JWT token decoding
  - `app/utils/password-validation.test.ts` - Password security validation (61 tests)
  - `app/hooks/use-mobile.test.ts` - Mobile device detection
  - `app/hooks/shared/use-export-data.test.ts` - CSV/Excel export functionality (18 tests)
  - `app/hooks/shared/use-export-pdf.test.ts` - PDF generation (partial coverage)

### Testing Guidelines

**When to Write Tests**:
- All utility functions in `app/utils/` (especially security-related)
- Custom hooks that contain business logic
- Complex data transformations
- Form validation logic

**Test Structure**:
```typescript
describe('ComponentName or functionName', () => {
  describe('specific feature', () => {
    it('should describe expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Best Practices**:
- Test behavior, not implementation details
- Use descriptive test names in Spanish (matching codebase language)
- Mock external dependencies (API calls, localStorage, etc.)
- Test edge cases and error conditions
- For hooks, use `renderHook` from React Testing Library
- For components with user interaction, use `userEvent` library

## Architecture Overview

### Tech Stack

- **Framework**: React 19 with React Router 7
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS with Radix UI components
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with automatic token refresh
- **State Management**: No global state library - uses React state and context
- **Authentication**: JWT with automatic refresh token handling

### Project Structure

```
app/
├── components/          # Reusable React components organized by module
│   ├── administracion/  # Administration module components
│   ├── mantencion/      # Maintenance module components
│   ├── monitor/         # Monitoring module components
│   ├── operaciones/     # Operations module components
│   └── ui/             # Base UI components (shadcn/ui style)
├── routes/             # File-based routing (React Router 7)
│   ├── auth/           # Authentication routes
│   └── dashboard/      # Protected dashboard routes by module
├── services/           # API service layer - one service per module
├── types/              # TypeScript type definitions by module
├── utils/              # Utility functions and helpers
└── hooks/              # Custom React hooks
```

### Key Architectural Patterns

**Module Organization**: The app is organized into 4 main business modules:

- `administracion` - User, client, contract, and meter management
- `mantencion` - System maintenance (tariffs, parameters, zones)
- `monitor` - Reading monitoring and data export
- `operaciones` - Billing operations and SAP integration

**Service Layer**: Each module has a dedicated service file in `app/services/` that handles all API calls for that module. Services use the configured axios instance with automatic authentication.

**Authentication Flow**:

- JWT tokens stored in localStorage
- Automatic token refresh via axios interceptors in `axiosConfig.ts`
- Protected routes use `ProtectedRoute` component
- Session expiry redirects to `/session-expired`

**Form Handling**: Uses React Hook Form with Zod schemas for validation. Forms typically follow the pattern of separate form components with modal wrappers.

**Error Handling**: Centralized error handling via axios interceptors with toast notifications using Sonner.

## Important Implementation Details

### Authentication System

- JWT tokens are automatically attached to requests via axios interceptors
- Token refresh happens automatically on 401 responses (except for expected routes)
- User data is decoded from JWT using `getAuthenticatedUser()` in `auth-utils.ts`
- Session state is not globally managed - components decode token as needed

### API Integration

- Base API URL configured via `VITE_API_URL` environment variable
- All services extend the configured axios instance from `axiosConfig.ts`
- Requests include credentials and have 15-second timeout
- Error responses show user-friendly toast messages

### Route Structure

- Uses React Router 7 file-based routing
- Dashboard routes are nested under `/dashboard` with shared layout
- Authentication routes are separate from dashboard
- Route-level error boundaries implemented

### Component Patterns

- UI components follow shadcn/ui patterns with Radix UI primitives
- Form components typically separate from data fetching logic
- Modal components wrap form components for create/edit flows
- Table components use TanStack Table with custom pagination

## Development Guidelines

### Code Style

- Uses ESLint with Airbnb base config and TypeScript rules
- Prettier for code formatting with Tailwind plugin
- Import sorting via prettier plugin
- Husky for pre-commit hooks

### API Service Pattern

When adding new API endpoints, follow the existing service pattern:

1. Add service function to appropriate module service file
2. Use the configured axios instance
3. Handle loading states in components
4. Let axios interceptors handle authentication and errors

### Form Implementation

For new forms:

1. Create Zod schema for validation
2. Use React Hook Form with resolver
3. Implement in modal component if needed
4. Follow existing error handling patterns

## 📚 Documentation

Complete documentation is available in the [docs/](./docs/) folder:

### Quick References
- **[Permissions System](./docs/development/PERMISOS.md)** - Role-based access control
- **[Quick Start](./docs/development/QUICK-START.md)** - Getting started guide
- **[Commands Cheatsheet](./docs/development/COMMANDS_CHEATSHEET.md)** - Useful commands
- **[API Debug Guide](./docs/development/API_DEBUG_GUIDE.md)** - API debugging

### Architecture & Deployment
- **[Architecture](./docs/architecture/ARCHITECTURE.md)** - System architecture
- **[Docker Guide](./docs/deployment/README-DOCKER.md)** - Docker setup
- **[Deployment](./docs/deployment/DEPLOY-README.md)** - Deployment guide

### Performance & Testing
- **[Performance](./docs/performance/PERFORMANCE.md)** - Performance optimization
- **[Testing](./docs/testing/TESTING.md)** - Testing guidelines

For the complete documentation index, see [docs/README.md](./docs/README.md)
