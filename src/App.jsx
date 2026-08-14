import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Clock, MapPin, Sun, Moon, Sunrise, Sunset, CloudSun, Locate, Search, Compass, ChevronDown, ArrowLeft, Info, Maximize, AlertTriangle, RefreshCw, Compass as CompassIcon, Download, Bell, BellOff } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import Screensaver from './components/Screensaver';
import './App.css';
import { formatNumber, formatTime, getMinutes, formatTimeDiff, getDayName, getMonthName, getForbiddenTimes, checkCurrentForbidden, calculateOfflinePrayerTimes } from './utils';
import { initAudioContext, playSoundSample, requestNotificationPermission, schedulePrayerNotifications } from './services/notificationService';
import { subscribeCompass } from './services/compassService';

// --- Custom Hooks ---
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return (stickyValue !== null && stickyValue !== 'undefined') ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  }, [key, value]);
  return [value, setValue];
}

// --- Constants & Translations ---
const PRAYERS = {
  bn: [
    { key: "Fajr", name: "ফজর", icon: <Sun size={24} /> },
    { key: "Dhuhr", name: "যোহর", icon: <Sun size={24} /> },
    { key: "Asr", name: "আসর", icon: <CloudSun size={24} /> },
    { key: "Maghrib", name: "মাগরিব", icon: <Sunset size={24} /> },
    { key: "Isha", name: "ইশা", icon: <Moon size={24} /> }
  ],
  en: [
    { key: "Fajr", name: "Fajr", icon: <Sun size={24} /> },
    { key: "Dhuhr", name: "Dhuhr", icon: <Sun size={24} /> },
    { key: "Asr", name: "Asr", icon: <CloudSun size={24} /> },
    { key: "Maghrib", name: "Maghrib", icon: <Sunset size={24} /> },
    { key: "Isha", name: "Isha", icon: <Moon size={24} /> }
  ]
};

const t = {
  bn: {
    appTitle: "সালাতের সময়", settings: "সেটিংস", theme: "থিম", hijri: "হিজরি", loading: "লোড হচ্ছে...", timeRemaining: "শেষ হতে বাকি", timeStarting: "শুরু হতে বাকি", waiting: "অপেক্ষমান", timeElapsed: "সময় অতিবাহিত", next: "পরবর্তী", start: "শুরু", end: "শেষ", sunrise: "সূর্যোদয়", sunset: "সূর্যাস্ত", midnight: "ইসলামিক মধ্যরাত", lastThird: "শেষ তৃতীয়াংশ শুরু", asrMethod: "আসরের মাজহাব", standard: "স্ট্যান্ডার্ড (শাফি)", hanafi: "হানাফি", language: "ভাষা", searchCity: "শহর খুঁজুন...", searching: "খোঁজা হচ্ছে...", locationError: "অবস্থান পাওয়া যায়নি", localTime: "স্থানীয় সময়", searchBtn: "খুঁজুন", searchLoc: "অবস্থান খুঁজুন", cancel: "বাতিল", bangladeshTime: "বাংলাদেশ সময়", qibla: "কিবলা", qiblaTitle: "কিবলা কম্পাস", qiblaDegree: "কিবলার দিক", north: "উত্তর", deviceHeading: "ডিভাইস হেডিং", permissionRequired: "সেন্সর ব্যবহারের অনুমতি প্রয়োজন", enableCompass: "কম্পাস চালু করুন", light: "লাইট মোড", dark: "ডার্ক মোড", installApp: "সালাতের সময়সূচী অ্যাপটি আপনার ফোনে ইনস্টল করুন", installBtn: "ইনস্টল করুন", dismissBtn: "এখনই নয়", errorLoading: "সময়সূচী লোড করা সম্ভব হয়নি। ইন্টারনেট কানেকশন চেক করুন।", retryBtn: "আবার চেষ্টা করুন", hijriAdjustment: "হিজরি তারিখ সমন্বয়", kaabaDirection: "কাবা শরীফের দিক", distanceToKaaba: "কাবা থেকে দূরত্ব", yourDirection: "আপনার দিক", kilometer: "কিলোমিটার", helpfulTips: "সহায়ক টিপস", tipsText: "কম্পাস সঠিকভাবে কাজ করার জন্য ম্যাগনেটিক জিনিস থেকে দূরে থাকুন এবং ফোনটি সমতলভাবে ধরুন।", compassInsecure: "অনিরাপদ HTTP সংযোগে ব্রাউজার কম্পাস অ্যাক্সেস ব্লক করেছে। অনুগ্রহ করে HTTPS বা localhost ব্যবহার করুন।", compassUnsupported: "আপনার ডিভাইস বা ব্রাউজারে কম্পাস সেন্সর পাওয়া যায়নি।",
    downloadModalTitle: "অ্যান্ড্রয়েড অ্যাপ ডাউনলোড", downloadModalDesc: "Enjoy offline Azan alerts, widget support, and Qibla compass.", downloadBtn: "ডাউনলোড APK",
    forbiddenTimes: "সালাতের নিষিদ্ধ সময়", forbiddenNotice: "এই ৩টি সময়ে যেকোনো সালাত আদায় করা নিষিদ্ধ", forbiddenSunrise: "সূর্যোদয়কালীন", forbiddenZawal: "দ্বিপ্রহর (জাওয়াল)", forbiddenSunset: "সূর্যাস্তকালীন", currentlyForbidden: "বর্তমান সময় সালাতের নিষিদ্ধ সময়", sunriseForbiddenTip: "সূর্য ওঠার পর ১৫ মি.", zawalForbiddenTip: "যোহরের ১০ মি. পূর্বে", sunsetForbiddenTip: "সূর্যাস্তের ১৫ মি. পূর্বে",
    trueNorth: "ট্রু নর্থ (GPS)", magneticNorth: "ম্যাগনেটিক নর্থ", declinationLabel: "ডিক্লিনেশন", sensorAccuracy: "সেন্সর সঠিকতা", accuracyHigh: "উচ্চ", accuracyMedium: "মাঝারি", accuracyLow: "কম", accuracyUnreliable: "অনির্ভরযোগ্য", calibrateTitle: "সেন্সর ক্যালিব্রেশন", calibrateGuide: "কম্পাসের সঠিকতা বাড়াতে ফোনটি ৩D স্পেসে ৮ (Figure-8) আকৃতিতে কয়েকবার ঘোরান।", tiltWarning: "কম্পাসের সঠিক ফলাফলের জন্য ফোনটি সমতল রাখুন",
    offlineNotice: "অফলাইন মোড: অ্যাস্ট্রোনমিক্যাল সোলার গণনা সক্রিয়"
  },
  en: {
    appTitle: "Prayer Times", settings: "Settings", theme: "Theme", hijri: "Hijri", loading: "Loading...", timeRemaining: "Ends In", timeStarting: "Starts In", waiting: "Waiting", timeElapsed: "Time Elapsed", next: "Next", start: "Start", end: "End", sunrise: "Sunrise", sunset: "Sunset", midnight: "Islamic Midnight", lastThird: "Last Third of Night", asrMethod: "Asr Method", standard: "Standard (Shafi)", hanafi: "Hanafi", language: "Language", searchCity: "Search city...", searching: "Searching...", locationError: "Location not found", localTime: "Local Time", searchBtn: "Search", searchLoc: "Search Location", cancel: "Cancel", bangladeshTime: "Local Time", qibla: "Qibla", qiblaTitle: "Qibla Compass", qiblaDegree: "Qibla Direction", north: "North", deviceHeading: "Heading", permissionRequired: "Sensor Permission Required", enableCompass: "Enable Compass", light: "Light Mode", dark: "Dark Mode", installApp: "Install the app for quick access to prayer times", installBtn: "Install", dismissBtn: "Not Now", errorLoading: "Failed to load prayer times. Check your internet connection.", retryBtn: "Retry", hijriAdjustment: "Hijri Date Adjustment", kaabaDirection: "Kaaba Direction", distanceToKaaba: "Distance to Kaaba", yourDirection: "Your Direction", kilometer: "km", helpfulTips: "Helpful Tips", tipsText: "Keep away from magnetic items and hold the device flat for accuracy.", compassInsecure: "Compass sensor is blocked on insecure HTTP. Please access using HTTPS or localhost.", compassUnsupported: "Compass sensor is not supported by your device or browser.",
    downloadModalTitle: "Download Android App", downloadModalDesc: "Enjoy offline Azan alerts, widget support, and Qibla compass.", downloadBtn: "Download APK",
    forbiddenTimes: "Prohibited Prayer Times", forbiddenNotice: "Prayer is prohibited during these 3 times", forbiddenSunrise: "Sunrise Period", forbiddenZawal: "Midday (Zawal)", forbiddenSunset: "Sunset Period", currentlyForbidden: "Current time is a Prohibited Prayer Time", sunriseForbiddenTip: "15 mins after sunrise", zawalForbiddenTip: "10 mins before Dhuhr", sunsetForbiddenTip: "15 mins before sunset",
    trueNorth: "True North (GPS)", magneticNorth: "Magnetic North", declinationLabel: "Declination", sensorAccuracy: "Sensor Accuracy", accuracyHigh: "High", accuracyMedium: "Medium", accuracyLow: "Low", accuracyUnreliable: "Unreliable", calibrateTitle: "Sensor Calibration", calibrateGuide: "Rotate device in a 3D figure-8 pattern to calibrate magnetic sensor.", tiltWarning: "Hold your device flat for best compass accuracy",
    offlineNotice: "Offline Mode: Solar astronomical calculation active"
  }
};

