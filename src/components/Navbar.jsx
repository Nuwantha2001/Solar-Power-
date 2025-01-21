import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <div className="navbar">
        <ul>
            <NavLink to='/'><li>Home</li></NavLink>
            <NavLink to='/generation_site_list'><li>Summary of Genaration</li></NavLink>
            <NavLink to='/disconnected_sites'><li>Disconnected Site</li></NavLink>
            <NavLink to='/harvest'><li>7-Day Harvest</li></NavLink>
            <NavLink to='/Analyzed Chart'><li>Chart</li></NavLink>
            <NavLink to='/site_details'><li>Site Capacity</li></NavLink>
            <NavLink to='/login'><li>Login</li></NavLink>
            <NavLink to='/test'><li>Test</li></NavLink>
        </ul>
      
    </div>
  )
}

export default Navbar
