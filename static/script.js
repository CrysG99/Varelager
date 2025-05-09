async function hentVarer() {
    const res = await fetch('/varer');
    const varer = await res.json();
    visVarer(varer);
}

function visVarer(varer) {
    const div = document.getElementById("vareliste");
    let html = `
        <table>
            <tr>
                <th>Varenummer</th>
                <th>Navn</th>
                <th>Kategori</th>
                <th>Antall</th>
                <th>Pris</th>
                <th>Handling</th>
            </tr>`;

    varer.forEach(v => {
        html += `
            <tr data-varenummer="${v.varenummer}">
            <td>${v.varenummer}</td>
            <td>${v.navn}</td>
            <td>${v.kategori}</td>
            <td><input type="number" value="${v.antall}" onchange="oppdaterAntall(${v.varenummer}, this.value)"></td>
            <td><input type="number" value="${v.pris}" step="0.01" id="pris-${v.varenummer}" value="${v.pris}"></td>
            <td>
                <button data-varenummer="${v.varenummer}" class="slett-knapp">Slett</button>
                <button data-varenummer="${v.varenummer}" class="endre-pris-knapp">Endre pris</button>
            </td>
        </tr>`;
    });

    html += "</table>";
    div.innerHTML = html;

    slettOppdatering();

    // Event listeners for slett-knapper
    document.querySelectorAll(".slett-knapp").forEach(button => {
        button.addEventListener("click", event => {
            const row = event.target.closest("tr");
            const varenummer = row.getAttribute("data-varenummer");
            slettVare(Number(varenummer));
        });
    });

    document.querySelectorAll(".endre-pris-knapp").forEach(button => {
        button.addEventListener("click", event => {
            const varenummer = button.getAttribute("data-varenummer");
            const nyPrisStr = document.getElementById(`pris-${varenummer}`).value.trim();


            if (!/^\d+(\.\d{1,2})?$/.test(nyPrisStr)) {
                alert("Ugyldig pris. Skriv inn et gyldig tall");
                return;
            }

            const nyPris = parseFloat(nyPrisStr);
            oppdaterPris(varenummer, nyPris);
        });
    });

    // Event listeners for oppdatering av antall
    document.querySelectorAll(".antall-input").forEach(input => {
        input.addEventListener("change", event => {
            const row = event.target.closest("tr");
            const varenummer = row.getAttribute("data-varenummer");
            const nyttAntall = event.target.value;
            oppdaterAntall(Number(varenummer), Number(nyttAntall));
        });
    });
}

async function leggTilVare() {
    const navn = document.getElementById("navn").value;
    const kategori = document.getElementById("kategori").value;
    const antall = Number(document.getElementById("antall").value);
    const pris = Number(document.getElementById("pris").value);

    const res = await fetch('/vare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navn, kategori, antall, pris })
    });

    const data = await res.json();
    alert(data.melding);
    hentVarer();
}

document.getElementById("sok-knapp").addEventListener("click", sokVare);

async function sokVare() {
    const q = document.getElementById("sokestreng").value.trim();
    if (!q) {
        document.getElementById("sokeresultat").innerHTML = "<p>Søk etter noe pung.</p>";
        return;
    }
    const res = await fetch(`/sok?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
        document.getElementById("sokeresultat").innerHTML = "<p>Feil ved søk.</p>";
        return;
    }

    const varer = await res.json();
    visSokResultat(varer);
}

function visSokResultat(varer) {
    const div = document.getElementById("sokeresultat");
    if (varer.length === 0) {
        div.innerHTML = "<p>Ingen var funnet.</p>";
        return;
    }

    let html = "<h3>Søkeresultat</h3><table><tr><th>Varenummer</th><th>Navn</th><th>Kategori</th><th>Antall</th><th>Pris</th></tr>";
    varer.forEach(v => {
        html += `<tr>
            <td>${v.varenummer}</td>
            <td>${v.navn}</td>
            <td>${v.kategori}</td>
            <td>${v.antall}</td>
            <td>${v.pris} kr</td>
        </tr>`;
    });
    html += "</table>";

    div.innerHTML = html;
}

async function oppdaterAntall(varenummer, nyttAntall) {
    await fetch(`/ vare / ${varenummer} `, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antall: Number(nyttAntall) })
    });
}

function sjekkGyldigTall(verdi) {
    return /^\d+(\.\d{1,2})?$/.test(verdi);
}

async function oppdaterPris(varenummer, nyPris) {
    if (!sjekkGyldigTall(pris)) {
        alert("Ugyldig pris. Skriv inn et tall");
        return;
    }
    const tall = parseFloat(pris);

    await fetch(`/vare/${varenummer}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pris: tall })
    });
    hentVarer();
}

async function slettVare(varenummer) {
    if (!confirm("Er du sikker på at du vil slette varen?")) return;
    await fetch(`/ vare / ${varenummer} `, { method: 'DELETE' });
    hentVarer();
}

function slettOppdatering() {
    document.querySelectorAll(".slett-knapp").forEach(button => {
        button.addEventListener("click", event => {
            const row = event.target.closest("tr");
            const varenummer = row.getAttribute("data-varenummer");
            slettVare(Number(varenummer));
        });
    });

    document.querySelectorAll(".antall-input").forEach(input => {
        input.addEventListener("change", event => {
            const row = event.target.closest("tr");
            const varenummer = row.getAttribute("data-varenummer");
            oppdaterAntall(Number(varenummer), Number(nyttAntall));
        });
    });
}

async function visRapport() {
    const res = await fetch('/rapport');
    const data = await res.json();
    document.getElementById("rapport").innerHTML = `
        Totalt antall varer: ${data.totalt_antall_varer} <br>
            Samlet lagerverdi: ${data.samlet_lagerverdi.toFixed(2)} kr
            `;
}

document.addEventListener("DOMContentLoaded", () => {
    hentVarer();

    const leggTilKnapp = document.getElementById("legg-til-knapp");
    if (leggTilKnapp) {
        leggTilKnapp.addEventListener("click", leggTilVare);
    }

    const sokKnapp = document.getElementById("sok-knapp");
    if (sokKnapp) {
        sokKnapp.addEventListener("click", sokVare);
    }

    const rapportKnapp = document.getElementById("rapport-knapp");
    if (rapportKnapp) {
        rapportKnapp.addEventListener("click", visRapport);
    }
});
