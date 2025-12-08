# Mini Supermarket Management System

A comprehensive web application for managing supermarket operations built with React and Vite.

## 🏗️ Project Structure

```
mini-supermarket-management/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Node.js)
├── netlify.toml     # Netlify deployment config
└── package.json     # Root package manager
```

## 🚀 Tech Stack

### Frontend

- **React 19** - UI Library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Icons** - Icon library
- **CSS Modules** - Styling

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd mini-supermarket-management
   ```

2. **Install dependencies:**

   ```bash
   npm install
   npm run install:all
   ```

3. **Start development servers:**

   ```bash
   npm run dev
   ```

   This runs:

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Individual Commands

```bash
# Frontend only
npm run client

# Backend only
npm run server

# Build for production
npm run build
```

## 📦 Features

- **Role-based Access Control**

  - Manager Dashboard
  - Staff Management
  - Cashier Interface
  - Delivery Staff Portal
  - Merchandise Supervisor Tools

- **Core Modules**
  - Product Management
  - Inventory Control
  - Customer Management
  - Invoice Processing
  - Supplier Management
  - Report Generation

## 🌐 Deployment

### Netlify (Frontend)

- Link: mini-supermarket-management.netlify.app

1. **Connect repository** to Netlify
2. **Build settings** (auto-detected):

   - Base directory: `client/`
   - Build command: `npm run build`
   - Publish directory: `dist/`

3. **Deploy** automatically on git push

### Environment Variables

Create `.env` files:

```bash
# client/.env
VITE_API_URL=http://localhost:3000

# server/.env
PORT=3000
NODE_ENV=development
```

## 🔧 Scripts Reference

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm run dev`    | Start both frontend & backend |
| `npm run build`  | Build frontend for production |
| `npm run client` | Start frontend only           |
| `npm run server` | Start backend only            |

## 📱 User Roles

1. **Manager** - Full system access
2. **Cashier** - Invoice & customer management
3. **Delivery Staff** - Order tracking & delivery
4. **Merchandise Supervisor** - Inventory & product management
5. **Warehouse Staff** - Stock management

## 🎯 Live Demo

- **Frontend:** [Deployed on Netlify]
- **Backend:** [API Documentation]

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request
