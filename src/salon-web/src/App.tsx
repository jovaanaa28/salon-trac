import { Route, Routes } from 'react-router'
import AdminOsnovneInformacije from './pages/AdminOsnovneInformacije'
import PocetnaStranica from './pages/PocetnaStranica'
import './App.css'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<PocetnaStranica />}
      />

      <Route
        path="/administracija/osnovne-informacije"
        element={<AdminOsnovneInformacije />}
      />
    </Routes>
  )
}

export default App