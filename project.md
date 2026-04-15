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

## 🚧 Future Scope
- Avatar upload
- Email verification
- Video lessons
- Certificates
