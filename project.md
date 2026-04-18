# Super Book - Project Documentation

## 🚀 Overview
A modern LMS built with Next.js featuring authentication, courses, quizzes, analytics, and admin management.

---

## 🛠 Tech Stack
- Next.js 15 (App Router + Turbopack)
- TypeScript
- MongoDB + Mongoose
- NextAuth (JWT)
- Tailwind CSS
- Framer Motion (animations)
- xlsx (Excel parsing)

---

## 📁 Structure (Simplified)

src/
app/
(auth)/ → login, register  
(dashboard)/dashboard/  
- student/ → courses, quizzes, progress  
- teacher/ → courses, quizzes, analytics  
- admin/ → users, analytics  

api/ → auth, courses, quizzes, enrollments, analytics  
components/ → dashboard + ui  
models/ → User, Course, Quiz, Enrollment, Attempt  

---

## 🔑 Core Features

### Authentication
- JWT login (NextAuth)
- Role-based access (student, teacher, admin)

---

### Student
- Browse & enroll courses
- Take quizzes with timer
- View results & progress
- Dashboard with real stats

---

### Teacher
- Create & manage courses
- Create quizzes (manual + Excel upload)
- Analytics dashboard
- Publish/unpublish quizzes

---

### Admin
- Manage users (CRUD)
- System analytics

---

### Course System
- Enrollment with duplicate prevention
- Progress tracking per course

---

### Quiz System
- Auto-grading
- Multiple attempts
- Time tracking
- Result review

---

### Analytics
- Teacher: course + student stats
- Admin: system-wide metrics

---

## 🎨 UI/UX Highlights
- Mobile-first responsive design
- Premium SaaS UI (Stripe/Vercel inspired)
- Glassmorphism + gradients
- Animated components (Framer Motion)
- Skeleton loaders + loaders
- Touch-friendly UI

---

## ⚙️ APIs (Key)

- `/api/courses`
- `/api/quizzes`
- `/api/enrollments`
- `/api/quiz-attempts`
- `/api/progress`
- `/api/analytics`
- `/api/admin/users`

---

## 🧠 Important Fixes

### ✅ Teacher Courses Not Showing
- Issue: `instructor=self` not handled
- Fix: mapped to `session.user.id`

---

### ✅ Dashboards Using Static Data
- Replaced with real API data

---

### ✅ Quiz Loading Bug
- Fixed ObjectId string comparison

---

### ✅ Build Issues
- Fixed TypeScript errors
- Fixed hooks & dependencies
- Removed unused variables

---

## 📱 Mobile Optimization
- Bottom navigation
- Hamburger menu
- Card-based layouts
- Touch targets ≥ 44px

---

## ⚡ Performance
- React.memo
- useMemo / useCallback
- Optimized API calls
- Reduced re-renders

---

## 🎯 Components

### UI
- Button
- Card
- Badge
- Loader
- Skeleton

### Dashboard
- Sidebar (Student/Teacher)
- MobileNav / BottomNav
- CourseCard / QuizCard

---

## 📦 Models
- User
- Course
- Lesson
- Quiz
- Enrollment
- QuizAttempt

---

## 🔐 Environment

MONGODB_URI=  
NEXTAUTH_SECRET=  
NEXTAUTH_URL=  

---

## 📝 Recent Updates (April 2026)

- Full LMS system implemented
- Admin panel added
- Analytics system added
- Excel quiz upload added
- Mobile-first redesign
- Premium UI redesign
- Performance optimization
- Loader & skeleton system
- All dashboards use real data

---

## 🧩 Decisions
- JWT over DB sessions
- Mongoose without adapter
- Separate dashboards per role
- Auto-grading quizzes
- Real-time analytics

---

## 🎨 AUTH UI REDESIGN (April 16, 2026)

### Overview
Complete redesign of Login and Register pages to match premium SaaS dashboard UI.

### Design Features

**1. Split-Screen Layout**
- Desktop: Left side branding (55%), Right side form (45%)
- Mobile: Gradient background with centered glassmorphism card

