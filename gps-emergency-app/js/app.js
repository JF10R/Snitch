/**
 * GeoPin - GPS Emergency Location App
 * Main application logic
 */

import { encode, decode, formatCoords, distanceMeters } from './encoder.js';

// ─── State ──────────────────────────────────────────────────────────────────
let currentPosition = null;
let watchId = null;
let isTracking = false;
let coordFormat = 'decimal'; // 'decimal' or 'dms'
let wakeLock = null;

// ─── DOM Elements ───────────────────────────────────────────────────────────
const els = {};

function initElements() {
  const ids = [
    'geopin-code', 'coordinates', 'accuracy-value', 'accuracy-bar',
    'accuracy-indicator', 'altitude-value', 'speed-value', 'heading-value',
    'timestamp', 'btn-track', 'btn-copy', 'btn-share', 'btn-emergency',
    'btn-sms', 'btn-format', 'status-text', 'compass-arrow',
    'decode-input', 'decode-btn', 'decode-result', 'accuracy-fill',
    'signal-bars', 'gps-status-dot'
  ];
  ids.forEach(id => {
    els[id] = document.getElementById(id);
  });
}

// ─── GPS Tracking ───────────────────────────────────────────────────────────
function startTracking() {
  if (!navigator.geolocation) {
    setStatus('GPS not available on this device', 'error');
    return;
  }

  isTracking = true;
  els['btn-track'].textContent = 'Stop Tracking';
  els['btn-track'].classList.add('active');
  setStatus('Acquiring GPS signal...', 'searching');
  acquireWakeLock();

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    {
      enableHighAccuracy: true,   // Forces GPS hardware (not cell/wifi)
      maximumAge: 5000,           // Accept cached position up to 5s old
      timeout: 30000              // Wait up to 30s for GPS fix
    }
  );
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  isTracking = false;
  els['btn-track'].textContent = 'Start GPS';
  els['btn-track'].classList.remove('active');
  setStatus('GPS stopped', 'idle');
  releaseWakeLock();
}

function onPositionUpdate(position) {
  const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;

  currentPosition = {
    lat: latitude,
    lng: longitude,
    accuracy: accuracy,
    altitude: altitude,
    speed: speed,
    heading: heading,
    timestamp: position.timestamp
  };

  updateDisplay();
}

function onPositionError(error) {
  const messages = {
    1: 'Location permission denied. Please enable GPS access.',
    2: 'GPS signal unavailable. Move to an open area.',
    3: 'GPS request timed out. Retrying...'
  };
  setStatus(messages[error.code] || 'Unknown GPS error', 'error');
}

// ─── Display Updates ────────────────────────────────────────────────────────
function updateDisplay() {
  if (!currentPosition) return;

  const { lat, lng, accuracy, altitude, speed, heading, timestamp } = currentPosition;

  // GeoPin code
  const pin = encode(lat, lng);
  els['geopin-code'].textContent = pin.code;
  els['geopin-code'].classList.add('has-code');

  // Coordinates
  els['coordinates'].textContent = formatCoords(lat, lng, coordFormat);

  // Accuracy
  const accMeters = Math.round(accuracy);
  els['accuracy-value'].textContent = `±${accMeters}m`;
  updateAccuracyBar(accMeters);
  updateSignalBars(accMeters);

  // Altitude
  els['altitude-value'].textContent = altitude !== null
    ? `${Math.round(altitude)}m` : '—';

  // Speed
  if (speed !== null && speed > 0.5) {
    const kmh = (speed * 3.6).toFixed(1);
    els['speed-value'].textContent = `${kmh} km/h`;
  } else {
    els['speed-value'].textContent = '—';
  }

  // Heading / Compass
  if (heading !== null && !isNaN(heading)) {
    els['heading-value'].textContent = `${Math.round(heading)}°`;
    els['compass-arrow'].style.transform = `rotate(${heading}deg)`;
  } else {
    els['heading-value'].textContent = '—';
  }

  // Timestamp
  const time = new Date(timestamp);
  els['timestamp'].textContent = time.toLocaleTimeString();

  // Status
  if (accMeters <= 10) {
    setStatus('Excellent GPS fix', 'excellent');
  } else if (accMeters <= 30) {
    setStatus('Good GPS signal', 'good');
  } else if (accMeters <= 100) {
    setStatus('Moderate signal — move to open area', 'moderate');
  } else {
    setStatus('Weak signal — acquiring satellites...', 'weak');
  }
}

