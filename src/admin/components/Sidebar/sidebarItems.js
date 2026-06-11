import { LayoutDashboard, Users, FileText } from "lucide-react";

export const sidebarItems = [
  {
    type: "link",
    key: "overview",
    to: "/admin/overviews",
    icon: LayoutDashboard,
    label: "Tổng quan",
  },
  {
    type: "link",
    key: "knowledge-bases",
    to: "/admin/knowledge-bases",
    icon: FileText,
    label: "Knowledge Bases",
  },
  {
    type: "link",
    key: "customers",
    to: "/admin/customers",
    icon: Users,
    label: "Khách hàng",
  },
];

export const bottomItems = [];
