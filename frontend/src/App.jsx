import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import EMICalculator from './pages/EMICalculator'
import AddLoan from './pages/AddLoan'
import MyLoans from './pages/MyLoans'
import LoanDetails from './pages/LoanDetails'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import AIAssistant from './pages/AIAssistant'
import GovernmentSchemes from './pages/GovernmentSchemes'
import Prepayment from './pages/Prepayment'
import LoanComparison from './pages/LoanComparison'
import Notifications from './pages/Notifications'

import ProtectedRoute from './components/Common/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION ROUTES
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =========================
            PUBLIC EMI CALCULATOR
        ========================== */}

        <Route
          path="/emi-calculator"
          element={<EMICalculator />}
        />


        {/* =========================
            PROTECTED APPLICATION
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/add-loan"
              element={<AddLoan />}
            />

            <Route
              path="/my-loans"
              element={<MyLoans />}
            />

            <Route
              path="/loan/:loanId"
              element={<LoanDetails />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/ai-assistant"
              element={<AIAssistant />}
            />

            <Route
              path="/government-schemes"
              element={<GovernmentSchemes />}
            />

            <Route
              path="/prepayment"
              element={<Prepayment />}
            />

            <Route
              path="/loan-comparison"
              element={<LoanComparison />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

          </Route>

        </Route>


        {/* =========================
            DEFAULT ROUTE
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================
            UNKNOWN ROUTES
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App