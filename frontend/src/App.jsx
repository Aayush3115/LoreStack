import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Home from './pages/Home';
import './App.css';

const App = () => {
<Router>
<Routes>
<Route path="/" element={<Landing />} />
<Route path="/login" element={<Login />} />
<Route path="/home" element={<Home />} />
</Routes>
</Router>
};
export default App;