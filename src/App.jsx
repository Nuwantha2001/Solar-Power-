import React from 'react'
import { Routes , Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './page/upload_file'
import Login from './page/login'
import Capacity from './page/capacity'


const App = () => {

  return (
    <div>
      <Navbar />
      <div className='container'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/capacity' element={<Capacity />} />
        </Routes>
      </div>
      
    </div>
  )
}

export default App