**2. Visual Design**
- Animated gradient backgrounds (indigo/violet/purple)
- Floating animated shapes (blur orbs)
- Glassmorphism form card with `backdrop-blur-xl`
- Rounded-3xl corners throughout
- Soft shadows (`shadow-2xl`)

**3. Animations (Framer Motion)**
- Page entrance: fade-in + slide-up
- Form card: scale-in animation
- Input fields: staggered slide-in from left
- Button: hover scale + tap press effect
- Branding orbs: infinite pulse animation

**4. Form Improvements**
- Lucide icons inside inputs (Mail, Lock, User, Eye/EyeOff)
- Password visibility toggle
- Modern error message styling
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, GitHub UI)
- Role selection cards (Student/Teacher with icons)

**5. Login Page Specific**
- Gradient: `from-indigo-600 via-violet-600 to-purple-700`
- Feature pills with Sparkles icon
- "Learn Smarter, Grow Faster" tagline

**6. Register Page Specific**
- Gradient: `from-violet-600 via-purple-600 to-indigo-700`
- Role selection with visual cards
- Stats display (10K+ Students, 500+ Courses, 50+ Teachers)
- "Start Your Journey Today" tagline

### Files Modified

- `src/app/(auth)/login/page.tsx` - Complete redesign
- `src/app/(auth)/register/page.tsx` - Complete redesign

### Dependencies Used

- `framer-motion` - Page and element animations
- `lucide-react` - Icons (Mail, Lock, Eye, EyeOff, GraduationCap, etc.)

### Responsive Breakpoints

- Mobile (< 640px): Single column, gradient background
- Tablet (640px - 1024px): Adjusted spacing
- Desktop (> 1024px): Split screen layout

### Design Principles Applied

1. **Glassmorphism** - Semi-transparent form card with blur
2. **Gradients** - Animated gradient backgrounds
3. **Rounded Corners** - 3xl (1.5rem) on main card
4. **Smooth Animations** - Framer Motion for all transitions
5. **Iconography** - Lucide React for consistent icons
6. **Responsive** - Mobile-first with breakpoint adjustments
7. **Micro-interactions** - Hover effects, button presses, loading states

---

## � BLOG SYSTEM (April 16, 2026)

### Overview
Added a complete content/blog system for knowledge sharing between teachers and students.

### Features

**1. Blog Model**
- `title` - Blog post title (max 200 chars)
- `content` - Rich text content
- `topic` - Category (Math, Science, etc.)
- `author` - Reference to teacher user
- `isPublished` - Draft/Published status
- `createdAt` / `updatedAt` - Timestamps

**2. Favorite System**
- Students can favorite blogs
- Unique constraint (user + blog)
- Quick access via "My Favorites" page

**3. Teacher Features**
- Create blog posts with topic categorization
- Edit/Delete own blogs
- Draft/Publish workflow
- Blog management dashboard

**4. Student Features**
- Browse all published blogs
- Filter by topic
- Search functionality
- Toggle favorites (heart icon)
- Read full blog content

**5. APIs Created**
- `GET/POST /api/blogs` - List/Create blogs
- `GET/PATCH/DELETE /api/blogs/[id]` - Blog operations
- `GET/POST /api/favorites` - Favorites management
- `DELETE /api/favorites/[id]` - Remove favorite

**6. Pages Created**

Teacher:
- `/dashboard/teacher/blogs` - Blog management
- `/dashboard/teacher/blogs/create` - Create blog
- `/dashboard/teacher/blogs/edit/[id]` - Edit blog

Student:
- `/dashboard/student/blogs` - Browse blogs
- `/dashboard/student/blogs/[id]` - Blog detail
- `/dashboard/student/favorites` - Saved blogs

**7. UI Components**
- Blog cards with topic badges
- Favorite toggle with animation
- Search and filter UI
- Empty states
- Loading skeletons

**8. Security**
- Only teachers can create/edit blogs
- Students can only read + favorite
- Ownership validation before edit/delete

### Files Modified/Created

**Models:**
- `src/models/Blog.ts`
- `src/models/Favorite.ts`

**APIs:**
- `src/app/api/blogs/route.ts`
- `src/app/api/blogs/[id]/route.ts`
- `src/app/api/favorites/route.ts`
- `src/app/api/favorites/[id]/route.ts`

