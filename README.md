
## Getting Started

### Prerequisites
- Node.js (v18 or higher) - [Download & Install Node.js](https://nodejs.org/)
- PostgreSQL (v14 or higher) - [Download & Install PostgreSQL](https://www.postgresql.org/download/)
- Git - [Download & Install Git](https://git-scm.com/downloads)
- A GitHub account (for cloning the repository)

### Downloading the Project

1. Open your terminal/command prompt

2. Navigate to where you want to store the project:
```bash
# On Windows
cd C:\Users\YourUsername\Desktop

# On Mac/Linux
cd ~/Desktop
```

3. Clone the repository:
```bash
git clone https://github.com/yourusername/discover.git
cd discover
```

### Database Setup

1. Navigate to the backend directory first:
```bash
cd backend
```

2. Create a new PostgreSQL database:
   - Open pgAdmin (comes with PostgreSQL installation) or your preferred PostgreSQL client
   - Or use the PostgreSQL command line:
```sql
psql -U postgres
CREATE DATABASE discover;
\q
```

3. Note down your PostgreSQL connection details (you'll need these for the next step):
- Database name: discover (or your preferred name)
- Username (default is usually "postgres")
- Password (what you set during PostgreSQL installation)
- Host (usually "localhost")
- Port (usually 5432)

### Backend Setup

1. You should already be in the backend directory from the previous step. If not, navigate there:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

4. Open the .env file in a text editor and update these values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/discover"
JWT_SECRET="your-secret-key"
PORT=3000
```
Replace:
- username with your PostgreSQL username
- password with your PostgreSQL password
- your-secret-key with a random string for security

5. Set up the database:
```bash
npx prisma migrate dev
```

6. Start the backend server:
```bash
npm run dev
```

The backend should now be running on http://localhost:3000

### Frontend Setup

1. Open a new terminal window/tab

2. Navigate to frontend directory:
```bash
# From the project root
cd frontend
```

3. Install dependencies:
```bash
npm install
```

4. Create environment file:
```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

5. Update the .env file:
```env
VITE_API_URL=http://localhost:3000
```

6. Start the frontend development server:
```bash
npm run dev
```

The frontend should now be running on http://localhost:5173

### Verifying the Setup

1. Open your browser and go to http://localhost:5173
2. You should see the login page
3. Create a new account using the "Register" link
4. Try logging in with your new account

### Common Issues & Solutions

1. "Port already in use" error:
```bash
# Find the process using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F       # Windows
kill -9 <PID>                # Mac/Linux
```

2. Database connection issues:
- Check if PostgreSQL is running
- Verify your database credentials in .env
- Make sure the database exists

3. "npm command not found":
- Reinstall Node.js
- Add Node.js to your system's PATH

4. Git clone errors:
- Check your internet connection
- Verify you have a GitHub account
- Ensure you have Git installed: `git --version`

### Project Structure
```
Sadaora/
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/      # React context for state management
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
├── backend/           # Node.js backend application
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Data models and schemas
│   │   └── utils/        # Utility functions
└── README.md         # Project documentation
```

For any additional help or issues, please open an issue on the GitHub repository.

## Project Overview

Discover is a social platform that enables users to:
- Create and manage detailed profiles
- Discover other users based on shared interests
- Follow other users and build connections
- Filter and explore profiles through an infinite-scroll feed

## Tech Stack

### Frontend
- **React.js with Vite**: Chosen for its fast development experience and optimized build output
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing with protected route support
- **React Hook Form**: Efficient form handling with built-in validation
- **Axios**: Promise-based HTTP client for API requests

### Backend
- **Node.js + Express**: Fast, unopinionated web framework
- **PostgreSQL**: Robust, relational database for complex data relationships
- **Prisma ORM**: Type-safe database access with excellent TypeScript support
- **JWT Authentication**: Stateless authentication for better scalability
- **Express Validator**: Request validation middleware

## Architectural Decisions

### 1. Monorepo Structure
- **Why**: Enables code sharing, easier dependency management, and simplified deployment
- **Benefits**: 
  - Single source of truth for the entire application
  - Shared TypeScript types between frontend and backend
  - Simplified CI/CD pipeline
  - Easier code refactoring across the stack

### 2. Component Architecture
- **Mobile-First Responsive Design**: Built for optimal mobile experience first
- **Atomic Design Principles**: Components are organized by complexity and reusability
- **Context-Based State Management**: Using React Context instead of Redux for:
  - Simpler state management needs
  - Reduced boilerplate code
  - Better performance for this scale
  - Easier testing and maintenance

### 3. Authentication & Security
- **JWT-Based Authentication**:
  - Stateless authentication for better scalability
  - Tokens stored in localStorage with appropriate security measures
  - Refresh token rotation for enhanced security
- **Protected Routes**: Server-side and client-side route protection
- **Input Validation**: Both client and server-side validation

### 4. Database Design
- **PostgreSQL**:
  - Strong data consistency and relationships
  - Rich querying capabilities
  - Excellent support for JSON data types
- **Prisma ORM**:
  - Type-safe database queries
  - Automatic migrations
  - Excellent developer experience
  - Built-in connection pooling

### 5. Performance Optimizations
- **Infinite Scroll**: Implemented for better performance and UX
- **Image Optimization**: Proper sizing and lazy loading
- **Caching Strategy**: Browser caching for static assets
- **Code Splitting**: Route-based code splitting for faster initial load

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Create new user account
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Profile Endpoints
- GET /api/profile/me - Get current user profile
- PUT /api/profile/me - Update current user profile
- DELETE /api/profile/me - Delete current user profile
- GET /api/profile/:id - Get public profile by ID

### Feed Endpoints
- GET /api/feed - Get paginated feed of profiles
- GET /api/feed/interests - Filter feed by interests
