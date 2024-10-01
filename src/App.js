import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.js';
import AdminLoginPage from './pages/AdminLoginPage.js';
import AdminConsolePage from './pages/AdminConsolePage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Admin Console에 대한 경로를 하나만 추가 */}
        <Route path="/admin/console/*" element={<AdminConsolePage />} />

        {/* 잘못된 경로로 접근하면 기본 경로로 리디렉션 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
