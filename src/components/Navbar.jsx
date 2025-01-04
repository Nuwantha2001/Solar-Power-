import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <div className="navbar">
        <ul>
            <NavLink to='/'><li>Home</li></NavLink>
            <NavLink to='/login'><li>Login</li></NavLink>
            <NavLink to='/capacity'><li>Capacity</li></NavLink>
        </ul>
      
    </div>
  )
}

export default Navbar
