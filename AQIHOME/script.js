const aqiValueEl = document.getElementById('aqi-value');
const aqiStatusEl = document.getElementById('aqi-status');
const cityNameEl = document.getElementById('city-name');
const pollutantsEl = document.querySelector('.pollutants');
const infoCard = document.getElementById('info-card');
const overlay = document.getElementById('overlay');

const apiKey = '84f4e0b475d6778cd954658b20c84e29'; // Replace with your OpenWeatherMap API key

function initMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([lat, lon]).addTo(map);

  const heatPoints = [];
  for (let i = 0; i < 50; i++) {
    const offsetLat = (Math.random() - 0.5) * 0.1;
    const offsetLon = (Math.random() - 0.5) * 0.1;
    heatPoints.push([lat + offsetLat, lon + offsetLon, Math.random()]);
  }
  L.heatLayer(heatPoints, { radius: 25, blur: 15 }).addTo(map);
}
function calculateIndianAQI(pollutants) {
  function getSubIndex(conc, breakpoints) {
    for (const bp of breakpoints) {
      if (conc >= bp.low && conc <= bp.high) {
        return Math.round((bp.iHigh - bp.iLow) / (bp.high - bp.low) * (conc - bp.low) + bp.iLow);
      }
    }
    return 0;
  }

  const breakpoints = {
    pm2_5: [
      { low: 0, high: 30, iLow: 0, iHigh: 50 },
      { low: 31, high: 60, iLow: 51, iHigh: 100 },
      { low: 61, high: 90, iLow: 101, iHigh: 200 },
      { low: 91, high: 120, iLow: 201, iHigh: 300 },
      { low: 121, high: 250, iLow: 301, iHigh: 400 },
      { low: 251, high: 350, iLow: 401, iHigh: 500 },
    ],
    pm10: [
      { low: 0, high: 50, iLow: 0, iHigh: 50 },
      { low: 51, high: 100, iLow: 51, iHigh: 100 },
      { low: 101, high: 250, iLow: 101, iHigh: 200 },
      { low: 251, high: 350, iLow: 201, iHigh: 300 },
      { low: 351, high: 430, iLow: 301, iHigh: 400 },
      { low: 431, high: 500, iLow: 401, iHigh: 500 },
    ],
    no2: [
      { low: 0, high: 40, iLow: 0, iHigh: 50 },
      { low: 41, high: 80, iLow: 51, iHigh: 100 },
      { low: 81, high: 180, iLow: 101, iHigh: 200 },
      { low: 181, high: 280, iLow: 201, iHigh: 300 },
      { low: 281, high: 400, iLow: 301, iHigh: 400 },
      { low: 401, high: 500, iLow: 401, iHigh: 500 },
    ],
    so2: [
      { low: 0, high: 40, iLow: 0, iHigh: 50 },
      { low: 41, high: 80, iLow: 51, iHigh: 100 },
      { low: 81, high: 380, iLow: 101, iHigh: 200 },
      { low: 381, high: 800, iLow: 201, iHigh: 300 },
      { low: 801, high: 1600, iLow: 301, iHigh: 400 },
      { low: 1601, high: 2000, iLow: 401, iHigh: 500 },
    ],
    co: [
      { low: 0, high: 1, iLow: 0, iHigh: 50 },
      { low: 1.1, high: 2, iLow: 51, iHigh: 100 },
      { low: 2.1, high: 10, iLow: 101, iHigh: 200 },
      { low: 10.1, high: 17, iLow: 201, iHigh: 300 },
      { low: 17.1, high: 34, iLow: 301, iHigh: 400 },
      { low: 34.1, high: 50, iLow: 401, iHigh: 500 },
    ],
    o3: [
      { low: 0, high: 50, iLow: 0, iHigh: 50 },
      { low: 51, high: 100, iLow: 51, iHigh: 100 },
      { low: 101, high: 168, iLow: 101, iHigh: 200 },
      { low: 169, high: 208, iLow: 201, iHigh: 300 },
      { low: 209, high: 748, iLow: 301, iHigh: 400 },
      { low: 749, high: 1000, iLow: 401, iHigh: 500 },
    ],
    nh3: [
      { low: 0, high: 200, iLow: 0, iHigh: 100 },
      { low: 201, high: 400, iLow: 101, iHigh: 200 },
      { low: 401, high: 800, iLow: 201, iHigh: 300 },
      { low: 801, high: 1200, iLow: 301, iHigh: 400 },
      { low: 1201, high: 1800, iLow: 401, iHigh: 500 },
    ]
  };

  const subIndices = [];

  for (const key in breakpoints) {
    const conc = pollutants[key];
    if (conc !== undefined && !isNaN(conc)) {
      subIndices.push(getSubIndex(conc, breakpoints[key]));
    }
  }

  return Math.max(...subIndices);
}

function fetchAQIData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const comps = data.list[0].components;
      const aqi = calculateIndianAQI(comps);

      let status = 'Good', color = '#4caf50';
      if (aqi > 400) { status = 'Hazardous'; color = '#7e0023'; }
      else if (aqi > 300) { status = 'Very Poor'; color = '#99004c'; }
      else if (aqi > 200) { status = 'Poor'; color = '#ff0000'; }
      else if (aqi > 100) { status = 'Moderate'; color = '#ff9800'; }
      else if (aqi > 50) { status = 'Fair'; color = '#cddc39'; }

      aqiValueEl.textContent = `${aqi}`;
      aqiStatusEl.textContent = status;
      aqiStatusEl.style.background = color;
      infoCard.style.borderColor = color;

      pollutantsEl.innerHTML = `
        <li><i class="fa fa-car"></i> CO: ${comps.co} µg/m³</li>
        <li><i class="fa fa-industry"></i> NO: ${comps.no} µg/m³</li>
        <li><i class="fa fa-fire"></i> NO₂: ${comps.no2} µg/m³</li>
        <li><i class="fa fa-sun-o"></i> O₃: ${comps.o3} µg/m³</li>
        <li><i class="fa fa-leaf"></i> SO₂: ${comps.so2} µg/m³</li>
        <li><i class="fa fa-flask"></i> NH₃: ${comps.nh3} µg/m³</li>
        <li><i class="fa fa-exclamation-triangle"></i> PM2.5: ${comps.pm2_5} µg/m³</li>
        <li><i class="fa fa-exclamation-triangle"></i> PM10: ${comps.pm10} µg/m³</li>`;
    })
    .catch(err => {
      console.error('Error fetching AQI:', err);
      pollutantsEl.innerHTML = '<li>Error fetching AQI data.</li>';
    });
}

function fetchCityName(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        cityNameEl.textContent = data[0].name || 'Unknown';
      } else {
        cityNameEl.textContent = 'Unknown';
      }
    })
    .catch(err => {
      console.error('Error fetching city:', err);
      cityNameEl.textContent = 'Unknown';
    });
}

function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  overlay.classList.add('animate__fadeOut');
  overlay.addEventListener('animationend', () => overlay.style.display = 'none');
  initMap(lat, lon);
  fetchCityName(lat, lon);
  fetchAQIData(lat, lon);
}

function error(err) {
  console.warn('Location error:', err.message);
  const lat = 18.5204, lon = 73.8567;
  overlay.innerHTML = '<p>Could not get location. Using Pune.</p>';
  initMap(lat, lon);
  fetchCityName(lat, lon);
  fetchAQIData(lat, lon);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  error({ message: 'Geolocation not supported' });
}
