# Hallmark University Assignment Management System

## Project Overview

**Hallmark Assignment Management App** is a comprehensive web-based platform designed for Hallmark University to streamline the assignment submission and grading workflow. It provides a centralized system where lecturers can manage assignments, students can submit work, and administrators can oversee the entire ecosystem.

This is a **Final Year Computer Science Project** built with production-grade architecture, security best practices, and modern web technologies.

---

## Problem Statement

### Current Challenges

Hallmark University faced several operational challenges in managing assignments across multiple courses and academic levels:

1. **Fragmented Assignment Management**
   - No centralized platform for assignment distribution
   - Lecturers manually track submissions via email or WhatsApp
   - Students often miss deadlines due to lack of visibility
   - No standardized submission format or tracking

2. **No Deadline Enforcement**
   - Late submissions are manually tracked and penalized inconsistently
   - Lecturers cannot easily identify overdue work
   - Students lack clear deadline reminders
   - No automated late submission policy application

3. **Manual Grade Management**
   - Grades are recorded in scattered spreadsheets
   - Students must contact lecturers individually for feedback
   - No history or audit trail of grading
   - Difficult to generate academic reports

4. **Scalability Issues**
   - The university has no API access to student/lecturer databases
   - Manual CSV imports are error-prone and time-consuming
   - Admin workload increases with each new semester
   - No standardized onboarding process

5. **Security & Access Control**
   - Students can potentially view other students' work
   - No role-based access control
   - Passwords managed insecurely by administrators
   - No session management or audit logs

6. **File Management**
   - Assignments shared via email attachments (storage issues)
   - Student submissions stored in multiple locations
   - No centralized backup or version control
   - Risk of file loss or corruption

---

## Solution

### How Hallmark Assignment Management App Solves These Issues

#### 1. **Centralized Assignment Distribution**
- Lecturers upload assignments to specific courses with clear descriptions
- All students enrolled in a course automatically see relevant assignments
- Push notifications (planned feature) remind students of new assignments
- Students access assignments from a unified dashboard

#### 2. **Deadline Management with Late Submission Policy**
- Each assignment has a configurable deadline (date + time)
- Lecturers can enable/disable late submissions and set cutoff windows
- System automatically detects late submissions with timestamp accuracy
- Penalties are configurable per assignment (e.g., -10% per day)
- Students receive warnings before deadline is exceeded

#### 3. **Automated Grade Tracking**
- Lecturers grade submissions directly in the platform with feedback
- Grades are instantly visible to students
- Complete grade history is maintained (no accidental overwrites)
- Penalty calculations are transparent (e.g., "85% - 10% late penalty = 75%")
- Course analytics show grade distribution and class performance

#### 4. **Admin-Managed User Onboarding**
- Admins can add students/lecturers individually or via CSV bulk import
- CSV mapping allows flexible data import from existing databases
- Users create their own passwords on first login (admins never know passwords)
- Role-based account creation (student, lecturer, or admin)
- Secure session management prevents unauthorized access

#### 5. **Role-Based Access Control (RBAC)**
- **Students** only see their enrolled courses and assignments
- **Lecturers** only manage their own courses and grades
- **Admins** have full system oversight but cannot access student/lecturer data directly
- All access is logged and auditable
- Row-level security enforced at database level

#### 6. **Secure File Storage & Management**
- All files stored on Vercel Blob (enterprise-grade cloud storage)
- Students submit multiple files per assignment
- Lecturers can download submissions directly from the platform
- File URLs are secured and expire after a set period
- Automatic backup and redundancy

---

## Key Features

### For Students
- **Dashboard**: View all enrolled courses and active assignments
- **Assignment Submission**: Upload multiple files with drag-and-drop interface
- **Submission Status**: See if submission is on-time, late, or overdue
- **Grade Retrieval**: View grades immediately after lecturer grading
- **Feedback Review**: Read lecturer feedback and penalty breakdowns
- **Course Management**: View all enrolled courses and lecturers
- **Deadline Tracking**: See upcoming deadlines with visual warnings

