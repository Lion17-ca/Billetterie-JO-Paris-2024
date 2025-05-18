import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import { UserRoute, EmployeeRoute, AdminRoute, AuthRoute } from './components/ProtectedRoutes';

// Pages - Utilisateurs
import Home from './pages/Home';
import OffersList from './pages/OffersList';
import Register from './pages/Register';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import MFASetup from './pages/MFASetup';

// Pages - Employés
import EmployeeDashboard from './pages/EmployeeDashboard';
import TicketScanner from './pages/TicketScanner';
import ValidationHistory from './pages/ValidationHistory';

// Pages - Administrateurs
import AdminDashboard from './pages/AdminDashboard';
import ManageOffers from './pages/ManageOffers';
import SalesReports from './pages/SalesReports';

// Pages - Légales et RGPD
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletionRequest from './pages/DataDeletionRequest';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navigation />
        <CookieConsent />
        <main className="flex-grow-1">
          <Routes>
            {/* Routes utilisateurs */}
            <Route path="/" element={<UserRoute><Home /></UserRoute>} />
            <Route path="/offers" element={<UserRoute><OffersList /></UserRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<AuthRoute><UserProfile /></AuthRoute>} />
            <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
            <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
            <Route path="/my-tickets" element={<UserRoute><MyTickets /></UserRoute>} />
            <Route path="/mfa-setup" element={<MFASetup />} />
            
            {/* Routes employés */}
            <Route path="/employee-dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
            <Route path="/ticket-scanner" element={<EmployeeRoute><TicketScanner /></EmployeeRoute>} />
            <Route path="/validation-history" element={<EmployeeRoute><ValidationHistory /></EmployeeRoute>} />
            
            {/* Routes administrateurs */}
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/manage-offers" element={<AdminRoute><ManageOffers /></AdminRoute>} />
            <Route path="/sales-reports" element={<AdminRoute><SalesReports /></AdminRoute>} />
            <Route path="/sales-reports/:eventId" element={<AdminRoute><SalesReports /></AdminRoute>} />
            
            {/* Routes légales et RGPD */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/data-deletion-request" element={<DataDeletionRequest />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
