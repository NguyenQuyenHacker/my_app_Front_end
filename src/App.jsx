import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import CustomerLayout from "./pages/CustomerLayout/CustomerLayout";
import CustomerOverview from "./pages/CustomerLayout/screens/CustomerOverview/CustomerOverview";
import AccountScreen from "./pages/CustomerLayout/screens/AccountScreen/AccountScreen";
// import TransactionScreen from "./pages/CustomerLayout/screens/TransactionScreen/TransactionScreen";
// import LoanScreen from "./pages/CustomerLayout/screens/LoanScreen/LoanScreen";

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
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="transactions" element={<TransactionScreen />} /> */}
          {/* <Route path="loans" element={<LoanScreen />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;