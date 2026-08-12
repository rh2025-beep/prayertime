import { Capacitor } from '@capacitor/core';

// Check if Native Compass Plugin is available
const isNativeCompassAvailable = () => {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Compass');
};

/**
 * Shortest path angle interpolation to prevent 360 <-> 0 wrap-around spinning
 */
export const interpolateAngle = (current, previous, factor = 0.25) => {
  if (previous === null || previous === undefined) return current;
  let diff = current - previous;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  if (Math.abs(diff) < 0.01) return previous;
  return (previous + diff * factor + 360) % 360;
};

/**
 * Calculate Approximate Magnetic Declination using World Magnetic Model approximation
 * if native GeomagneticField is not active (web fallback)
 */
export const calculateWebDeclination = (lat, lng) => {
  if (!lat || !lng) return 0;
  // Approximate dipole declination formula fallback for web
  const rad = Math.PI / 180;
  const latRad = lat * rad;
  const lngRad = lng * rad;
  // Simple approximation coefficient
  const decl = (lngRad * Math.sin(latRad) * (180 / Math.PI)) * 0.15;
  return Math.round(decl * 10) / 10;
};

export const getCardinalDirection = (deg) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return directions[idx];
};

/**
 * Subscribe to compass orientation updates (Native or Web fallback)
 */
export const subscribeCompass = (options, onUpdate) => {
  const { lat = 0, lng = 0, alt = 0, useTrueNorth = true } = options || {};
  let lastHeading = null;
  let pluginListenerHandle = null;
  let webListener = null;

  if (isNativeCompassAvailable()) {
    const Compass = Capacitor.Plugins.Compass;

    Compass.startCompass({ lat, lng, alt, trueNorth: useTrueNorth })
      .then(() => {
        try {
          const res = Compass.addListener('compassUpdate', (data) => {
            const heading = data.heading !== undefined ? data.heading : data.trueHeading;
            const nextHeading = interpolateAngle(heading, lastHeading, 0.35);
            lastHeading = nextHeading;

            onUpdate({
              heading: nextHeading,
              magneticHeading: data.magneticHeading,
              trueHeading: data.trueHeading,
              declination: data.declination,
              useTrueNorth: data.useTrueNorth,
              accuracy: data.accuracy || 'medium',
              pitch: data.pitch || 0,
              roll: data.roll || 0,
              isFlat: data.isFlat !== undefined ? data.isFlat : true,
              cardinal: data.cardinal || getCardinalDirection(nextHeading),
              isNative: true
            });
          });
          if (res && typeof res.then === 'function') {
            res.then((h) => { pluginListenerHandle = h; }).catch(() => {});
          } else {
            pluginListenerHandle = res;
          }
        } catch (e) {
          console.warn("Compass addListener error, falling back to Web", e);
          startWebFallback();
        }
      })
      .catch((err) => {
        console.warn("Native Compass start error, falling back to Web", err);
        startWebFallback();
      });

    return () => {
      if (pluginListenerHandle) {
        pluginListenerHandle.remove();
      }
      Compass.stopCompass().catch(() => {});
    };
  } else {
    startWebFallback();
    return () => {
      if (webListener) {
        window.removeEventListener('deviceorientationabsolute', webListener, true);
        window.removeEventListener('deviceorientation', webListener, true);
      }
    };
  }

  function startWebFallback() {
    const webDeclination = calculateWebDeclination(lat, lng);

    webListener = (e) => {
      let rawHeading = null;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        // iOS WebKit
        rawHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        const betaVal = e.beta || 0;
        const gammaVal = e.gamma || 0;
        const isFlat = Math.abs(betaVal) < 30 && Math.abs(gammaVal) < 30;

        if (isFlat) {
          rawHeading = (360 - e.alpha) % 360;
        } else {
          // Tilt-compensated calculation from Android web orientation
          const alpha = e.alpha * (Math.PI / 180);
          const beta = betaVal * (Math.PI / 180);
          const gamma = gammaVal * (Math.PI / 180);

          const ca = Math.cos(alpha);
          const sa = Math.sin(alpha);
          const sb = Math.sin(beta);
          const cg = Math.cos(gamma);
          const sg = Math.sin(gamma);

          const rA = -ca * sg - sa * sb * cg;
          const rB = -sa * sg + ca * sb * cg;

          let heading = Math.atan2(rA, rB);
          rawHeading = (heading * (180 / Math.PI) + 360) % 360;
          if (Number.isNaN(rawHeading)) {
            rawHeading = (360 - e.alpha) % 360;
          }
        }
      }

      if (rawHeading === null || Number.isNaN(rawHeading)) return;

      const magneticHeading = (rawHeading + 360) % 360;
      const trueHeading = (magneticHeading + webDeclination + 360) % 360;
      const finalHeading = useTrueNorth ? trueHeading : magneticHeading;

      const nextHeading = interpolateAngle(finalHeading, lastHeading, 0.25);
      lastHeading = nextHeading;

      const betaVal = e.beta || 0;
      const gammaVal = e.gamma || 0;
      const isFlat = Math.abs(betaVal) < 30 && Math.abs(gammaVal) < 30;

      onUpdate({
        heading: nextHeading,
        magneticHeading: Math.round(magneticHeading * 10) / 10,
        trueHeading: Math.round(trueHeading * 10) / 10,
        declination: webDeclination,
        useTrueNorth,
        accuracy: 'medium',
        pitch: Math.round(betaVal),
        roll: Math.round(gammaVal),
        isFlat,
        cardinal: getCardinalDirection(nextHeading),
        isNative: false
      });
    };

    window.addEventListener('deviceorientationabsolute', webListener, true);
    window.addEventListener('deviceorientation', webListener, true);
  }
};
