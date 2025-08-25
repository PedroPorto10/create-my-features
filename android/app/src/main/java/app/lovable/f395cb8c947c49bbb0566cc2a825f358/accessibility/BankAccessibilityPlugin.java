package app.lovable.f395cb8c947c49bbb0566cc2a825f358.accessibility;

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

@CapacitorPlugin(name = "BankAccessibility")
public class BankAccessibilityPlugin extends Plugin {
    private BroadcastReceiver receiver;
    private static final String TAG = "BankAccessibilityPlugin";

    @Override
    public void load() {
        super.load();
        Context ctx = getContext();
        Log.d(TAG, "BankAccessibilityPlugin loaded");
        
        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                if (!BankAccessibilityService.ACTION_NEW_BANK_EVENT.equals(intent.getAction())) return;
                
                Log.d(TAG, "Received bank accessibility event");
                JSObject payload = new JSObject();
                payload.put("id", intent.getStringExtra("id"));
                payload.put("type", intent.getStringExtra("type"));
                payload.put("amount", intent.getDoubleExtra("amount", 0));
                payload.put("date", intent.getLongExtra("date", System.currentTimeMillis()));
                payload.put("contact", intent.getStringExtra("contact"));
                payload.put("description", intent.getStringExtra("description"));
                notifyListeners("bankTransaction", payload);
            }
        };
        
        IntentFilter filter = new IntentFilter(BankAccessibilityService.ACTION_NEW_BANK_EVENT);
        try {
            // Use reflection to safely check for API level 26+ methods
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                ctx.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED);
            } else {
                ctx.registerReceiver(receiver, filter);
            }
        } catch (Exception e) {
            // Fallback for any issues
            ctx.registerReceiver(receiver, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        try { 
            getContext().unregisterReceiver(receiver); 
        } catch (Exception ignored) {}
        super.handleOnDestroy();
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        boolean enabled = isAccessibilityServiceEnabled();
        
        Log.d(TAG, String.format("Accessibility service enabled: %b", enabled));
        
        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to open accessibility settings", e);
            call.reject("Failed to open settings: " + e.getMessage());
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