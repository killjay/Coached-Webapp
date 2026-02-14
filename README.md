# Coached - Enterprise Fitness Management Platform

A comprehensive enterprise-level fitness coaching platform built with React, TypeScript, Firebase, and Cloud Functions.

## 🎯 Features Completed

### ✅ Core Infrastructure
- **Firebase Authentication** - Email/password and Google Sign-in
- **Plan-Based Access Control** - Individual, Business, and Enterprise tiers
- **Firebase Firestore** - Real-time database with security rules
- **Firebase Cloud Functions** - Serverless backend logic
- **TypeScript** - Full type safety across the application

### ✅ Enterprise Navigation System
Complete side navigation with 8 feature modules (Enterprise plan only):

1. **Revenue Dashboard** 
   - KPI cards (Total Revenue, MRR, Active Subscriptions, Churn Rate)
   - Revenue trend charts with Chart.js
   - Payment status tracking
   - Revenue breakdown by plan
   - Export to CSV

2. **Client Onboarding**
   - Multi-step wizard (4 steps)
   - Personal details, fitness goals, medical history
   - Coach assignment and subscription selection
   - Form validation with error handling

3. **Coach Onboarding**
   - Multi-step onboarding process
   - Certification management
   - Specialization selection
   - Availability and commission setup

4. **Client List**
   - Searchable client directory
   - Filter by status and plan
   - Sortable columns
   - Pagination
   - Client detail modal

5. **Coach List**
   - Coach directory with performance metrics
   - Revenue and client count tracking
   - Verification status
   - Coach detail modal

6. **Create Template**
   - Workout plan builder
   - Exercise management (sets, reps, rest periods)
   - Nutrition plan builder (planned)
   - Template library

7. **Calendar**
   - Appointment management
   - Multiple view options (Month/Week/Day)
   - Multi-coach view with color coding
   - Appointment creation modal
   - Coach and client scheduling
   - **Automatic email invites** to coach and client
   - Calendar invite (.ics) attachments

8. **Roles Management**
   - Permission matrix
   - Pre-defined roles (Admin, Manager, Coach, Client)
   - User role assignment
   - Permission visualization

### ✅ Reusable UI Components
- `Button` - Multiple variants, sizes, loading states
- `Input` - With labels, errors, icons, help text
- `Select` - Dropdown with validation
- `Modal` - Multiple sizes, responsive
- `Card` - With headers, actions, flexible layout
- `Table` - Sortable, with custom renderers
- `Loader` - Spinner with fullscreen option
- `EmptyState` - For empty lists/data
- `Sidebar` - Collapsible navigation with mobile support

### ✅ Utilities & Hooks
- **dateUtils.ts** - Date formatting functions
- **validation.ts** - Form validation utilities
- **formatters.ts** - Currency, number, phone formatting
- **useFirestore.ts** - Complete CRUD operations
- **useTable.ts** - Table state with sort/filter/pagination

### ✅ Firebase Cloud Functions
Located in `/functions/src/`:
- **index.ts** - Appointment email notifications with calendar invites
- **revenue.ts** - Revenue calculations and reporting
- **notifications.ts** - Email notifications (welcome, verification, reminders)
- **aggregation.ts** - Coach and client metrics aggregation
- **scheduled.ts** - Daily revenue sync and appointment reminders

### ✅ Security & Data Models
- **Firestore Security Rules** - Plan-based and role-based access
- **Firestore Indexes** - Optimized queries
- **Complete TypeScript Types** - All data models defined

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (optional for deployment)

### Installation

1. **Clone and install dependencies:**
```bash
cd c:\Projects\Coached
npm install
```

2. **Set up Firebase configuration:**
   - Ensure `.env.local` has your Firebase credentials
   - File should contain: `REACT_APP_FIREBASE_*` variables

3. **Install Cloud Functions dependencies:**
```bash
cd functions
npm install
cd ..
```

4. **Configure email service for appointment invites:**
```bash
# Set up Gmail credentials for sending emails
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.pass="your-app-password"
```
See `functions/SETUP_GUIDE.md` for detailed email setup instructions.

### Running the Application

**Development Server:**
```bash
npm start
```
Opens on http://localhost:3000

**Build for Production:**
```bash
npm run build
```

### Firebase Deployment

**Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy Cloud Functions:**
```bash
firebase deploy --only functions
```

**Deploy Hosting:**
```bash
npm run build
firebase deploy --only hosting
```

## 📁 Project Structure

```
c:\Projects\Coached\
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── dashboard/       # Revenue dashboard components
│   │   ├── navigation/      # Sidebar component
│   │   ├── onboarding/      # (Empty - forms in pages)
│   │   └── lists/           # (Empty - tables in pages)
│   ├── layouts/
│   │   └── EnterpriseLayout.tsx  # Main layout with sidebar
│   ├── pages/
│   │   └── enterprise/      # All 8 enterprise feature pages
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── hooks/
│   │   ├── useFirestore.ts
│   │   └── useTable.ts
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state
│   ├── firebase/
│   │   └── config.ts        # Firebase initialization
│   └── App.tsx              # Routing with EnterpriseRoute guard
├── functions/
│   ├── src/
│   │   └── index.ts         # Appointment email notifications
│   ├── README.md            # Cloud Functions documentation
│   ├── SETUP_GUIDE.md       # Email setup guide
│   ├── setup.sh             # Setup script (Linux/Mac)
│   ├── setup.ps1            # Setup script (Windows)
│   ├── package.json
│   └── tsconfig.json
├── firebase.json            # Firebase configuration
├── firestore.rules          # Security rules
├── firestore.indexes.json   # Database indexes
└── package.json
```

## 🔑 User Access Levels

### Individual Plan ($29/month)
- Basic dashboard
- Personal fitness tracking

### Business Plan ($79/month)
- Basic dashboard
- Team features (planned)

### Enterprise Plan ($149/month)
- **Full access to all 8 enterprise features**
- Revenue dashboard
- Client & coach management
- Template builder
- Calendar
- Roles management

## 🎨 Design System

**Colors:**
- Primary: `#4f7cff`, `#3d63d9`
- Purple gradient: `#667eea`, `#764ba2`
- Success: `#10b981`, `#059669`
- Danger: `#ef4444`, `#dc2626`
- Background: `#e8eeff`, `#f5f7ff`
- Text: `#1a1d2e`, `#6b7280`

**Typography:**
- Font: Inter (Google Fonts)
- Weights: 300-800

**Responsive Breakpoints:**
- Mobile: 640px
- Tablet: 768px
- Desktop: 1024px

## 📊 Mock Data

The application currently uses mock data for demonstration. To connect to Firestore:

1. Uncomment Firestore queries in page components
2. Remove mock data arrays
3. Use the `useFirestore` hook for data operations

Example:
```typescript
const { data, loading, getAll } = useFirestore<ClientProfile>('client_profiles');

useEffect(() => {
  getAll();
}, []);
```

## 🔐 Security Notes

- **Firestore Rules** enforce plan-based access
- **EnterpriseRoute** guard prevents non-enterprise users from accessing features
- **Cloud Functions** validate user permissions before operations
- Passwords are handled by Firebase Authentication

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 Next Steps

For production deployment:
1. Set up SendGrid for email notifications
2. Configure Firebase Storage for file uploads
3. Add Stripe/PayPal for payment processing
4. Implement real-time Firestore listeners
5. Add comprehensive error boundaries
6. Set up monitoring and analytics
7. Configure custom domain

## 🤝 Contributing

This is a private enterprise application. For questions or support, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using React, TypeScript, and Firebase**
