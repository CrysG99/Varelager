from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)
DATAFIL = 'varer.json'

# Datafunksjoner som laster data, lagrer data og varebehandling

def last_data():
    if not os.path.exists(DATAFIL):
        return []
    with open(DATAFIL, 'r', encoding='utf-8') as f:
        return json.load(f)
    

def lagre_data(data):
    with open(DATAFIL, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)



def finn_vare(varenummer):
    varer = last_data()
    for v in varer:
        if v['varenummer'] == varenummer:
            return v
        return None
    
    

@app.route('/varer', methods=['GET'])
def hent_varer():
    return jsonify(last_data())


@app.route('/vare', methods=['POST'])
def legg_til_vare():
    ny_vare = request.json
    varer = last_data()

    ny_vare['varenummer'] = ny_vare.get('varenummer') or (max([v['varenummer'] for v in varer], default=0) + 1)

    varer.append(ny_vare)
    lagre_data(varer)
    return jsonify({"Melding": "Vare lagt til", "vare": ny_vare})


@app.route('/sok', methods=['GET'])
def sok_vare():
    søk = request.args.get('q', '').lower()
    varer = last_data()
    resultater = [v for v in varer if søk in v['navn'].lower() or søk in str(v['varenummer'])]
    return jsonify(resultater)


@app.route('/vare/<int:varenummer>', methods=['PUT'])
def oppdater_vare(varenummer):
    data = request.json
    varer = last_data()
    for v in varer:
        if v['varenummer'] == varenummer:
            v['antall'] = data.get('antall', v['antall'])
            lagre_data(varer)
            return jsonify({"melding": "vare oppdatert", "vare": v})
        return jsonify({"feil": "vare ikke funnet"}), 404



@app.route('/vare/<int:varenummer>', methods=['DELETE'])
def slett_vare():
    with open(DATAFIL, "r") as f:
        varer = json.load(f)

    ny_liste = [v for v in varer if v["varenummer"] != varenummer]

    if len(ny_liste) == len(varer):
        return jsonify({"melding": "Varen ble ikke funnet"}), 404
    
with open(DATAFIL, "w") as f:
    json.dump(ny_liste, f, indent=2)

return jsonify({"melding": "Vare slettet"})

@app.route('/rapport', methods=['GET'])
def rapport():
    varer = last_data()
    total_verdi = sum(v['antall'] * v['pris'] for v in varer)
    return jsonify({
        "totalt_antall_varer": len(varer),
        "samlet_lagerverdi": total_verdi,
        "varer": varer
    })




# HTML Sider

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)



