import React, { useState } from "react";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaTags,
  FaFileAlt,
  FaBook,
  FaTruck,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaHistory,
  FaFileInvoice,
} from "react-icons/fa";
import { MdBrokenImage, MdShelves } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { PiWarehouseBold } from "react-icons/pi";

import Logo from "../ui/Logo";
import "./Sidebar.css";

const Sidebar = ({ activeItem, onItemClick, userRole = "manager" }) => {
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  if (userRole === "customer") return "";

  // Menu items based on user role
  const getMenuItemsByRole = (role) => {
    switch (role) {
      case "merchandise_supervisor":
        return [
          {
            id: "shelf-product",
            label: "Products on shelves",
            icon: <FaBox />,
            path: "/shelf-product",
          },
          {
            id: "damaged-product",
            label: "Damaged product",
            icon: <MdBrokenImage />,
            path: "/damaged-product",
          },
          {
            id: "instruction",
            label: "Instructions",
            icon: <FaBook />,
            path: "/instruction",
          },
          {
            id: "report",
            label: "Report",
            icon: <FaFileAlt />,
            hasSubmenu: true,
            path: "/report",
          },
          {
            id: "profile",
            label: "Profile",
            icon: <FaUser />,
            path: "/profile",
          },
        ];
      case "delivery_staff":
        return [
          {
            id: "assigned-orders",
            label: "Assigned Orders",
            icon: <FaClipboardList />,
            path: "/assigned-orders",
          },
          {
            id: "order-history",
            label: "Order History",
            icon: <FaHistory />,
            path: "/order-history",
          },
          {
            id: "instruction",
            label: "Instructions",
            icon: <FaBook />,
            path: "/instruction",
          },
          {
            id: "report",
            label: "Report",
            icon: <FaFileAlt />,
            hasSubmenu: true,
            path: "/report",
          },
          {
            id: "profile",
            label: "Profile",
            icon: <FaUser />,
            path: "/profile",
          },
        ];
      case "warehouse_staff":
        return [
          {
            id: "inventory",
            label: "Inventory",
            icon: <FaBox />,
            path: "/products",
          },
          {
            id: "instruction",
            label: "Instructions",
            icon: <FaBook />,
            path: "/instruction",
          },
          {
            id: "report",
            label: "Report",
            icon: <FaFileAlt />,
            hasSubmenu: true,
            path: "/report",
          },
          {
            id: "profile",
            label: "Profile",
            icon: <FaUser />,
            path: "/profile",
          },
        ];
      case "cashier":
        return [
          {
            id: "invoice",
            label: "Invoice",
            icon: <FaFileAlt />,
            path: "/invoice",
          },
          {
            id: "customer",
            label: "Customer",
            icon: <FaUserGroup />,
            path: "/customer",
          },
          {
            id: "instruction",
            label: "Instructions",
            icon: <FaBook />,
            path: "/instruction",
          },
          {
            id: "report",
            label: "Report",
            icon: <FaFileAlt />,
            hasSubmenu: true,
            path: "/report",
          },
          {
            id: "profile",
            label: "Profile",
            icon: <FaUser />,
            path: "/profile",
          },
        ];
      case "manager":
      default:
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: <FaHome />,
            path: "/dashboard",
          },
          {
            id: "staff",
            label: "Staff",
            icon: <FaUsers />,
            path: "/staff",
          },
          {
            id: "products",
            label: "Product",
            icon: <FaBox />,
            path: "/products",
          },
          {
            id: "promotion",
            label: "Promotion",
            icon: <FaTags />,
            path: "/promotion",
          },
          {
            id: "report",
            label: "Report",
            icon: <FaFileAlt />,
            hasSubmenu: true,
            path: "/report",
          },
          {
            id: "instruction",
            label: "Instruction",
            icon: <FaBook />,
            path: "/instruction",
          },
          {
            id: "supplier",
            label: "Supplier",
            icon: <FaTruck />,
            path: "/suppliers",
          },
          {
            id: "sections",
            label: "Section",
            icon: <PiWarehouseBold />,
            path: "/sections",
          },
          {
            id: "shelves",
            label: "Shelves",
            icon: <MdShelves />,
            path: "/shelves",
          },

          {
            id: "profile",
            label: "Profile",
            icon: <FaUser />,
            path: "/profile",
          },
        ];
    }
  };

  const menuItems = getMenuItemsByRole(userRole);

  // Bottom menu items - same for all roles
  const bottomMenuItems = [
    {
      id: "settings",
      label: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
    {
      id: "help",
      label: "Help center",
      icon: <FaQuestionCircle />,
      path: "/help",
    },
    {
      id: "signout",
      label: "Sign out",
      icon: <FaSignOutAlt />,
      action: "signout",
      className: "signout-item",
    },
  ];

  const handleItemClick = (item) => {
    if (item.id === "report") {
      // Navigate to report page instead of just toggling submenu
      onItemClick?.(item);
      setIsReportExpanded(!isReportExpanded);
    } else if (item.action === "signout") {
      // Handle sign out action
      onItemClick?.(item);
    } else {
      onItemClick?.(item);
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "delivery_staff":
        return "Delivery Staff";
      case "merchandise_supervisor":
        return "Merchandise Supervisor";
      case "warehouse_staff":
        return "Warehouse Staff";
      case "cashier":
        return "Cashier";
      case "manager":
      default:
        return "Manager";
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Logo size="small" />
        <div className="user-role-badge">
          <span className="role-text">{getRoleDisplayName(userRole)}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${
                  activeItem === item.id ? "active" : ""
                } ${item.hasSubmenu ? "has-submenu" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul className="nav-list">
          {bottomMenuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${item.className || ""} ${
                  activeItem === item.id ? "active" : ""
                }`}
                onClick={() => handleItemClick(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