### For Lecturers
- **Course Management**: View all assigned courses and enrolled students
- **Assignment Creation**: Create assignments with customizable deadlines
- **Late Policy Configuration**: Set acceptance of late submissions and penalties
- **Submission Review**: View all student submissions organized by course
- **Grading Interface**: Grade submissions with feedback and penalties
- **Analytics**: See class performance, submission rates, and grade distribution
- **Bulk Operations**: Download all submissions or export grades to CSV

### For Admins
- **User Management**: Add/edit/delete students and lecturers (manual or CSV)
- **Course Management**: Create courses, assign levels, set lecturers
- **System Overview**: Dashboard with total users, courses, submissions, and grades
- **Course Enrollment**: Manage student-course relationships
- **System Settings**: Configure global late submission policies (if needed)
- **Data Import**: Bulk import students and lecturers via CSV with mapping
- **User Onboarding**: Monitor which users have completed password setup and course selection

---

## Technical Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.2 + Next.js 16 (App Router) |
| **Backend** | Next.js API Routes (server-side rendering) |
| **Database** | MongoDB 7.0 (NoSQL) |
| **Authentication** | Custom JWT + bcryptjs password hashing |
| **File Storage** | Vercel Blob |
| **State Management** | Zustand 5.0 |
| **UI Framework** | shadcn/ui + Tailwind CSS 4.1 |
| **Form Handling** | React Hook Form + Zod validation |
| **Deployment** | Vercel |

### Database Schema

```
Users (base collection)
├── role: "student" | "lecturer" | "admin"
├── email: string (unique)
├── matric_number/lecturer_number: string (unique)
├── password_hash: string (bcrypt)
├── isPasswordSet: boolean

Courses
├── course_code: string (e.g., "CSC401")
├── course_name: string
├── level: number (100, 200, 300, 400)
├── lecturer_id: ObjectId (references Users)
├── semester: string

StudentEnrollments
├── student_id: ObjectId
├── course_id: ObjectId
├── enrolled_at: date

Assignments
├── course_id: ObjectId
├── title: string
├── deadline: date
├── late_submission: { accept_late, cutoff_days, penalty_percent }
├── created_by: ObjectId (lecturer)

Submissions
├── assignment_id: ObjectId
├── student_id: ObjectId
├── file_urls: [string] (Vercel Blob URLs)
├── submitted_at: date
├── is_late: boolean

Grades
├── submission_id: ObjectId
├── score: number (0-100)
├── feedback: string
├── graded_by: ObjectId (lecturer)
├── penalty_applied: number
├── final_score: number
```

---

## Authentication Flow

### User Registration & Onboarding

```
1. ADMIN CREATES USER
   Email + Matric/Lecturer Number → System creates user (isPasswordSet: false)

2. USER FIRST LOGIN
   Email + Matric Number → System verifies both exist
   
3. PASSWORD CREATION
   User sets secure password (hashed with bcryptjs)
   isPasswordSet: true

4. ROLE-BASED REDIRECT
   Students → Select courses page
   Lecturers → Dashboard
   Admins → Dashboard

5. SUBSEQUENT LOGIN
   Email + Password → JWT token issued → Access dashboard
```

### Session Management
- JWT tokens stored in HTTP-only cookies (secure from XSS)
- Refresh tokens for extended sessions
- Automatic logout after inactivity (configurable)
- Session validation on protected routes via middleware

---

## Security Measures

1. **Password Security**
   - Bcryptjs hashing (10 salt rounds)
   - Passwords never stored in plaintext
   - Admin never sees user passwords

2. **Access Control**
   - Role-based middleware on all protected routes
   - Students cannot access lecturer/admin pages
   - Lecturers cannot view other lecturers' courses
   - Row-level database checks prevent data leakage

3. **File Security**
   - Vercel Blob handles secure storage
   - File URLs expire after access period
   - Students can only download their own submissions
   - Lecturers can only access submissions for their courses

4. **Session Security**
   - HTTP-only cookies prevent client-side access
   - CSRF protection via token validation
   - Session timeout and automatic logout
   - Logout clears all tokens and cookies

5. **Input Validation**
   - Zod schema validation on all forms
   - Server-side validation on API routes
   - SQL injection prevention (MongoDB + parameterized queries)
   - XSS prevention via React escaping and sanitization

