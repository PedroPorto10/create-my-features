package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "HybridBankNotifications")
public class HybridBankPlugin extends Plugin {
    private BroadcastReceiver notificationReceiver;
    private BroadcastReceiver accessibilityReceiver;
    private static final String TAG = "HybridBankPlugin";

    @Override
    public void load() {
        super.load();
        Context ctx = getContext();
        Log.d(TAG, "HybridBankPlugin loaded - using both notification and accessibility services");
        
        // Register receiver for NotificationListenerService events
        notificationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                if (!BankNotificationListenerService.ACTION_NEW_BANK_EVENT.equals(intent.getAction())) return;
                
                Log.d(TAG, "Received bank notification event");
                JSObject payload = createTransactionPayload(intent);
                notifyListeners("bankTransaction", payload);
            }
        };
        
        // Register receiver for AccessibilityService events (backup)
        accessibilityReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                if (!"app.lovable.BANK_ACCESSIBILITY_EVENT".equals(intent.getAction())) return;
                
                Log.d(TAG, "Received bank accessibility event (backup)");
                JSObject payload = createTransactionPayload(intent);
                notifyListeners("bankTransaction", payload);
            }
        };
        
        // Register both receivers
        IntentFilter notificationFilter = new IntentFilter(BankNotificationListenerService.ACTION_NEW_BANK_EVENT);
        IntentFilter accessibilityFilter = new IntentFilter("app.lovable.BANK_ACCESSIBILITY_EVENT");
        
        try {
            ctx.registerReceiver(notificationReceiver, notificationFilter, Context.RECEIVER_EXPORTED);
            ctx.registerReceiver(accessibilityReceiver, accessibilityFilter, Context.RECEIVER_EXPORTED);
        } catch (NoSuchMethodError e) {
            ctx.registerReceiver(notificationReceiver, notificationFilter);
            ctx.registerReceiver(accessibilityReceiver, accessibilityFilter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        try { 
            if (notificationReceiver != null) getContext().unregisterReceiver(notificationReceiver);
            if (accessibilityReceiver != null) getContext().unregisterReceiver(accessibilityReceiver);
        } catch (Exception ignored) {}
        super.handleOnDestroy();
    }

    private JSObject createTransactionPayload(Intent intent) {
        JSObject payload = new JSObject();
        payload.put("id", intent.getStringExtra("id"));
        payload.put("type", intent.getStringExtra("type"));
        payload.put("amount", intent.getDoubleExtra("amount", 0));
        payload.put("date", intent.getLongExtra("date", System.currentTimeMillis()));
        payload.put("contact", intent.getStringExtra("contact"));
        payload.put("description", intent.getStringExtra("description"));
        return payload;
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        boolean notificationEnabled = isNotificationListenerEnabled();
        boolean accessibilityEnabled = isAccessibilityServiceEnabled();
        
        Log.d(TAG, String.format("Services status - Notifications: %b, Accessibility: %b", 
            notificationEnabled, accessibilityEnabled));
        
        JSObject ret = new JSObject();
        ret.put("enabled", notificationEnabled || accessibilityEnabled);
        ret.put("notificationEnabled", notificationEnabled);
        ret.put("accessibilityEnabled", accessibilityEnabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to open notification settings", e);
            call.reject("Failed to open notification settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to open accessibility settings", e);
            call.reject("Failed to open accessibility settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void drainBacklog(PluginCall call) {
        try {
            android.content.SharedPreferences prefs = getContext().getSharedPreferences("bank_events_queue", android.content.Context.MODE_PRIVATE);
            String raw = prefs.getString("events", "[]");
            Log.d(TAG, "Draining backlog with " + new org.json.JSONArray(raw).length() + " events");
            // Clear after reading
            prefs.edit().putString("events", "[]").apply();
            JSObject ret = new JSObject();
            ret.put("events", new org.json.JSONArray(raw));
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to drain backlog", e);
            call.reject("Failed to drain backlog: " + e.getMessage());
        }
    }

    private boolean isNotificationListenerEnabled() {
        String enabledListeners = Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );
        return enabledListeners != null && enabledListeners.contains(getContext().getPackageName());
    }

    private boolean isAccessibilityServiceEnabled() {
        String packageName = getContext().getPackageName();
        String serviceName = packageName + "/.accessibility.BankAccessibilityService";
        
        String enabledServices = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        
        if (TextUtils.isEmpty(enabledServices)) return false;
        
        String[] services = enabledServices.split(":");
        for (String service : services) {
            if (service.equals(serviceName)) {
                return true;
            }
        }
        
        return false;
    }
}