import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/Home.css';

const Profile = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h2 className="page-title">Profile</h2>
        </header>
        <div className="dashboard-section">
          <p>Profile Content Here</p>
        </div>
      </main>
    </div>
  )
}

export default Profile