import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ConnectionStatus from './components/ConnectionStatus';
import Home from './pages/Home';
import SupportAgentPage from './pages/SupportAgentPage';
import DashboardAgentPage from './pages/DashboardAgentPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support" element={<SupportAgentPage />} />
          <Route path="/dashboard" element={<DashboardAgentPage />} />
        </Routes>
        <ConnectionStatus />
      </div>
    </Router>
  );
}

export default App;
