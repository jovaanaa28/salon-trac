import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import Zaglavlje from "../components/Zaglavlje";
import type { RezervacijaDetalji } from "../models/RezervacijaDetalji";
import { pristupiRezervaciji } from "../services/rezervacijeService";
import "./PristupRezervaciji.css";

function formatirajCenu(cena: number) {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cena);
}

function formatirajDatum(datum: string) {
  return new Intl.DateTimeFormat("sr-RS").format(new Date(datum));
}

function formatirajVreme(vreme: string) {
  return vreme.slice(0, 5);
}

function PristupRezervaciji() {
  const [email, setEmail] = useState("");
  const [sifra, setSifra] = useState("");
  const [rezervacija, setRezervacija] = useState<RezervacijaDetalji | null>(
    null,
  );
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  async function pristupi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGreska(null);
    setRezervacija(null);
    const emailVrednost = email.trim();
    const sifraVrednost = sifra.trim().toUpperCase();
    if (!emailVrednost || !sifraVrednost) {
      setGreska("Email i pristupna šifra su obavezni.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVrednost)) {
      setGreska("Unesi ispravnu email adresu.");
      return;
    }
    try {
      setUcitavanje(true);
      const rezultat = await pristupiRezervaciji({
        email: emailVrednost,
        sifra: sifraVrednost,
      });
      setRezervacija(rezultat);
      /*
       * Čuvamo podatke samo u trenutnoj
       * browser sesiji da ih Task 43
       * može koristiti za izmenu i
       * otkazivanje.
       */
      sessionStorage.setItem("rezervacijaEmail", emailVrednost);
      sessionStorage.setItem("rezervacijaSifra", sifraVrednost);
      sessionStorage.setItem("rezervacijaId", String(rezultat.id));
    } catch (error) {
      sessionStorage.removeItem("rezervacijaEmail");
      sessionStorage.removeItem("rezervacijaSifra");
      sessionStorage.removeItem("rezervacijaId");
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Rezervaciji trenutno nije moguće pristupiti.");
      }
    } finally {
      setUcitavanje(false);
    }
  }
  function novaPretraga() {
    setRezervacija(null);
    setGreska(null);
    setEmail("");
    setSifra("");
    sessionStorage.removeItem("rezervacijaEmail");
    sessionStorage.removeItem("rezervacijaSifra");
    sessionStorage.removeItem("rezervacijaId");
  }
  return (
    <div className="pristup-rezervaciji-stranica">
      <Zaglavlje />
      <main className="pristup-rezervaciji-sadrzaj">
        <div className="pristup-rezervaciji-naslov">
          <p className="pristup-rezervaciji-nadnaslov">Salon Trač</p>
          <h1>Moja rezervacija</h1>
          <p>
            Unesi email adresu i pristupnu šifru koju si dobio/la nakon uspešnog
            kreiranja rezervacije.
          </p>
        </div>
        {!rezervacija ? (
          <section className="pristup-kartica">
            <h2>Pristup rezervaciji</h2>
            <p className="pristup-opis">Za pristup su potrebna oba podatka.</p>
            <form className="pristup-forma" onSubmit={pristupi}>
              <div className="pristup-polje">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setGreska(null);
                  }}
                  placeholder="ime@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="pristup-polje">
                <label htmlFor="sifra">Pristupna šifra</label>
                <input
                  id="sifra"
                  type="text"
                  value={sifra}
                  onChange={(event) => {
                    setSifra(event.target.value.toUpperCase());
                    setGreska(null);
                  }}
                  placeholder="Unesi pristupnu šifru"
                  autoComplete="off"
                  required
                />
                <span className="pristup-napomena">
                  Šifra je prikazana nakon uspešnog kreiranja rezervacije.
                </span>
              </div>
              {greska && (
                <div className="pristup-poruka pristup-greska">{greska}</div>
              )}
              <button
                type="submit"
                className="pristup-glavno-dugme"
                disabled={ucitavanje}
              >
                {ucitavanje ? "Provera..." : "Pristupi rezervaciji"}
              </button>
            </form>
          </section>
        ) : (
          <section className="pristup-kartica">
            <div className="pristup-uspeh-ikona">✓</div>
            <p className="pristup-rezervaciji-nadnaslov">Pristup uspešan</p>
            <h2>Rezervacija #{rezervacija.id}</h2>
            <p className="pristup-opis">Uspešno si pristupio/la rezervaciji.</p>
            <div className="pristup-osnovni-podaci">
              <div>
                <span>Korisnik</span>
                <strong>
                  {rezervacija.ime} {rezervacija.prezime}
                </strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{rezervacija.email}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{rezervacija.status}</strong>
              </div>
              <div>
                <span>Datum kreiranja</span>
                <strong>{formatirajDatum(rezervacija.datumKreiranja)}</strong>
              </div>
            </div>
            <div className="pristup-cena-kartica">
              <div>
                <span>Ukupna cena</span>
                <strong>
                  {formatirajCenu(rezervacija.ukupnaCena)}{" "}
                  {rezervacija.izabranaValuta}
                </strong>
              </div>
              <div>
                <span>Popust</span>
                <strong>{rezervacija.popust}%</strong>
              </div>
              <div className="pristup-konacna-cena">
                <span>Konačna cena</span>
                <strong>
                  {formatirajCenu(rezervacija.konacnaCena)}{" "}
                  {rezervacija.izabranaValuta}
                </strong>
              </div>
            </div>
            <div className="pristup-usluge">
              <h3>Rezervisane usluge</h3>
              {rezervacija.stavke.map((stavka) => (
                <article className="pristup-usluga" key={stavka.id}>
                  <div>
                    <strong>{stavka.nazivUsluge}</strong>
                    <span>
                      {formatirajDatum(stavka.datum)}
                      {" · "}
                      {formatirajVreme(stavka.vremePocetka)}
                    </span>
                  </div>
                  <strong className="pristup-usluga-cena">
                    {formatirajCenu(stavka.cenaRsd)} RSD
                  </strong>
                </article>
              ))}
            </div>
            {rezervacija.promoKod && (
              <div className="pristup-promo">
                <span>Promo kod generisan ovom rezervacijom</span>
                <strong>{rezervacija.promoKod}</strong>
              </div>
            )}

            <div className="pristup-upravljanje">
              <Link
                to="/upravljanje-rezervacijom"
                className="pristup-upravljanje-dugme"
              >
                Upravljaj rezervacijom
              </Link>
              <p>
                Ovde možeš dodati ili ukloniti uslugu i otkazati rezervaciju.
              </p>
            </div>
            
            <button
              type="button"
              className="pristup-sekundarno-dugme"
              onClick={novaPretraga}
            >
              Pristupi drugoj rezervaciji
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default PristupRezervaciji;
