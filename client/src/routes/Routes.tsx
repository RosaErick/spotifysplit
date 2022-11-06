import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Home } from '../containers/Home'
import { Login } from '../containers/Login'

type Props = {}

export const AppRoutes = (props: Props) => {
  return (
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          
          
    
      </Routes>
  )
}