**Pages:**
- `src/app/(dashboard)/dashboard/teacher/blogs/page.tsx`
- `src/app/(dashboard)/dashboard/teacher/blogs/create/page.tsx`
- `src/app/(dashboard)/dashboard/teacher/blogs/edit/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/student/blogs/page.tsx`
- `src/app/(dashboard)/dashboard/student/blogs/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/student/favorites/page.tsx`

**Components:**
- `src/components/dashboard/TeacherSidebar.tsx` (added Blogs nav)
- `src/components/dashboard/StudentSidebar.tsx` (added Blogs & Favorites nav)

---

## 📝 RICH TEXT EDITOR (April 16, 2026)

### Overview
Added TipTap rich text editor for enhanced blog content creation with formatting capabilities.

### Dependencies
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder isomorphic-dompurify
```

### Features

**1. Editor Capabilities**
- ✅ Bold & Italic formatting
- ✅ Headings (H1, H2, H3)
- ✅ Bullet lists
- ✅ Numbered lists
- ✅ Blockquotes
- ✅ Links (with URL validation)
- ✅ Placeholder text
- ✅ Undo/Redo

**2. UI/UX**
- Clean minimal toolbar (top-mounted)
- Theme support (indigo/emerald)
- Responsive design
- Character count display
- Active state indicators
- Hover effects

**3. Security**
- HTML sanitization using DOMPurify
- Content stored as sanitized HTML
- No image upload (text-only as requested)
- No media embedding

**4. Validation**
- Empty content detection (strips HTML tags)
- Prevents submission of empty `<p></p>` tags
- Helper function: `isContentEmpty(html)`

**5. Updated Pages**
- `/dashboard/teacher/blogs/create` - Create blog with RTE
- `/dashboard/teacher/blogs/edit/[id]` - Edit blog with RTE
- `/dashboard/student/blogs/[id]` - Render HTML content (sanitized)
- `/dashboard/student/blogs` - Strip HTML for excerpts
- `/dashboard/student/favorites` - Strip HTML for excerpts

### Files Created/Modified

**New Component:**
- `src/components/ui/RichTextEditor.tsx`

**Modified:**
- `src/app/(dashboard)/dashboard/teacher/blogs/create/page.tsx`
- `src/app/(dashboard)/dashboard/teacher/blogs/edit/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/student/blogs/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/student/blogs/page.tsx`
- `src/app/(dashboard)/dashboard/student/favorites/page.tsx`

---

## 🌐 FILE-BASED I18N SYSTEM (April 18, 2026)

### Overview
Implemented a file-based internationalization (i18n) system to replace the API-based translation system. This provides instant language switching, better performance, and full control over translations without external API dependencies.

### Supported Languages
- English (en) - Default
- Hindi (hi) - हिंदी

### Architecture

**1. Translation Files**
Located in `src/i18n/`:
- `en.ts` - English translations
- `hi.ts` - Hindi translations
- `index.ts` - Exports all translations and language types

**2. Global Language Context Provider**
- `src/contexts/LanguageContext.tsx` - Global language state management
- React Context provider for centralized language state
- Ensures all components share the same language state
- Triggers re-renders across the app when language changes
- localStorage persistence for language preference

**3. Translation Hook**
- `src/hooks/useTranslation.ts` - React hook for accessing translations
- Now uses global language context instead of local state
- Provides `t()` function for translating keys
- Provides `lang` and `setLang` for language switching
- Ensures instant language switching across all components

**4. Language Switcher Component**
- `src/components/ui/LanguageSwitcher.tsx` - Dropdown for language selection
- Simple select dropdown with English and Hindi options
- Integrated into desktop and mobile headers

**5. Dashboard Header**
- `src/components/dashboard/DashboardHeader.tsx` - Client component for dashboard header
- Integrates language switcher into desktop header
- Translates dashboard title based on selected language

### Translation Structure

**Nested Object Structure:**
```typescript
{
  common: {
    loading: 'Loading...',
    submit: 'Submit',
    next: 'Next',
    previous: 'Previous',
    // ...
  },
  quiz: {
    start: 'Start Quiz',
    submit: 'Submit Quiz',
    timeRemaining: 'Time Remaining',
    // ...
  },
  blog: {
    readMore: 'Read More',
    share: 'Share',
    // ...
  },
  nav: {
    dashboard: 'Dashboard',
    courses: 'Courses',
    // ...
  },
  language: {
    selectLanguage: 'Select Language',
    english: 'English',
    hindi: 'हिंदी',
  }
}
```

### Usage

**In Components:**
```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  const { t, lang, setLang } = useTranslation();

  return (
    <div>
      <h1>{t('quiz.start')}</h1>
      <button onClick={() => setLang('hi')}>Switch to Hindi</button>
    </div>
  );
}
```

**Language Switcher:**
```tsx
<select onChange={(e) => setLang(e.target.value as 'en' | 'hi')}>
  <option value="en">English</option>
  <option value="hi">हिंदी</option>
