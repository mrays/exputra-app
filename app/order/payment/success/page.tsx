import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}