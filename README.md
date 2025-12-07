# AITWY - AI-Powered Business Platform

A modern web application built with React, TypeScript, and MongoDB Atlas for user authentication and management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free at https://mongodb.com/cloud/atlas)

### Installation

1. **Clone and install dependencies:**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

2. **Configure MongoDB credentials:**

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://AITWY_admin:AITWY%40pg%40123@aitwy-ctl.ot1vbkm.mongodb.net/?appName=AITWY-CTL
DB_NAME=aitwy
JWT_SECRET=aitwy-super-secret-jwt-key-2024-change-in-production
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

Create `.env` in project root:
```env
VITE_BACKEND_URL=http://localhost:5001
VITE_CHATBOT_API_URL=https://your-chatbot-api.ngrok-free.dev
```

3. **Run the application:**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

4. **Access the app:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:5001
- Health Check: http://localhost:5001/health

## 📁 Project Structure

```
aitwy/
├── server/                 # Backend (Node.js/Express)
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   └── server.js          # Main server file
├── src/                   # Frontend (React/TypeScript)
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── lib/               # Utilities
└── public/                # Static assets
```

## 🔐 Features

- ✅ User authentication (signup/login)
- ✅ **Email verification** for new accounts
- ✅ JWT token-based sessions
- ✅ Password hashing with bcrypt
- ✅ MongoDB Atlas integration
- ✅ Protected routes
- ✅ Email service with Nodemailer
- ✅ **Chatbot integration** with external API
- ✅ Create and manage AI chatbots
- ✅ Real-time chat interface
- ✅ Modern UI with Tailwind CSS & shadcn/ui
- ✅ TypeScript for type safety
- ✅ Responsive design

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Framer Motion

### Backend
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcryptjs
- jsonwebtoken
- express-validator

## 📡 API Endpoints

### Authentication API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/auth/signup` | Register user (sends verification email) | No |
| GET | `/api/auth/verify-email/:token` | Verify email address | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| POST | `/api/auth/login` | Login user (requires verified email) | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Chatbot API (External)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/chatbots/wizard/start` | Start chatbot creation wizard | Yes |
| GET | `/api/v1/chatbots/{id}/status` | Get chatbot creation status | Yes |
| POST | `/api/v1/chatbots/{id}/finalize` | Finalize chatbot creation | Yes |
| GET | `/api/v1/chatbots/list` | List all chatbots | Yes |
| GET | `/api/v1/chatbots/{id}` | Get chatbot details | Yes |
| DELETE | `/api/v1/chatbots/{id}` | Delete chatbot | Yes |
| POST | `/api/v1/chatbots/{id}/chat` | Send message to chatbot | Yes |
| GET | `/api/v1/chatbots/{id}/knowledge` | List knowledge items | Yes |
| POST | `/api/v1/chatbots/{id}/knowledge` | Add knowledge item | Yes |
| PUT | `/api/v1/chatbots/{id}/knowledge/{itemId}` | Update knowledge item | Yes |
| DELETE | `/api/v1/chatbots/{id}/knowledge/{itemId}` | Delete knowledge item | Yes |

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Runs Vite dev server
```

### Build for Production
```bash
npm run build
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5001 | xargs kill -9
```

### MongoDB Connection Issues
- Verify credentials in `server/.env`
- Check IP whitelist in MongoDB Atlas (Network Access)
- Ensure internet connection is active

### CORS Errors
- Verify `FRONTEND_URL` in `server/.env` matches your frontend URL
- Check backend is running before starting frontend

## 🔒 Security

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 30 days
- Environment variables for sensitive data
- CORS protection enabled
- Input validation on all endpoints

## 📝 Environment Variables

### Backend (`server/.env`)
- `MONGODB_URI` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret for JWT signing
- `PORT` - Server port
- `NODE_ENV` - Environment mode
- `FRONTEND_URL` - Frontend URL for CORS
- `EMAIL_SERVICE` - Email service provider (gmail, sendgrid, etc.)
- `EMAIL_USER` - Email account username
- `EMAIL_PASSWORD` - Email account password or API key
- `EMAIL_FROM` - From address for emails

### Frontend (`.env`)
- `VITE_BACKEND_URL` - Backend API URL (for authentication)
- `VITE_CHATBOT_API_URL` - Chatbot API URL (external service)

**Note:** In development, emails use Ethereal (fake SMTP). Check console for preview URLs.

## 🚀 Deployment

### Production Checklist
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Use HTTPS for frontend and backend
- [ ] Restrict MongoDB Atlas IP access
- [ ] Update CORS to production domain
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## 📧 Email Verification

New users must verify their email address before logging in.

**Development:** Uses Ethereal Email (fake SMTP) - check console for preview URLs
**Production:** Configure real email service (Gmail, SendGrid, etc.)

## 🤖 Chatbot Integration

Create and manage AI chatbots powered by website scraping and knowledge base.

### Features
- **Wizard-based Creation**: Start with a website URL, and the system automatically scrapes and builds a knowledge base
- **Status Tracking**: Real-time progress monitoring during chatbot creation
- **Smart Chat**: AI-powered responses based on scraped website content
- **Source Citations**: Responses include links to source pages
- **Knowledge Management**: Add, update, or delete knowledge items manually
- **Easy Configuration**: Centralized API configuration in `src/config/api.config.ts`

### How to Create a Chatbot

1. Navigate to the "Chatbots" page
2. Click "Create New Chatbot"
3. Enter:
   - **Chatbot Name**: A friendly name for your bot
   - **Website URL**: The website to scrape (e.g., `https://example.com`)
   - **Description** (optional): What your chatbot does
4. Click "Create Chatbot"
5. Wait for the scraping process to complete (progress shown in real-time)
6. Once completed, start chatting!

### API Configuration

Update the chatbot API URL in your `.env` file:

```env
VITE_CHATBOT_API_URL=https://your-chatbot-api.ngrok-free.dev
```

Or modify `src/config/api.config.ts` to change endpoint paths.

### Chatbot Workflow

1. **Start Wizard** → Creates chatbot record and starts scraping job
2. **Status Polling** → Frontend polls for completion status
3. **Finalize** → Marks chatbot as ready for use
4. **Chat** → Send messages and receive AI-powered responses with sources

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

Built with ❤️ by the AITWY Team

