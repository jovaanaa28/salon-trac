import { Route, Routes } from 'react-router'
import AdminKategorije from './pages/AdminKategorije'
import AdminOsnovneInformacije from './pages/AdminOsnovneInformacije'
import AdminUsluge from './pages/AdminUsluge'
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

      <Route
        path="/administracija/kategorije"
        element={<AdminKategorije />}
      />

      <Route
        path="/administracija/usluge"
        element={<AdminUsluge />}
      />
    </Routes>
  )
}

export default App