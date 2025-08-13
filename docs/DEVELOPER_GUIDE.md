# 👨‍💻 Developer Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Docker (for local development)
- IDE with TypeScript and ESLint support (VS Code recommended)

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/saas-platform.git
   cd saas-platform
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using Yarn
   yarn
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start frontend
   npm run dev
   
   # In a new terminal, start backend
   npm run dev:server
   ```

## 🏗 Project Structure

```
saas-platform/
├── .github/               # GitHub workflows and templates
├── public/                # Static files
├── src/
│   ├── api/               # API clients and services
│   ├── assets/            # Static assets (images, fonts, etc.)
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common components (buttons, inputs, etc.)
│   │   ├── layout/        # Layout components
│   │   └── modules/       # Feature-specific components
│   ├── config/            # Application configuration
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── routes/            # Application routes
│   ├── services/          # Business logic and API services
│   ├── store/             # State management
│   ├── styles/            # Global styles and themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── tests/                 # Test files
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🛠 Development Workflow

### Branch Naming
Use the following prefixes for branch names:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test updates
- `chore/` - Maintenance tasks

Example: `feat/user-authentication`

### Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example:
```
feat(auth): add Google OAuth login

- Implement Google OAuth 2.0 authentication
- Add user session management
- Update login page with OAuth button

Closes #123
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with clear, atomic commits
3. Push your branch and create a PR
4. Request reviews from at least one team member
5. Address all CI checks and code review feedback
6. Squash and merge when approved

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests in watch mode
npm run test:unit

# Run component tests
npm run test:components

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Testing Guidelines
- Write tests for all new features and bug fixes
- Follow the Testing Library best practices
- Mock external dependencies
- Test user interactions, not implementation details
- Aim for >80% test coverage

## 🎨 Styling

### CSS-in-JS with Styled Components
```typescript
import styled from 'styled-components';

const Button = styled.button`
  background: ${({ primary }) => (primary ? '#007bff' : '#6c757d')};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

### Utility-First with Tailwind CSS
```jsx
function Button({ children, primary, disabled }) {
  const baseClasses = 'px-4 py-2 rounded cursor-pointer';
  const variantClasses = primary 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-gray-500 hover:bg-gray-600 text-white';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## 📦 State Management

### Local State (useState/useReducer)
```typescript
// For simple state
const [count, setCount] = useState(0);

// For complex state logic
const [state, dispatch] = useReducer(reducer, initialState);
```

### Global State (Redux Toolkit)
```typescript
// store/slices/counterSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1 },
    decrement: state => { state.value -= 1 },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;

// Component
import { useDispatch, useSelector } from 'react-redux';
import { increment } from '../store/slices/counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

### Server State (React Query)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{user.name}</div>;
}

// Mutate data
function UpdateProfile() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return (
    <button
      onClick={() => {
        mutation.mutate({ id: 1, name: 'New Name' });
      }}
    >
      Update Name
    </button>
  );
}
```

## 🔌 API Integration

### API Client Setup
```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Service Example
```typescript
// src/services/userService.ts
import apiClient from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
  
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
  
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await apiClient.post<User>('/users', user);
    return response.data;
  },
  
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, user);
    return response.data;
  },
  
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
```

## 🔒 Authentication

### Auth Context
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ user: User }>(token);
        setUser(decoded.user);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Protected Route
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Reports = React.lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization
```typescript
// Memoize expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Virtualization
```typescript
import { FixedSizeList as List } from 'react-window';

function BigList({ data }) {
  return (
    <List
      height={400}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          Row {index}: {data[index]}
        </div>
      )}
    </List>
  );
}
```

## 🔍 Debugging

### React DevTools
- Inspect component hierarchy
- View and edit props and state
- Profile component performance

### Redux DevTools
- Track state changes
- Time travel debugging
- Action replay

### Debugging in VS Code
1. Install the [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension
2. Add this configuration to `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "chrome",
         "request": "launch",
         "name": "Launch Chrome against localhost",
         "url": "http://localhost:3000",
         "webRoot": "${workspaceFolder}"
       }
     ]
   }
   ```
3. Set breakpoints in your code
4. Press F5 to start debugging

## 📝 Documentation

### Component Documentation
Use Storybook for component documentation and development:

```bash
# Start Storybook
npm run storybook
```

Example story:
```typescript
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};
```

## 🤝 Code Review Guidelines

### What to Look For
- **Functionality**: Does the code work as intended?
- **Readability**: Is the code easy to understand?
- **Performance**: Are there any performance issues?
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are there sufficient tests?
- **Documentation**: Is the code well-documented?

### Review Etiquette
- Be constructive and respectful
- Explain why changes are needed
- Suggest improvements, not just point out issues
- Acknowledge good code too
- Respond to feedback with an open mind

## 🚀 Deployment

### Environment Variables
Create a `.env.production` file with production-specific variables:
```
VITE_API_BASE_URL=https://api.production.example.com
VITE_SENTRY_DSN=your-sentry-dsn
NODE_ENV=production
```

### Building for Production
```bash
# Build the application
npm run build

# The build output will be in the 'dist' directory
```

### Docker Production Build
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD Pipeline
Example GitHub Actions workflow:
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
```

## 📚 Learning Resources

### React
- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Patterns](https://reactpatterns.com/)

### State Management
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query/latest)

### Testing
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Mock Service Worker](https://mswjs.io/)

### Performance
- [React.memo](https://reactjs.org/docs/react-api.html#reactmemo)
- [useMemo & useCallback](https://reactjs.org/docs/hooks-reference.html#usememo)
- [React Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)

## 🆘 Getting Help

- **Documentation**: Check the [documentation](#) for detailed guides
- **Issues**: Search for existing issues or open a new one
- **Discussions**: Join the conversation in our [community forum](#)
- **Support**: Email support@example.com for direct assistance

## 🙏 Acknowledgments

- [Create React App](https://create-react-app.dev/) for the project setup
- [Vite](https://vitejs.dev/) for the fast development experience
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React Query](https://tanstack.com/query) for data fetching and caching
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Storybook](https://storybook.js.org/) for component development
- [Playwright](https://playwright.dev/) for end-to-end testing
