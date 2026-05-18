import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Submit = lazy(() => import('./pages/Submit'))
const RiceDetail = lazy(() => import('./pages/RiceDetail'))
const Admin = lazy(() => import('./pages/Admin'))
const Themes = lazy(() => import('./pages/Themes'))
const Gallery = lazy(() => import('./pages/Gallery'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Wiki = lazy(() => import('./pages/Wiki'))
const WikiDetail = lazy(() => import('./pages/WikiDetail'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/themes" element={<Themes />} />
                <Route path="/" element={<Home />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/rice/:id" element={<RiceDetail />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/wiki" element={<Wiki />} />
                <Route path="/wiki/:id" element={<WikiDetail />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-accent)',
                secondary: 'var(--color-surface)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
