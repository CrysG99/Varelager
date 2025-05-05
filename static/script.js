async function hentVarer() {
    const res = await fetch('/varer');
    const varer = await res.json();
    visVarer(varer);
}

function visVarer(varer) {
    const div = document.getElementById("vareliste");
    let html = "<table><tr><th>Varenummer</th><th>Navn</th><th>Kategori</th><th>Antall</th><th>Pris</th><th>Handling</th></tr>";
    varer.forEach(v => {
        html += `<tr>
            <td>${v.varenummer}</td>
            <td>${v.navn}</td>
            <td>${v.kategori}</td>
            <td><input type="number" value="${v.antall}" onchange="oppdaterAntall(${v.varenummer}, this.value)"></td>
            <td>${v.pris} kr</td>
            <td><button onclick="slettVare(${v.varenummer})">Slett</button></td>
        </tr>`;
    });
    html += "</table>";
    div.innerHTML = html;
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

async function sokVare() {
    const q = document.getElementById("sokestreng").value;
    const res = await fetch(`/sok?q=${q}`);
    const varer = await res.json();
    visVarer(varer);
}

async function oppdaterAntall(varenummer, nyttAntall) {
    await fetch(`/vare/${varenummer}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antall: Number(nyttAntall) })
    });
}

async function slettVare(varenummer) {
    if (!confirm("Er du sikker på at du vil slette varen?")) return;
    await fetch(`/vare/${varenummer}`, { method: 'DELETE' });
    hentVarer();
}

async function visRapport() {
    const res = await fetch('/rapport');
    const data = await res.json();
    document.getElementById("rapport").innerHTML = `
        Totalt antall varer: ${data.totalt_antall_varer}<br>
        Samlet lagerverdi: ${data.samlet_lagerverdi.toFixed(2)} kr
    `;
}

window.onload = hentVarer;
