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



@app.route('')







# HTML Sider

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)



