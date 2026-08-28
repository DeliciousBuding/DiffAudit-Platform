/**
 * SPA route tree (React Router v7, library mode).
 *
 * Mirrors the legacy Next app router structure. Page modules are migrated
 * in place under `@/app/**` (the directory is kept as the route-group home;
 * the Next-specific semantics no longer apply).
 */

import { createBrowserRouter } from "react-router";

import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import AuthLayout from "@/app/(auth)/layout";
import DocsPage from "@/app/(marketing)/docs/page";
import DocsSlugPage from "@/app/(marketing)/docs/[...slug]/page";
import HomePage from "@/app/(marketing)/page";
import TrialPage from "@/app/(marketing)/trial/page";
import NotFound from "@/app/not-found";
import WorkspaceRootPage from "@/app/(workspace)/workspace/page";
import WorkspaceLayout from "@/app/(workspace)/workspace/layout";
import WorkspaceStartPage from "@/app/(workspace)/workspace/start/page";
import WorkspaceAuditsPage from "@/app/(workspace)/workspace/audits/page";
import WorkspaceAuditNewPage from "@/app/(workspace)/workspace/audits/new/page";
import WorkspaceAuditDetailPage from "@/app/(workspace)/workspace/audits/[jobId]/page";
import WorkspaceModelAssetsPage from "@/app/(workspace)/workspace/model-assets/page";
import WorkspaceReportsPage from "@/app/(workspace)/workspace/reports/page";
import WorkspaceReportTrackPage from "@/app/(workspace)/workspace/reports/[track]/page";
import WorkspaceRiskFindingsPage from "@/app/(workspace)/workspace/risk-findings/page";
import WorkspaceSettingsPage from "@/app/(workspace)/workspace/settings/page";
import WorkspaceAccountPage from "@/app/(workspace)/workspace/account/page";
import WorkspaceApiKeysPage from "@/app/(workspace)/workspace/api-keys/page";
import { WorkspaceRouteGuard } from "@/components/route-guard";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/docs", element: <DocsPage /> },
  { path: "/docs/*", element: <DocsSlugPage /> },
  { path: "/trial", element: <TrialPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <WorkspaceRouteGuard />,
    children: [
      {
        element: <WorkspaceLayout />,
        children: [
          { path: "/workspace", element: <WorkspaceRootPage /> },
          { path: "/workspace/start", element: <WorkspaceStartPage /> },
          { path: "/workspace/audits", element: <WorkspaceAuditsPage /> },
          { path: "/workspace/audits/new", element: <WorkspaceAuditNewPage /> },
          { path: "/workspace/audits/:jobId", element: <WorkspaceAuditDetailPage /> },
          { path: "/workspace/model-assets", element: <WorkspaceModelAssetsPage /> },
          { path: "/workspace/reports", element: <WorkspaceReportsPage /> },
          { path: "/workspace/reports/:track", element: <WorkspaceReportTrackPage /> },
          { path: "/workspace/risk-findings", element: <WorkspaceRiskFindingsPage /> },
          { path: "/workspace/settings", element: <WorkspaceSettingsPage /> },
          { path: "/workspace/account", element: <WorkspaceAccountPage /> },
          { path: "/workspace/api-keys", element: <WorkspaceApiKeysPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
