import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import QueEsAkusete from '../pages/QueEsAkusete'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CrearTicket from '../pages/CrearTicket'
import Tickets from '../pages/Tickets'
import Usuario from '../pages/Usuario'
import ResolverProblemas from '../pages/ResolverProblemas'
import ForgotPassword from '../pages/Recuperarcontraseña'
import ResetPassword from '../pages/ResetPassword'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/que-es-akusete" element={<QueEsAkusete />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/usuario" element={<Usuario />} />
      <Route path="/crear-ticket" element={<CrearTicket />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/resolver-problemas" element={<ResolverProblemas />} />
    </Routes>
  )
}
