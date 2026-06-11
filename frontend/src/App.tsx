import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/shared/layouts/RootLayout";
import { LandingPage } from "@/features/landing/LandingPage";
import { QualificationPage } from "@/features/qualification/QualificationPage";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LeadDetailPage } from "@/features/dashboard/LeadDetailPage";
import { ThankYouPage } from "@/features/qualification/ThankYouPage";

const AnalyticsPage = lazy(() =>
  import("@/features/dashboard/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage }))
);

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Route>
      <Route path="/qualify" element={<QualificationPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<DashboardPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route
          path="analytics"
          element={
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                </div>
              }
            >
              <AnalyticsPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
