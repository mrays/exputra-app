// Metronic Components Library
// A modular component library based on Metronic v9.4.2 design system
// Designed to be used independently without the full Metronic folder

This library contains:
- **UI Components**: Basic building blocks (Button, Card, Alert, Badge)
- **Dashboard Components**: Pre-built dashboard sections (StatCard, RecentOrders, QuickActions, Header)

All components are built with Tailwind CSS and are fully customizable.

## Usage

```tsx
import { StatCard, Button, Card } from '@/metronic-components';

// Use in your components
export default function Dashboard() {
  return (
    <StatCard
      title="Total Orders"
      value={42}
      icon="📋"
      color="cyan"
    />
  );
}
```

## Components

### UI Components
- **Button**: Customizable button with variants
- **Card**: Container component with header, content, and footer
- **Alert**: Alert container with variants (success, warning, info, error)
- **Badge**: Badge component for status indicators

### Dashboard Components
- **DashboardHeader**: Header with greeting and description
- **StatCard**: Statistics card with icon, value, and trend
- **QuickActions**: Quick action links grid
- **RecentOrders**: Recent orders list component

## Files Structure

```
metronic-components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── alert.tsx
│   └── badge.tsx
├── dashboard/
│   ├── header.tsx
│   ├── stat-card.tsx
│   ├── quick-actions.tsx
│   └── recent-orders.tsx
└── index.ts
```

After integrating all components into your application, you can safely delete the
`metronic-v9.4.2` folder as it's no longer needed.
