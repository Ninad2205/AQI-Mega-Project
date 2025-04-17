from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

API_KEY = "306f5a21f4611bca4f7a86231be36c38"

# Define CPCB breakpoints for PM2.5 and PM10 (extendable)
CPCB_BREAKPOINTS = {
    "pm2_5": [
        (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
        (91, 120, 201, 300), (121, 250, 301, 400), (251, 350, 401, 500)
    ],
    "pm10": [
        (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
        (251, 350, 201, 300), (351, 430, 301, 400), (431, 500, 401, 500)
    ]
}

def calculate_subindex(concentration, breakpoints):
    for bp in breakpoints:
        c_low, c_high, i_low, i_high = bp
        if c_low <= concentration <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low)
    return None

@app.route("/aqi")
def get_aqi():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    response = requests.get(url)
    data = response.json()

    components = data["list"][0]["components"]
    pm2_5 = components.get("pm2_5", 0)
    pm10 = components.get("pm10", 0)

    pm2_5_index = calculate_subindex(pm2_5, CPCB_BREAKPOINTS["pm2_5"])
    pm10_index = calculate_subindex(pm10, CPCB_BREAKPOINTS["pm10"])

    final_aqi = max(filter(None, [pm2_5_index, pm10_index]))

    return jsonify({
        "aqi": final_aqi,
        "components": components
    })

if __name__ == "__main__":
    app.run(debug=True)
