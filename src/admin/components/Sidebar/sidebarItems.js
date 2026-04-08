import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CreditCard, 
  ArrowRightLeft, 
  Settings, 
  FileText,
  Wrench,
  ShieldAlert
} from "lucide-react";

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
  {
    type: "link",
    key: "accounts",
    to: "/admin/accounts/list",
    icon: Wallet,
    label: "Tài khoản",
  },
  {
    type: "link",
    key: "cards",
    to: "/admin/cards",
    icon: CreditCard,
    label: "Thẻ",
  },
  {
    type: "link",
    key: "transactions",
    to: "/admin/transactions",
    icon: ArrowRightLeft,
    label: "Giao dịch",
  },
  {
    type: "link",
    key: "tool-hub",
    to: "/admin/tool-hub",
    icon: Wrench,
    label: "Tool Hub",
  },
  {
    type: "link",
    key: "guardrails",
    to: "/admin/guardrails",
    icon: ShieldAlert,
    label: "Guardrails",
  },
];

export const bottomItems = [
  {
    type: "link",
    key: "settings",
    to: "/admin/settings",
    icon: Settings,
    label: "Cài đặt",
  },
];