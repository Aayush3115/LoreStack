import React, { useState } from 'react'

import './Login.css'

const Login = () => {
     const [action,setAction] = useState('Sign Up');
  return (
    <div className='container'>
        <div className="header">
            <div className="msg">{action}</div>
            <div className="uline"></div>
        </div>
        <div className="inputs">
            {action === "Login" ?<div></div>: <div className="input">
                <label htmlFor="username">Enter Your Name:</label>
                <input type="text" placeholder='Username' />
            </div> }
            
             <div className="input">
                <label htmlFor="email">Enter Your Email:</label>
                <input type="email" placeholder='Email' />
            </div>
             <div className="input">
                <label htmlFor="password">Enter Your Password:</label>
                <input type="password" placeholder='Password' />
            </div>
        </div>
        {action === "Sign Up" ?<div></div>: <div className="forget-password">Forget Password?</div>}
        
        <div className="buttonpart">
            <button className={`btn ${action === "Sign Up" ? "active" : "inactive"}`}
    onClick={() => setAction("Sign Up")}>Sign Up</button>
            <button className={`btn ${action === "Sign Up" ? "inactive" : "active"}`}
    onClick={() => setAction("Login")}>Login</button>

        </div>
      
    </div>
  )
}


export default Login
