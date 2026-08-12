package com.prayertimes.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppShortcut")
public class AppShortcutPlugin extends Plugin {

    private static String pendingAction = null;
    private static AppShortcutPlugin instance = null;

    @Override
    public void load() {
        instance = this;
    }

    public static void setInitialAction(String action) {
        pendingAction = action;
        if (instance != null && action != null) {
            JSObject data = new JSObject();
            data.put("action", action);
            instance.notifyListeners("shortcutTriggered", data);
        }
    }

    @PluginMethod
    public void getInitialAction(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("action", pendingAction);
        call.resolve(ret);
        pendingAction = null; // Clear once read
    }
}