function updateAccuracyBar(meters) {
  // Map 0-200m to 100%-0% fill
  const pct = Math.max(0, Math.min(100, 100 - (meters / 2)));
  const fill = els['accuracy-fill'];
  if (fill) {
    fill.style.width = `${pct}%`;
    fill.className = 'accuracy-fill';
    if (meters <= 10) fill.classList.add('excellent');
    else if (meters <= 30) fill.classList.add('good');
    else if (meters <= 100) fill.classList.add('moderate');
    else fill.classList.add('weak');
  }
}

function updateSignalBars(meters) {
  const bars = els['signal-bars'];
  if (!bars) return;
  let level = 0;
  if (meters <= 5) level = 4;
  else if (meters <= 15) level = 3;
  else if (meters <= 50) level = 2;
  else if (meters <= 200) level = 1;
  bars.setAttribute('data-level', level);
}

function setStatus(text, level) {
  if (els['status-text']) els['status-text'].textContent = text;
  const dot = els['gps-status-dot'];
  if (dot) {
    dot.className = 'status-dot';
    if (level) dot.classList.add(level);
  }
}

// ─── Actions ────────────────────────────────────────────────────────────────
async function copyToClipboard() {
  if (!currentPosition) {
    showToast('No GPS fix yet');
    return;
  }

  const pin = encode(currentPosition.lat, currentPosition.lng);
  const text = [
    `GeoPin: ${pin.code}`,
    `GPS: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`,
    `Accuracy: ±${Math.round(currentPosition.accuracy)}m`,
    `Maps: https://maps.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`,
    `Time: ${new Date(currentPosition.timestamp).toISOString()}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    showToast('Location copied to clipboard');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Location copied');
  }
}

function shareLocation() {
  if (!currentPosition) {
    showToast('No GPS fix yet');
    return;
  }

  const pin = encode(currentPosition.lat, currentPosition.lng);
  const text = `EMERGENCY - My location:\nGeoPin: ${pin.code}\nGPS: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}\nAccuracy: ±${Math.round(currentPosition.accuracy)}m\nMap: https://maps.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`;

  if (navigator.share) {
    navigator.share({ title: 'My GPS Location', text }).catch(() => {});
  } else {
    copyToClipboard();
  }
}

function sendSMS() {
  if (!currentPosition) {
    showToast('No GPS fix yet');
    return;
  }

  const pin = encode(currentPosition.lat, currentPosition.lng);
  const body = encodeURIComponent(
    `EMERGENCY - My GPS Location:\n${pin.code}\n${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}\nMap: https://maps.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`
  );
  window.open(`sms:?body=${body}`, '_self');
}

function callEmergency() {
  const confirmed = confirm(
    'This will dial emergency services (112/911).\n\n' +
    'Your GeoPin location has been copied to clipboard.\n\n' +
    'Proceed with call?'
  );

  if (confirmed) {
    if (currentPosition) {
      const pin = encode(currentPosition.lat, currentPosition.lng);
      navigator.clipboard.writeText(
        `My location: ${pin.code} | GPS: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`
      ).catch(() => {});
    }
    window.open('tel:112', '_self');
  }
}

function toggleFormat() {
  coordFormat = coordFormat === 'decimal' ? 'dms' : 'decimal';
  els['btn-format'].textContent = coordFormat === 'decimal' ? 'DD' : 'DMS';
  updateDisplay();
}

function decodePinCode() {
  const input = els['decode-input'].value.trim();
  if (!input) return;

  const result = decode(input);
  if (result) {
    els['decode-result'].innerHTML = `
      <div class="decode-success">
        <div>${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}</div>
        <a href="https://maps.google.com/maps?q=${result.lat},${result.lng}"
           target="_blank" rel="noopener" class="map-link">Open in Maps</a>
      </div>`;
  } else {
    els['decode-result'].innerHTML =
      '<div class="decode-error">Invalid GeoPin code. Format: word-word-word-00</div>';
  }
}

// ─── Wake Lock (prevent screen sleep during tracking) ───────────────────────
async function acquireWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch {
      // Wake lock not available
    }
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// ─── Toast Notification ─────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ─── Initialization ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initElements();

  // Button handlers
  els['btn-track'].addEventListener('click', () => {
    isTracking ? stopTracking() : startTracking();
  });

  els['btn-copy'].addEventListener('click', copyToClipboard);
  els['btn-share'].addEventListener('click', shareLocation);
  els['btn-emergency'].addEventListener('click', callEmergency);
  els['btn-sms'].addEventListener('click', sendSMS);
  els['btn-format'].addEventListener('click', toggleFormat);
  els['decode-btn'].addEventListener('click', decodePinCode);

  els['decode-input'].addEventListener('keydown', (e) => {
    if (e.key === 'Enter') decodePinCode();
  });

  // Auto-start GPS
  startTracking();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
