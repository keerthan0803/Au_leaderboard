# College Coding Leaderboard

A comprehensive college management system for tracking student coding performance across multiple platforms including LeetCode, HackerRank, CodeChef, Codeforces, and GitHub.

## Features

### Authentication
- **Email/Password Login & Signup**
- **Google OAuth Login** - Quick sign-in with Google account
- **Auto Role Assignment** - Admins automatically get Faculty access
- **Admin Array** - Configure multiple admins via environment variable

### Student Side
- **Authentication**: Secure login and signup
- **Profile Management**: Add coding platform usernames (LeetCode, HackerRank, CodeChef, GitHub)
- **Resume Upload**: Upload and store resume URLs
- **Performance Dashboard**: View personal coding statistics
- **Performance Graphs**: Visual representation of coding achievements
- **Leaderboard Access**: View rankings among all students

### Faculty Side
- **Student Overview**: View all registered students
- **Search Functionality**: Search students by name, roll number, or department
- **Detailed Student View**: Access complete student profiles and performance data
- **Performance Tracking**: Monitor student progress on various coding platforms
- **Leaderboard Access**: View overall student rankings

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Axios** for API calls to coding platforms

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Canvas API** for performance graphs

## Project Structure

```
au_ai_leaderboard/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── facultyController.js
│   │   └── leaderboardController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── facultyRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── config/
│   │   └── db.js
│   ├── utils/
│   │   └── apiHelpers.js
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Leaderboard.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── FacultyDashboard.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── PerformanceGraph.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the following values in `.env`:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     PORT=5000
     ADMIN_EMAILS=keerthanpentam@gmail.com,other-admin@example.com
     GITHUB_API_TOKEN=your_github_token
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
   - See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed Google OAuth configuration

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Update `.env` file if needed:
     ```
     VITE_API_URL=http://localhost:5000/api
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```
   - Use the SAME Google Client ID from backend setup

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Admin Configuration

### How It Works
- The system uses an **email-based admin system**
- Admin emails are configured in the backend `.env` file
- When a user signs up or logs in, the system checks if their email is in the admin list
- **If email is in admin list** → User gets Faculty role
- **If email is NOT in admin list** → User gets Student role

### Configure Admins

1. Open `backend/.env`
2. Update the `ADMIN_EMAILS` variable with comma-separated emails:

```env
ADMIN_EMAILS=keerthanpentam@gmail.com,admin2@college.edu,admin3@university.com
```

**Rules:**
- Emails are case-insensitive
- Separate multiple emails with commas (no spaces)
- No role selection during signup - role is auto-assigned
- Initially configured with: `keerthanpentam@gmail.com`

### Adding New Admins

To add more admins at any time:
1. Edit `backend/.env`
2. Add the new email to `ADMIN_EMAILS`
3. Restart the backend server
4. The new admin can now sign up/login and will automatically get Faculty access

## Google OAuth Setup

This application supports Google Sign-In for quick authentication.

### Quick Setup

1. Get your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
3. Add to `frontend/.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

### Detailed Instructions

See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for complete step-by-step instructions on:
- Creating a Google Cloud project
- Configuring OAuth consent screen
- Getting your Client ID and Secret
- Testing the integration
- Troubleshooting common issues

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (auto-assigns role)
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user (Protected)

### Student Routes (Protected - Student Only)
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/coding-profiles` - Update coding profiles
- `POST /api/student/resume` - Upload resume URL
- `POST /api/student/refresh-data` - Refresh performance data

### Faculty Routes (Protected - Faculty Only)
- `GET /api/faculty/students` - Get all students
- `GET /api/faculty/students/:id` - Get student by ID
- `GET /api/faculty/leaderboard` - Get leaderboard

### Leaderboard (Protected)
- `GET /api/leaderboard` - Get leaderboard data

## API Keys Configuration

To fetch data from coding platforms, you need to configure API keys in the backend `.env` file:

### GitHub
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `public_repo` scope
3. Add to `.env`: `GITHUB_API_TOKEN=your_token`

### Other Platforms
- **LeetCode**: Uses public API (leetcode-stats-api.herokuapp.com)
- **CodeChef**: Requires API credentials (check CodeChef API documentation)
- **HackerRank**: No public API available (may require web scraping)

## Usage

1. **Sign Up**: Create an account as Student or Faculty
2. **Login**: Access your dashboard
3. **Students**: 
   - Add coding platform usernames
   - Upload resume URL
   - Refresh performance data
   - View profile and graphs
4. **Faculty**: 
   - View all students
   - Search students
   - Access detailed student profiles
   - Monitor leaderboard

## Scoring System

Total Score Calculation:
- LeetCode problems solved × 10
- GitHub contributions × 2
- CodeChef rating (direct value)

## Design Philosophy

The UI is designed to be:
- **Simple**: Clean, minimalist interface
- **Professional**: Monochromatic color scheme (grays and blacks)
- **Functional**: Easy navigation and clear information hierarchy
- **Responsive**: Works on all screen sizes

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes with middleware
- Role-based access control (Student/Faculty)

## Future Enhancements

- Real-time data syncing
- Email notifications
- Advanced analytics
- Batch data refresh
- Export functionality
- Contest tracking
- Team collaborations

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for cloud MongoDB

### API Rate Limits
- Some coding platforms have rate limits
- Use API keys when available
- Implement caching for frequent requests

### CORS Issues
- Backend configured to accept requests from frontend
- Check proxy settings in `vite.config.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues and questions, please open an issue in the repository.

---

**Built with MERN Stack** | MongoDB + Express + React + Node.js
