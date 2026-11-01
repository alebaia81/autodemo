import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { SellCarPage } from './pages/SellCarPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F1015] text-white flex flex-col justify-between selection:bg-[#E5A93C] selection:text-black">
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/servizi" element={<ServicesPage />} />
              <Route path="/chi-siamo" element={<AboutPage />} />
              <Route path="/auto/:slug" element={<VehicleDetailPage />} />
              <Route path="/vendi-auto" element={<SellCarPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

