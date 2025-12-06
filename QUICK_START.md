# Quick Start Guide - Frontend-Backend Integration

## 📋 Prerequisites

Ensure you have completed the backend setup:
- Backend running on `http://localhost:5000`
- Database initialized with `node server/scripts/init-data.js`
- All 129 backend tests passing

---

## 🚀 Starting the Application

### Terminal 1: Start Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Terminal 2: Start Frontend Dev Server
```bash
cd client
npm install  # First time only
npm run dev
# Frontend runs on http://localhost:5173
```

### Open Browser
Navigate to: **http://localhost:5173**

---

## 🔐 Test Accounts

### Admin (Full System Access)
```
Username: admin
Password: admin123
```

### Manager (Staff & Order Management)
```
Username: manager
Password: manager123
```

### Cashier Staff (Transactions)
```
Username: cashier1
Password: staff123
```

### Regular Customer
```
Username: customer1
Password: customer123
```

---

## 💡 How the Integration Works

### API Client (`client/src/services/apiClient.js`)
- Centralized HTTP client using axios
- Automatically adds JWT token to all requests
- Handles 401 errors by redirecting to login

### Services (6 modules)
```
staffService.js       → /api/staff endpoints
productService.js     → /api/products endpoints
supplierService.js    → /api/suppliers endpoints
orderService.js       → /api/orders endpoints
customerService.js    → /api/customers endpoints
invoiceService.js     → /api/invoices endpoints
```

### Authentication Context
- Global `AuthContext` provides user state
- `useAuth()` hook for component access
- Automatic token management

---

## 🧪 Test the Integration

### 1. Test Login
1. Go to http://localhost:5173/signin
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to dashboard on success

### 2. Test API Call (Browser Console)
```javascript
// After logging in, open DevTools Console:

// Import and test
import staffService from 'http://localhost:5173/src/services/staffService.js'

// This will fail in console, but shows the concept
// In components, do: const staff = await staffService.getAll()
```

### 3. Check Token in Storage
```javascript
// In Browser DevTools → Application → localStorage
// Should see key: auth_token with JWT value
```

---

## 📁 File Structure

```
client/
├── src/
│   ├── services/              ← NEW: API communication
│   │   ├── apiClient.js       ← HTTP client with auth
│   │   ├── authService.js     ← Authentication
│   │   ├── staffService.js    ← Staff CRUD
│   │   ├── productService.js  ← Product CRUD
│   │   ├── supplierService.js ← Supplier CRUD
│   │   ├── orderService.js    ← Order CRUD
│   │   ├── customerService.js ← Customer CRUD
│   │   └── invoiceService.js  ← Invoice CRUD
│   │
│   ├── context/               ← NEW: Global state
│   │   └── AuthContext.jsx    ← Auth provider
│   │
│   ├── hooks/
│   │   ├── useAuth.js         ← UPDATED: Real API
│   │   └── useNotification.js
│   │
│   ├── views/
│   │   ├── auth/
│   │   │   └── SignIn.jsx     ← UPDATED: API login
│   │   ├── dashboard/
│   │   ├── manager/
│   │   ├── cashier/
│   │   ├── delivery-staff/
│   │   └── merchandise-supervisor/
│   │
│   └── App.jsx                ← UPDATED: AuthProvider wrapper
│
├── .env                       ← NEW: Configuration
└── package.json
```

---

## 📝 Common Tasks

### Add New Feature Using API

#### 1. Create Service Method (if needed)
```javascript
// In client/src/services/staffService.js
getByPosition: async (position) => {
  const response = await apiClient.get(`/staff/position/${position}`);
  return response;
}
```

#### 2. Use in Component
```javascript
import { useAuth } from '@/hooks/useAuth';
import staffService from '@/services/staffService';
import { useNotification } from '@/hooks/useNotification';

const MyComponent = () => {
  const { isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await staffService.getByPosition('cashier');
        setData(result.data);
        showSuccess('Loaded', 'Data fetched successfully');
      } catch (error) {
        showError('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {/* Display data */}
    </div>
  );
};
```

---

## 🔧 Environment Variables

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mini Supermarket Management
```

### Backend `.env`
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini_supermarket
JWT_SECRET=mini_supermarket_secret_key_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## 🐛 Troubleshooting

### "Connection refused" on API calls
**Solution:**
- Check backend is running: `npm start` in server directory
- Verify port 5000 is accessible
- Check firewall settings

### "CORS error"
**Solution:**
- Backend CORS must allow frontend origin
- Verify `CLIENT_URL` in server `.env` matches frontend URL
- Restart backend after changing `.env`

### Login fails silently
**Solution:**
- Check browser console for errors
- Verify test account exists in database
- Run `node server/scripts/init-data.js` to reset data

### Token not persisting
**Solution:**
- Check localStorage is not disabled
- Verify token is being saved: `localStorage.getItem('auth_token')`
- Check token expiry: `localStorage.getItem('auth_token')` (check 7-day expiry)

### "Cannot find module" errors
**Solution:**
- Ensure all service files are created in correct locations
- Run `npm install` in client directory
- Restart dev server

---

## 📊 API Response Examples

### Login Success
```javascript
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "accountId": "67f1234567890abcd",
      "username": "admin",
      "role": "admin",
      "email": "admin@example.com"
    }
  }
}
```

### Get Staff List
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "67f1234567890abcd",
      "accountId": "...",
      "position": "manager",
      "salary": 65000,
      "employmentType": "full-time",
      "joinDate": "2024-01-10",
      "isActive": true,
      "createdAt": "2024-01-10T00:00:00Z"
    },
    // ... more items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

---

## 🎯 Integration Checklist

- [x] Backend API running with 129 tests passing
- [x] Frontend dependencies installed (axios added)
- [x] API client service created
- [x] Authentication service created
- [x] AuthContext provider created
- [x] useAuth hook created
- [x] 6 module services created
- [x] SignIn component integrated with API
- [x] App.jsx wrapped with AuthProvider
- [ ] **Next Phase:** StaffListView API integration
- [ ] **Next Phase:** ProductListView API integration
- [ ] **Next Phase:** All list views API integration
- [ ] **Next Phase:** All forms CRUD integration

---

## 📚 Documentation

- **Integration Analysis**: `FRONTEND_API_INTEGRATION_ANALYSIS.md`
- **Phase 1 Complete**: `PHASE_1_INTEGRATION_COMPLETE.md`
- **Backend API Docs**: `server/API_DOCUMENTATION.md`
- **Backend Tests**: `server/tests/` directory

---

## 🤝 Team Communication

### Current Status
- ✅ Authentication system fully integrated
- ✅ All API services ready for components
- ✅ Foundation complete and tested

### Ready for Next Phase
- List views need API integration
- Forms need CRUD integration
- Dashboard needs statistics widgets
- Specialized views need implementation

### Known Limitations
- List views still use hardcoded data (to be replaced)
- Some forms still use mock submissions
- Dashboard is placeholder
- Damaged products & shelf products not yet implemented

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `FRONTEND_API_INTEGRATION_ANALYSIS.md` for detailed architecture
3. Check backend `API_DOCUMENTATION.md` for API details
4. Review test files in `server/tests/` for API usage examples

---

**Ready to start? Login with admin/admin123 and explore the dashboard!** 🚀
