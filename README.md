# MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE — College News Portal

A colorful, responsive news/events portal for MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE with a lightweight Node/Express backend that serves detailed event data. This portal provides a comprehensive platform for students and administrators to manage campus events, news, and registrations.

## 🌟 Features

### For Students
- **Browse Events**: View campus news, academic updates, sports events, tech talks, hackathons, placements, seminars, and competitions
- **Search & Filter**: Real-time search and category-based filtering of events
- **Event Details**: Comprehensive event information including agendas, resources, and logistics
- **Registration System**: Easy event registration with status tracking
- **User Profiles**: Manage personal information, department, year, and social links
- **Theme Support**: Dark/Light mode toggle for comfortable viewing
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### For Administrators
- **Event Management**: Create, update, and delete events with rich details
- **Registration Management**: Review, accept, or reject student registrations
- **Dashboard Metrics**: Real-time statistics on events, upcoming activities, and pending approvals
- **Advanced Filtering**: Filter registrations by status, event, and search terms
- **Profile Management**: Admin profile settings and password management

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with glassmorphism design, gradients, and animations
- **Vanilla JavaScript**: No frameworks, pure JavaScript for optimal performance
- **LocalStorage**: Client-side data persistence for user accounts
- **SessionStorage**: Session management for authentication state

### Backend
- **Node.js**: JavaScript runtime for server-side logic
- **Express.js**: Web framework for RESTful API endpoints
- **CORS**: Cross-Origin Resource Sharing support
- **File System**: JSON-based data storage for events and registrations

### Dependencies
```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.1.3"
}
```

## 📁 Project Structure

```
College News Portal/
├── assets/
│   ├── campus-bg.jpg          # Background image for authentication pages
│   ├── mit-logo.png           # MIT Mysore logo
│   └── README.txt             # Assets documentation
├── data/
│   ├── events.json            # Event data storage
│   └── registrations.json      # Registration submissions storage
├── node_modules/              # Dependencies (excluded from git)
├── .gitignore                 # Git ignore rules
├── package.json               # Project configuration and dependencies
├── package-lock.json          # Dependency lock file
├── server.js                  # Express server and API endpoints
├── styles.css                 # Global styles and responsive design
├── guard.js                   # Authentication guard and logout handler
├── script.js                  # Main page logic (index.html)
├── profile.js                # Profile management for both user types
├── index.html                 # Main student-facing page
├── event.html                 # Event detail page
├── event.js                   # Event detail logic
├── register.html             # Event registration page
├── register.js               # Registration form logic
├── admin.html                 # Admin console for event management
├── admin.js                  # Admin console logic
├── registrations-admin.html   # Registration management page
├── registrations-admin.js     # Registration management logic
├── login.html                # Authentication login page
├── login.js                  # Login form logic
├── signup.html               # User registration page
├── signup.js                 # Signup form logic
├── student-profile.html      # Student profile view
├── student-profile-settings.html # Student profile editing
├── admin-profile.html        # Admin profile view
├── admin-profile-settings.html # Admin profile editing
├── support.html              # Help and support page
└── README.md                 # Project documentation
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Modern web browser

### Installation Steps

1. **Clone or download the project**
   ```powershell
   cd "C:\Users\RISHAN\Desktop\College News Portal"
   ```

2. **Install dependencies** (first time only)
   ```powershell
   npm install
   ```

3. **Start the backend server**
   ```powershell
   npm start
   ```
   The Express server will start on `http://localhost:4000`

4. **Open the application**
   - For new users: Open `signup.html` in your browser
   - For existing users: Open `login.html` in your browser

## 📖 Usage Guide

### Authentication Flow

1. **Sign Up**
   - Navigate to `signup.html`
   - Select your role (Student/Reader or Admin/Staff)
   - Fill in your details (name, email, password)
   - Submit the form to create your account
   - Accounts are stored in browser's localStorage

2. **Login**
   - Navigate to `login.html`
   - Select your role
   - Enter your email and password
   - Students are redirected to `index.html`
   - Admins are redirected to `admin.html`

### Student Workflow

1. **Browse Events** (`index.html`)
   - View all events in a card-based layout
   - Use category filters (All, Campus, Academics, Sports, Events, Tech Talks, Hackathons, Placements, Seminars, Competitions)
   - Search events by title, excerpt, or content
   - Click "Read" for detailed event information
   - Click "Register" to sign up for events

