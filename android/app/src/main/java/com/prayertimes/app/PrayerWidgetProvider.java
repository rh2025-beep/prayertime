package com.prayertimes.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class PrayerWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_AUTO_UPDATE = "com.prayertimes.app.ACTION_AUTO_UPDATE";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        scheduleNextUpdate(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_AUTO_UPDATE.equals(action) ||
                Intent.ACTION_TIME_TICK.equals(action) ||
                Intent.ACTION_TIME_CHANGED.equals(action) ||
                Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
                Intent.ACTION_USER_PRESENT.equals(action) ||
                AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action)) {
                
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                ComponentName thisAppWidget = new ComponentName(context.getPackageName(), PrayerWidgetProvider.class.getName());
                int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidget);
                for (int appWidgetId : appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId);
                }
                scheduleNextUpdate(context);
            }
        }
    }

    private void scheduleNextUpdate(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(context, PrayerWidgetProvider.class);
            intent.setAction(ACTION_AUTO_UPDATE);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Align precisely with top of next minute (:00 seconds)
            long nowMillis = System.currentTimeMillis();
            long delayToNextMinute = 60000 - (nowMillis % 60000);
            if (delayToNextMinute < 1000) {
                delayToNextMinute += 60000;
            }
            long triggerAtMillis = SystemClock.elapsedRealtime() + delayToNextMinute;

            if (alarmManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtMillis, pendingIntent);
                    } else {
                        alarmManager.setWindow(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtMillis, 5000, pendingIntent);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtMillis, pendingIntent);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    alarmManager.setExact(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtMillis, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtMillis, pendingIntent);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            // 1. Current Live System Time
            Calendar now = Calendar.getInstance();
            SimpleDateFormat timeFormat = new SimpleDateFormat("h:mm a", Locale.ENGLISH);
            String currentTimeStr = timeFormat.format(now.getTime()).toLowerCase();

            // Default values
            String widgetTimeVal = formatToBengaliNumerals(currentTimeStr);
            String nextPrayerTitle = "পরবর্তী: ফজর";
            String nextPrayerVal = "৪:০৮ am";
            String countdownText = "(--:--)";
            String startLabel = "";
            String endLabel = "";
            int progress = 0;

            String colorTheme = "emerald";
            String widgetStyle = "theme";

            try {
                SharedPreferences widgetPrefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
                colorTheme = widgetPrefs.getString("colorTheme", "emerald");
                widgetStyle = widgetPrefs.getString("widgetStyle", "theme");

                String rawJson = widgetPrefs.getString("widget_data", null);
                if (rawJson == null) {
                    SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                    rawJson = prefs.getString("widget_data", null);
                }

                String timingsJsonStr = widgetPrefs.getString("timings_json", null);

                // If widget_data exists, read cached labels as baseline
                if (rawJson != null) {
                    JSONObject json = new JSONObject(rawJson);
                    if (json.has("nextPrayerName")) nextPrayerTitle = "পরবর্তী: " + json.getString("nextPrayerName");
                    if (json.has("nextPrayerTime")) nextPrayerVal = formatToBengaliNumerals(json.getString("nextPrayerTime"));
                    if (json.has("countdown")) countdownText = "(" + json.getString("countdown") + ")";
                    if (json.has("startLabel")) startLabel = formatToBengaliNumerals(json.getString("startLabel"));
                    if (json.has("endLabel")) endLabel = formatToBengaliNumerals(json.getString("endLabel"));
                    if (json.has("progress")) progress = json.getInt("progress");
                    if (json.has("colorTheme")) colorTheme = json.getString("colorTheme");
                    if (json.has("widgetStyle")) widgetStyle = json.getString("widgetStyle");

                    if (timingsJsonStr == null && json.has("timings")) {
                        timingsJsonStr = json.getJSONObject("timings").toString();
                    }
                }

                // If timings JSON exists, perform dynamic minute-precise recalculation
                if (timingsJsonStr != null) {
                    JSONObject t = new JSONObject(timingsJsonStr);
                    int fajrMin = parseMinutes(t.optString("Fajr", "04:08"));
                    int sunriseMin = parseMinutes(t.optString("Sunrise", "05:30"));
                    int dhuhrMin = parseMinutes(t.optString("Dhuhr", "12:08"));
                    int asrMin = parseMinutes(t.optString("Asr", "16:30"));
                    int maghribMin = parseMinutes(t.optString("Maghrib", t.optString("Sunset", "18:38")));
                    int ishaMin = parseMinutes(t.optString("Isha", "20:00"));

                    int nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
                    int nowSec = now.get(Calendar.SECOND);

                    String sLabel = "";
                    String eLabel = "";
                    String nName = "";
                    String nTime = "";
                    int startM = 0;
                    int endM = 0;
                    int targetM = 0;

                    if (nowMin >= fajrMin && nowMin < sunriseMin) {
                        sLabel = "ফজর " + formatTime12h(fajrMin);
                        eLabel = "সূর্যোদয় " + formatTime12h(sunriseMin);
                        nName = "যোহর";
                        nTime = formatTime12h(dhuhrMin);
                        startM = fajrMin;
                        endM = sunriseMin;
                        targetM = dhuhrMin;
                    } else if (nowMin >= sunriseMin && nowMin < dhuhrMin) {
                        sLabel = "সূর্যোদয় " + formatTime12h(sunriseMin);
                        eLabel = "যোহর " + formatTime12h(dhuhrMin);
                        nName = "যোহর";
                        nTime = formatTime12h(dhuhrMin);
                        startM = sunriseMin;
                        endM = dhuhrMin;
                        targetM = dhuhrMin;
                    } else if (nowMin >= dhuhrMin && nowMin < asrMin) {
                        sLabel = "যোহর " + formatTime12h(dhuhrMin);
                        eLabel = "আসর " + formatTime12h(asrMin);
                        nName = "আসর";
                        nTime = formatTime12h(asrMin);
                        startM = dhuhrMin;
                        endM = asrMin;
                        targetM = asrMin;
                    } else if (nowMin >= asrMin && nowMin < maghribMin) {
                        sLabel = "আসর " + formatTime12h(asrMin);
                        eLabel = "মাগরিব " + formatTime12h(maghribMin);
                        nName = "মাগরিব";
                        nTime = formatTime12h(maghribMin);
                        startM = asrMin;
                        endM = maghribMin;
                        targetM = maghribMin;
                    } else if (nowMin >= maghribMin && nowMin < ishaMin) {
                        sLabel = "মাগরিব " + formatTime12h(maghribMin);
                        eLabel = "ইশা " + formatTime12h(ishaMin);
                        nName = "ইশা";
                        nTime = formatTime12h(ishaMin);
                        startM = maghribMin;
                        endM = ishaMin;
                        targetM = ishaMin;
                    } else {
                        // Isha -> Fajr (spans midnight)
                        sLabel = "ইশা " + formatTime12h(ishaMin);
                        eLabel = "ফজর " + formatTime12h(fajrMin);
                        nName = "ফজর";
                        nTime = formatTime12h(fajrMin);
                        startM = ishaMin;
                        endM = fajrMin + 24 * 60;
                        targetM = fajrMin;
                    }

                    int cMin = nowMin;
                    if (nowMin < fajrMin && startM == ishaMin) {
                        cMin = nowMin + 24 * 60;
                    }

                    startLabel = formatToBengaliNumerals(sLabel);
                    endLabel = formatToBengaliNumerals(eLabel);
                    nextPrayerTitle = "পরবর্তী: " + nName;
                    nextPrayerVal = formatToBengaliNumerals(nTime);

                    int diffMin = targetM - nowMin;
                    if (diffMin < 0) diffMin += 24 * 60;
                    int h = diffMin / 60;
                    int m = diffMin % 60;

                    if (h > 0) {
                        countdownText = "(" + formatToBengaliNumerals(String.valueOf(h)) + " ঘণ্টা " + formatToBengaliNumerals(String.valueOf(m)) + " মিনিট বাকি)";
                    } else {
                        countdownText = "(" + formatToBengaliNumerals(String.valueOf(m)) + " মিনিট বাকি)";
                    }

                    long elapsedSec = ((long) (cMin - startM) * 60) + nowSec;
                    long totalSec = (long) (endM - startM) * 60;
                    if (totalSec > 0) {
                        progress = Math.min(100, Math.max(0, (int) ((elapsedSec * 100) / totalSec)));
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            // Determine exact layout file based on active app color theme & widget style
            int layoutResId = R.layout.widget_prayer_clock;
            if ("glass".equals(widgetStyle)) {
                layoutResId = R.layout.widget_prayer_clock_glass;
            } else if ("midnight".equals(colorTheme)) {
                layoutResId = R.layout.widget_prayer_clock_midnight;
            } else if ("sand".equals(colorTheme)) {
                layoutResId = R.layout.widget_prayer_clock_sand;
            } else if ("velvet".equals(colorTheme)) {
                layoutResId = R.layout.widget_prayer_clock_velvet;
            }

            RemoteViews views = new RemoteViews(context.getPackageName(), layoutResId);

            // Apply text values to RemoteViews
            views.setTextViewText(R.id.widget_time_val, widgetTimeVal);
            views.setTextViewText(R.id.widget_next_title, nextPrayerTitle);
            views.setTextViewText(R.id.widget_next_val, nextPrayerVal);
            views.setTextViewText(R.id.widget_next_countdown, countdownText);
            views.setTextViewText(R.id.widget_start_label, startLabel);
            views.setTextViewText(R.id.widget_end_label, endLabel);
            views.setProgressBar(R.id.widget_progress_bar, 100, progress, false);

            // Click widget to launch main App
            Intent intent = new Intent(context, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

            // Instruct widget manager to update
            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static int parseMinutes(String timeStr) {
        if (timeStr == null) return 0;
        String clean = timeStr.trim();
        String[] parts = clean.split(":");
        if (parts.length < 2) return 0;
        try {
            int h = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
            int m = Integer.parseInt(parts[1].replaceAll("[^0-9]", ""));
            return h * 60 + m;
        } catch (Exception e) {
            return 0;
        }
    }

    private static String formatTime12h(int totalMin) {
        int mins = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
        int h = mins / 60;
        int m = mins % 60;
        boolean isPm = h >= 12;
        int h12 = h % 12;
        if (h12 == 0) h12 = 12;
        String mStr = m < 10 ? "0" + m : String.valueOf(m);
        return h12 + ":" + mStr + (isPm ? " pm" : " am");
    }

    private static String formatToBengaliNumerals(String numberStr) {
        if (numberStr == null) return "";
        char[] bnDigits = {'০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'};
        StringBuilder sb = new StringBuilder();
        for (char c : numberStr.toCharArray()) {
            if (c >= '0' && c <= '9') {
                sb.append(bnDigits[c - '0']);
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
