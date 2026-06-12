import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/leads", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