2. **View Event Details** (`event.html`)
   - Comprehensive event information
   - Date, time, and location details
   - Speaker information
   - Event highlights
   - Sample agenda
   - Resources and logistics

3. **Register for Events** (`register.html`)
   - Fill in registration form (name, email, department, year, phone, notes)
   - Submit registration
   - View confirmation status

4. **Manage Profile** (`student-profile.html`, `student-profile-settings.html`)
   - View personal information
   - Update profile details
   - Change password
   - Add social links
   - Manage profile photo

### Admin Workflow

1. **Manage Events** (`admin.html`)
   - Create new events with comprehensive details
   - View existing events in a table format
   - Delete events
   - View dashboard metrics (total events, upcoming events, pending registrations)

2. **Manage Registrations** (`registrations-admin.html`)
   - View all student registrations
   - Filter by status (pending, accepted, rejected)
   - Filter by event
   - Search by name, email, or department
   - Accept or reject registrations
   - View registration statistics

3. **Manage Profile** (`admin-profile.html`, `admin-profile-settings.html`)
   - View admin information
   - Update profile details
   - Change password
   - Add social links

## 🔌 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Events Endpoints

#### Get All Events
```
GET /api/events
```
**Query Parameters:**
- `category` (optional): Filter by category (campus, academics, sports, events, tech, hackathon, placements, seminar, competition)
- `q` (optional): Search query for title, excerpt, or content

**Response:** Array of event objects

#### Get Single Event
```
GET /api/events/:id
```
**Response:** Single event object

#### Create Event
```
POST /api/events
```
**Request Body:**
```json
{
  "title": "string (required)",
  "category": "string (required)",
  "date": "string (required, YYYY-MM-DD)",
  "excerpt": "string (required)",
  "content": "string (required)",
  "location": "string (optional)",
  "startTime": "string (optional, HH:MM)",
  "endTime": "string (optional, HH:MM)",
  "speakers": "array or comma-separated string (optional)",
  "highlights": "array or comma-separated string (optional)",
  "registrationLink": "string (optional)",
  "contactEmail": "string (optional)",
  "color1": "string (optional, hex color)",
  "color2": "string (optional, hex color)"
}
```

**Response:** Created event object

#### Delete Event
```
DELETE /api/events/:id
```
**Response:** Success message

### Registrations Endpoints

#### Get All Registrations
```
GET /api/registrations
```
**Query Parameters:**
- `eventId` (optional): Filter by event ID

**Response:** Array of registration objects

