// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FamilyList from './pages/FamilyList';
import TreeView from './pages/TreeView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/family-list" element={<FamilyList />} />
        <Route path="/tree-view" element={<TreeView />} />
      </Routes>
    </Router>
  );
}

export default App;