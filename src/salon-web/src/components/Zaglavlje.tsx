import { Link } from "react-router";

function Zaglavlje() {
  return (
    <header className="zaglavlje">
      <div className="zaglavlje-sadrzaj">
        <Link className="logo" to="/">
          Salon Trač
        </Link>

        <nav className="navigacija">
          <a href="/#o-salonu">O salonu</a>

          <a href="/#usluge">Usluge</a>

          <Link to="/rezervacija">Rezerviši</Link>
          
          <Link to="/moja-rezervacija">Moja rezervacija</Link>

          <Link to="/administracija/osnovne-informacije">Administracija</Link>
        </nav>
      </div>
    </header>
  );
}

export default Zaglavlje;
