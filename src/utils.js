export const cleanTimeStr = (timeStr) => {
  if (!timeStr) return '00:00';
  const match = timeStr.toString().match(/(\d{1,2}):(\d{2})/);
  if (!match) return '00:00';
  const h = match[1].padStart(2, '0');
  const m = match[2];
  return `${h}:${m}`;
};

export const formatNumber = (number, lang = 'bn') => {
  if (lang === 'en') return number.toString();
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return number.toString().replace(/[0-9]/g, (digit) => bengaliDigits[digit]);
};

export const formatTime = (time24, lang = 'bn') => {
  const clean = cleanTimeStr(time24);
  const [hours, minutes] = clean.split(':');
  let h = parseInt(hours, 10);
  const isPM = h >= 12;
  const suffix = isPM ? 'pm' : 'am';
  
  h = h % 12;
  h = h ? h : 12;

  if (lang === 'en') {
    return `${h}:${minutes} ${suffix}`;
  }

  return `${formatNumber(h, lang)}:${formatNumber(minutes, lang)} ${suffix}`;
};

export const getMinutes = (timeStr) => {
  const clean = cleanTimeStr(timeStr);
  const [h, m] = clean.split(':').map(Number);
  return h * 60 + m;
};

export const formatTimeDiff = (diffSeconds, lang = 'bn', showSeconds = false) => {
  if (diffSeconds < 0) diffSeconds = 0;
  const h = Math.floor(diffSeconds / 3600);
  const m = Math.floor((diffSeconds % 3600) / 60);
  const s = Math.floor(diffSeconds % 60);

  if (showSeconds) {
    const hStr = h > 0 ? (lang === 'en' ? `${h}h ` : `${formatNumber(h, lang)}ঘ: `) : '';
    const mStr = lang === 'en' ? `${m.toString().padStart(2, '0')}m ` : `${formatNumber(m.toString().padStart(2, '0'), lang)}মি: `;
    const sStr = lang === 'en' ? `${s.toString().padStart(2, '0')}s` : `${formatNumber(s.toString().padStart(2, '0'), lang)}সে`;
    return `${hStr}${mStr}${sStr}`;
  }

  let timeStr = "";
  if (lang === 'en') {
    if (h === 0 && m === 0) {
      return "< 1 min";
    }
    if (h > 0) timeStr += `${h} hr `;
    timeStr += `${m} min`;
    return timeStr;
  }

  if (h === 0 && m === 0) {
    return "< ১ মিনিট";
  }
  if (h > 0) timeStr += `${formatNumber(h, lang)} ঘন্টা `;
  timeStr += `${formatNumber(m, lang)} মিনিট`;
  return timeStr;
};

export const getDayName = (dayIndex, lang = 'bn') => {
  if (lang === 'en') {
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysEn[dayIndex];
  }
  const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return daysBn[dayIndex];
};

export const getMonthName = (monthIndex, lang = 'bn') => {
  if (lang === 'en') {
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthsEn[monthIndex];
  }
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return monthsBn[monthIndex];
};

export const minToTimeStr = (totalMinutes) => {
  let mins = Math.floor(totalMinutes) % (24 * 60);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
};

export const getForbiddenTimes = (timings) => {
  if (!timings) return null;
  
  const sunriseMin = getMinutes(timings.Sunrise);
  const dhuhrMin = getMinutes(timings.Dhuhr);
  const sunsetTimeStr = timings.Sunset || timings.Maghrib;
  const sunsetMin = getMinutes(sunsetTimeStr);

  return {
    sunrise: {
      key: 'sunrise',
      startMin: sunriseMin,
      endMin: sunriseMin + 15,
      startTimeStr: timings.Sunrise,
      endTimeStr: minToTimeStr(sunriseMin + 15)
    },
    zawal: {
      key: 'zawal',
      startMin: dhuhrMin - 10,
      endMin: dhuhrMin,
      startTimeStr: minToTimeStr(dhuhrMin - 10),
      endTimeStr: timings.Dhuhr
    },
    sunset: {
      key: 'sunset',
      startMin: sunsetMin - 15,
      endMin: sunsetMin,
      startTimeStr: minToTimeStr(sunsetMin - 15),
      endTimeStr: sunsetTimeStr
    }
  };
};

