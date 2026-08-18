import type { Metadata } from "next";
import { AdminView } from "@/components/admin/admin-view";

export const metadata: Metadata = {
  title: "Admin | MIGR8 AI",
};

export default function AdminPage() {
  return <AdminView />;
}
