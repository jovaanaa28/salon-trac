import { Route, Routes } from 'react-router'
import PocetnaStranica from './pages/PocetnaStranica'
import './App.css'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<PocetnaStranica />}
      />
    </Routes>
  )
}

export default App