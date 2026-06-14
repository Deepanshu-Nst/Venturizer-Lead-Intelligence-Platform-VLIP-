import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/shared/layouts/RootLayout";
import { LandingPage } from "@/features/landing/LandingPage";
import { QualificationPage } from "@/features/qualification/QualificationPage";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";

import { LeadDetailPage } from "@/features/dashboard/LeadDetailPage";
import { ThankYouPage } from "@/features/qualification/ThankYouPage";
import { ChatbotProvider } from "@/features/chatbot/ChatbotContext";
import { ChatbotLauncher } from "@/features/chatbot/ChatbotLauncher";
import { ChatbotPanel } from "@/features/chatbot/ChatbotPanel";
import { AdminGate } from "@/features/auth/AdminGate";

const AnalyticsPage = lazy(() =>
  import("@/features/dashboard/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage }))
);
const LeadsPage = lazy(() =>
  import("@/features/dashboard/LeadsPage").then((m) => ({ default: m.LeadsPage }))
);

export default function App() {
  return (
    <ChatbotProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
        </Route>
        <Route path="/qualify" element={<QualificationPage />} />
        <Route
          path="/dashboard"
          element={
            <AdminGate>
              <DashboardLayout />
            </AdminGate>
          }
        >
          <Route index element={<Navigate to="leads" replace />} />
          <Route path="leads" element={
            <Suspense fallback={<div />}>
              <LeadsPage />
            </Suspense>
          } />
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

      {/* Global chatbot — rendered outside routes to persist across navigation */}
      <ChatbotLauncher />
      <ChatbotPanel />
    </ChatbotProvider>
  );
}
