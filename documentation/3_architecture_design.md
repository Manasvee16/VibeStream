# Architecture Design

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
[Client Browser] ←→ [Next.js App] ←→ [API Layer] ←→ [Database/Storage]
```

### 1.2 Key Components
1. Frontend (Next.js App)
   - App Router for routing
   - React components
   - Client-side state management
   - UI/UX implementation

2. Backend Services
   - API routes
   - Authentication service
   - Video processing service
   - Data access layer

3. Database & Storage
   - PostgreSQL (user data, metadata)
   - BunnyCDN (video storage)

## 2. Detailed Component Design

### 2.1 Frontend Architecture
```
/app
├── (auth)         # Authentication routes
├── (root)         # Main application routes
├── api           # API endpoints
├── components    # Reusable components
├── lib          # Utilities and hooks
└── public       # Static assets
```

### 2.2 Database Schema
```sql
User {
  id: string (PK)
  name: string
  email: string
  emailVerified: boolean
  image: string?
  createdAt: timestamp
  updatedAt: timestamp
}

Video {
  id: uuid (PK)
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  visibility: enum
  userId: string (FK)
  views: integer
  duration: integer
  createdAt: timestamp
  updatedAt: timestamp
}

Session {
  id: string (PK)
  token: string
  expiresAt: timestamp
  userId: string (FK)
}
```

## 3. Technology Stack Details

### 3.1 Frontend Technologies
- Next.js 15.3.1
- React 19.0.0
- TypeScript 5.x
- Tailwind CSS
- Better Auth

### 3.2 Backend Technologies
- Node.js
- PostgreSQL
- Drizzle ORM
- BunnyCDN API
- Xata

### 3.3 Development Tools
- ESLint
- Prettier
- Jest
- Playwright/Cypress

## 4. Security Architecture

### 4.1 Authentication Flow
1. User initiates Google OAuth
2. OAuth callback processed
3. Session token generated
4. Secure cookie set
5. Regular token rotation

### 4.2 Authorization
- Role-based access control
- Resource-level permissions
- API route protection
- Rate limiting with Arcjet

## 5. Data Flow

### 5.1 Video Upload Flow
```
[Client] → [Upload Request] → [BunnyCDN] 
                           → [Metadata Storage]
                           → [Thumbnail Generation]
                           → [Database Update]
```

### 5.2 Video Playback Flow
```
[Client] → [Request Video] → [Auth Check]
                          → [CDN Stream]
                          → [View Count Update]
```

## 6. Scalability Considerations

### 6.1 Current Scale
- Expected users: 1000+
- Storage requirements: 1TB+
- Concurrent users: 100+

### 6.2 Scaling Strategies
1. Horizontal Scaling
   - Load balancing
   - Database replication
   - CDN distribution

2. Performance Optimization
   - Caching layers
   - Query optimization
   - Asset optimization

## 7. Monitoring & Maintenance

### 7.1 Monitoring
- Performance metrics
- Error tracking
- User analytics
- Resource usage

### 7.2 Backup Strategy
- Daily database backups
- CDN redundancy
- Disaster recovery plan

## 8. Integration Points

### 8.1 External Services
- Google OAuth
- BunnyCDN
- Xata
- Arcjet

### 8.2 APIs
- RESTful endpoints

## 9. Deployment Architecture

### 9.1 Development
- Local development
- Testing environment
- Staging environment

### 9.2 Production
- Cloud hosting
- CDN distribution
- Database clusters
- Monitoring systems