---

## Project Objectives

### Primary Goals
1. ✅ Build a functional assignment management platform for Hallmark University
2. ✅ Implement secure authentication without university API access
3. ✅ Create role-based dashboards for students, lecturers, and admins
4. ✅ Handle file uploads and late submission policies
5. ✅ Provide centralized grade management and feedback

### Secondary Goals
1. ✅ Demonstrate production-grade architecture and security practices
2. ✅ Implement scalable database design
3. ✅ Create professional, user-friendly UI
4. ✅ Deploy on modern cloud platform (Vercel)
5. ✅ Document code and decisions thoroughly

---

## Future Enhancement Possibilities

1. **Email Notifications**
   - Send emails to students when assignments are posted
   - Deadline reminders (24 hours, 1 hour before)
   - Grade posted notifications

2. **Advanced Analytics**
   - Lecturer analytics: class performance, submission patterns, grade distributions
   - Admin analytics: system health, user engagement, course popularity
   - Student analytics: grade trends, performance over time

3. **Submission Comments**
   - Students can add comments to submissions
   - Lecturers can reply to comments for clarification

4. **Assignment Templates**
   - Lecturers create reusable assignment formats
   - Quick creation for recurring assignment types

5. **Mobile App**
   - React Native app for iOS/Android
   - Offline submission queuing

6. **Integration Features**
   - Connect to university LMS (if API becomes available)
   - Export grades to institutional systems
   - Single Sign-On (SSO) via university credentials

7. **Plagiarism Detection**
   - Integrate plagiarism detection tool
   - Automatic similarity scanning on submissions

8. **Real-time Notifications**
   - WebSocket integration for live updates
   - Browser push notifications for important events

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Vercel account (for Blob storage and deployment)

### Installation

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd hallmark-assignment-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   # Create .env.local
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=hallmark-assignment
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

### Creating the First Admin

Run the seed script to create an admin account:
```bash
node scripts/seed-admin.js
```

This will create:
- Email: admin@hallmark.edu
- Admin ID: ADMIN001
- Password: Set on first login

---

## Project Structure

```
hallmark-assignment-app/
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── lecturer/           # Lecturer dashboard pages
│   ├── student/            # Student dashboard pages
│   ├── api/                # API routes (backend)
│   ├── auth/               # Authentication pages
│   ├── onboarding/         # Onboarding flows
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   └── ...                 # Feature components
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Database connection
│   ├── types.ts            # TypeScript interfaces
│   ├── store.ts            # Zustand stores
│   └── utils.ts            # Helper functions
├── scripts/
│   └── seed-admin.js       # Create first admin
└── public/                 # Static assets
```

---

## Testing

### Manual Testing Checklist

**Admin Flow**
- [ ] Login with admin email + admin ID
- [ ] Create a lecturer via form
- [ ] Create a student via form
- [ ] Upload CSV with multiple students
- [ ] Create a course
- [ ] Assign lecturer to course
- [ ] View system statistics

**Lecturer Flow**
- [ ] Login with lecturer email + lecturer number
- [ ] Create an assignment with deadline
- [ ] Configure late submission policy
- [ ] View student submissions
- [ ] Grade a submission with feedback and penalty
- [ ] View grades analytics

**Student Flow**
- [ ] Login with student email + matric number
- [ ] Set password on first login
- [ ] Select enrolled courses
- [ ] View assignments for selected courses
- [ ] Submit assignment with multiple files
- [ ] View submission status (on-time/late)
- [ ] View grades and lecturer feedback

---

## Contributing

This is a final year project. Contributions should follow:
- Code style: ESLint + Prettier
- Commit messages: Conventional commits
- Pull requests: Require code review
- Testing: Write tests for new features

---

## License

This project is proprietary to Hallmark University.

---

## Contacts & Support

**Project Lead**: [Your Name]
**University**: Hallmark University
**Department**: Computer Science

For issues and bug reports, open an issue in the repository or contact the development team.

---

## Acknowledgments

- Hallmark University for the opportunity and requirements
- Next.js and React communities for excellent documentation
- shadcn/ui for production-ready components
- Vercel for hosting and deployment infrastructure
