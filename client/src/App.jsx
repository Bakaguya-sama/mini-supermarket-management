import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./views/auth/SignIn";
import SignUp from "./views/auth/SignUp";
import ForgetPass from "./views/auth/ForgetPass";
import Layout from "./components/layout/Layout";
import Dashboard from "./views/dashboard/Dashboard";
import StaffListView from "./views/manager/staff-management/StaffListView";
import AddStaffView from "./views/manager/staff-management/AddStaffView";
import EditStaffView from "./views/manager/staff-management/EditStaffView";
import ProductListView from "./views/manager/product-management/ProductListView";
import AddProductView from "./views/manager/product-management/AddProductView";
import EditProductView from "./views/manager/product-management/EditProductView";
import SupplierListView from "./views/manager/supplier-management/SupplierListView";
import AddSupplierView from "./views/manager/supplier-management/AddSupplierView";
import EditSupplierView from "./views/manager/supplier-management/EditSupplierView";
import PlaceOrderView from "./views/manager/supplier-management/PlaceOrderView";
import AssignedOrdersView from "./views/delivery-staff/assigned-orders/AssignedOrdersView";
import AssignedOrderDetail from "./views/delivery-staff/assigned-orders/AssignedOrderDetail";
import OrderHistoryView from "./views/delivery-staff/order-history/OrderHistoryView";
import OrderHistoryDetail from "./views/delivery-staff/order-history/OrderHistoryDetail";
import DamagedProduct from "./views/merchandise-supervisor/damaged-products/DamagedProduct";
import "./App.css";
import ShelfProduct from "./views/merchandise-supervisor/products-on-shelves/ShelfProduct";
import CustomerListView from "./views/cashier/customer-management/CustomerListView";
import AddCustomerView from "./views/cashier/customer-management/AddCustomerView";
import EditCustomerView from "./views/cashier/customer-management/EditCustomerView";
import InvoiceListView from "./views/cashier/invoice-management/InvoiceListView";
import InvoiceDetail from "./views/cashier/invoice-management/InvoiceDetail";
import PromotionSelection from "./views/cashier/invoice-management/PromotionSelection";
import RecordDamagedProduct from "./views/merchandise-supervisor/damaged-products/RecordDamagedProduct";
import AddShelfProduct from "./views/merchandise-supervisor/products-on-shelves/AddShelfProduct";
import EditDamagedProduct from "./views/merchandise-supervisor/damaged-products/EditDamagedProduct";
import EditShelfProduct from "./views/merchandise-supervisor/products-on-shelves/EditShelfProduct";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPass />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/help"
            element={
              <Layout>
                <h1>Help center</h1>
              </Layout>
            }
          />

          <Route
            path="/settings"
            element={
              <Layout>
                <h1>Settings</h1>
              </Layout>
            }
          />

          <Route
            path="/promotion"
            element={
              <Layout>
                <h1>Promotion</h1>
              </Layout>
            }
          />

          <Route
            path="/profile"
            element={
              <Layout>
                <h1>Profile</h1>
              </Layout>
            }
          />

          <Route
            path="/report"
            element={
              <Layout>
                <h1>Report</h1>
              </Layout>
            }
          />

          <Route
            path="/instruction"
            element={
              <Layout>
                <h1>Instruction</h1>
              </Layout>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/staff"
            element={
              <Layout>
                <StaffListView />
              </Layout>
            }
          />

          <Route
            path="/staff/add"
            element={
              <Layout>
                <div>
                  <AddStaffView />
                </div>
              </Layout>
            }
          />

          <Route
            path="/staff/edit/:id"
            element={
              <Layout>
                <div>
                  <EditStaffView />
                </div>
              </Layout>
            }
          />

          {/* Product Management Routes */}
          <Route
            path="/products"
            element={
              <Layout>
                <ProductListView />
              </Layout>
            }
          />

          <Route
            path="/products/add"
            element={
              <Layout>
                <AddProductView />
              </Layout>
            }
          />

          <Route
            path="/products/edit/:id"
            element={
              <Layout>
                <EditProductView />
              </Layout>
            }
          />

          {/* Supplier Management  */}
          <Route
            path="/supplier"
            element={
              <Layout>
                <SupplierListView />
              </Layout>
            }
          />

          <Route
            path="/supplier/add"
            element={
              <Layout>
                <AddSupplierView />
              </Layout>
            }
          />

          <Route
            path="/supplier/edit/:id"
            element={
              <Layout>
                <EditSupplierView />
              </Layout>
            }
          />

          <Route
            path="/supplier/place-order/:id"
            element={
              <Layout>
                <PlaceOrderView />
              </Layout>
            }
          />

          {/* Delivery staff */}
          {/* Assigned orders */}
          <Route
            path="/assigned-orders"
            element={
              <Layout>
                <AssignedOrdersView />
              </Layout>
            }
          />

          <Route
            path="/assigned-orders/:id"
            element={
              <Layout>
                <AssignedOrderDetail />
              </Layout>
            }
          />

          <Route
            path="/order-history"
            element={
              <Layout>
                <OrderHistoryView />
              </Layout>
            }
          />

          <Route
            path="/order-history/:id"
            element={
              <Layout>
                <OrderHistoryDetail />
              </Layout>
            }
          />

          {/* Merchandise supervisor */}
          {/* Damaged product */}
          <Route
            path="/damaged-product"
            element={
              <Layout>
                <DamagedProduct />
              </Layout>
            }
          />

          <Route
            path="/damaged-product/record"
            element={
              <Layout>
                <RecordDamagedProduct />
              </Layout>
            }
          />

          <Route
            path="/damaged-product/edit/:id"
            element={
              <Layout>
                <EditDamagedProduct />
              </Layout>
            }
          />

          <Route
            path="/shelf-product"
            element={
              <Layout>
                <ShelfProduct />
              </Layout>
            }
          />

          <Route
            path="/shelf-product/add"
            element={
              <Layout>
                <AddShelfProduct />
              </Layout>
            }
          />

          <Route
            path="/shelf-product/edit/:combinedId"
            element={
              <Layout>
                <EditShelfProduct />
              </Layout>
            }
          />

          {/* Cashier */}
          {/* Customer list view */}
          <Route
            path="/customer"
            element={
              <Layout>
                <CustomerListView />
              </Layout>
            }
          />

          <Route
            path="/customer/add"
            element={
              <Layout>
                <AddCustomerView />
              </Layout>
            }
          />

          <Route
            path="/customer/edit/:id"
            element={
              <Layout>
                <EditCustomerView />
              </Layout>
            }
          />

          <Route
            path="/invoice"
            element={
              <Layout>
                <InvoiceListView />
              </Layout>
            }
          />

          <Route
            path="/invoice/detail/:id"
            element={
              <Layout>
                <InvoiceDetail />
              </Layout>
            }
          />

          <Route
            path="/promotion-selection"
            element={
              <Layout>
                <PromotionSelection />
              </Layout>
            }
          />

          {/* Redirect root to signin */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
