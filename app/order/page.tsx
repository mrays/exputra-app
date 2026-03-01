'use client';

import { Suspense, lazy, useMemo } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import Stepper from '@/components/Stepper';

// Lazy load step components for better initial load performance
const DomainStep = lazy(() => import('@/components/DomainStep'));
const TemplateStep = lazy(() => import('@/components/TemplateStep'));
const ProfileStep = lazy(() => import('@/components/ProfileStep'));
const PackageStep = lazy(() => import('@/components/PackageStep'));

// Loading skeleton for step components
function StepSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

export default function OrderPage() {
  const currentStep = useOrderStore((state) => state.currentStep);

  // Memoize step component to prevent unnecessary re-renders
  const StepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return DomainStep;
      case 2:
        return TemplateStep;
      case 3:
        return ProfileStep;
      case 4:
        return PackageStep;
      default:
        return DomainStep;
    }
  }, [currentStep]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <Stepper />
        <div className="flex-1">
          <Suspense fallback={<StepSkeleton />}>
            <StepComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