const tzCache = { timezone: null, formatter: null };

export const getTzTime = (date, timezone) => {
  if (!timezone) return date;
  try {
    if (tzCache.timezone !== timezone) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric'
      });
      tzCache.formatter = formatter;
      tzCache.timezone = timezone;
    }
    return new Date(tzCache.formatter.format(date));
  } catch {
    return date;
  }
};

export const checkCurrentForbidden = (nowMin, forbiddenTimes) => {
  if (!forbiddenTimes) return null;
  if (nowMin >= forbiddenTimes.sunrise.startMin && nowMin < forbiddenTimes.sunrise.endMin) {
    return 'sunrise';
  }
  if (nowMin >= forbiddenTimes.zawal.startMin && nowMin < forbiddenTimes.zawal.endMin) {
    return 'zawal';
  }
  if (nowMin >= forbiddenTimes.sunset.startMin && nowMin < forbiddenTimes.sunset.endMin) {
    return 'sunset';
  }
  return null;
};

/**
 * Astronomical Solar Calculation Engine for 100% Offline Prayer Times
 */
export const calculateOfflinePrayerTimes = (lat, lng, dateObj = new Date(), school = 0) => {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  // Julian Date calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad)) % 360;

  const e = 23.439 - 0.00000036 * d;
  const RA = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) * deg;
  let RA_norm = (RA + 360) % 360;
  
  const declination = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) * deg;
  let dEqT = q - RA_norm;
  while (dEqT < -180) dEqT += 360;
  while (dEqT > 180) dEqT -= 360;
  const EqT = dEqT / 15;

  const tzOffset = -dateObj.getTimezoneOffset() / 60;
  const noon = 12 + tzOffset - (lng / 15) - EqT;

  const sunAngleTime = (angle, isMorning = true) => {
    const cosH = (Math.sin(-angle * rad) - Math.sin(lat * rad) * Math.sin(declination * rad)) / 
                 (Math.cos(lat * rad) * Math.cos(declination * rad));
    if (cosH > 1 || cosH < -1) return noon;
    const H = Math.acos(cosH) * deg / 15;
    return isMorning ? noon - H : noon + H;
  };

  const asrTime = (factor) => {
    const phi = Math.abs(lat - declination);
    const cotAngle = factor + Math.tan(phi * rad);
    const angle = Math.atan(1 / cotAngle) * deg;
    const cosH = (Math.sin(angle * rad) - Math.sin(lat * rad) * Math.sin(declination * rad)) / 
                 (Math.cos(lat * rad) * Math.cos(declination * rad));
    if (cosH > 1 || cosH < -1) return noon + 3;
    const H = Math.acos(cosH) * deg / 15;
    return noon + H;
  };

  const fajrHours = sunAngleTime(18, true);
  const sunriseHours = sunAngleTime(0.833, true);
  const dhuhrHours = noon;
  const asrHours = asrTime(school === 1 ? 2 : 1);
  const sunsetHours = sunAngleTime(0.833, false);
  const ishaHours = sunAngleTime(18, false);

  const formatHours = (h) => {
    let mins = Math.round(h * 60);
    mins = (mins + 24 * 60) % (24 * 60);
    return minToTimeStr(mins);
  };

  return {
    Fajr: formatHours(fajrHours),
    Sunrise: formatHours(sunriseHours),
    Dhuhr: formatHours(dhuhrHours),
    Asr: formatHours(asrHours),
    Sunset: formatHours(sunsetHours),
    Maghrib: formatHours(sunsetHours),
    Isha: formatHours(ishaHours)
  };
};


