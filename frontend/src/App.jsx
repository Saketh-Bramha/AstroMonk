import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AstroProvider } from './context/AstroContext';
import Login from './pages/Login';
import Details from './pages/Details';
import Dashboard from './pages/Dashboard';
import Feature from './pages/Feature';
import ForecastMenu from './pages/ForecastMenu';

function App() {
  return (
    <AstroProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/details" element={<Details />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forecast" element={<ForecastMenu />} />
          <Route path="/feature/:type" element={<Feature />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AstroProvider>
  );
}

export default App;
