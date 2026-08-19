import './App.css'

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
            Aplikacija za izveštavanje koristi sopstvenu bazu
            podataka koju A.2 ažurira na osnovu događaja
            primljenih preko RabbitMQ-a.
          </p>
        </section>

        <section className="kartice">
          <article className="kartica">
            <span className="broj">01</span>

            <h3>Termini po kategoriji</h3>

            <p>
              Pregled trenutno rezervisanih termina
              grupisanih po kategoriji usluge.
            </p>
          </article>

          <article className="kartica">
            <span className="broj">02</span>

            <h3>Rezervacije po datumu</h3>

            <p>
              Istorijski pregled broja rezervacija
              prema originalnom datumu kreiranja.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
