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
import Navbar from './Components/Navbar'; 

const App = () => {
  return (
    <Router>
      <div className='app'>
        <div className="navbar">
          <Navbar />
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Landing />}  />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={
            
               <Home/>
            
            } />
            <Route path='/notification' element={<Notification />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/community' element={<Community /> } />
            <Route path='*' element={<Errors />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
