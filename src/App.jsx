import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './styles/base.css'
import './styles/layout.css'

function App() {
  return (
    <>
      <Navbar />
      <main className="main-container">
        <AppRoutes />
        <div className="gradiente-profundidad"></div>
      </main>
      <Footer />
    </>
  )
}

export default App
