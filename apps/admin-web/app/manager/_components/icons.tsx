import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Banknote,
  Bell,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleDollarSign,
  Grid3X3,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Package,
  Pencil,
  Percent,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  Wine,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconName =
  | "alert" | "arrow-down" | "arrow-up" | "bell" | "bottle" | "box" | "calendar" | "cart" | "cash"
  | "chart" | "check" | "chevron" | "close" | "cube" | "dashboard" | "dollar" | "grid" | "home"
  | "info" | "logout" | "menu" | "minus" | "money" | "pencil" | "percent" | "plus" | "receipt"
  | "search" | "settings" | "store" | "trash" | "trending" | "truck" | "users";

const iconMap: Record<IconName, LucideIcon> = {
  alert: AlertTriangle,
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  bell: Bell,
  bottle: Wine,
  box: Package,
  calendar: CalendarDays,
  cart: ShoppingCart,
  cash: WalletCards,
  chart: ChartNoAxesCombined,
  check: Check,
  chevron: ChevronDown,
  close: X,
  cube: Boxes,
  dashboard: LayoutDashboard,
  dollar: CircleDollarSign,
  grid: Grid3X3,
  home: Home,
  info: Info,
  logout: LogOut,
  menu: Menu,
  minus: Minus,
  money: Banknote,
  pencil: Pencil,
  percent: Percent,
  plus: Plus,
  receipt: ReceiptText,
  search: Search,
  settings: Settings,
  store: Store,
  trash: Trash2,
  trending: TrendingUp,
  truck: Truck,
  users: Users
};

export function Icon({ name }: { readonly name: IconName }) {
  const Lucide = iconMap[name];
  return <Lucide aria-hidden="true" strokeWidth={1.9} />;
}