const hijriMonthsBn = {
  "Muharram": "মহররম", "Safar": "সফর", "Ṣafar": "সফর", "Rabi Al-Awwal": "রবিউল আউয়াল", "Rabi Al-Akhar": "রবিউস সানি", "Jumada Al-Awwal": "জুমাদাল আউয়াল", "Jumada Al-Akhirah": "জুমাদাস সানি", "Rajab": "রজব", "Sha'ban": "শাবান", "Ramadan": "রমজান", "Shawwal": "শাওয়াল", "Dhu Al-Qidah": "জিলকদ", "Dhu Al-Hijjah": "জিলহজ"
};

const MosqueIcon = () => (
  <svg viewBox="0 0 100 50" className="mosque-header-svg" style={{ fill: 'currentColor' }}>
    {/* Base structure */}
    <path d="M15 45h70v3H15zm10-18h50v18H25z" opacity="0.9" />
    
    {/* Center Dome */}
    <path d="M38 27c0-8 6-12 12-12s12 4 12 12H38z" />
    
    {/* Left Small Dome */}
    <path d="M28 27c0-5 3-7 7-7s7 2 7 7H28z" opacity="0.8" />
    
    {/* Right Small Dome */}
    <path d="M58 27c0-5 3-7 7-7s7 2 7 7H58z" opacity="0.8" />

    {/* Left Minaret */}
    <path d="M18 15h4v30h-4zm1-3c0-2 1-3 1-3s1 1 1 3h-2z" />
    <path d="M16 15h8v2h-8z" />
    
    {/* Right Minaret */}
    <path d="M78 15h4v30h-4zm1-3c0-2 1-3 1-3s1 1 1 3h-2z" />
    <path d="M76 15h8v2h-8z" />
  </svg>
);

// --- Qibla Calculation ---
const calculateQibla = (lat, lng) => {
  const phiK = 21.4225 * Math.PI / 180;
  const lambdaK = 39.8262 * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const lambda = lng * Math.PI / 180;
  const deltaLambda = lambdaK - lambda;
  
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  let qibla = Math.atan2(y, x) * 180 / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla);
};

