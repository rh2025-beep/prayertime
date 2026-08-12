package com.prayertimes.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrayerWidget")
public class PrayerWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidget(PluginCall call) {
        try {
            Context context = getContext();
            String colorTheme = call.getString("colorTheme", "emerald");
            String widgetStyle = call.getString("widgetStyle", "theme");
            JSObject data = call.getObject("data");

            SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("colorTheme", colorTheme);
            editor.putString("widgetStyle", widgetStyle);
            if (data != null) {
                editor.putString("widget_data", data.toString());
                if (data.has("timings")) {
                    editor.putString("timings_json", data.getJSObject("timings").toString());
                }
            }
            editor.apply();

            // Also mirror into CapacitorStorage for fallback compatibility
            try {
                SharedPreferences capPrefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                SharedPreferences.Editor capEditor = capPrefs.edit();
                if (data != null) {
                    capEditor.putString("widget_data", data.toString());
                    if (data.has("timings")) {
                        capEditor.putString("timings_json", data.getJSObject("timings").toString());
                    }
                }
                capEditor.apply();
            } catch (Exception ignored) {}

            // Force AppWidgetManager to refresh all widget instances on home screen immediately
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, PrayerWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);

            for (int appWidgetId : appWidgetIds) {
                PrayerWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
            }

            Intent intent = new Intent(context, PrayerWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);

            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage(), e);
        }
    }
}
