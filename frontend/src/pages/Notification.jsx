import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/Home.css';

const Notification = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px"}}>
        <header className="top-header">
          <h2 className="page-title">Notifications</h2>
        </header>
        <div className="dashboard-section">
          <p>Notification Content Here</p>
        </div>
      </main>
    </div>
  )
}

export default Notification