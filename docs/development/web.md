# Web Development Guide

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md) | [← Backend](backend.md)

Complete guide for developing the Next.js web application for NxLoy.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Page Structure (App Router)](#page-structure-app-router)
6. [Data Fetching](#data-fetching)
7. [State Management](#state-management)
8. [Component Patterns](#component-patterns)
9. [Styling](#styling)

---

## Overview

The NxLoy web application is built with **Next.js 15** using the App Router, providing:

- Server-side rendering (SSR) for fast initial page loads
- Static site generation (SSG) for marketing pages
- Server Components for efficient data fetching
- Client Components for interactivity
- Built-in optimization for images, fonts, and scripts

**Current Status**: ✅ Complete - fully functional and ready to use

---

## Technology Stack

### Next.js 15.x

**Why Next.js 15?**
- **App Router**: React Server Components by default
- **Server-side rendering**: Fast initial page loads, better SEO
- **Static site generation**: Pre-render pages at build time
- **API routes**: Backend API calls without CORS issues
- **Image optimization**: Automatic image resizing and lazy loading

**Key Features**:
- Nested layouts and loading states
- Streaming and Suspense support
- Built-in route handlers
- Middleware for authentication

### React 19.x

**Modern React Features**:
- Component-based architecture
- React Hooks (useState, useEffect, useContext, etc.)
- Context API for global state
- React Server Components (default in App Router)

### Tailwind CSS 3.x

**Utility-First Styling**:
- Rapid UI development with utility classes
- Responsive design built-in
- Dark mode support
- Custom design system via config

### State Management

**Multiple Approaches**:
- **React Context**: Simple global state (theme, auth user)
- **TanStack Query**: Server state management (API data, caching)
- **Zustand** (if needed): Complex client state

### Forms

**React Hook Form + Zod**:
- Type-safe form validation
- Performance optimized (minimal re-renders)
- Schema-based validation with Zod

---

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Auth pages (grouped route)
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx     # Auth layout
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── layout.tsx     # Dashboard shell
│   │   │   ├── customers/
│   │   │   ├── loyalty/
│   │   │   └── rewards/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── api/               # API routes (if needed)
│   ├── components/            # Reusable components
│   │   ├── ui/               # Generic UI (Button, Input, Card)
│   │   ├── forms/            # Form components
│   │   ├── layouts/          # Layout components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # API client
│   │   ├── auth.ts           # Auth helpers
│   │   └── validation.ts     # Zod schemas
│   ├── hooks/                # Custom React hooks
│   └── styles/               # Global styles
│       └── globals.css
├── public/                   # Static assets
│   ├── images/
│   └── favicon.ico
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── project.json              # Nx configuration
```

---

## Development Workflow

### Start Development Server

```bash
nx serve web

# App available at: http://localhost:8081
```

### Development Commands

```bash
# Build for production
nx build web

# Run tests
nx test web

# Run E2E tests
nx e2e web-e2e

# Lint code
nx lint web --fix

# Type check
nx run web:typecheck
```

---

## Page Structure (App Router)

### Server Components (Default)

Server Components render on the server and send HTML to the client:

```typescript
// app/customers/page.tsx
async function CustomersPage() {
  // Fetch data on server
  const customers = await fetch('http://localhost:8080/api/customers');

  return (
    <div>
      <h1>Customers</h1>
      <CustomerList customers={customers} />
    </div>
  );
}

export default CustomersPage;
```

**Benefits**:
- Fast initial page load
- No JavaScript sent to client for non-interactive parts
- Direct database access (if needed)
- Reduced bundle size

### Client Components (Interactive)

Use `'use client'` directive for interactive components:

```typescript
// components/forms/CustomerForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CustomerForm() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    router.push('/customers');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Layouts

**Root Layout** (`app/layout.tsx`):
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**Nested Layout** (`app/(dashboard)/layout.tsx`):
```typescript
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Data Fetching

### Server Components (Fetch on Server)

```typescript
// app/loyalty/programs/page.tsx
async function LoyaltyProgramsPage() {
  // Fetches on server, no loading state needed
  const programs = await fetch('http://localhost:8080/api/loyalty/programs', {
    cache: 'no-store' // Always fresh data
  }).then(res => res.json());

  return (
    <div>
      {programs.map(program => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
}
```

### Client Components (TanStack Query)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function CustomerList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading customers</div>;

  return (
    <div>
      {data.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
```

### Loading States

```typescript
// app/customers/loading.tsx
export default function Loading() {
  return <div>Loading customers...</div>;
}
```

### Error Handling

```typescript
// app/customers/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## State Management

### React Context (Simple State)

**Create Context**:
```typescript
// lib/auth-context.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Use in Components**:
```typescript
'use client';

import { useAuth } from '@/lib/auth-context';

export function UserProfile() {
  const { user } = useAuth();
  return <div>Welcome, {user?.email}</div>;
}
```

### TanStack Query (Server State)

**Setup**:
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Use in Root Layout**:
```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Component Patterns

### Reusable UI Components

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded font-semibold transition';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Form Components with Validation

```typescript
// components/forms/CreateCustomerForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required')
});

type FormData = z.infer<typeof schema>;

export function CreateCustomerForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  async function onSubmit(data: FormData) {
    await fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('firstName')} placeholder="First Name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register('lastName')} placeholder="Last Name" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <button type="submit">Create Customer</button>
    </form>
  );
}
```

---

## Styling

### Tailwind CSS Utility Classes

```typescript
// Example: Responsive card component
export function CustomerCard({ customer }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {customer.firstName} {customer.lastName}
      </h3>
      <p className="text-gray-600">{customer.email}</p>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <span className="text-sm text-gray-500">Tier</span>
          <p className="font-semibold">{customer.tier}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Points</span>
          <p className="font-semibold">{customer.points}</p>
        </div>
      </div>
    </div>
  );
}
```

### Custom Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
};
```

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Mobile Development](mobile.md) - Cross-platform considerations
- [Backend API](backend.md) - API integration
- [Code Standards](../contributing/code-standards.md)

---

**Navigation**:
- [← Back to main README](../../README.md)
- [← Previous: Backend](backend.md)
- [Next: Mobile Development →](mobile.md)
