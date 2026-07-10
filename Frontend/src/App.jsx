import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import UserHome from './pages/userHome'
import UserProtectWrapper from './pages/userProtectWrapper'
import UserLogin from './pages/userLogin'
import UserRegister from './pages/userRegister'
import CaptainLogin from './pages/captainLogin'
import ProfilePage from './pages/ProfilePage'
import UserLogout from './pages/UserLogout'
import CaptainRegister from './pages/captainRegsiter'
import CaptainHome from './pages/captainHome'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'
import CaptainProfilePage from './pages/CaptainProfilePage'
import CaptainLogout from './pages/CaptainLogout'
import CaptainLiveTracking from './pages/CaptainLiveTracking'
import CaptainOngoing from './pages/CaptainOngoing'
import UserLiveTracking from './pages/UserLiveTracking'
import UserOngoing from './pages/UserOngoing'
const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          duration: 2000,
          removeDelay: 500,
        }}
      />
      <Routes>
        <Route path='/users/login' element={<UserLogin />} />
        <Route path='/users/register' element={<UserRegister />} />
        <Route path='/users/home' element={
          <UserProtectWrapper>
            <UserHome />
          </UserProtectWrapper>
        } />
        <Route path='/users/profile' element={
          <UserProtectWrapper>
            <ProfilePage />
          </UserProtectWrapper>
        } />

        <Route path="/users/logout" element={
          <UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
        } />

        <Route path="/users/live-tracking" element={
          <UserProtectWrapper>
            <UserLiveTracking />
          </UserProtectWrapper>
        } />

        <Route path="/users/ride-ongoing" element={
          <UserProtectWrapper>
            <UserOngoing />
          </UserProtectWrapper>
        } />

        <Route path='/captains/register' element={<CaptainRegister />} />
        <Route path='/captains/login' element={<CaptainLogin />} />
        <Route path='/captains/home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>
        } />

        <Route path='/captains/profile' element={
          <CaptainProtectWrapper>
            <CaptainProfilePage />
          </CaptainProtectWrapper>
        } />

        <Route path='/captains/live-tracking' element={
          <CaptainProtectWrapper>
            <CaptainLiveTracking />
          </CaptainProtectWrapper>
        } />

        <Route path='/captains/ride-ongoing' element={
          <CaptainProtectWrapper>
            <CaptainOngoing />
          </CaptainProtectWrapper>
        } />

        <Route path='/captains/logout' element={
          <CaptainProtectWrapper>
            <CaptainLogout />
          </CaptainProtectWrapper>
        } />

      </Routes>
    </>
  )
}

export default App