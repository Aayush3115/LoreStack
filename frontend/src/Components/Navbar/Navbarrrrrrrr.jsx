import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <div className='navbar'>
      <a href="#" className="logo">LoreStack</a>

      <div className='navlinks'>
        <a href="#">Home</a>
        <a href="#">Movies</a>
        <a href="#">Series</a>
        <a href="#">Anime</a>
        <a href="#">About Us</a>
      </div>

      <div className='auth-links'>
        <a href="#" className="signin">Sign In</a>
        <a href="#" className="signup">Create Account</a>
      </div>
    </div>
  )
}

export default Navbar
