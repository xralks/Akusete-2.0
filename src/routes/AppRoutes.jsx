import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import QueEsAkusete from '../pages/QueEsAkusete'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CrearTicket from '../pages/CrearTicket'
import Tickets from '../pages/Tickets'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/que-es-akusete" element={<QueEsAkusete />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/crear-ticket" element={<CrearTicket />} />
      <Route path="/tickets" element={<Tickets />} />
    </Routes>
  )
}
