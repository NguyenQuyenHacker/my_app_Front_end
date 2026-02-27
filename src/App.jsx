import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import CustomerLayout from "./pages/CustomerLayout/CustomerLayout";
import CustomerOverview from "./pages/CustomerLayout/screens/CustomerOverview/CustomerOverview";
import AccountScreen from "./pages/CustomerLayout/screens/AccountScreen/AccountScreen";
import TransferScreen from "./pages/CustomerLayout/screens/TransferScreen/TransferScreen";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;