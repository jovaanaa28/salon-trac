import {
  Link,
  NavLink,
} from 'react-router'
import './AdminNavigacija.css'

function AdminNavigacija() {
  function klasaLinka(
    isActive: boolean,
  ) {
    return isActive
      ? 'admin-link admin-link-aktivan'
      : 'admin-link'
  }

  return (
    <header className="admin-zaglavlje">
      <div className="admin-zaglavlje-sadrzaj">
        <Link
          to="/"
          className="admin-logo"
        >
          Salon Trač
        </Link>

        <nav className="admin-navigacija">
          <NavLink
            to="/administracija/osnovne-informacije"
            className={({ isActive }) =>
              klasaLinka(isActive)
            }
          >
            Osnovne informacije
          </NavLink>

          <NavLink
            to="/administracija/kategorije"
            className={({ isActive }) =>
              klasaLinka(isActive)
            }
          >
            Kategorije
          </NavLink>

          <NavLink
            to="/administracija/usluge"
            className={({ isActive }) =>
              klasaLinka(isActive)
            }
          >
            Usluge
          </NavLink>

          <NavLink
            to="/administracija/podesavanja"
            className={({ isActive }) =>
              klasaLinka(isActive)
            }
          >
            Valute i popust
          </NavLink>

          <Link
            to="/"
            className="admin-link"
          >
            Nazad na salon
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default AdminNavigacija