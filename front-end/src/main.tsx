import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n';
import { BrowserRouter, Routes, Route } from "react-router";
import Register from './pages/register/Register.tsx';
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ToastContainer/>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </BrowserRouter>,
)
