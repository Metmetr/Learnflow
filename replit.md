# LearnFlow

## Overview

LearnFlow is a Turkish-language educational platform that combines social media UX patterns with verified educational content. The platform enables verified educators to share high-quality educational materials while providing students with a familiar, Instagram/Facebook-style feed experience. Key features include Google OAuth authentication, SheerID educator verification, n8n webhook integration for automated content creation, personalized ML-based feed ranking, and comprehensive admin moderation tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for HMR and optimized production builds
- Wouter for lightweight client-side routing (alternative to React Router)
- Path aliases configured (@/, @shared/, @assets/) for clean imports

**UI Component System**
- Shadcn/ui component library using Radix UI primitives for accessibility
- Tailwind CSS for styling with custom design system tokens
- Typography: Inter/Rubik for UI, Merriweather/Georgia for content reading
- Design philosophy: Social media familiarity (Instagram/LinkedIn patterns) with educational credibility
- Responsive design with mobile-first approach
- Turkish language support throughout the interface

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and API calls
- Context API for authentication state (AuthContext)
- Local component state with React hooks for UI interactions
- Cookie-based session management with JWT tokens

**Key UI Patterns**
- Feed-based content display with infinite scroll capability
- Card-based content presentation with verification badges
- Reader mode for distraction-free article consumption
- Comment system with nested replies
- Topic-based filtering and navigation
- Admin dashboard for content moderation
- Real-time notifications popover with unread count badge
- Search results page with PostCard-based content display

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js runtime with ESM module system
- Modular route organization (auth, content, social, feed, admin, sheerid, n8n)
- Cookie-parser middleware for session management
- Custom logging middleware for API request tracking

**Authentication & Authorization**
- JWT-based authentication with configurable secret (environment variable required in production)
- Google OAuth2 integration (primary authentication method)
- Mock login endpoint for development (disabled in production)
- Role-based access control: user, educator (verified), admin
- Bcrypt password hashing for local credentials
- Session management with database-backed session storage

**API Structure**
- RESTful API design with logical route grouping
- `/api/auth` - Authentication endpoints (login, signup, mock-login, logout, session management)
- `/api/content` - Content CRUD operations with verification status filtering
- `/api/social` - Social interactions (likes, bookmarks, comments, reports)
- `/api/feed` - Personalized feed with ML ranking
- `/api/admin` - Admin-only moderation and verification endpoints
- `/api/sheerid` - SheerID educator verification integration
- `/api/n8n` - Webhook endpoints for automated content creation
- `/api/notifications` - Notification management (fetch, unread count, mark as read)
- `/api/search` - Full-text search across verified content (title, body, topics)
- Middleware for authentication (authenticateToken, optionalAuth, requireRole)

**Business Logic Patterns**
- Content verification workflow: pending → verified/rejected
- Educator verification through SheerID integration
- ML-based feed ranking algorithm (mock implementation with scoring: verification +2, topic match +1.5/topic, popularity normalized, age penalty)
- Content moderation with admin approval queue
- Social features: nested comments, likes, bookmarks, reporting system
- Notification system: auto-generates notifications for content verification, likes, comments, and replies (excludes self-interactions)
- Search functionality: full-text search across verified content using PostgreSQL ILIKE with topic array unnesting

### Data Storage

**Database System**
- PostgreSQL as primary database (Neon serverless driver)
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling via node-postgres
- Schema-first approach with migrations directory

**Data Model**
- Users: email, name, password, googleId, avatar, role, specialty, bio, verified status
- SheerID Verifications: userId, verificationId, status, verificationData (JSONB)
- Content: title, excerpt, body, mediaUrl, topics, authorId, verificationStatus, popularity
- Social Interactions: likes, bookmarks, comments (with nested structure), reports
- Notifications: userId, type, title, message, contentId (optional), commentId (optional), read status, timestamps
- Sessions: userId, token, expiration for auth session management
- Enums: user_role (user, educator, admin), verification_status (pending, verified, rejected), content_type (article, video, podcast), notification_type (content_verified, content_rejected, like_added, comment_added, comment_reply)

**Schema Design Decisions**
- JSONB fields for flexible data storage (verificationData, consent metadata)
- Array fields for topics to support multi-category content
- Cascade deletes for referential integrity (user deletion removes related data)
- Timestamp tracking (createdAt, updatedAt) for all entities
- UUID primary keys for security and distributed systems compatibility

### External Dependencies

**Third-Party Authentication**
- Google OAuth2 for primary authentication flow
- Environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_CALLBACK_URL
- Fallback mock login for development when OAuth not configured

**Educator Verification Service**
- SheerID API integration for educator identity verification
- Server-side verification flow with webhook support
- Environment variable: SHEERID_CLIENT_ID
- Status tracking: pending → verified/rejected with verification data storage
- Admin approval required post-SheerID verification

**Automated Content Creation**
- n8n webhook integration for AI-generated content
- API key protection via x-n8n-key header
- Environment variable: N8N_API_KEY
- System user account for content attribution
- Supports title, body, topic, media URL, tags via webhook payload

**Database Infrastructure**
- Neon Serverless PostgreSQL for production
- Environment variable: DATABASE_URL (required)
- Connection pooling for performance
- Drizzle Kit for schema migrations

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- Lucide React for consistent iconography
- React Hook Form with Zod for form validation
- date-fns for date formatting with Turkish locale support
- Tailwind CSS with custom design tokens

**Development Tools**
- Replit-specific plugins for development (vite-plugin-runtime-error-modal, cartographer, dev-banner)
- TypeScript for type safety across full stack
- ESBuild for production server bundling

**Security & Configuration**
- JWT_SECRET environment variable (required in production, warning in development)
- Cookie-based session storage for security
- CORS and request validation
- Rate limiting consideration for n8n endpoints (TODO)
- Input sanitization via Zod schemas