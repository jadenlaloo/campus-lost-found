import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InspectorProvider, useInspector } from './context/InspectorContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ItemInspector from './components/ItemInspector';
import ClaimModal from './components/ClaimModal';
import MatchSuggestionsModal from './components/MatchSuggestionsModal';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import Support from './pages/Support';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import ReportLostItem from './pages/user/ReportLostItem';
import ReportFoundItem from './pages/user/ReportFoundItem';
import MyReports from './pages/user/MyReports';
import MyClaims from './pages/user/MyClaims';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItems from './pages/admin/AdminItems';
import AdminClaims from './pages/admin/AdminClaims';
import AdminUsers from './pages/admin/AdminUsers';

function AppLayout() {
  const { activeClaimItem, setActiveClaimItem, activeMatchItem, setActiveMatchItem } = useInspector();
  const [toastMessage, setToastMessage] = React.useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="app-frame position-relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 px-4 py-2 border border-dark rounded-0 shadow font-monospace fw-bold z-3"
          style={{ backgroundColor: '#fed639', color: '#1c1917', border: '2px solid #1c1917' }}
        >
          <i className="bi bi-check2-circle me-2 text-success fs-5 align-middle"></i>
          <span className="align-middle">{toastMessage}</span>
          <button
            type="button"
            className="btn-close ms-3 align-middle"
            style={{ fontSize: '0.7rem' }}
            onClick={() => setToastMessage(null)}
          ></button>
        </div>
      )}

      {/* 1. Left Icon Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Right Work Area */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Top Header Bar with Yellow Search Bar + User Avatar & Notification */}
        <TopHeader />

        {/* Content Body: Center Main Column + Right Inspector Column */}
        <div className="app-content-body">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<BrowseItems />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Normal User Protected Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <ReportLostItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <ReportFoundItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-claims"
              element={
                <ProtectedRoute>
                  <MyClaims />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Administrator Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/items"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminClaims />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Right Inspector Column Matching Template */}
          <ItemInspector />
        </div>
      </div>

      {/* Global Modals triggered from Inspector or anywhere */}
      {activeClaimItem && (
        <ClaimModal
          item={activeClaimItem}
          onClose={() => setActiveClaimItem(null)}
          onSuccess={(msg) => showToast(msg || 'Claim submitted successfully!')}
        />
      )}

      {activeMatchItem && (
        <MatchSuggestionsModal
          item={activeMatchItem}
          onClose={() => setActiveMatchItem(null)}
          onOpenClaim={(itm) => {
            setActiveMatchItem(null);
            setActiveClaimItem(itm);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InspectorProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </InspectorProvider>
    </AuthProvider>
  );
}
