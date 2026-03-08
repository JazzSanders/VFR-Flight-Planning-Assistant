//Responsive Design for VFR Flight Planning Assistant: Web Application for CSC272
//Author: Jasmine Sanders
//Date: 02/21/2025
//Updated: 03/08/2026

//Filename: index.js
//Required Files:
//Description: Responsive Design for VFR Flight Planning Assistant Web Application


// --- UI & NAVIGATION LOGIC ---

function showCalc(event, calcId) {
  document.querySelectorAll(".calc-section").forEach((section) => {
    section.classList.add("hidden");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(calcId).classList.remove("hidden");
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }
}

function updateWeatherLabel(label) {
  document.getElementById("variable-label").innerText = label;
}

// --- MATH HELPERS ---
const degToRad = (deg) => deg * (Math.PI / 180);
const radToDeg = (rad) => rad * (180 / Math.PI);
const normalizeHeading = (deg) => {
  let normalized = (deg + 360) % 360;
  return normalized === 0 ? 360 : Math.round(normalized);
};

// Magnus-Tetens Constants
const MAG_A = 17.27;
const MAG_B = 237.7;

// --- CALCULATOR FUNCTIONS ---

function calcWindTriangle() {
  const tc = parseFloat(document.getElementById("tc").value);
  const tas = parseFloat(document.getElementById("tas_in").value);
  const wd = parseFloat(document.getElementById("wd").value);
  const ws = parseFloat(document.getElementById("ws").value);

  if (isNaN(tc) || isNaN(tas) || isNaN(wd) || isNaN(ws)) return;

  const windAngleRad = degToRad(wd - tc);
  const crosswind = ws * Math.sin(windAngleRad);
  const headwind = ws * Math.cos(windAngleRad);

  if (Math.abs(crosswind) >= tas) {
    alert("Wind exceeds aircraft capability for this course.");
    return;
  }

  const wcaRad = Math.asin(crosswind / tas);
  const wcaDeg = radToDeg(wcaRad);
  const gs = tas * Math.cos(wcaRad) - headwind;
  const th = normalizeHeading(tc + wcaDeg);

  // Update Wind Triangle UI
  document.getElementById("res-wca").innerText =
    Math.abs(Math.round(wcaDeg)) + "° " + (wcaDeg < 0 ? "L" : "R");
  document.getElementById("res-th").innerText =
    th.toString().padStart(3, "0") + "°";
  document.getElementById("res-gs").innerText = Math.round(gs) + " kts";
  document.getElementById("wind-results").classList.remove("hidden");

  // AUTO-POPULATE: Send Groundspeed to Performance Tab
  document.getElementById("gs_perf").value = Math.round(gs);
}

function calcAltitudes() {
  const el = parseFloat(document.getElementById("field_el").value);
  const altim = parseFloat(document.getElementById("altimeter").value);
  const oat = parseFloat(document.getElementById("oat_alt").value);

  if (isNaN(el) || isNaN(altim) || isNaN(oat)) return;

  // Pressure Altitude = Elevation + (29.92 - Altimeter) * 1000
  const pressAlt = el + (29.92 - altim) * 1000;
  
  // Standard Temp at Altitude = 15 - (2 * (PA/1000))
  const stdTemp = 15 - (2 * (pressAlt / 1000));
  
  // Density Altitude = Pressure Alt + (120 * (OAT - StdTemp))
  const densAlt = pressAlt + (120 * (oat - stdTemp));

  document.getElementById("res-press-alt").innerText = Math.round(pressAlt) + " ft";
  document.getElementById("res-dens-alt").innerText = Math.round(densAlt) + " ft";
  document.getElementById("alt-results").classList.remove("hidden");
}

function findActualWind() {
  const tc = parseFloat(document.getElementById("tc_solve").value);
  const gs = parseFloat(document.getElementById("gs_observed").value);
  const th = parseFloat(document.getElementById("th_observed").value);
  const tas = parseFloat(document.getElementById("tas_solve").value);

  if (isNaN(tc) || isNaN(gs) || isNaN(th) || isNaN(tas)) return;

  const wX = tas * Math.sin(degToRad(th)) - gs * Math.sin(degToRad(tc));
  const wY = tas * Math.cos(degToRad(th)) - gs * Math.cos(degToRad(tc));

  const windSpeed = Math.sqrt(wX * wX + wY * wY);
  let windDir = radToDeg(Math.atan2(-wX, -wY));

  document.getElementById("res-actual-wind").innerText =
    normalizeHeading(windDir).toString().padStart(3, "0") +
    "° @ " +
    Math.round(windSpeed) +
    " kts";
  document.getElementById("wind-results").classList.remove("hidden");
}

function calcTimeFuel() {
  const dist = parseFloat(document.getElementById("dist").value);
  const gs = parseFloat(document.getElementById("gs_perf").value);
  const rate = parseFloat(document.getElementById("burn_rate").value);

  if (isNaN(dist) || isNaN(gs) || isNaN(rate)) return;

  const timeHrs = dist / gs;
  const timeMins = Math.round(timeHrs * 60);
  const fuelReq = (timeHrs * rate).toFixed(1);

  document.getElementById("res-time").innerText = `${timeMins} min`;
  document.getElementById("res-fuel").innerText = `${fuelReq} gal`;
  document.getElementById("perf-results").classList.remove("hidden");
}

function calcTAS() {
  const ias = parseFloat(document.getElementById("speed_val").value);
  const alt = parseFloat(document.getElementById("alt_air").value);
  const tas = ias * (1 + (alt / 1000) * 0.02);

  document.getElementById("res-airspeed-label").innerText = "True Airspeed";
  document.getElementById("res-airspeed-val").innerText =
    Math.round(tas) + " kts";
  document.getElementById("perf-results").classList.remove("hidden");
}

function calcIAS() {
  const tas = parseFloat(document.getElementById("speed_val").value);
  const alt = parseFloat(document.getElementById("alt_air").value);
  const ias = tas / (1 + (alt / 1000) * 0.02);

  document.getElementById("res-airspeed-label").innerText =
    "Indicated Airspeed";
  document.getElementById("res-airspeed-val").innerText =
    Math.round(ias) + " kts";
  document.getElementById("perf-results").classList.remove("hidden");
}

// Magnus-Tetens Equation for Dewpoint
function calcDewpoint() {
  const T = parseFloat(document.getElementById("w-temp").value);
  const RH = parseFloat(document.getElementById("w-variable").value) / 100;

  if (isNaN(T) || isNaN(RH)) return;

  const gamma = ((MAG_A * T) / (MAG_B + T)) + Math.log(RH);
  const dp = (MAG_B * gamma) / (MAG_A - gamma);

  document.getElementById("res-weather-val").innerText =
    dp.toFixed(1) + " °C (Dewpoint)";
  document.getElementById("weather-results").classList.remove("hidden");
}

// Magnus-Tetens Equation for Relative Humidity
function calcHumidity() {
  const T = parseFloat(document.getElementById("w-temp").value);
  const DP = parseFloat(document.getElementById("w-variable").value);

  if (isNaN(T) || isNaN(DP)) return;

  const gammaT = (MAG_A * T) / (MAG_B + T);
  const gammaDP = (MAG_A * DP) / (MAG_B + DP);
  const rh = Math.exp(gammaDP - gammaT) * 100;

  document.getElementById("res-weather-val").innerText =
    Math.round(rh) + " % (Rel. Humidity)";
  document.getElementById("weather-results").classList.remove("hidden");
}