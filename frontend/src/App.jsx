import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SmartBot from './components/SmartBot'
import PageLoader from './components/PageLoader'
import ScrollToTop from './components/ScrollToTop'
import BackToTop from './components/BackToTop'
import CommandPalette from './components/CommandPalette'
import OnboardingFlow from './components/OnboardingFlow'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy-loaded pages
const Home           = lazy(() => import('./pages/Home'))
const Services       = lazy(() => import('./pages/Services'))
const Products       = lazy(() => import('./pages/Products'))
const Founder        = lazy(() => import('./pages/Founder'))
const AboutUs        = lazy(() => import('./pages/AboutUs'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const UserProfile    = lazy(() => import('./pages/UserProfile'))
const UserSettings   = lazy(() => import('./pages/UserSettings'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Contact        = lazy(() => import('./pages/Contact'))
const Pricing        = lazy(() => import('./pages/Pricing'))
const Blog           = lazy(() => import('./pages/Blog'))
const CaseStudies    = lazy(() => import('./pages/CaseStudies'))
const Privacy        = lazy(() => import('./pages/Privacy'))
const Terms          = lazy(() => import('./pages/Terms'))
const ApiDocs        = lazy(() => import('./pages/ApiDocs'))
const Changelog      = lazy(() => import('./pages/Changelog'))
const NotFound       = lazy(() => import('./pages/NotFound'))

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user)    return <Navigate to="/login"   replace />
  if (!isAdmin) return <Navigate to="/profile" replace />
  return children
}

function AppShell() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="relative min-h-screen flex flex-col noise-bg">
        <Navbar />
        <CommandPalette />
        {user && <OnboardingFlow />}
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"             element={<Home />}        />
              <Route path="/services"     element={<Services />}    />
              <Route path="/products"     element={<Products />}    />
              <Route path="/about"        element={<AboutUs />}     />
              <Route path="/founder"      element={<Founder />}     />
              <Route path="/pricing"      element={<Pricing />}     />
              <Route path="/contact"      element={<Contact />}     />
              <Route path="/blog"         element={<Blog />}        />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/api-docs"     element={<ApiDocs />}     />
              <Route path="/privacy"      element={<Privacy />}     />
              <Route path="/terms"        element={<Terms />}       />
              <Route path="/changelog"    element={<Changelog />}   />
              <Route path="/login"        element={<Login />}       />
              <Route path="/register"     element={<Register />}    />
              <Route path="/profile"  element={<PrivateRoute><UserProfile /></PrivateRoute>}    />
              <Route path="/settings" element={<PrivateRoute><UserSettings /></PrivateRoute>}   />
              <Route path="/admin"    element={<AdminRoute><AdminDashboard /></AdminRoute>}     />
              <Route path="*"         element={<NotFound />}    />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <SmartBot />
        <BackToTop />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
