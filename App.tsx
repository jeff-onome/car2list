
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarProvider } from './context/CarContext';
import { UserDataProvider } from './context/UserDataContext';
import { SiteConfigProvider } from './context/SiteConfigContext';

// Landing Pages
import Home from './landing/pages/Home';
import Inventory from './landing/pages/Inventory';
import CarDetail from './landing/pages/CarDetail';
import About from './landing/pages/About';
import FAQ from './landing/pages/FAQ';
import Contact from './landing/pages/Contact';
import Financing from './landing/pages/Financing';
import PrivacyPolicy from './landing/pages/PrivacyPolicy';
import TermsOfService from './landing/pages/TermsOfService';

// Auth Pages
import Login from './auth/Login';
import Register from './auth/Register';
import RegistrationSuccess from './auth/RegistrationSuccess';

// User Portal
import Overview from './user/pages/Overview';
import UserProfile from './user/pages/UserProfile';
import Garage from './user/pages/Garage';
import Compare from './user/pages/Compare';
import Verification from './user/pages/Verification';
import TestDrives from './user/pages/TestDrives';
import Purchases from './user/pages/Purchases';
import RentalHistory from './user/pages/RentalHistory';
import UserMessages from './user/pages/Messages';

// Dealer Portal
import DealerDashboard from './dealer/pages/Dashboard';
import ManageListingsDealer from './dealer/pages/ManageListings';
import AddCar from './dealer/pages/AddCar';

// Super Admin
import AdminDashboard from './superadmin/pages/Dashboard';
import ManageUsers from './superadmin/pages/ManageUsers';
import AddUser from './superadmin/pages/AddUser';
import AdminManageListings from './superadmin/pages/ManageListings';
import SiteCMS from './superadmin/pages/SiteCMS';
import DealOfTheWeekAdmin from './superadmin/pages/DealOfTheWeek';
import KYCReview from './superadmin/pages/KYCReview';
import RentalManagement from './superadmin/pages/RentalManagement';
import RentalDetail from './superadmin/pages/RentalDetail';
import PaymentManagement from './superadmin/pages/PaymentManagement';
import AddCarAdmin from './superadmin/pages/AddCar';
import AdminCarsList from './superadmin/pages/AdminCarsList';
import BoughtCars from './superadmin/pages/BoughtCars';
import MessageHistory from './superadmin/pages/MessageHistory';
import InquiryList from './superadmin/pages/InquiryList';
import InquiryDetail from './superadmin/pages/InquiryDetail';

// Common
import Security from './common/pages/Security';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PortalLayout from './components/PortalLayout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <UserDataProvider>
          <SiteConfigProvider>
            <CarProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/car/:id" element={<CarDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/financing" element={<Financing />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register-success" element={<RegistrationSuccess />} />
                    
                    <Route path="/user/*" element={
                      <PortalLayout>
                        <Routes>
                          <Route path="overview" element={<Overview />} />
                          <Route path="profile" element={<UserProfile />} />
                          <Route path="security" element={<Security />} />
                          <Route path="garage" element={<Garage />} />
                          <Route path="compare" element={<Compare />} />
                          <Route path="verify" element={<Verification />} />
                          <Route path="test-drives" element={<TestDrives />} />
                          <Route path="purchases" element={<Purchases />} />
                          <Route path="rentals" element={<RentalHistory />} />
                          <Route path="messages" element={<UserMessages />} />
                          <Route path="*" element={<Navigate to="overview" replace />} />
                        </Routes>
                      </PortalLayout>
                    } />

                    <Route path="/dealer/*" element={
                      <PortalLayout>
                        <Routes>
                          <Route path="dashboard" element={<DealerDashboard />} />
                          <Route path="listings" element={<ManageListingsDealer />} />
                          <Route path="security" element={<Security />} />
                          <Route path="add-car" element={<AddCar />} />
                          <Route path="verify" element={<Verification />} />
                          <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                      </PortalLayout>
                    } />

                    <Route path="/admin/*" element={
                      <PortalLayout>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<ManageUsers />} />
                          <Route path="kyc" element={<KYCReview />} />
                          <Route path="security" element={<Security />} />
                          <Route path="add-user" element={<AddUser />} />
                          <Route path="listings" element={<AdminManageListings />} />
                          <Route path="deal" element={<DealOfTheWeekAdmin />} />
                          <Route path="cms" element={<SiteCMS />} />
                          <Route path="rentals" element={<RentalManagement />} />
                          <Route path="rentals/:id" element={<RentalDetail />} />
                          <Route path="payments" element={<PaymentManagement />} />
                          <Route path="add-car" element={<AddCarAdmin />} />
                          <Route path="cars-list" element={<AdminCarsList />} />
                          <Route path="bought-cars" element={<BoughtCars />} />
                          <Route path="message-history" element={<MessageHistory />} />
                          <Route path="inquiry" element={<InquiryList />} />
                          <Route path="inquiry/:id" element={<InquiryDetail />} />
                          <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                      </PortalLayout>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </CarProvider>
          </SiteConfigProvider>
        </UserDataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
