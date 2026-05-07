import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Home from './pages/Home';
import ProtectedRoute from './Components/ProtectedRoute';
import './App.css';
import Notification from './pages/Notification';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Community from './pages/Community';
import Errors from './pages/Error.jsx';
import CommunityDetail from "./pages/CommunityDetail";
import MovieDetails from "./pages/MovieDetails";
import WebSeriesDetails from "./pages/WebSeriesDetails";
import AnimeDetails from "./pages/AnimeDetails";

import { SidebarProvider } from './Context/SidebarContext';
import { ThemeProvider } from './Context/ThemeContext';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/explore" element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } />
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
            <Route path='/profile/:username' element={
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
            <Route path="/movie/:id" element={
              <ProtectedRoute>
                <MovieDetails />
              </ProtectedRoute>
            } />
            <Route path="/tv/:id" element={
              <ProtectedRoute>
                <WebSeriesDetails />
              </ProtectedRoute>
            } />
            <Route path="/anime/:id" element={
              <ProtectedRoute>
                <AnimeDetails />
              </ProtectedRoute>
            } />
            <Route path='*' element={<Errors />} />
            <Route path="/community/:id" element={<CommunityDetail />} />

          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
