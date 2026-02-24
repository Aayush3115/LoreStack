import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ProtectedRoute from './Components/ProtectedRoute';
import './App.css';
import Notification from './pages/Notification';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Community from './pages/Community';
import Errors from './pages/Error.jsx';
import CommunityDetail from "./pages/CommunityDetail";
import MovieDetail from "./pages/MovieDetail";




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path='/Notification' element={
          <ProtectedRoute>
            <Notification />
          </ProtectedRoute>} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/settings' element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>} />
        <Route path='/loreroom' element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />
        <Route path='*' element={<Errors />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/movie/:id" element={<MovieDetail />} />

      </Routes>
    </Router>
  );
};

export default App;