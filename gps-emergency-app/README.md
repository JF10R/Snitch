# GeoPin - GPS Emergency Location App

A GPS-based emergency location app that converts your precise satellite coordinates into a memorable **3-word + 2-digit code** — like What3Words, but built on actual GPS hardware positioning. Works offline, in the countryside, and deep in the woods.

## How It Works

**GeoPin** uses your device's GPS satellite receiver (`enableHighAccuracy: true`) to get a precise fix, then encodes it as a short, speakable code:

```
forest-river-eagle-73
```

This code maps to a ~20-40m area anywhere on Earth — accurate enough for emergency services to find you.

### Encoding Scheme

- **2048 common English words** — easy to say over a phone or radio
- **3 words + 2 digits** = 40 bits of location data
- **20 bits latitude** (~19m resolution) + **20 bits longitude** (~38m at equator)
- Fully deterministic: same coordinates always produce the same code
- Bidirectional: codes decode back to GPS coordinates

## Features

- **True GPS positioning** — uses satellite hardware, not cell tower triangulation
- **Offline capable** — PWA with service worker; works after first load without internet
- **Emergency call** — one-tap call to 112/911 with location auto-copied
- **Share via SMS** — pre-formatted emergency message with coordinates + map link
- **Copy to clipboard** — GeoPin code, GPS coords, accuracy, and Google Maps link
- **Native share** — uses Web Share API on supported devices
- **Decode codes** — enter any GeoPin code to see its location on a map
- **Real-time stats** — accuracy, altitude, speed, compass heading
- **Signal strength indicator** — visual GPS signal quality display
- **Screen wake lock** — prevents screen from sleeping during tracking
- **Dark theme** — high contrast, mobile-first design
- **Coordinate formats** — toggle between decimal degrees and DMS

## Why GPS Over Cell Towers?

| Feature | Cell Tower | GPS Satellite |
|---------|-----------|---------------|
| Accuracy in cities | ~100-300m | ~3-10m |
| Accuracy in countryside | ~1-5km | ~3-10m |
| Works in deep woods | Poorly or not at all | Yes |
| Works without cell signal | No | Yes |
| Works offline | No | Yes |

GPS receivers talk directly to satellites — no cell network needed. GeoPin forces `enableHighAccuracy: true` to ensure the GPS chip is used instead of falling back to cell/wifi positioning.

## Quick Start

1. Open `index.html` in any modern browser
2. Allow location permission when prompted
3. Wait for GPS fix (may take 10-30 seconds outdoors)
4. Your GeoPin code appears — share it in an emergency

### Serve locally (for HTTPS required by some browsers):

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

## Project Structure

```
gps-emergency-app/
├── index.html          # App shell
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline support)
├── css/
│   └── style.css       # Dark theme, mobile-first
├── js/
│   ├── app.js          # Main app logic (GPS, UI, sharing)
│   ├── encoder.js      # Coordinate ↔ GeoPin encoding/decoding
│   └── words.js        # 2048-word list for location codes
└── README.md
```

## Technical Details

### GPS Accuracy Tips

- **Best**: Outdoors with clear sky view (3-10m)
- **Good**: Near windows, open areas (10-30m)
- **Moderate**: Urban canyons, light tree cover (30-100m)
- **Poor**: Indoors, deep valleys, dense forest canopy (100m+)

The app shows real-time accuracy readings so you know exactly how reliable your position is.

### Browser Compatibility

Works on all modern browsers with Geolocation API:
- Chrome/Edge 50+
- Firefox 55+
- Safari 11+
- Chrome for Android
- Safari for iOS

### No Dependencies

Zero npm packages. Zero build step. Zero external APIs. Just HTML, CSS, and vanilla JavaScript. Open `index.html` and go.

## License

MIT
