import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/Home.css';

const Settings = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h2 className="page-title">Settings</h2>
        </header>
        <div className="dashboard-section">
          <p>Settings Content Here</p>
        </div>
      </main>
    </div>
  )
}

export default Settings