document.getElementById("aqiForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const lat = document.getElementById("latitude").value;
  const lon = document.getElementById("longitude").value;

  try {
    const response = await fetch(`http://127.0.0.1:5000/aqi?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    document.getElementById("result").innerText = `Calculated AQI: ${data.aqi}`;

    const comp = data.components;
    document.getElementById("components").innerHTML = `
      <p>PM2.5: ${comp.pm2_5}</p>
      <p>PM10: ${comp.pm10}</p>
      <p>CO: ${comp.co}</p>
      <p>NO: ${comp.no}</p>
      <p>NO₂: ${comp.no2}</p>
      <p>O₃: ${comp.o3}</p>
      <p>SO₂: ${comp.so2}</p>
      <p>NH₃: ${comp.nh3}</p>
    `;
  } catch (err) {
    document.getElementById("result").innerText = "Error fetching data!";
  }
});
