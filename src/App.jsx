import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./client/pages/Login/Login";
import CustomerLayout from "./client/pages/CustomerLayout/CustomerLayout";
import CustomerOverview from "./client/pages/CustomerLayout/screens/CustomerOverview/CustomerOverview";
import AccountScreen from "./client/pages/CustomerLayout/screens/AccountScreen/AccountScreen";
import TransferScreen from "./client/pages/CustomerLayout/screens/TransferScreen/TransferScreen";

import AdminLayout from "./admin/pages/AdminLayout/AdminLayout";
import AdminOverview from "./admin/pages/AdminOverview/AdminOverview";
import AdminUsers from "./admin/pages/AdminUsers/AdminUsers";
import AdminCustomers from "./admin/pages/AdminCustomers/AdminCustomers";
import AdminAccounts from "./admin/pages/AdminAccounts/AdminAccounts";
import AdminCards from "./admin/pages/AdminCards/AdminCards";
import AdminTransactions from "./admin/pages/AdminTransactions/AdminTransactions";
import AdminLogin from "./admin/pages/AdminLogin/AdminLogin";

// Knowledge Base Module
import KnowledgeBaseListPage from "./admin/pages/AdminKnowledgeBase/KnowledgeBaseListPage";
import KnowledgeBaseDetailLayout from "./admin/pages/AdminKnowledgeBase/KnowledgeBaseDetail/KnowledgeBaseDetailLayout";
import DatasetTab from "./admin/pages/AdminKnowledgeBase/KnowledgeBaseDetail/tabs/DatasetTab";
import ConfigurationTab from "./admin/pages/AdminKnowledgeBase/KnowledgeBaseDetail/tabs/ConfigurationTab";

import AdminProtectedRoute from "./admin/router/AdminProtectedRoute";   
import AdminPublicRoute from "./admin/router/AdminPublicRoute";
import ClientProtectedRoute from "./client/router/ClientProtectedRoute";
import ClientPublicRoute from "./client/router/ClientPublicRoute";

import { AdminProvider } from "./admin/context/AdminContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<ClientPublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ClientProtectedRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CustomerOverview />} />
            <Route path="accounts" element={<AccountScreen />} />
            <Route path="transfer" element={<TransferScreen />} />
          </Route>
        </Route>

        <Route element={<AdminProvider />}>
          <Route element={<AdminPublicRoute />}>
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="overviews" replace />} />
              <Route path="overviews" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="customers" element={<AdminUsers />} />
              <Route path="accounts/list" element={<AdminAccounts />} />
              <Route path="accounts/pending" element={<AdminAccounts />} />
              <Route path="cards" element={<AdminCards />} />
              <Route path="transactions" element={<AdminTransactions />} />

              {/* Knowledge Base Module */}
              <Route path="knowledge-bases" element={<KnowledgeBaseListPage />} />
              <Route path="knowledge-bases/:kbId" element={<KnowledgeBaseDetailLayout />}>
                <Route index element={<Navigate to="documents" replace />} />
                <Route path="documents" element={<DatasetTab />} />
                <Route path="configuration" element={<ConfigurationTab />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;