// --- Distance & Direction Helpers ---
const calculateDistance = (lat1, lon1) => {
  const lat2 = 21.4225; // Kaaba Latitude
  const lon2 = 39.8262; // Kaaba Longitude
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const getDirectionName = (deg, lang) => {
  const directionsBn = ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"];
  const directionsEn = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  const idx = Math.round(deg / 45) % 8;
  return lang === 'bn' ? directionsBn[idx] : directionsEn[idx];
};

const KaabaIcon3D = () => (
  <svg viewBox="0 0 100 100" width="36" height="36">
    <path d="M50 25 L15 40 L15 75 L50 60 Z" fill="#2d2d2d" />
    <path d="M50 25 L85 40 L85 75 L50 60 Z" fill="#1a1a1a" />
    <path d="M50 25 L15 40 L50 55 L85 40 Z" fill="#404040" />
    <path d="M15 45 L50 33 L50 38 L15 50 Z" fill="#fbbf24" />
    <path d="M85 45 L50 33 L50 38 L85 50 Z" fill="#fbbf24" />
    <path d="M55 47 L55 67 L70 73 L70 53 Z" fill="#fbbf24" opacity="0.9" />
  </svg>
);

const adjustHijriDate = (hijri, offset, lang) => {
  if (!hijri) return '';
  let day = parseInt(hijri.day);
  let monthNum = parseInt(hijri.month.number);
  let year = parseInt(hijri.year);
  
  if (offset !== 0) {
    day += offset;
    const getMonthDays = (m, y) => {
      if (m === parseInt(hijri.month.number, 10)) {
        return parseInt(hijri.month.days, 10) || (m % 2 === 1 ? 30 : 29);
      }
      if (m === 12) {
        const isLeap = (11 * y + 14) % 30 < 11;
        return isLeap ? 30 : 29;
      }
      return m % 2 === 1 ? 30 : 29;
    };

    while (day > getMonthDays(monthNum, year)) {
      day -= getMonthDays(monthNum, year);
      monthNum += 1;
      if (monthNum > 12) {
        monthNum = 1;
        year += 1;
      }
    }
    while (day <= 0) {
      monthNum -= 1;
      if (monthNum < 1) {
        monthNum = 12;
        year -= 1;
      }
      day += getMonthDays(monthNum, year);
    }
  }

  const hijriMonthNamesEn = [
    "Muharram", "Safar", "Rabi Al-Awwal", "Rabi Al-Akhar", 
    "Jumada Al-Awwal", "Jumada Al-Akhirah", "Rajab", "Sha'ban", 
    "Ramadan", "Shawwal", "Dhu Al-Qidah", "Dhu Al-Hijjah"
  ];
  const monthNameEn = hijriMonthNamesEn[Math.max(0, Math.min(11, monthNum - 1))];
  const month = lang === 'bn' ? (hijriMonthsBn[monthNameEn] || monthNameEn) : monthNameEn;
  
  return `${formatNumber(day, lang)} ${month} ${formatNumber(year, lang)}`;
};

const getPrayerEndTime = (key, timings) => {
  if (!timings) return '';
  switch (key) {
    case 'Fajr':
      return timings.Sunrise;
    case 'Dhuhr':
      return timings.Asr;
    case 'Asr':
      return timings.Sunset || timings.Maghrib;
    case 'Maghrib':
      return timings.Isha;
    case 'Isha':
      return timings.Fajr;
    default:
      return '';
  }
};

function App() {
  const [theme, setTheme] = useStickyState('light', 'app-theme');
  const [colorTheme, setColorTheme] = useStickyState('emerald', 'app-color-theme');
  const [widgetStyle, setWidgetStyle] = useStickyState('theme', 'app-widget-style');
  const [notifConfig, setNotifConfig] = useStickyState({
    sound: 'bird_chirp',
    fajrNotif: true,
    dhuhrNotif: true,
    asrNotif: true,
    maghribNotif: true,
    ishaNotif: true
  }, 'app-notif-config');
  const [config, setConfig] = useStickyState({
    lat: 23.8103,
    lng: 90.4125,
    city: 'Dhaka',
    country: 'Bangladesh',
    school: 0,
    lang: 'bn',
    hijriOffset: 0
  }, 'app-config');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [timings, setTimings] = useState(() => {
    try {
      return calculateOfflinePrayerTimes(23.8103, 90.4125, new Date(), 0);
    } catch {
      return null;
    }
  });

  const [dateInfo, setDateInfo] = useState(() => {
    try {
      const dateNow = new Date();
      const year = dateNow.getFullYear();
      const month = dateNow.getMonth() + 1;
      const day = dateNow.getDate();

      let a = Math.floor((14 - month) / 12);
      let y = year + 4800 - a;
      let m = month + 12 * a - 3;
      let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

      let islamicDays = Math.floor(jd - 1948439.5);
      let islamicYears = Math.floor(islamicDays / 354.367);
      let hijriYear = 1 + islamicYears;
      let daysInYear = Math.floor(islamicDays - (islamicYears * 354.367));
      let hijriMonth = Math.min(12, Math.max(1, Math.floor(daysInYear / 29.5) + 1));
      let hijriDay = Math.min(30, Math.max(1, Math.floor(daysInYear % 29.5) + 1));

      return {
        readable: dateNow.toDateString(),
        hijri: {
          day: hijriDay.toString(),
          month: { number: hijriMonth.toString(), days: 30 },
          year: hijriYear.toString()
        }
      };
    } catch {
      return null;
    }
  });
  const [isOfflineData, setIsOfflineData] = useState(false);

  // Initialize Capacitor Status Bar
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Light }); // Light style gives dark text on light backgrounds
    }
  }, []);
  const [metaInfo, setMetaInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [activePrayer, setActivePrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [prevMilestone, setPrevMilestone] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [fetchDateStr, setFetchDateStr] = useState(new Date().toDateString());
  const [apiError, setApiError] = useState(null);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);

  // Listen for Android launcher app shortcut intents (e.g. Qibla Compass, Settings)
  useEffect(() => {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('AppShortcut')) {
      const handleAction = (act) => {
        if (!act) return;
        if (act.includes('OPEN_QIBLA')) {
          setIsQiblaOpen(true);
        } else if (act.includes('OPEN_SETTINGS')) {
          setIsSettingsOpen(true);
        }
      };

      Capacitor.Plugins.AppShortcut.getInitialAction()
        .then((res) => {
          if (res && res.action) handleAction(res.action);
        })
        .catch((err) => console.warn("AppShortcut error", err));

      let handle = null;
      if (typeof Capacitor.Plugins.AppShortcut.addListener === 'function') {
        try {
          const res = Capacitor.Plugins.AppShortcut.addListener('shortcutTriggered', (data) => {
            if (data && data.action) handleAction(data.action);
          });
          if (res && typeof res.then === 'function') {
            res.then((h) => { handle = h; }).catch(() => {});
          } else {
            handle = res;
          }
        } catch (e) {
          console.warn("AppShortcut addListener error", e);
        }
      }

      return () => {
        if (handle && typeof handle.remove === 'function') handle.remove();
      };
    }
  }, []);

  // Error boundary effect
  useEffect(() => {
    const handleError = (e) => {
      console.error('App error:', e.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Handle Android Hardware Back Button & Browser History Back Navigation
  useEffect(() => {
    const isAnyModalActive = isScreensaverActive || isQiblaOpen || isSearchOpen || isSettingsOpen;
    if (isAnyModalActive) {
      try {
        window.history.pushState({ modalOpen: true }, '');
      } catch {}
    }

    const handleHardwareBack = (e) => {
      if (isScreensaverActive) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setIsScreensaverActive(false);
      } else if (isQiblaOpen) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setIsQiblaOpen(false);
      } else if (isSearchOpen) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setIsSearchOpen(false);
      } else if (isSettingsOpen) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('backbutton', handleHardwareBack, false);
    window.addEventListener('popstate', handleHardwareBack, false);

    let appListenerHandle = null;
    if (Capacitor.isNativePlatform()) {
      try {
        const res = CapacitorApp.addListener('backButton', (data) => {
          if (isScreensaverActive) {
            setIsScreensaverActive(false);
          } else if (isQiblaOpen) {
            setIsQiblaOpen(false);
          } else if (isSearchOpen) {
            setIsSearchOpen(false);
          } else if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else if (data && data.canGoBack) {
            window.history.back();
          } else {
            CapacitorApp.minimizeApp();
          }
        });
        if (res && typeof res.then === 'function') {
          res.then((h) => { appListenerHandle = h; }).catch(() => {});
        } else {
          appListenerHandle = res;
        }
      } catch (err) {
        console.error("Capacitor App backButton listener error", err);
      }
    }

    return () => {
      document.removeEventListener('backbutton', handleHardwareBack, false);
      window.removeEventListener('popstate', handleHardwareBack, false);
      if (appListenerHandle && typeof appListenerHandle.remove === 'function') {
        appListenerHandle.remove();
      }
    };
  }, [isScreensaverActive, isQiblaOpen, isSearchOpen, isSettingsOpen]);

  const closeModalState = (setModalState) => {
    setModalState(false);
    if (window.history.state?.modalOpen) {
      window.history.back();
    }
  };

  const closeScreensaver = () => closeModalState(setIsScreensaverActive);
  const closeQibla = () => closeModalState(setIsQiblaOpen);
  const closeSettings = () => closeModalState(setIsSettingsOpen);
  const closeSearch = () => closeModalState(setIsSearchOpen);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = window.localStorage.getItem('pwa-install-dismissed');
      if (isDismissed !== 'true' && !Capacitor.isNativePlatform()) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Prompt Android mobile web visitors to download the APK directly
    const isAndroidBrowser = /Android/i.test(navigator.userAgent) && !Capacitor.isNativePlatform();
    const isDismissed = window.localStorage.getItem('apk-download-dismissed');
    if (isAndroidBrowser && isDismissed !== 'true') {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = () => {
    const targetUrl = 'https://github.com/drrezwanul-png/Prayertime/releases/download/v1/prayertime.apk';
    window.location.href = targetUrl;
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    window.localStorage.setItem('pwa-install-dismissed', 'true');
    window.localStorage.setItem('apk-download-dismissed', 'true');
  };

  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [hasCompassPermission, setHasCompassPermission] = useState(null);
  const [isAligned, setIsAligned] = useState(false);
  const [compassError, setCompassError] = useState('');
  const [useTrueNorth, setUseTrueNorth] = useStickyState(true, 'app-use-true-north');
  const [sensorAccuracy, setSensorAccuracy] = useState('medium');
  const [declination, setDeclination] = useState(0);
  const [cardinal, setCardinal] = useState('N');
  const [isFlat, setIsFlat] = useState(true);
  const [showCalibrationHelp, setShowCalibrationHelp] = useState(false);

  useEffect(() => {
    if (!isQiblaOpen) {
      setIsAligned(false);
      return;
    }
    const diff = Math.abs((qiblaAngle - (heading || 0) + 180) % 360 - 180);
    const currentlyAligned = diff < 5;
    
    if (currentlyAligned && !isAligned) {
      if (navigator.vibrate) {
        navigator.vibrate([200]);
      }
    }
    setIsAligned(currentlyAligned);
  }, [heading, qiblaAngle, isQiblaOpen, isAligned]);

  const lang = config.lang;
  const str = t[lang];
  const prayersList = PRAYERS[lang];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-theme', `${colorTheme}-${theme}`);
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
    }
  }, [theme, colorTheme]);

  useEffect(() => {
    if (timings) {
      schedulePrayerNotifications(timings, notifConfig, lang);
    }
  }, [timings, notifConfig, lang]);

  // Re-fetch timings when date shifts or location/school config changes
  useEffect(() => {
    let activeFetch = true;
    const nowLocal = new Date();
    const yyyy = nowLocal.getFullYear();
    const mm = String(nowLocal.getMonth() + 1).padStart(2, '0');
    const dd = String(nowLocal.getDate()).padStart(2, '0');
    const todayKey = `${yyyy}-${mm}-${dd}`;
    const cacheKey = `prayer_cache_${Number(config.lat).toFixed(2)}_${Number(config.lng).toFixed(2)}_${config.school}_${todayKey}`;

    // Instant load from cache if available
    let hasLoadedFromCache = false;
    const cachedDataStr = localStorage.getItem(cacheKey);
    if (cachedDataStr) {
      try {
        const cached = JSON.parse(cachedDataStr);
        setTimings(cached.timings);
        setDateInfo(cached.date);
        setMetaInfo(cached.meta);
        setIsOfflineData(false);
        hasLoadedFromCache = true;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    const fetchTimings = async () => {
      try {
        setApiError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${config.lat}&longitude=${config.lng}&method=1&school=${config.school}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("API response error");
        const data = await res.json();
        if (data.code === 200 && activeFetch) {
          setTimings(data.data.timings);
          setDateInfo(data.data.date);
          setMetaInfo(data.data.meta);
          setApiError(null);
          setIsOfflineData(false);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.data));
          } catch (e) {
            console.error("Cache write error", e);
          }
        } else {
          throw new Error("Invalid API payload");
        }
      } catch (err) {
        if (activeFetch) {
          console.error("Failed to fetch timings, using offline solar calculation engine", err);
          let loadedFromPreviousCache = false;
          if (!hasLoadedFromCache) {
            // Check for any previous cached day
            const keys = Object.keys(localStorage).filter(k => k.startsWith(`prayer_cache_${Number(config.lat).toFixed(2)}_${Number(config.lng).toFixed(2)}`));
            if (keys.length > 0) {
              const fallbackStr = localStorage.getItem(keys[keys.length - 1]);
              if (fallbackStr) {
                try {
                  const fb = JSON.parse(fallbackStr);
                  if (fb && fb.timings && fb.date) {
                    setTimings(fb.timings);
                    setDateInfo(fb.date);
                    setMetaInfo(fb.meta || null);
                    setIsOfflineData(true);
                    setApiError(null);
                    loadedFromPreviousCache = true;
                  }
                } catch {}
              }
            }
          }

          if (!hasLoadedFromCache && !loadedFromPreviousCache) {
            // Offline Solar Engine & Hijri Date Approximation
            const calcTimings = calculateOfflinePrayerTimes(config.lat, config.lng, new Date(), config.school);
            setTimings(calcTimings);

            const dateNow = new Date();
            const year = dateNow.getFullYear();
            const month = dateNow.getMonth() + 1;
            const day = dateNow.getDate();

            let a = Math.floor((14 - month) / 12);
            let y = year + 4800 - a;
            let m = month + 12 * a - 3;
            let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

            let islamicDays = Math.floor(jd - 1948439.5);
            let islamicYears = Math.floor(islamicDays / 354.367);
            let hijriYear = 1 + islamicYears;
            let daysInYear = Math.floor(islamicDays - (islamicYears * 354.367));
            let hijriMonth = Math.min(12, Math.max(1, Math.floor(daysInYear / 29.5) + 1));
            let hijriDay = Math.min(30, Math.max(1, Math.floor(daysInYear % 29.5) + 1));

            setDateInfo({
              readable: dateNow.toDateString(),
              hijri: {
                day: hijriDay.toString(),
                month: { number: hijriMonth.toString(), days: 30 },
                year: hijriYear.toString()
              }
            });
            setIsOfflineData(true);
            setApiError(null);
          } else {
            setIsOfflineData(true);
          }
        }
      }
    };
    fetchTimings();
    setQiblaAngle(calculateQibla(config.lat, config.lng));
    return () => { activeFetch = false; };
  }, [config.lat, config.lng, config.school, fetchDateStr]);

  // 1-second timer to update current time and track day transitions (midnight crossings)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const todayStr = now.toDateString();
      setFetchDateStr((prev) => {
        if (prev !== todayStr) {
          return todayStr;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!timings) return;
    
    const tzTime = (metaInfo && metaInfo.timezone) ? (() => {
       try {
         return new Date(currentTime.toLocaleString("en-US", { timeZone: metaInfo.timezone }));
       } catch {
         return currentTime;
       }
     })() : currentTime;

    const nowMin = tzTime.getHours() * 60 + tzTime.getMinutes();
    const nowSec = tzTime.getSeconds();
    const nowTotalSec = nowMin * 60 + nowSec;

    const fajrMin = getMinutes(timings.Fajr);
    const sunriseMin = getMinutes(timings.Sunrise);
    const dhuhrMin = getMinutes(timings.Dhuhr);
    const asrMin = getMinutes(timings.Asr);
    const maghribMin = getMinutes(timings.Sunset || timings.Maghrib);
    const ishaMin = getMinutes(timings.Isha);

    // Map the 6 continuous timeline intervals across 24 hours
    const intervals = [
      {
        key: 'Fajr',
        name: lang === 'bn' ? 'ফজর' : 'Fajr',
        time: timings.Fajr,
        startMin: fajrMin,
        endMin: sunriseMin,
        isPrayer: true,
        nextPrayerKey: 'Sunrise',
        nextPrayerName: lang === 'bn' ? 'সূর্যোদয়' : 'Sunrise',
        nextPrayerTargetMin: sunriseMin
      },
      {
        key: 'Sunrise',
        name: lang === 'bn' ? 'সূর্যোদয়' : 'Sunrise',
        time: timings.Sunrise,
        startMin: sunriseMin,
        endMin: dhuhrMin,
        isPrayer: false,
        nextPrayerKey: 'Dhuhr',
        nextPrayerName: lang === 'bn' ? 'যোহর' : 'Dhuhr',
        nextPrayerTargetMin: dhuhrMin
      },
      {
        key: 'Dhuhr',
        name: lang === 'bn' ? 'যোহর' : 'Dhuhr',
        time: timings.Dhuhr,
        startMin: dhuhrMin,
        endMin: asrMin,
        isPrayer: true,
        nextPrayerKey: 'Asr',
        nextPrayerName: lang === 'bn' ? 'আসর' : 'Asr',
        nextPrayerTargetMin: asrMin
      },
      {
        key: 'Asr',
        name: lang === 'bn' ? 'আসর' : 'Asr',
        time: timings.Asr,
        startMin: asrMin,
        endMin: maghribMin,
        isPrayer: true,
        nextPrayerKey: 'Maghrib',
        nextPrayerName: lang === 'bn' ? 'মাগরিব' : 'Maghrib',
        nextPrayerTargetMin: maghribMin
      },
      {
        key: 'Maghrib',
        name: lang === 'bn' ? 'মাগরিব' : 'Maghrib',
        time: timings.Maghrib || timings.Sunset,
        startMin: maghribMin,
        endMin: ishaMin,
        isPrayer: true,
        nextPrayerKey: 'Isha',
        nextPrayerName: lang === 'bn' ? 'ইশা' : 'Isha',
        nextPrayerTargetMin: ishaMin
      },
      {
        key: 'Isha',
        name: lang === 'bn' ? 'ইশা' : 'Isha',
        time: timings.Isha,
        startMin: ishaMin,
        endMin: fajrMin + 24 * 60,
        isPrayer: true,
        nextPrayerKey: 'Fajr',
        nextPrayerName: lang === 'bn' ? 'ফজর' : 'Fajr',
        nextPrayerTargetMin: fajrMin
      }
    ];

    let currentInterval = null;
    let cMin = nowMin;

    for (let interval of intervals) {
      let intervalStart = interval.startMin;
      let intervalEnd = interval.endMin;
      let checkMin = nowMin;

      if (interval.key === 'Isha' && nowMin < fajrMin) {
        checkMin = nowMin + 24 * 60;
      }

      if (checkMin >= intervalStart && checkMin < intervalEnd) {
        currentInterval = interval;
        cMin = checkMin;
        break;
      }
    }

    if (!currentInterval) {
      currentInterval = intervals[0];
    }

    // Prev Milestone / Start Label
    setPrevMilestone({
      name: currentInterval.name,
      time: currentInterval.time
    });

    // Active Prayer (if current interval is a prayer interval, e.g. Fajr, Dhuhr, Asr, Maghrib, Isha)
    if (currentInterval.isPrayer) {
      const activeP = prayersList.find(p => p.key === currentInterval.key) || null;
      setActivePrayer(activeP);
    } else {
      setActivePrayer(null);
    }

    // Next Prayer
    const nextP = prayersList.find(p => p.key === currentInterval.nextPrayerKey) || {
      key: currentInterval.nextPrayerKey,
      name: currentInterval.nextPrayerName
    };
    setNextPrayer(nextP);

    // Time left until next prayer
    let targetSec = currentInterval.nextPrayerTargetMin * 60;
    if (currentInterval.nextPrayerTargetMin < nowMin && (nowMin >= ishaMin || currentInterval.key === 'Isha')) {
      targetSec += 24 * 60 * 60;
    }
    const remainingSec = targetSec - nowTotalSec;
    setTimeLeft(Math.max(0, remainingSec));

    // Progress percentage of the current interval
    const totalDurationSec = (currentInterval.endMin - currentInterval.startMin) * 60;
    const elapsedSec = ((cMin - currentInterval.startMin) * 60) + nowSec;
    const calcProgress = (elapsedSec / totalDurationSec) * 100;
    setProgressPercent(Math.min(100, Math.max(0, calcProgress)));

  }, [currentTime, timings, prayersList, metaInfo, lang]);

  // Sync Android Home Screen Widget payload & notify native widget manager immediately
  useEffect(() => {
    if (nextPrayer && timings && prevMilestone) {
      try {
        const startLabelStr = `${prevMilestone.name} ${formatTime(prevMilestone.time, lang)}`;
        const endLabelStr = `${nextPrayer.name} ${formatTime(timings[nextPrayer.key], lang)}`;
        const widgetPayload = {
          nextPrayerName: nextPrayer.name,
          nextPrayerTime: timings[nextPrayer.key],
          countdown: `${formatTimeDiff(timeLeft, lang)} ${lang === 'bn' ? 'বাকি' : 'left'}`,
          startLabel: startLabelStr,
          endLabel: endLabelStr,
          progress: Math.min(100, Math.max(0, Math.round(progressPercent))),
          colorTheme: colorTheme,
          widgetStyle: widgetStyle,
          timings: timings
        };

        if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('PrayerWidget')) {
          Capacitor.Plugins.PrayerWidget.updateWidget({
            colorTheme: colorTheme,
            widgetStyle: widgetStyle,
            data: widgetPayload
          }).catch((e) => console.warn("PrayerWidget plugin failed", e));
        }

        localStorage.setItem('widget_data', JSON.stringify(widgetPayload));
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
          window.Capacitor.Plugins.Preferences.set({ key: 'widget_data', value: JSON.stringify(widgetPayload) });
        }
      } catch (e) {
        console.warn("Widget sync failed", e);
      }
    }
  }, [nextPrayer, prevMilestone, timings, timeLeft, progressPercent, lang, colorTheme, widgetStyle]);

  // Compass Sensor Logic via Native Plugin / Web Fallback
  useEffect(() => {
    if (!isQiblaOpen) return;

    if (!window.DeviceOrientationEvent && !Capacitor.isNativePlatform()) {
      setCompassError('unsupported');
      return;
    }

    if (window.isSecureContext === false && !Capacitor.isNativePlatform()) {
      setCompassError('insecure');
      return;
    }

    setCompassError('');

    const unsubscribe = subscribeCompass(
      {
        lat: config.lat,
        lng: config.lng,
        useTrueNorth
      },
      (data) => {
        setHeading(data.heading);
        setSensorAccuracy(data.accuracy || 'medium');
        setDeclination(data.declination || 0);
        setCardinal(data.cardinal || 'N');
        setIsFlat(data.isFlat !== undefined ? data.isFlat : true);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isQiblaOpen, useTrueNorth, config.lat, config.lng]);

  // Auto-set compass permission for Android/Desktop (no prompt needed), prompt on iOS
  useEffect(() => {
    if (isQiblaOpen && hasCompassPermission === null) {
      const needsPrompt = typeof DeviceOrientationEvent !== 'undefined' && 
                          typeof DeviceOrientationEvent.requestPermission === 'function';
      if (needsPrompt) {
        setHasCompassPermission(false);
      } else {
        setHasCompassPermission(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQiblaOpen]);

  const requestCompassPermission = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            setHasCompassPermission(true);
          } else {
            setHasCompassPermission(false);
          }
        })
        .catch(() => setHasCompassPermission(false));
    } else {
      // Android/WP: No permission needed, auto-granted
      setHasCompassPermission(true);
    }
  };

  // --- GPS Auto-Location ---
  const detectLocation = () => {
    if (!navigator.geolocation) return alert(str.locationError);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const langCode = lang === 'bn' ? 'bn' : 'en';
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${langCode}`);
        const data = await res.json();
        setConfig(c => ({
          ...c,
          lat: latitude,
          lng: longitude,
          city: data.locality || data.city || 'Local',
          country: data.countryName || 'GPS Location'
        }));
      } catch {
        setConfig(c => ({...c, lat: latitude, lng: longitude, city: 'GPS Location', country: ''}));
      }
    }, () => alert(str.locationError));
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 3) return setSearchResults([]);
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${lang}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const selectLocation = (item) => {
    const addressParts = (item.display_name || '').split(',');
    const city = addressParts[0] ? addressParts[0].trim() : 'Location';
    const country = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : '';
    setConfig(c => ({ ...c, lat: parseFloat(item.lat), lng: parseFloat(item.lon), city, country }));
    closeSearch();
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!timings || !dateInfo) {
    if (apiError) {
      return (
        <div style={{padding: '2rem', textAlign: 'center', color: '#0a251a'}}>
          <p>{str.errorLoading}</p>
          <button onClick={() => setFetchDateStr(new Date().toDateString())} style={{marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#166534', color: 'white', border: 'none'}}>
            {str.retryBtn}
          </button>
        </div>
      );
    }
    return <div style={{padding: '2rem', textAlign: 'center', color: '#0a251a'}}>{str.loading}</div>;
  }

  const renderFormattedTime = (time24, extraClass = "") => {
    const formattedStr = formatTime(time24, lang);
    const parts = formattedStr.split(' ');
    if (parts.length > 1) {
      return (
        <span className={`formatted-time ${extraClass}`}>
          {parts[0]}<span className="time-suffix-ampm" style={{
            fontSize: '0.65em',
            fontWeight: '300',
            marginLeft: '3px',
            textTransform: 'lowercase',
            opacity: 0.85
          }}>{parts[1]}</span>
        </span>
      );
    }
    return <span className={`formatted-time ${extraClass}`}>{formattedStr}</span>;
  };

  const getHijriDate = (hijri) => {
    const offset = config.hijriOffset || 0;
    return adjustHijriDate(hijri, offset, lang);
  };

  const getGregorianDate = (activeTime) => {
    return `${formatNumber(activeTime.getDate(), lang)} ${getMonthName(activeTime.getMonth(), lang)} ${formatNumber(activeTime.getFullYear(), lang)}`;
  };

const tzTime = (metaInfo && metaInfo.timezone) ? (() => {
       try {
         return new Date(currentTime.toLocaleString("en-US", { timeZone: metaInfo.timezone }));
       } catch {
         return currentTime;
       }
     })() : currentTime;

  const currentHour = tzTime.getHours();
  const currentMin = tzTime.getMinutes();
  const currentMinStr = currentMin < 10 ? `0${currentMin}` : `${currentMin}`;

  const forbiddenTimesInfo = timings ? getForbiddenTimes(timings) : null;
  const nowMin = currentHour * 60 + currentMin;
  const activeForbiddenKey = checkCurrentForbidden(nowMin, forbiddenTimesInfo);
  const isCurrentForbidden = Boolean(activeForbiddenKey);

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* HEADER */}
        <div className="header" style={{ alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ width: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button className="action-btn" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); setIsSettingsOpen(true); }} title={str.settings} aria-label={str.settings}>
              <Settings size={24} />
            </button>
          </div>
          <div className="header-title-container" style={{ marginTop: 0 }}>
            <MosqueIcon />
            <span className="header-title-text" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', fontWeight: '800', color: 'var(--primary-green)', marginTop: '4px' }}>{str.appTitle}</span>
            <div className="title-divider" style={{ width: '100px', height: '10px' }}></div>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '4px' }}>
            {Capacitor.isNativePlatform() ? (
              <button className="action-btn" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); setIsQiblaOpen(true); }} title={str.qibla} aria-label={str.qibla}>
                <Compass size={24} />
              </button>
            ) : (
              <button className="action-btn" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); handleInstallApp(); }} title={lang === 'bn' ? 'অ্যাপ ডাউনলোড করুন' : 'Download App'} aria-label="Download App">
                <Download size={24} style={{ color: 'var(--primary-green)' }} />
              </button>
            )}
          </div>
        </div>

        {/* LOCATION BAR */}
        <div className="location-bar-card" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); setIsSearchOpen(true); }} style={{
          background: 'var(--card-bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '0.25rem'
        }}>
          <div className="location-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <MapPin size={24} style={{ color: 'var(--primary-green)' }} />
            <div className="location-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="location-city" style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>{config.city}</span>
                <ChevronDown size={16} style={{ marginTop: '2px', color: 'var(--text-muted)' }} />
              </div>
              <span className="location-country" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{config.country || (lang === 'bn' ? "আপনার অবস্থান" : "Your Location")}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); detectLocation(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto', display: 'flex', padding: '6px' }} title="Use GPS" aria-label="Use GPS">
              <Locate size={20} />
            </button>
          </div>
        </div>

        {/* OFFLINE MODE WARNING BANNER */}
        {isOfflineData && (
          <div className="offline-warning-banner">
            <AlertTriangle size={18} />
            <span>{lang === 'bn' ? 'অফলাইন মোড (সংরক্ষিত সময়সূচী দেখানো হচ্ছে)' : 'Offline Mode (Showing Cached Schedule)'}</span>
          </div>
        )}

        {/* CURRENTLY FORBIDDEN TIME WARNING BANNER */}
        {isCurrentForbidden && forbiddenTimesInfo && (
          <div className="forbidden-warning-banner" style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: 'white',
            borderRadius: '18px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
            marginBottom: '0.25rem'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.2px' }}>
                ⚠️ {str.currentlyForbidden}
              </span>
              <span style={{ fontSize: '0.82rem', opacity: 0.95, fontWeight: '500', marginTop: '2px' }}>
                {(() => {
                  const nowTotalSec = currentHour * 3600 + currentMin * 60 + tzTime.getSeconds();
                  const remainingSec = activeForbiddenKey && forbiddenTimesInfo ? (forbiddenTimesInfo[activeForbiddenKey].endMin * 60 - nowTotalSec) : 0;
                  const timeDiffFormatted = formatTimeDiff(remainingSec, lang, true);
                  return (
                    <>
                      {activeForbiddenKey === 'sunrise' && (
                        <>{str.forbiddenSunrise}: {renderFormattedTime(forbiddenTimesInfo.sunrise.startTimeStr)} - {renderFormattedTime(forbiddenTimesInfo.sunrise.endTimeStr)} ({timeDiffFormatted} {lang === 'bn' ? 'বাকি' : 'left'})</>
                      )}
                      {activeForbiddenKey === 'zawal' && (
                        <>{str.forbiddenZawal}: {renderFormattedTime(forbiddenTimesInfo.zawal.startTimeStr)} - {renderFormattedTime(forbiddenTimesInfo.zawal.endTimeStr)} ({timeDiffFormatted} {lang === 'bn' ? 'বাকি' : 'left'})</>
                      )}
                      {activeForbiddenKey === 'sunset' && (
                        <>{str.forbiddenSunset}: {renderFormattedTime(forbiddenTimesInfo.sunset.startTimeStr)} - {renderFormattedTime(forbiddenTimesInfo.sunset.endTimeStr)} ({timeDiffFormatted} {lang === 'bn' ? 'বাকি' : 'left'})</>
                      )}
                    </>
                  );
                })()}
              </span>
            </div>
          </div>
        )}

        {/* SPLIT TIMELINE PRAYER CARD (MIDDLE UI) */}
        <div className="active-prayer-card" style={{
          background: 'var(--active-gradient)',
          borderRadius: '24px',
          padding: '1.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Split info grid */}
          <div className="split-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Left side: Current time */}
            <div className="split-col left-col" style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', textAlign: 'center' }}>
              <span className="col-label" style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {lang === 'bn' ? 'এখন সময়' : 'Current Time'}
              </span>
              <span className="col-time" style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>
                {renderFormattedTime(`${currentHour}:${currentMinStr}`)}
              </span>
              <span className="col-sub" style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '6px', fontWeight: '500' }}>
                {str.localTime}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="split-divider" style={{ width: '1px', height: '65px', background: 'rgba(255, 255, 255, 0.25)', margin: '0 0.5rem' }}></div>

            {/* Right side: Next prayer */}
            <div className="split-col right-col" style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', textAlign: 'center' }}>
              <span className="col-label" style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {lang === 'bn' ? `পরবর্তী: ${nextPrayer ? nextPrayer.name : ''}` : `Next: ${nextPrayer ? nextPrayer.name : ''}`}
              </span>
              <span className="col-time" style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>
                {nextPrayer ? renderFormattedTime(timings[nextPrayer.key]) : '--:--'}
              </span>
              <span className="col-sub" style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '6px', fontWeight: '500' }}>
                {nextPrayer ? `(${formatTimeDiff(timeLeft, lang)} ${lang === 'bn' ? 'বাকি' : 'left'})` : ''}
              </span>
            </div>
          </div>

          {/* Timeline slider component */}
          <div className="slider-progress-wrapper" style={{ marginTop: '0.25rem', position: 'relative', zIndex: 1 }}>
            <div className="slider-track-container" style={{ position: 'relative', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px' }}>
              <div className="slider-track-fill" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPercent}%`, background: isCurrentForbidden ? '#ef4444' : 'var(--progress-bar-color, #4ade80)', borderRadius: '3px', transition: 'background-color 0.3s ease, width 0.4s ease' }}></div>
            </div>
            <div className="slider-labels" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', fontSize: 'clamp(0.78rem, 3.4vw, 0.92rem)', fontWeight: '700', opacity: 0.95, position: 'relative' }}>
              <span className="slider-label-left" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '38%' }}>
                {prevMilestone ? <>{prevMilestone.name} {renderFormattedTime(prevMilestone.time)}</> : ''}
              </span>
              
              {/* Screensaver Trigger Button - Locked Dead-Center */}
              <button 
                className="glass-trigger-btn"
                onClick={() => setIsScreensaverActive(true)}
                title={lang === 'bn' ? 'স্ক্রিনসেভার চালু করুন' : 'Start Screensaver'}
                aria-label={lang === 'bn' ? 'স্ক্রিনসেভার চালু করুন' : 'Start Screensaver'}
                style={{ margin: 0, width: '36px', height: '36px', flexShrink: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
              >
                <Maximize size={18} />
              </button>

              <span className="slider-label-right" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '38%', marginLeft: 'auto' }}>
                {nextPrayer ? <>{nextPrayer.name} {renderFormattedTime(timings[nextPrayer.key])}</> : ''}
              </span>
            </div>
          </div>
        </div>

        {/* DUAL DATE CARDS */}
        <div className="dual-date-cards" style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="date-card" style={{
            background: 'var(--card-bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '0.75rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
            flex: 1,
            minWidth: 0
          }}>
            <div style={{ background: 'rgba(22, 101, 52, 0.1)', padding: '6px', borderRadius: '50%', display: 'flex', color: 'var(--primary-green)', flexShrink: 0 }}>
              <Calendar size={20} />
            </div>
            <div className="date-card-text" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span className="date-card-main" style={{ fontWeight: '800', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', color: 'var(--text-main)', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word' }}>{getGregorianDate(tzTime)}</span>
              <span className="date-card-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>{getDayName(tzTime.getDay(), lang)}</span>
            </div>
          </div>
          
          <div className="date-card" style={{
            background: 'var(--card-bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '0.75rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
            flex: 1,
            minWidth: 0
          }}>
            <div style={{ background: 'rgba(22, 101, 52, 0.1)', padding: '6px', borderRadius: '50%', display: 'flex', color: 'var(--primary-green)', flexShrink: 0 }}>
              <Moon size={20} />
            </div>
            <div className="date-card-text" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span className="date-card-main" style={{ fontWeight: '800', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', color: 'var(--text-main)', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word' }}>{getHijriDate(dateInfo.hijri)}</span>
              <span className="date-card-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '1px' }}>{str.hijri}</span>
            </div>
          </div>
        </div>

        {/* FORBIDDEN PRAYER TIMES CARD */}
        {forbiddenTimesInfo && (
          <div className="forbidden-times-card" style={{
            background: 'var(--card-bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isCurrentForbidden ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '1.1rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  background: isCurrentForbidden ? 'rgba(239, 68, 68, 0.15)' : 'rgba(217, 119, 6, 0.12)',
                  color: isCurrentForbidden ? '#ef4444' : '#d97706',
                  padding: '7px',
                  borderRadius: '50%',
                  display: 'flex'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', display: 'block', lineHeight: 1.2 }}>
                    {str.forbiddenTimes}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {str.forbiddenNotice}
                  </span>
                </div>
              </div>
              {isCurrentForbidden && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  {lang === 'bn' ? 'চলমান' : 'Active'}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {/* Sunrise Forbidden */}
              <div style={{
                background: activeForbiddenKey === 'sunrise' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-main)',
                border: activeForbiddenKey === 'sunrise' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Sunrise size={18} style={{ color: activeForbiddenKey === 'sunrise' ? '#ef4444' : '#d97706' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>{str.forbiddenSunrise}</span>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', lineHeight: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeForbiddenKey === 'sunrise' ? '#ef4444' : 'var(--primary-green)' }}>
                  <span>{renderFormattedTime(forbiddenTimesInfo.sunrise.startTimeStr)}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.75, margin: '-1px 0' }}>{lang === 'bn' ? 'থেকে' : 'to'}</span>
                  <span>{renderFormattedTime(forbiddenTimesInfo.sunrise.endTimeStr)}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{str.sunriseForbiddenTip}</span>
              </div>

              {/* Zawal Forbidden */}
              <div style={{
                background: activeForbiddenKey === 'zawal' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-main)',
                border: activeForbiddenKey === 'zawal' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Sun size={18} style={{ color: activeForbiddenKey === 'zawal' ? '#ef4444' : '#d97706' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>{str.forbiddenZawal}</span>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', lineHeight: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeForbiddenKey === 'zawal' ? '#ef4444' : 'var(--primary-green)' }}>
                  <span>{renderFormattedTime(forbiddenTimesInfo.zawal.startTimeStr)}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.75, margin: '-1px 0' }}>{lang === 'bn' ? 'থেকে' : 'to'}</span>
                  <span>{renderFormattedTime(forbiddenTimesInfo.zawal.endTimeStr)}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{str.zawalForbiddenTip}</span>
              </div>

              {/* Sunset Forbidden */}
              <div style={{
                background: activeForbiddenKey === 'sunset' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-main)',
                border: activeForbiddenKey === 'sunset' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Sunset size={18} style={{ color: activeForbiddenKey === 'sunset' ? '#ef4444' : '#d97706' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>{str.forbiddenSunset}</span>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', lineHeight: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeForbiddenKey === 'sunset' ? '#ef4444' : 'var(--primary-green)' }}>
                  <span>{renderFormattedTime(forbiddenTimesInfo.sunset.startTimeStr)}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.75, margin: '-1px 0' }}>{lang === 'bn' ? 'থেকে' : 'to'}</span>
                  <span>{renderFormattedTime(forbiddenTimesInfo.sunset.endTimeStr)}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{str.sunsetForbiddenTip}</span>
              </div>
            </div>
          </div>
        )}



        {/* ADDITIONAL TIMES FOOTER */}
        <div className="additional-times">
          <div className="add-time-item">
            <Sunrise size={20} className="add-time-icon" />
            <div className="add-time-texts">
              <span className="add-time-label">{str.sunrise}</span>
              <span className="add-time-val">{renderFormattedTime(timings.Sunrise)}</span>
            </div>
          </div>
          <div className="add-time-item">
            <Sunset size={20} className="add-time-icon" />
            <div className="add-time-texts">
              <span className="add-time-label">{str.sunset}</span>
              <span className="add-time-val">{renderFormattedTime(timings.Sunset)}</span>
            </div>
          </div>
          <div className="add-time-item">
            <Moon size={20} className="add-time-icon" style={{color: '#94a3b8'}} />
            <div className="add-time-texts">
              <span className="add-time-label">{str.midnight}</span>
              <span className="add-time-val">{renderFormattedTime(timings.Midnight)}</span>
            </div>
          </div>
          <div className="add-time-item">
            <Clock size={20} className="add-time-icon" style={{color: '#94a3b8'}} />
            <div className="add-time-texts">
              <span className="add-time-label">{str.lastThird}</span>
              <span className="add-time-val">{renderFormattedTime(timings.Lastthird)}</span>
            </div>
          </div>
        </div>

        {/* PRAYER LIST */}
        <div className="prayer-list-card">
          {prayersList.map((p) => {
            const isAct = activePrayer && activePrayer.key === p.key;
            const endTimeStr = getPrayerEndTime(p.key, timings);
            return (
              <div key={p.key} className={`prayer-list-item ${isAct ? 'active' : ''}`}>
                <div className="pl-left">
                  <div className="pl-icon" style={{background: isAct ? 'none' : 'rgba(76, 166, 97, 0.1)', padding: '6px', borderRadius: '50%', display: 'flex'}}>{p.icon}</div>
                  <div className="pl-name-group">
                    <span className="pl-name" style={{color: isAct ? 'var(--primary-green)' : 'var(--text-main)'}}>{p.name}</span>
                    {isAct && (
                      <span className="badge-active">
                        {lang === 'bn' ? 'চলমান' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pl-middle">
                  <span className="pl-time-val" style={{color: isAct ? 'var(--primary-green)' : 'var(--text-main)'}}>{renderFormattedTime(timings[p.key])}</span>
                </div>
                <div className="pl-right">
                  <span className="pl-time-val" style={{color: isAct ? 'var(--primary-green)' : 'var(--text-main)'}}>{renderFormattedTime(endTimeStr)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SETTINGS FULLSCREEN VIEW */}
        {isSettingsOpen && (
          <div className="fullscreen-view">
            <div className="fullscreen-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="fullscreen-back-btn" onClick={closeSettings} title="Back" aria-label="Back">
                  <ArrowLeft size={22} />
                </button>
                <span className="fullscreen-title">{str.settings}</span>
              </div>
            </div>

            <div className="fullscreen-content">
              <div className="setting-group">
                <label className="setting-label">{str.asrMethod}</label>
                <div className="toggle-container">
                  <button 
                    className={`toggle-btn ${config.school === 0 ? 'active' : ''}`}
                    onClick={() => setConfig({...config, school: 0})}
                  >
                    {str.standard}
                  </button>
                  <button 
                    className={`toggle-btn ${config.school === 1 ? 'active' : ''}`}
                    onClick={() => setConfig({...config, school: 1})}
                  >
                    {str.hanafi}
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">{str.theme}</label>
                <div className="toggle-container" style={{ marginBottom: '0.5rem' }}>
                  <button 
                    className={`toggle-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    {str.light}
                  </button>
                  <button 
                    className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    {str.dark}
                  </button>
                </div>

                {/* Color Palette Theme Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {[
                    { id: 'emerald', labelBn: 'সবুজ', labelEn: 'Green', color: '#166534' },
                    { id: 'midnight', labelBn: 'নীল', labelEn: 'Blue', color: '#1d4e89' },
                    { id: 'sand', labelBn: 'কমলা', labelEn: 'Orange', color: '#8a6b3f' },
                    { id: 'velvet', labelBn: 'বেগুনি', labelEn: 'Purple', color: '#5b3c88' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setColorTheme(item.id)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '10px',
                        border: colorTheme === item.id ? `2px solid ${item.color}` : '1px solid var(--border-color)',
                        background: colorTheme === item.id ? 'var(--list-active-bg)' : 'var(--bg-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {lang === 'bn' ? item.labelBn : item.labelEn}
                      </span>
                    </button>
                  ))}
                </div>

                {/* WIDGET THEME & GLASS TRANSPARENCY SETTINGS */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                  <label className="setting-label" style={{ fontWeight: '800', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                    {lang === 'bn' ? 'হোম স্ক্রিন উইজেট স্টাইল' : 'Home Screen Widget Style'}
                  </label>
                  <div className="toggle-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    <button 
                      className={`toggle-btn ${widgetStyle === 'theme' ? 'active' : ''}`}
                      onClick={() => setWidgetStyle('theme')}
                    >
                      🎨 {lang === 'bn' ? 'থিম কালার ম্যাচ' : 'Theme Match'}
                    </button>
                    <button 
                      className={`toggle-btn ${widgetStyle === 'glass' ? 'active' : ''}`}
                      onClick={() => setWidgetStyle('glass')}
                    >
                      ✨ {lang === 'bn' ? 'গ্লাস ইফেক্ট (Translucent)' : 'Frosted Glass'}
                    </button>
                  </div>
                </div>
              </div>

              {/* NOTIFICATION & AUDIO SETTINGS */}
              <div className="setting-group" style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="setting-label" style={{ margin: 0, fontWeight: '800' }}>
                    {lang === 'bn' ? 'আযান ও নোটিফিকেশন শব্দ' : 'Azan & Notification Sound'}
                  </span>
                  <button
                    onClick={async () => {
                      initAudioContext();
                      const granted = await requestNotificationPermission();
                      alert(granted ? (lang === 'bn' ? 'অনুমতি প্রদান করা হয়েছে' : 'Notification permission granted') : (lang === 'bn' ? 'অনুমতি দেওয়া হয়নি' : 'Permission denied'));
                    }}
                    style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', background: 'var(--active-gradient)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                  >
                    {lang === 'bn' ? 'অনুমতি দিন' : 'Grant Perm'}
                  </button>
                </div>

                {/* Sound Selection Dropdown/Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '0.75rem' }}>
                  {[
                    { id: 'makkah', labelBn: 'আযান (Azan)', labelEn: 'Azan Sound' },
                    { id: 'bird_chirp', labelBn: 'পাখির ডাক', labelEn: 'Bird Chirp' },
                    { id: 'silent', labelBn: 'নীরব (Silent)', labelEn: 'Silent' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setNotifConfig(prev => ({ ...prev, sound: s.id }));
                        if (s.id !== 'silent') playSoundSample(s.id);
                      }}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '8px',
                        border: notifConfig.sound === s.id ? '2px solid var(--primary-green)' : '1px solid var(--border-color)',
                        background: notifConfig.sound === s.id ? 'var(--list-active-bg)' : 'var(--card-bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'bn' ? s.labelBn : s.labelEn}
                    </button>
                  ))}
                </div>

                {/* Per Prayer Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {lang === 'bn' ? 'ওয়াক্ত অনুযায়ী নোটিফিকেশন অ্যালার্ট:' : 'Prayer Notification Alerts:'}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {[
                      { key: 'fajrNotif', labelBn: 'ফজর', labelEn: 'Fajr' },
                      { key: 'dhuhrNotif', labelBn: 'যোহর', labelEn: 'Dhuhr' },
                      { key: 'asrNotif', labelBn: 'আসর', labelEn: 'Asr' },
                      { key: 'maghribNotif', labelBn: 'মাগরিব', labelEn: 'Maghrib' },
                      { key: 'ishaNotif', labelBn: 'ইশা', labelEn: 'Isha' }
                    ].map(p => {
                      const isEnabled = Boolean(notifConfig[p.key]);
                      return (
                        <button
                          key={p.key}
                          onClick={() => setNotifConfig(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '12px',
                            border: isEnabled ? '1.5px solid var(--primary-green)' : '1px solid var(--border-color)',
                            background: isEnabled ? 'var(--list-active-bg)' : 'var(--bg-main)',
                            color: isEnabled ? 'var(--primary-green)' : 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isEnabled ? '0 2px 8px rgba(22, 101, 52, 0.15)' : 'none'
                          }}
                        >
                          {isEnabled ? <Bell size={15} style={{ color: 'var(--primary-green)' }} /> : <BellOff size={15} style={{ opacity: 0.5 }} />}
                          <span>{lang === 'bn' ? p.labelBn : p.labelEn}</span>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: isEnabled ? 'var(--primary-green)' : 'rgba(148, 163, 184, 0.2)',
                            color: isEnabled ? 'white' : 'var(--text-muted)',
                            marginTop: '2px'
                          }}>
                            {isEnabled ? (lang === 'bn' ? 'চালু' : 'ON') : (lang === 'bn' ? 'বন্ধ' : 'OFF')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">{str.language}</label>
                <div className="toggle-container">
                  <button 
                    className={`toggle-btn ${config.lang === 'bn' ? 'active' : ''}`}
                    onClick={() => setConfig({...config, lang: 'bn'})}
                  >
                    বাংলা
                  </button>
                  <button 
                    className={`toggle-btn ${config.lang === 'en' ? 'active' : ''}`}
                    onClick={() => setConfig({...config, lang: 'en'})}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">{str.hijriAdjustment}</label>
                <div className="toggle-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                  {[-2, -1, 0, 1, 2].map((offset) => (
                    <button
                      key={offset}
                      className={`toggle-btn ${config.hijriOffset === offset ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, hijriOffset: offset })}
                    >
                      {offset > 0 ? `+${formatNumber(offset, lang)}` : formatNumber(offset, lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Info */}
              <div className="settings-footer" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>Created by: <strong>CodeToday</strong></div>
                <div style={{ marginTop: '4px' }}>
                  Visit our facebook page: <a href="#" onClick={(e) => { e.preventDefault(); window.open("https://www.facebook.com/profile.php?id=61592160592518", "_system"); }} style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: '600' }}>CodeToday</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOCATION SEARCH MODAL */}
        {isSearchOpen && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
            <div className="modal-content">
              <div className="sheet-drag-handle" />
              <div className="modal-header" style={{marginBottom: '1rem'}}>
                <span className="modal-title">{str.searchLoc}</span>
                <button className="close-btn" onClick={closeSearch} aria-label={str.cancel}>&times;</button>
              </div>
              
              <div style={{display:'flex', gap:'0.5rem', marginBottom:'1rem'}}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={str.searchCity}
                  aria-label={str.searchCity}
                  style={{flex:1, padding:'0.75rem', borderRadius:'10px', border:'1px solid var(--border-color)', background:'var(--bg-main)', color:'var(--text-main)', fontSize:'1rem'}}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                />
                <button 
                  onClick={() => handleSearch(searchQuery)}
                  aria-label={str.searchBtn}
                  style={{padding:'0.75rem 1rem', borderRadius:'10px', background:'var(--active-gradient)', color:'white', border:'none', cursor:'pointer'}}
                >
                  <Search size={20} />
                </button>
              </div>

              {isSearching ? (
                <div style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>{str.searching}</div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                  {searchResults.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectLocation(item)}
                      style={{padding:'1rem', borderRadius:'10px', background:'var(--card-bg)', cursor:'pointer', border:'1px solid var(--border-color)'}}
                    >
                      <div style={{fontWeight:'700', fontSize:'1rem'}}>{item.display_name.split(',')[0]}</div>
                      <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{item.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* QIBLA COMPASS FULLSCREEN VIEW */}
        {isQiblaOpen && (
          <div className="fullscreen-view">
            <div className="fullscreen-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="fullscreen-back-btn" onClick={closeQibla} title="Back" aria-label="Back">
                  <ArrowLeft size={22} />
                </button>
                <span className="fullscreen-title">{str.qiblaTitle}</span>
              </div>
              <button 
                className={`compass-header-btn ${showCalibrationHelp ? 'active' : ''}`}
                onClick={() => setShowCalibrationHelp(!showCalibrationHelp)}
                title={str.calibrateTitle}
                aria-label={str.calibrateTitle}
              >
                <RefreshCw size={20} className={showCalibrationHelp ? 'spin-icon' : ''} />
              </button>
            </div>

            <div className="fullscreen-content">

              {/* Location Card */}
              <div className="compass-location-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={24} style={{ color: 'var(--primary-green)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {config.city}, {config.country}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {lang === 'bn' ? "আপনার অবস্থান" : "Your Location"} • {formatNumber(calculateDistance(config.lat, config.lng), lang)} {str.kilometer}
                    </span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); detectLocation(); }} style={{ background: 'rgba(22, 101, 52, 0.08)', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '50%' }} title="Use GPS" aria-label="Use GPS">
                  <Locate size={20} />
                </button>
              </div>

              {/* True North Toggle & Sensor Accuracy Bar */}
              <div className="compass-controls-bar">
                <button 
                  className={`true-north-toggle ${useTrueNorth ? 'active' : ''}`}
                  onClick={() => setUseTrueNorth(!useTrueNorth)}
                >
                  <CompassIcon size={16} />
                  <span>{useTrueNorth ? str.trueNorth : str.magneticNorth}</span>
                  {declination !== 0 && (
                    <span className="declination-pill">
                      {declination > 0 ? `+${declination}°` : `${declination}°`}
                    </span>
                  )}
                </button>

                <div 
                  className={`accuracy-badge ${sensorAccuracy}`}
                  onClick={() => setShowCalibrationHelp(!showCalibrationHelp)}
                  title="Click for calibration guide"
                >
                  <span className="accuracy-dot"></span>
                  <span>
                    {sensorAccuracy === 'high' ? str.accuracyHigh :
                     sensorAccuracy === 'medium' ? str.accuracyMedium :
                     sensorAccuracy === 'low' ? str.accuracyLow : str.accuracyUnreliable}
                  </span>
                </div>
              </div>

              {/* Device Flatness / Tilt Warning Banner */}
              {!isFlat && (
                <div className="compass-tilt-banner">
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{str.tiltWarning}</span>
                </div>
              )}

              {/* Calibration Banner (when low accuracy or requested) */}
              {(showCalibrationHelp || sensorAccuracy === 'unreliable' || sensorAccuracy === 'low') && (
                <div className="compass-calibration-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={16} style={{ color: 'var(--primary-green)' }} />
                      <span>{str.calibrateTitle}</span>
                    </div>
                    <button onClick={() => setShowCalibrationHelp(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '1rem', color: 'var(--text-main)' }} aria-label={str.cancel}>&times;</button>
                  </div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '4px 0', lineHeight: 1.35 }}>
                    {str.calibrateGuide}
                  </p>
                  <div className="figure8-animation">
                    <svg viewBox="0 0 100 40" width="80" height="32">
                      <path d="M 25,20 C 10,5 10,35 25,20 C 40,5 60,35 75,20 C 90,5 90,35 75,20 C 60,5 40,35 25,20 Z" 
                            fill="none" stroke="var(--primary-green)" strokeWidth="2.5" strokeDasharray="4 2" />
                    </svg>
                  </div>
                </div>
              )}

              {compassError ? (
                <div className="compass-error-banner">
                  <Info size={24} style={{ color: 'var(--text-main)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                      {lang === 'bn' ? "সেন্সর ত্রুটি" : "Sensor Issue"}
                    </span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: 1.4 }}>
                      {compassError === 'insecure' ? str.compassInsecure : str.compassUnsupported}
                    </span>
                  </div>
                </div>
              ) : hasCompassPermission === false ? (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <p style={{ marginBottom: '1.25rem', color: 'var(--text-muted)' }}>{str.permissionRequired}</p>
                  <button onClick={requestCompassPermission} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'var(--active-gradient)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                    {str.enableCompass}
                  </button>
                </div>
              ) : (
                <>
                  {/* Compass Dial Area */}
                  <div className={`compass-dial-outer ${isAligned ? 'aligned' : ''}`}>
                    {/* Fixed Qibla Icon at top midpoint */}
                    <div className={`fixed-qibla-marker ${isAligned ? 'aligned' : ''}`}>
                      <KaabaIcon3D />
                    </div>

                    <svg viewBox="0 0 200 200" className="compass-svg" style={{ transform: 'rotate(' + (heading ? -heading : 0) + 'deg)' }}>
                      {/* Outer ring */}
                      <circle cx="100" cy="100" r="90" fill="none" stroke="var(--primary-green)" strokeWidth="2.5" />
                      {/* Dashed ticks */}
                      <circle cx="100" cy="100" r="84" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeDasharray="1.5 5" opacity="0.35" />
                      
                      {/* Light axes */}
                      <line x1="100" y1="30" x2="100" y2="170" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="30" y1="100" x2="170" y2="100" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

                      {/* Major Cardinal labels */}
                      <text x="100" y="27" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#ef4444">N</text>
                      <text x="175" y="105" fontSize="13" fontWeight="bold" textAnchor="middle" fill="var(--text-muted)">E</text>
                      <text x="100" y="182" fontSize="13" fontWeight="bold" textAnchor="middle" fill="var(--text-muted)">S</text>
                      <text x="25" y="105" fontSize="13" fontWeight="bold" textAnchor="middle" fill="var(--text-muted)">W</text>

                      {/* Minor Cardinal labels */}
                      <text x="150" y="52" fontSize="9" fontWeight="600" textAnchor="middle" fill="var(--text-muted)" opacity="0.7">NE</text>
                      <text x="150" y="156" fontSize="9" fontWeight="600" textAnchor="middle" fill="var(--text-muted)" opacity="0.7">SE</text>
                      <text x="50" y="156" fontSize="9" fontWeight="600" textAnchor="middle" fill="var(--text-muted)" opacity="0.7">SW</text>
                      <text x="50" y="52" fontSize="9" fontWeight="600" textAnchor="middle" fill="var(--text-muted)" opacity="0.7">NW</text>

                      {/* Needle pointing to Qibla */}
                      <g transform={`rotate(${qiblaAngle}, 100, 100)`}>
                        {/* Needle body */}
                        <path d="M100,100 L96,100 L100,28 Z" fill="var(--primary-green)" opacity="0.95" />
                        <path d="M100,100 L104,100 L100,28 Z" fill="var(--primary-green)" />
                        {/* Needle arrow head */}
                        <polygon points="100,20 93,36 100,32 107,36" fill="var(--primary-green)" />
                      </g>

                      {/* Center Pivot */}
                      <circle cx="100" cy="100" r="6" fill="var(--primary-green)" stroke="var(--card-bg)" strokeWidth="2" className="compass-needle-pivot" />
                    </svg>
                  </div>

                  {/* Qibla Direction Heading Display */}
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <div className="compass-qibla-degree-title">{str.qiblaDegree}</div>
                    <div className="compass-qibla-degree-val">
                      {formatNumber(qiblaAngle, lang)}° <span style={{ fontSize: '1rem', color: 'var(--primary-green)', fontWeight: '700' }}>({getDirectionName(qiblaAngle, lang)})</span>
                    </div>
                    <div className="compass-device-heading">
                      {str.deviceHeading}: <strong>{formatNumber(Math.round(heading || 0), lang)}° {cardinal}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* WEB APP APK DOWNLOAD BANNER */}
        {showInstallBanner && (
          <div className="pwa-install-banner" style={{ background: colorTheme === 'dark' ? '#0f172a' : '#ffffff', border: '1px solid var(--border-color)', color: colorTheme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 -10px 30px rgba(0,0,0,0.3)' }}>
            <span className="pwa-banner-text" style={{ fontSize: '0.88rem', fontWeight: '600' }}>
              {lang === 'bn' ? 'অফলাইন আযান ও উইজেটের জন্য APK ডাউনলোড করুন' : 'Enjoy offline Azan alerts, widget support, and Qibla compass.'}
            </span>
            <div className="pwa-banner-actions">
              <button className="pwa-btn pwa-btn-install" onClick={handleInstallApp}>
                <Download size={16} style={{ marginRight: '4px' }} />
                {lang === 'bn' ? 'ডাউনলোড' : 'Download APK'}
              </button>
              <button className="pwa-btn pwa-btn-dismiss" onClick={handleDismissInstall}>{str.dismissBtn}</button>
            </div>
          </div>
        )}

        {/* SCREENSAVER */}
        {isScreensaverActive && (
          <Screensaver
            onClose={closeScreensaver}
            colorTheme={colorTheme}
            currentHour={currentHour}
            currentMinStr={currentMinStr}
            nextPrayer={nextPrayer}
            timeLeft={timeLeft}
            lang={lang}
            str={str}
            renderFormattedTime={renderFormattedTime}
            timings={timings}
            activePrayer={activePrayer}
          />
        )}
      </div>
    </div>
  );
}

export default App;
