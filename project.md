# Super Book - Learning Management System

## 🚀 Overview
Super Book is a modern Learning Management System (LMS) built with Next.js 15, featuring role-based access control, course management, quizzes, blogs, analytics, and comprehensive admin controls. The platform supports both English and Hindi languages with instant switching capabilities.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth (JWT)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Rich Text**: TipTap editor
- **File Processing**: xlsx (Excel parsing)

## 🏗 Architecture

### Directory Structure
```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page with glassmorphism UI
│   │   └── register/        # Registration with role selection
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── student/     # Student dashboard & features
│   │   │   ├── teacher/     # Teacher dashboard & content management
│   │   │   └── admin/       # Admin panel & system controls
│   └── api/                 # API routes
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   └── ui/                  # Reusable UI components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization files
├── lib/                    # Utility functions
└── models/                 # Mongoose schemas
```

## 🔑 Core Features

### Authentication & Authorization
- JWT-based authentication via NextAuth
- Role-based access control (student, teacher, admin)
- User suspension capabilities
- Protected routes with server-side validation

### Student Features
- Browse and enroll in courses
- Take timed quizzes with auto-grading
- View quiz results and detailed feedback
- Track learning progress across courses
- Read and favorite blog posts
- Personalized dashboard with statistics

### Teacher Features
- Create and manage courses (draft/publish)
- Create quizzes with manual entry or Excel upload
- Write and manage blog posts with rich text editor
- View analytics on student performance
- Content creation limits (configurable by admin)
- Publish/unpublish content

### Admin Features
- Full user management (CRUD operations)
- Role assignment and user suspension
- Platform-wide analytics dashboard
- Content management (view, publish, delete all content)
- Configure teacher content limits
- Feature toggles (enable/disable platform features)
- Platform configuration (maintenance mode, registration, etc.)

### Course System
- Course enrollment with duplicate prevention
- Progress tracking per course
- Price support (free/paid)
- Draft and published states
- Instructor information

### Quiz System
- Multiple choice questions
- Timer functionality
- Auto-grading with instant feedback
- Multiple attempts tracking
- Result review with correct answers
- Excel import for bulk question creation

### Blog System
- Rich text editor (TipTap)
- Topic categorization
- Draft/publish workflow
- Student favorite system
- Search and filter capabilities
- Teacher ownership validation

### Analytics
- Teacher: Course performance, student stats, quiz attempts
- Admin: Platform-wide metrics, user growth, content statistics
- Visual dashboards with modern UI

## 🎨 UI/UX Design
- **Design Philosophy**: Premium SaaS-inspired UI (Stripe/Vercel aesthetic)
- **Visual Style**: Glassmorphism, gradients, rounded corners, subtle shadows
- **Animations**: Framer Motion for smooth transitions
- **Responsiveness**: Mobile-first design with bottom navigation
- **Loading States**: Skeleton loaders and spinners
- **Accessibility**: Semantic HTML, aria-labels, keyboard navigation

## 🌐 Internationalization
- **Languages**: English (default), Hindi
- **Architecture**: File-based translation system (no API dependencies)
- **Switching**: Instant language switching without page reload
- **Storage**: localStorage for language preference
- **Coverage**: All major UI components translated
- **Future**: Support for additional Indian languages (Telugu, Tamil, Bengali, Marathi)

## ⚙️ Configuration

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/super-book
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Database Models
- **User**: Authentication, role, suspension status
- **Course**: Course content, enrollment tracking
- **Quiz**: Questions, options, time limits
- **QuizAttempt**: Student quiz results
- **Enrollment**: Student-course relationships
- **Blog**: Blog posts with rich text
- **Favorite**: Student blog favorites
- **AppSettings**: Platform configuration

## 🔐 Security
- Server-side session validation
- Role-based API access control
- Ownership validation for content modifications
- HTML sanitization (DOMPurify)
- Password hashing
- Admin self-protection (cannot suspend self)
- Protected routes with middleware

## 📱 Mobile Experience
- Bottom navigation for students
- Hamburger menu for desktop
- Touch-friendly UI (44px minimum touch targets)
- Responsive card layouts
- Mobile-optimized forms

## 🚀 Development Guidelines

### API Development
- Always validate sessions with `getServerSession(authOptions)`
- Check user roles before allowing access
- Return proper HTTP status codes (401, 403, 404, 500)
- Use NextResponse for responses
- Include error messages in response body

### Component Development
- Use TypeScript interfaces for props
- Use 'use client' directive for client components
- Keep components focused and reusable
- Use Framer Motion for animations
- Use Lucide React for icons

### State Management
- useState for local component state
- useEffect for side effects and data fetching
- useSession for authentication state
- Global context for app-wide state (language)

### Styling
- Tailwind CSS for all styling
- Mobile-first responsive design
- Consistent spacing and border radius
- Consistent color scheme (indigo/emerald)
- Glassmorphism effects

## 📊 Key APIs
- `/api/auth/*` - Authentication endpoints
- `/api/courses/*` - Course management
- `/api/quizzes/*` - Quiz management
- `/api/blogs/*` - Blog management
- `/api/enrollments/*` - Enrollment tracking
- `/api/quiz-attempts/*` - Quiz results
- `/api/favorites/*` - Blog favorites
- `/api/admin/settings` - Platform configuration
- `/api/admin/users` - User management
- `/api/analytics/*` - Analytics data

## 🎯 Recent Major Updates

### April 2026
- **Auth UI Redesign**: Premium glassmorphism login/register pages
- **Blog System**: Complete content management with rich text editor
- **I18n System**: File-based translations with instant switching
- **Super Admin**: Full platform control with settings and limits
- **Alert Component**: Modern toast notifications with auto-dismiss
- **Blog Integration**: Alert component added to all blog pages

## 🔮 Future Enhancements
- Avatar upload functionality
- Email verification system
- Video lessons support
- Course completion certificates
- Real-time notifications
- Payment gateway integration
- Advanced analytics with charts
- Bulk user import
- Audit logs for admin actions
- Content moderation system
- Quiz multilingual data support
