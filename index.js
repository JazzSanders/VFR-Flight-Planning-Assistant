
      //Responsive Design for VFR Flight Planning Assistant: Web Application for CSC272
      //Author: Jasmine Sanders
      //Date: 02/21/2025

      //Filename: index.js
      //Required Files: 
      //Description: Responsive Design for VFR Flight Planning Assistant Web Application

document.getElementById('flight-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Gather Input Data
    const tc = parseFloat(document.getElementById('trueCourse').value);
    const tas = parseFloat(document.getElementById('trueAirspeed').value);
    const wd = parseFloat(document.getElementById('windDirection').value);
    const ws = parseFloat(document.getElementById('windSpeed').value);

    // Validate inputs
    if (isNaN(tc) || isNaN(tas) || isNaN(wd) || isNaN(ws)) {
        alert("Please ensure all fields are filled out correctly.");
        return;
    }

    // Helper functions for Aviation Math (Degrees <-> Radians)
    const degToRad = (deg) => deg * (Math.PI / 180);
    const radToDeg = (rad) => rad * (180 / Math.PI);

    // 2. Perform Calculations (Simulating the E6B Wind Triangle)
    // Calculate wind angle relative to course
    const windAngleRad = degToRad(wd - tc);

    // Calculate crosswind and headwind components
    const crosswind = ws * Math.sin(windAngleRad);
    const headwind = ws * Math.cos(windAngleRad);

    // Check if wind speed is greater than true airspeed (impossible to fly course)
    if (Math.abs(crosswind) >= tas) {
        alert("Wind speed is too high to maintain this course. (Crosswind exceeds TAS)");
        return;
    }

    // Calculate Wind Correction Angle (WCA)
    const wcaRad = Math.asin(crosswind / tas);
    let wcaDeg = radToDeg(wcaRad);

    // Calculate Groundspeed (GS)
    let gs = (tas * Math.cos(wcaRad)) - headwind;

    // Calculate True Heading (TH)
    let th = tc + wcaDeg;
    
    // Normalize True Heading to a 360-degree circle
    if (th >= 360) th -= 360;
    if (th < 0) th += 360;
    if (th === 0) th = 360; // Aviators use 360 instead of 0 for North

    // 3. Update the UI
    // Format WCA with an 'L' (Left/Minus) or 'R' (Right/Plus) suffix
    let wcaFormatted = Math.abs(Math.round(wcaDeg)) + '°';
    if (wcaDeg < -0.5) wcaFormatted += ' L';
    else if (wcaDeg > 0.5) wcaFormatted += ' R';
    else wcaFormatted = '0°';

    // Output values rounded to nearest whole number per FAA standards
    document.getElementById('wca-result').innerText = wcaFormatted;
    document.getElementById('heading-result').innerText = Math.round(th).toString().padStart(3, '0') + '°';
    document.getElementById('gs-result').innerText = Math.round(gs) + ' kts';

    // Reveal the results panel
    document.getElementById('results-panel').classList.remove('hidden');
});