/**
 * GeoPin Encoder - Converts GPS coordinates to memorable 3-word + 2-digit codes
 *
 * Encoding scheme:
 * - Total capacity: 2048^3 * 100 = 858,993,459,200 cells
 * - Latitude steps: 655,360 (180° range → ~30m resolution)
 * - Longitude steps: 1,310,720 (360° range → ~30m resolution at equator)
 * - Product: 655,360 * 1,310,720 = 858,993,459,200 (fits exactly)
 * - Effective accuracy: ~30m everywhere (well within emergency rescue range)
 */

import { WORD_LIST } from './words.js';

const WORD_COUNT = 2048;
const DIGIT_COUNT = 100; // 00-99
const TOTAL_CAPACITY = WORD_COUNT * WORD_COUNT * WORD_COUNT * DIGIT_COUNT; // 858,993,459,200
const LAT_STEPS = 655360;
const LNG_STEPS = 1310720;

/**
 * Encode GPS coordinates to a GeoPin code
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lng - Longitude (-180 to 180)
 * @returns {{ code: string, words: string[], digits: string }}
 */
export function encode(lat, lng) {
  // Clamp to valid ranges
  lat = Math.max(-90, Math.min(90, lat));
  lng = Math.max(-180, Math.min(180, lng));

  // Normalize to index ranges
  const latIndex = Math.round(((lat + 90) / 180) * (LAT_STEPS - 1));
  const lngIndex = Math.round(((lng + 180) / 360) * (LNG_STEPS - 1));

  // Combine into a single number
  let combined = latIndex * LNG_STEPS + lngIndex;

  // Extract word and digit indices (least-significant first)
  const word3Index = combined % WORD_COUNT;
  combined = Math.floor(combined / WORD_COUNT);
  const word2Index = combined % WORD_COUNT;
  combined = Math.floor(combined / WORD_COUNT);
  const word1Index = combined % WORD_COUNT;
  combined = Math.floor(combined / WORD_COUNT);
  const digitsPart = combined % DIGIT_COUNT;

  const digits = String(digitsPart).padStart(2, '0');
  const words = [
    WORD_LIST[word1Index],
    WORD_LIST[word2Index],
    WORD_LIST[word3Index]
  ];

  return {
    code: `${words[0]}-${words[1]}-${words[2]}-${digits}`,
    words,
    digits
  };
}

/**
 * Decode a GeoPin code back to GPS coordinates
 * @param {string} code - GeoPin code (e.g., "forest-river-eagle-73")
 * @returns {{ lat: number, lng: number } | null}
 */
export function decode(code) {
  const parts = code.toLowerCase().trim().split('-');
  if (parts.length !== 4) return null;

  const [w1, w2, w3, digitStr] = parts;
  const digits = parseInt(digitStr, 10);
  if (isNaN(digits) || digits < 0 || digits >= DIGIT_COUNT) return null;

  const i1 = WORD_LIST.indexOf(w1);
  const i2 = WORD_LIST.indexOf(w2);
  const i3 = WORD_LIST.indexOf(w3);
  if (i1 === -1 || i2 === -1 || i3 === -1) return null;

  // Reconstruct the combined number
  const combined = ((digits * WORD_COUNT + i1) * WORD_COUNT + i2) * WORD_COUNT + i3;

  const lngIndex = combined % LNG_STEPS;
  const latIndex = Math.floor(combined / LNG_STEPS);

  if (latIndex >= LAT_STEPS || lngIndex >= LNG_STEPS) return null;

  const lat = (latIndex / (LAT_STEPS - 1)) * 180 - 90;
  const lng = (lngIndex / (LNG_STEPS - 1)) * 360 - 180;

  return { lat, lng };
}

/**
 * Calculate distance between two GPS points in meters (Haversine formula)
 */
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format coordinates for display
 */
export function formatCoords(lat, lng, format = 'decimal') {
  if (format === 'dms') {
    return `${toDMS(lat, 'N', 'S')} ${toDMS(lng, 'E', 'W')}`;
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function toDMS(decimal, pos, neg) {
  const direction = decimal >= 0 ? pos : neg;
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = ((minutesFloat - minutes) * 60).toFixed(1);
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}