#### Create Registration
```
POST /api/registrations
```
**Request Body:**
```json
{
  "eventId": "number (required)",
  "name": "string (required)",
  "email": "string (required)",
  "department": "string (optional)",
  "year": "string (optional)",
  "phone": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:** Created registration object

#### Update Registration Status
```
PATCH /api/registrations/:id
```
**Request Body:**
```json
{
  "status": "pending | accepted | rejected"
}
```

**Response:** Updated registration object

## 👥 User Roles and Permissions

### Student/Reader
- View all events and news
- Search and filter events
- Read event details
- Register for events
- Manage own profile
- View registration status

### Admin/Staff
- All student permissions
- Create, update, and delete events
- View all registrations
- Accept or reject registrations
- Access admin dashboard
- Manage admin profile

## 🎨 Design Features

### Visual Design
- **Glassmorphism**: Modern glass-like UI elements with blur effects
- **Gradient Backgrounds**: Dynamic color gradients for visual appeal
- **Color Categories**: Each event category has unique color schemes
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Smooth Animations**: Subtle transitions and hover effects

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast options via theme toggle

## 🔒 Security Features

- Client-side authentication using localStorage
- Role-based access control via guard.js
- Session management with sessionStorage
- Password validation (minimum 6 characters)
- Input sanitization to prevent XSS
- CORS enabled for API communication

## 📊 Data Structure

### Event Object
```json
{
  "id": "number",
  "title": "string",
  "category": "string",
  "date": "string (YYYY-MM-DD)",
  "excerpt": "string",
  "content": "string",
  "location": "string",
  "startTime": "string (HH:MM)",
  "endTime": "string (HH:MM)",
  "speakers": ["string"],
  "highlights": ["string"],
  "registrationLink": "string",
  "contactEmail": "string",
  "color1": "string (hex)",
  "color2": "string (hex)"
}
```

### Registration Object
```json
{
  "id": "number (timestamp)",
  "eventId": "number",
  "name": "string",
  "email": "string",
  "department": "string",
  "year": "string",
  "phone": "string",
  "notes": "string",
  "status": "pending | accepted | rejected",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### User Account Object
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "user | admin",
  "phone": "string",
  "department": "string",
  "year": "string",
  "bio": "string",
  "photo": "string (URL)",
  "socialLinks": ["string"]
}
```

## 🧪 Testing

The project includes manual testing capabilities:
- Test event creation and deletion
- Test registration flow
- Test authentication system
- Test search and filter functionality
- Test profile management

## 🚧 Future Enhancements

### Planned Features
- **Database Integration**: Migrate from JSON files to MongoDB or PostgreSQL
- **Authentication**: Implement JWT-based server-side authentication
- **Email Notifications**: Send confirmation emails for registrations
- **File Upload**: Support for event images and document attachments
- **Pagination**: Implement pagination for large event lists
- **Comments System**: Allow comments on events
- **Calendar View**: Monthly calendar view of events
- **Mobile App**: React Native or Flutter mobile application
- **Real-time Updates**: WebSocket integration for live updates
- **Analytics**: Google Analytics integration for usage tracking
- **Multi-language Support**: Internationalization (i18n)

### Technical Improvements
- **Unit Testing**: Jest or Mocha test framework
- **Code Splitting**: Optimize JavaScript loading
- **Service Workers**: Offline functionality
- **Performance Optimization**: Lazy loading and caching strategies
- **Error Handling**: Comprehensive error logging and monitoring

## 📞 Support

For support and assistance:
- **Email**: support@mitmysore.edu
- **Phone**: +91 821 234 5678
- **Campus Desk**: Admin Block, Room 102 (Mon-Fri, 10:00 AM – 4:00 PM)
- **Online**: Visit `support.html` for additional resources

## 📝 License

ISC License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 File Descriptions

### Core Application Files
- **server.js**: Express server with RESTful API endpoints for events and registrations
- **styles.css**: Comprehensive stylesheet with responsive design and theme support
- **guard.js**: Authentication guard protecting role-based pages and handling logout

### Frontend Pages
- **index.html**: Main student-facing page with event cards and filters
- **event.html**: Detailed event view with comprehensive information
- **register.html**: Event registration form
- **admin.html**: Admin console for event management
- **registrations-admin.html**: Registration management interface
- **login.html**: User authentication page
- **signup.html**: New user registration page
- **support.html**: Help and support information

### Profile Pages
- **student-profile.html**: Student profile view
- **student-profile-settings.html**: Student profile editing
- **admin-profile.html**: Admin profile view
- **admin-profile-settings.html**: Admin profile editing

### JavaScript Logic
- **script.js**: Main page logic for event display, filtering, and search
- **event.js**: Event detail page logic with dynamic content rendering
- **register.js**: Registration form handling and submission
- **admin.js**: Admin console logic for event CRUD operations
- **registrations-admin.js**: Registration management and approval logic
- **profile.js**: Profile management for both user types
- **login.js**: Authentication logic and session management
- **signup.js**: User registration and account creation

### Data Files
- **data/events.json**: Event data storage with sample events
- **data/registrations.json**: Registration submissions storage

### Assets
- **assets/campus-bg.jpg**: Background image for authentication pages
- **assets/mit-logo.png**: Official MIT Mysore logo

## 🎯 Event Categories

The portal supports the following event categories:
- **Campus**: Campus news and updates
- **Academics**: Academic announcements and schedules
- **Sports**: Sports events and tournaments
- **Events**: General campus events
- **Tech Talks**: Technology presentations and discussions
- **Hackathons**: Coding competitions and hackathons
- **Placements**: Job placement drives and recruitment
- **Seminars**: Academic seminars and guest lectures
- **Competitions**: Various competitions and contests

## 🔧 Development Details

### Environment Variables
The application uses the following environment variables:
- `PORT`: Server port (default: 4000)

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

**MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE — News and Events Portal**  
Built with modern web technologies for a seamless campus experience.