import { Link } from 'react-router'
import './AdminNavigacija.css'

function AdminNavigacija() {
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
          <Link
            to="/administracija/osnovne-informacije"
            className="admin-link admin-link-aktivan"
          >
            Osnovne informacije
          </Link>

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