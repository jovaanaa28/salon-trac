import { Route, Routes } from "react-router";

import AdminKategorije from "./pages/AdminKategorije";

import AdminOsnovneInformacije from "./pages/AdminOsnovneInformacije";

import AdminPodesavanja from "./pages/AdminPodesavanja";

import AdminUsluge from "./pages/AdminUsluge";

import NovaRezervacija from "./pages/NovaRezervacija";

import PocetnaStranica from "./pages/PocetnaStranica";

import RezervacijaUspesna from "./pages/RezervacijaUspesna";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PocetnaStranica />} />
      <Route path="/rezervacija" element={<NovaRezervacija />} />
      <Route
        path="/rezervacija/status/:idZahteva"
        element={<RezervacijaUspesna />}
      />
      <Route
        path="/administracija/osnovne-informacije"
        element={<AdminOsnovneInformacije />}
      />
      <Route path="/administracija/kategorije" element={<AdminKategorije />} />
      <Route path="/administracija/usluge" element={<AdminUsluge />} />
      <Route
        path="/administracija/podesavanja"
        element={<AdminPodesavanja />}
      />
    </Routes>
  );
}

export default App;
