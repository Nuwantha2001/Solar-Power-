import React from 'react'
import { Routes , Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './page/upload_file'
import Login from './page/LoginPage'
import Generation_SL from './page/Generation_SL'
import Site_SL from '/src/page/Site'
import Harvest from './page/Harvest'
import Test from './page/test'
import Disconnected_site from './page/Disconnected_site'

const App = () => {

  return (
    <div>
      <Navbar />
      <div className='container'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/generation_site_list' element={<Generation_SL />} />
          <Route path='/site_details' element={<Site_SL />} />
          <Route path='/harvest' element={<Harvest />} />
          <Route path='/test' element={<Test />} />
          <Route path='/disconnected_sites' element={<Disconnected_site />} />
        </Routes>
      </div>
      
    </div>
  )
}

export default App
