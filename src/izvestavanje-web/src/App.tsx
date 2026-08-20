import './App.css'

import TerminiPoKategorijiTabela
  from './components/TerminiPoKategorijiTabela'

function App() {
  return (
    <div className="aplikacija">
      <header className="zaglavlje">
        <div>
          <p className="nadnaslov">
            Salon Trač · A.2
          </p>

          <h1>Izveštavanje</h1>

          <p className="podnaslov">
            Portal za pregled podataka i izveštaja salona.
          </p>
        </div>
      </header>

      <main className="sadrzaj">
        <section className="uvod">
          <p className="nadnaslov">
            Upravljački pregled
          </p>

          <h2>Izveštaji salona</h2>

          <p>
            Podaci se čuvaju u posebnoj A.2 bazi
            i ažuriraju događajima primljenim
            preko RabbitMQ-a.
          </p>
        </section>

        <section className="izvestaj-sekcija">
          <div className="izvestaj-naslov">
            <span className="broj">
              01
            </span>

            <div>
              <h3>
                Termini po kategoriji
              </h3>

              <p>
                Trenutno rezervisani termini
                grupisani po kategoriji usluge.
              </p>
            </div>
          </div>

          <TerminiPoKategorijiTabela />
        </section>

        <section className="izvestaj-sekcija">
          <div className="izvestaj-naslov">
            <span className="broj">
              02
            </span>

            <div>
              <h3>
                Rezervacije po datumu
              </h3>

              <p>
                Istorijski pregled rezervacija
                biće prikazan u sledećem zadatku.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App