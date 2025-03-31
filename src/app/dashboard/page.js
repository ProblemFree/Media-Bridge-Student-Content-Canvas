import DashboardClient from "./dashboardClient";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}