</select>
```

### Features

**1. Instant Translation**
- No API calls required
- Translations loaded immediately
- Language preference saved in localStorage
- Global language state ensures instant UI updates across all components

**2. Type Safety**
- TypeScript support with `Language` type
- Autocomplete for translation keys
- Compile-time error checking

**3. Performance**
- No network latency
- No API rate limits
- Minimal bundle size
- Fast language switching
- Removed memoization blocks to allow re-renders on language change

**4. Scalability**
- Easy to add new languages
- Organized translation structure
- Reusable across components
- Centralized language state management

### Files Created

**New Files:**
- `src/i18n/en.ts` - English translations
- `src/i18n/hi.ts` - Hindi translations
- `src/i18n/index.ts` - Translation exports
- `src/contexts/LanguageContext.tsx` - Global language context provider
- `src/hooks/useTranslation.ts` - Translation hook (updated to use context)
- `src/components/ui/LanguageSwitcher.tsx` - Language switcher component
- `src/components/dashboard/DashboardHeader.tsx` - Dashboard header with language switcher

### Files Modified

**Layout:**
- `src/app/layout.tsx` - Added LanguageProvider wrapper
- `src/app/(dashboard)/layout.tsx` - Added DashboardHeader component

**Sidebar Components:**
- `src/components/dashboard/StudentSidebar.tsx` - Added translations for navigation items, role badge, platform text
- `src/components/dashboard/TeacherSidebar.tsx` - Added translations for navigation items, role badge, platform text, admin section

**Mobile Navigation:**
- `src/components/dashboard/MobileNav.tsx` - Added translations for navigation items, sign out button; removed memo wrapper for instant re-renders
- `src/components/dashboard/MobileBottomNav.tsx` - Added translations for navigation items; removed memo wrapper for instant re-renders

**Card Components:**
- `src/components/dashboard/CourseCard.tsx` - Added translations for price, description, instructor, progress, action buttons
- `src/components/dashboard/QuizCard.tsx` - Added translations for course badge, questions count, description, time limit, score, attempt info, action buttons

**Student Pages:**
- `src/app/(dashboard)/dashboard/student/page.tsx` - Added translations for dashboard content
- `src/app/(dashboard)/dashboard/student/courses/page.tsx` - Added translations for courses page
- `src/app/(dashboard)/dashboard/student/quizzes/page.tsx` - Added translations for quizzes list page
- `src/app/(dashboard)/dashboard/student/blogs/page.tsx` - Added translations for blogs page
- `src/app/(dashboard)/dashboard/student/quizzes/take/page.tsx` - Updated to use file-based translations for UI text

**Teacher Pages:**
- `src/app/(dashboard)/dashboard/teacher/page.tsx` - Added translations for teacher dashboard

### Translation Keys

**Common:**
- loading, error, success, submit, cancel, save, delete, edit, back, next, previous, search, filter, all, yes, no
- **Sidebar:** dashboard, myCourses, browse, blogs, favorites, quizzes, progress, profile, analytics, users, allCourses, administration, learningPlatform, teachingPlatform, student, teacher, administrator, signOut

**Dashboard:**
- welcome, welcomeBack, studentDashboard, teacherDashboard, adminDashboard, continueLearning
- **Teacher Dashboard:** manageContent, createCourse, myCourses, students, published, recentCourses, viewAll, quickActions, manageCourses, viewAndEdit, manageQuizzes, createAndReview, analytics, viewInsights, addNewContent, studentsEnrolled

**Courses:**
- myCourses, continueLearning, browseMore, noCourses, startLearning, dropCourse, dropFailed
- **Course Card:** free, noDescription, unknown, progress, enrollNow, start, review, continue

**Quiz:**
- start, submit, next, previous, score, timeRemaining, question, of, answered, remaining, submitting, autoSubmitWarning, confirmSubmit, available, completed, noQuizzes, enrollCourse, noCompleted, takeQuiz, myQuizzes, quizzesDesc
- **Quiz Card:** course, questions, noDescription, timeLimit, min, quizScore, attempt, correct, startQuiz, review, retake

**Blog:**
- readMore, share, favorite, unfavorited, noFavorites, startExploring, backToBlogs, learningBlog, blogDesc, myFavorites, searchBlogs, totalArticles, noBlogsFound, noBlogsYet, tryAdjusting, checkBackLater, teacher

**Navigation:**
- dashboard, courses, quizzes, blogs, progress, favorites, settings, logout

**Language:**
- selectLanguage, english, hindi

### Quiz Data Strategy

**Current Implementation:**
- UI text uses file-based translations (buttons, labels, messages)
- Quiz questions and options remain in English (from database)

**Future Enhancement:**
- Update Quiz schema to support multilingual data:
  ```typescript
  title: { en: String, hi: String }
  questions: [{
    question: { en: String, hi: String },
    options: [{ en: String, hi: String }]
  }]
  ```
- Render using: `quiz.title[lang]`, `question.question[lang]`

### Benefits

**Over API-Based System:**
- No external API dependencies
- Instant language switching
- Better performance (no network calls)
- Full control over translations
- No rate limits
- No broken outputs like "[हिंदी]"
- Cost-free (no API usage)
- Works offline
- Type-safe with TypeScript

### Migration from API-Based System

**Removed:**
- API-based translation functions (`translateText`, `translateHTML`, `batchTranslate`)
- LanguageContext (replaced with useTranslation hook)
- Mock translation fallbacks
- Translation API calls to LibreTranslate

**Replaced With:**
- Static translation files
- Global language context provider
- useTranslation hook (updated to use context)
- localStorage for language preference
- Type-safe translation keys

### I18n Improvements (April 18, 2026 - Update)

**Issues Fixed:**
1. ✅ Language switching required page reload - Fixed with global language context
2. ✅ Components not updating on language change - Removed memoization blocks
3. ✅ Hardcoded UI text across components - Added translations to all major components
4. ✅ Local language state causing inconsistencies - Centralized with global context

**Key Changes:**
- Created `src/contexts/LanguageContext.tsx` for centralized language state
- Updated `src/hooks/useTranslation.ts` to use global context instead of local state
- Added `LanguageProvider` wrapper to `src/app/layout.tsx` for app-wide language state
- Removed `memo()` wrappers from MobileNav and MobileBottomNav to allow re-renders
- Added comprehensive translation keys for sidebar, navigation, cards, and dashboard pages
- Updated 15+ components with full translation support

**Components Now Translated:**
- StudentSidebar, TeacherSidebar (navigation, role badges, platform text)
- MobileNav, MobileBottomNav (navigation items, sign out button)
- CourseCard (price, description, instructor, progress, actions)
- QuizCard (course badge, questions, time limit, score, actions)
- Student dashboard, courses, quizzes, blogs pages
- Teacher dashboard page

**Result:**
- 100% instant language switching without page reload
- Consistent language state across all components
- All major UI elements now translatable
- Clean, scalable i18n system ready for production

### Future Enhancements

**Add More Languages:**
- Telugu (te) - తెలుగు
- Tamil (ta) - தமிழ்
- Bengali (bn) - বাংলা
- Marathi (mr) - मराठी

**Quiz Multilingual Data:**
- Update database schema for multilingual quiz content
- Admin interface for managing quiz translations
- Import/export translation files

**Advanced Features:**
- Pluralization support
- Date/time formatting
- Number formatting
- RTL language support
- Language detection based on browser

---

---

## 👑 SUPER ADMIN CONTROL SYSTEM (April 18, 2026)

### Overview
Implemented a comprehensive Super Admin Control System giving the admin role full authority over the entire LMS platform including users, content, and global settings.

### Features

**1. Enhanced AppSettings Model**
- `teacherLimits` - Content creation limits for teachers (courses, quizzes, blogs)
- `featureToggles` - Enable/disable platform features (blogs, quizzes, courses, analytics)
- `platformConfig` - Platform-wide settings (site name, description, maintenance mode, registration, default language)

**2. Admin Settings API**
- `GET /api/admin/settings` - Fetch all settings (admin only)
- `PATCH /api/admin/settings` - Update settings with validation (admin only)
- Supports partial updates (can update just teacherLimits, featureToggles, or platformConfig)
- Validates all data types and values before saving

**3. User Suspension**
- Added `isSuspended` and `suspendedReason` fields to User model
- Admin can suspend/unsuspend users via PATCH `/api/admin/users`
- Prevents suspending self or other admins
- Suspended users cannot access the platform

**4. Admin Content Management**
- `/dashboard/admin/courses` - View, publish/unpublish, delete all courses
- `/dashboard/admin/quizzes` - View, publish/unpublish, delete all quizzes with search and filters
- `/dashboard/admin/blogs` - View, publish/unpublish, delete all blogs with search, filters, and language filter
- `/dashboard/admin/users` - Manage all users with role updates and suspension
- `/dashboard/admin/analytics` - Platform-wide analytics with modern UI
- `/dashboard/admin/settings` - Configure platform settings with toggle switches

**5. API Role Validation**
All admin APIs require admin role:
- `/api/admin/settings` - Admin only
- `/api/admin/users` - Admin only
- Content APIs (courses, quizzes, blogs) - Admin override for full CRUD on any content
- Teachers can only manage their own content
- Admins can manage any content regardless of ownership

**6. Admin Navigation**
Added to sidebar and mobile navigation:
- Users
- All Courses
- All Quizzes
- All Blogs
- Analytics
- Settings

**7. Admin Settings Page UI**
- Teacher Content Limits section (courses, quizzes, blogs limits)
- Feature Toggles section (enable/disable features with toggle switches)
- Platform Configuration section (site name, description, language, maintenance mode, registration)
- Modern UI with icons, animations, and proper spacing

### Files Modified/Created

**Models:**
- `src/models/AppSettings.ts` - Expanded with featureToggles and platformConfig
- `src/models/User.ts` - Added isSuspended and suspendedReason fields

**APIs:**
- `src/app/api/admin/settings/route.ts` - Updated for new settings structure
- `src/app/api/admin/users/route.ts` - Added user suspension with protections
- `src/app/api/courses/[id]/route.ts` - Created new route with admin override
- `src/app/api/blogs/[id]/route.ts` - Already had admin override
- `src/app/api/quizzes/[id]/route.ts` - Already had admin override

**Pages:**
- `src/app/(dashboard)/dashboard/admin/settings/page.tsx` - Updated with new settings UI
- `src/app/(dashboard)/dashboard/admin/quizzes/page.tsx` - Created
- `src/app/(dashboard)/dashboard/admin/blogs/page.tsx` - Created
- `src/app/(dashboard)/dashboard/admin/analytics/page.tsx` - Updated with modern UI

**Navigation:**
- `src/app/(dashboard)/layout.tsx` - Expanded adminNavigation array
- `src/components/dashboard/TeacherSidebar.tsx` - Expanded admin navigation section

**Translations:**
- `src/i18n/en.ts` - Added allQuizzes, allBlogs, settings
- `src/i18n/hi.ts` - Added allQuizzes, allBlogs, settings

### Security Rules
1. Admin APIs must validate session.user.role === 'admin'
2. Admin cannot suspend their own account
3. Admin cannot suspend other admin accounts
4. Admin cannot change their own role
5. Content APIs must check ownership (teacher) OR admin override
6. All sensitive operations require server-side validation

---

## � DEVELOPMENT RULES & GUIDELINES

### Code Organization
1. **API Routes**
   - Always use server-side session validation with `getServerSession(authOptions)`
   - Check user role before allowing access
   - Return proper HTTP status codes (401, 403, 404, 500)
   - Use NextResponse for responses
   - Include error messages in response body

2. **Components**
   - Use TypeScript interfaces for props
   - Use 'use client' directive for client components
   - Keep components focused and reusable
   - Use Framer Motion for animations
   - Use Lucide React for icons

3. **Database Models**
   - Define schemas in `src/models/`
   - Use Mongoose for MongoDB interactions
   - Include timestamps (createdAt, updatedAt)
   - Use proper field types and validation
   - Add indexes for frequently queried fields

4. **State Management**
   - Use useState for local component state
   - Use useEffect for side effects and data fetching
   - Use useSession for authentication state
   - Use global context for app-wide state (language, theme)

5. **Styling**
   - Use Tailwind CSS for all styling
   - Follow mobile-first responsive design
   - Use consistent spacing (p-4, p-6, p-8)
   - Use consistent border radius (rounded-xl, rounded-2xl)
   - Use consistent colors (indigo for student, emerald for teacher/admin)
   - Use glassmorphism effects (backdrop-blur, bg-white/10)

### API Development Rules
1. **Authentication**
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session) {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Role Validation**
   ```typescript
   if (session.user?.role !== 'admin') {
     return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
   }
   ```

3. **Database Connection**
   ```typescript
   await dbConnect();
   ```

4. **Error Handling**
   ```typescript
   try {
     // API logic
   } catch (error) {
     console.error('Error:', error);
     return NextResponse.json(
       { message: 'Error message' },
       { status: 500 }
     );
   }
   ```

5. **Validation**
   - Validate required fields
   - Check data types
   - Validate ObjectId format
   - Check ownership before modifications

### UI/UX Rules
1. **Loading States**
   - Always show loading indicator during API calls
   - Use skeleton loaders for content
   - Show spinner for button actions

2. **Error Handling**
   - Use custom Alert component for errors
   - Provide user-friendly error messages
   - Include retry options when appropriate

3. **Responsive Design**
   - Mobile-first approach
   - Test on breakpoints: sm (640px), md (768px), lg (1024px)
   - Use flex-col on mobile, flex-row on desktop
   - Touch targets minimum 44px

4. **Accessibility**
   - Use semantic HTML
   - Include aria-labels for icon-only buttons
   - Ensure keyboard navigation works
   - Use proper heading hierarchy

### File Naming Conventions
- API routes: `route.ts` in `src/app/api/[resource]/` or `src/app/api/[resource]/[id]/`
- Pages: `page.tsx` in `src/app/(group)/[route]/page.tsx`
- Components: PascalCase in `src/components/`
- Models: PascalCase in `src/models/`
- Hooks: camelCase with 'use' prefix in `src/hooks/`

### Git Workflow
1. Create feature branch from main
2. Make atomic commits with clear messages
3. Test thoroughly before pushing
4. Create pull request for review
5. Merge after approval

### Environment Variables
Required in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/super-book
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Testing Checklist
- [ ] All API endpoints return correct responses
- [ ] Role-based access control works correctly
- [ ] Forms validate input properly
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly
- [ ] Responsive design works on mobile
- [ ] Translations work for all languages
- [ ] Database operations complete successfully

### Performance Guidelines
- Use React.memo for expensive components
- Use useMemo for expensive computations
- Use useCallback for event handlers
- Optimize images (next/image)
- Implement lazy loading for large lists
- Debounce search inputs
- Minimize re-renders

### Security Guidelines
- Never expose sensitive data in client code
- Always validate input on server-side
- Use environment variables for secrets
- Implement rate limiting for public APIs
- Sanitize user input (DOMPurify for HTML)
- Use HTTPS in production
- Implement CORS correctly
- Hash passwords before storing

---

## �🚧 Future Scope
- Avatar upload
- Email verification
- Video lessons
- Certificates
- Real-time notifications
- Payment integration
- Advanced analytics with charts
- Bulk user import
- Audit logs for admin actions
- Content moderation system
