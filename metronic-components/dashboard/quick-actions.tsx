import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface QuickActionProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  color?: 'cyan' | 'green' | 'blue' | 'red' | 'yellow';
  count?: number;
}

interface QuickActionsProps {
  actions: QuickActionProps[];
}

const colorMap = {
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Akses Cepat</CardTitle>
        <CardDescription>Navigasi ke fitur utama</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition-colors ${colorMap[action.color || 'cyan']}`}
            >
              <div className="text-2xl">{action.icon}</div>
              <p className="mt-2 text-xs font-semibold text-center">{action.label}</p>
              {action.count !== undefined && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {action.count}
                </Badge>
              )}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
