import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home'; // <-- Import Home instead of Dashboard
import Movies from './pages/Movies';
import Details from './pages/Details';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import History from './pages/History';
import Random from './pages/Random';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Protected><Home /></Protected>} /> {/* Home acts as Dashboard */}
        <Route path="/movies" element={<Movies />} />
        <Route path="/random" element={<Random />} />
        <Route path="/movies/:id" element={<Details />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watchlist" element={<Protected><Watchlist /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}