import React from 'react';
import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/Explore.css';

const Home = () => {
    return (
        <div className="home-container" >
            <Sidebar />
            <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px" }}>
                <header className="top-header">
                    <h2 className="page-title">Home</h2>
                </header>
                <div className="dashboard-section">
                    {/* Blank for now */}
                </div>
            </main>
        </div>
    );
};

export default Home;
