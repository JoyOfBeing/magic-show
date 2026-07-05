'use client';

import { AuthProvider } from './AuthProvider';
import SparkleTrail from './SparkleTrail';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <SparkleTrail />
      {children}
    </AuthProvider>
  );
}
