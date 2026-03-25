import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./client/pages/Login/Login";
import Dashboard from "./client/pages/Dashboard/Dashboard";
import CustomerLayout from "./client/pages/CustomerLayout/CustomerLayout";
import CustomerOverview from "./client/pages/CustomerLayout/screens/CustomerOverview/CustomerOverview";
import AccountScreen from "./client/pages/CustomerLayout/screens/AccountScreen/AccountScreen";
import TransferScreen from "./client/pages/CustomerLayout/screens/TransferScreen/TransferScreen";

import AdminLayout from "./admin/pages/AdminLayout/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CustomerOverview />} />
          <Route path="accounts" element={<AccountScreen />} />
          <Route path="transfer" element={<TransferScreen />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<div style={{padding: 32}}><h2>Admin Users</h2><p>Coming soon...</p></div>} />
          <Route path="settings" element={<div style={{padding: 32}}><h2>Admin Settings</h2><p>Coming soon...</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
