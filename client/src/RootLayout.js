import React from 'react'
import NavBar from './components/js/NavBar'
import HomeBody from './components/js/Home'
import Footer from './components/js/Footer'
import {Outlet} from 'react-router-dom';
function RootLayout() {
  return (
    <div>
      <NavBar />
      <div style={{minHeight:'90vh'}} className='mb-5'>
        <Outlet/>
      </div>
      <Footer/>
    </div>
    
  )
}

export default RootLayout