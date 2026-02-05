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
        <Route path='/Notification' element={<Notification />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/community' element={<Community />} />
        <Route path='/Community' element={<Community />} />
        <Route path='*' element={<Errors />} />

      </Routes>
    </Router>
  );
};

export default App;