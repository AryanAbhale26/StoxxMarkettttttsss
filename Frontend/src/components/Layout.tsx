import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Repeat,
  FileText,
  Warehouse,
  MapPin,
  BarChart3,
  User,
  LogOut,
  History,
} from "lucide-react";
import Logo from "../assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: TrendingDown, label: "Receipts", path: "/receipts" },
    { icon: TrendingUp, label: "Deliveries", path: "/deliveries" },
    { icon: Repeat, label: "Internal Transfers", path: "/transfers" },
    { icon: FileText, label: "Adjustments", path: "/adjustments" },
    { icon: History, label: "Move History", path: "/history" },
    { icon: Warehouse, label: "Warehouses", path: "/warehouses" },
    { icon: MapPin, label: "Location Stock", path: "/location-stock" },
    {
      icon: BarChart3,
      label: "Location Inventory",
      path: "/location-inventory",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <img src={Logo} alt="" height={100} width={50} />
            {/* <Package className="h-8 w-8 text-blue-600 mr-3" /> */}
            <h1 className="text-xl font-bold text-gray-900">StockMaster</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="border-t p-4">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
