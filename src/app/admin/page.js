import AdminClient from "./adminClient";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}