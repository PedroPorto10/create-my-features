package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;
import android.app.ActivityManager;

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
            // Use API level check to safely use new methods
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                ctx.registerReceiver(notificationReceiver, notificationFilter, Context.RECEIVER_EXPORTED);
                ctx.registerReceiver(accessibilityReceiver, accessibilityFilter, Context.RECEIVER_EXPORTED);
            } else {
                ctx.registerReceiver(notificationReceiver, notificationFilter);
                ctx.registerReceiver(accessibilityReceiver, accessibilityFilter);
            }
        } catch (Exception e) {
            // Fallback for any issues
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
    public void requestNotificationPermission(PluginCall call) {
        try {
            if (isNotificationListenerEnabled()) {
                JSObject ret = new JSObject();
                ret.put("granted", true);
                call.resolve(ret);
                return;
            }

            // Show informative dialog before opening settings
            android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getActivity());
            builder.setTitle("Acesso às Notificações")
                   .setMessage("Para detectar transações PIX automaticamente, preciso acessar suas notificações.\n\nNas configurações que irão abrir, encontre \"" + getContext().getString(android.R.string.unknownName) + "\" e ative a permissão.")
                   .setPositiveButton("Abrir Configurações", (dialog, which) -> {
                       try {
                           Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
                           intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                           getContext().startActivity(intent);
                       } catch (Exception e) {
                           Log.e(TAG, "Failed to open notification settings", e);
                       }
                   })
                   .setNegativeButton("Pular", (dialog, which) -> dialog.dismiss())
                   .setCancelable(true)
                   .show();
            
            JSObject ret = new JSObject();
            ret.put("granted", false);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to request notification permission", e);
            call.reject("Failed to request notification permission: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        try {
            if (isAccessibilityServiceEnabled()) {
                JSObject ret = new JSObject();
                ret.put("granted", true);
                call.resolve(ret);
                return;
            }

            // Show informative dialog before opening settings
            android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getActivity());
            builder.setTitle("Serviço de Acessibilidade")
                   .setMessage("Como backup, posso também detectar transações através de acessibilidade.\n\nNas configurações que irão abrir, encontre \"Finance\" e ative o serviço.")
                   .setPositiveButton("Abrir Configurações", (dialog, which) -> {
                       try {
                           Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                           intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                           getContext().startActivity(intent);
                       } catch (Exception e) {
                           Log.e(TAG, "Failed to open accessibility settings", e);
                       }
                   })
                   .setNegativeButton("Pular", (dialog, which) -> dialog.dismiss())
                   .setCancelable(true)
                   .show();
            
            JSObject ret = new JSObject();
            ret.put("granted", false);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to request accessibility permission", e);
            call.reject("Failed to request accessibility permission: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPermissionDebugInfo(PluginCall call) {
        try {
            JSObject ret = new JSObject();
            
            // Get package name
            String packageName = getContext().getPackageName();
            ret.put("packageName", packageName);
            
            // Get enabled notification listeners
            String enabledListeners = Settings.Secure.getString(
                getContext().getContentResolver(),
                "enabled_notification_listeners"
            );
            ret.put("enabledListeners", enabledListeners != null ? enabledListeners : "null");
            
            // Check various permission methods
            ret.put("notificationEnabled", isNotificationListenerEnabled());
            ret.put("accessibilityEnabled", isAccessibilityServiceEnabled());
            
            // Check running services
            try {
                ActivityManager manager = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
                boolean serviceRunning = false;
                if (manager != null) {
                    for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
                        if (service.service.getClassName().contains("BankNotification") || 
                            service.service.getClassName().contains("BankAccessibility")) {
                            serviceRunning = true;
                            break;
                        }
                    }
                }
                ret.put("servicesRunning", serviceRunning);
            } catch (Exception e) {
                ret.put("servicesRunning", false);
                ret.put("serviceError", e.getMessage());
            }
            
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get debug info", e);
            call.reject("Failed to get debug info: " + e.getMessage());
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
        
        if (enabledListeners == null) {
            Log.d(TAG, "No enabled notification listeners found");
            return false;
        }
        
        String packageName = getContext().getPackageName();
        Log.d(TAG, "Checking notification listeners for package: " + packageName);
        Log.d(TAG, "Enabled listeners: " + enabledListeners);
        
        // Check for any variation containing our package name
        if (enabledListeners.contains(packageName)) {
            Log.d(TAG, "Found package name in enabled listeners");
            return true;
        }
        
        // Check for BankNotificationListenerService in any form
        if (enabledListeners.toLowerCase().contains("banknotificationlistenerservice")) {
            Log.d(TAG, "Found BankNotificationListenerService in enabled listeners");
            return true;
        }
        
        // Alternative method: Check if the service is actually running
        try {
            android.app.ActivityManager manager = (android.app.ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
            if (manager != null) {
                for (android.app.ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
                    String className = service.service.getClassName();
                    if (className != null && className.contains("BankNotificationListenerService")) {
                        Log.d(TAG, "Found running notification listener service: " + className);
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to check running services", e);
        }
        
        Log.d(TAG, "Notification listener not found");
        return false;
    }

    private boolean isAccessibilityServiceEnabled() {
        String packageName = getContext().getPackageName();
        
        String enabledServices = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        
        if (TextUtils.isEmpty(enabledServices)) {
            Log.d(TAG, "No accessibility services enabled");
            return false;
        }
        
        Log.d(TAG, "Checking accessibility services for package: " + packageName);
        Log.d(TAG, "Enabled accessibility services: " + enabledServices);
        
        // Check for any service containing our package name
        if (enabledServices.contains(packageName)) {
            Log.d(TAG, "Found package name in accessibility services");
            return true;
        }
        
        // Check for BankAccessibilityService in any form
        if (enabledServices.toLowerCase().contains("bankaccessibilityservice")) {
            Log.d(TAG, "Found BankAccessibilityService in accessibility services");
            return true;
        }
        
        return false;
    }
}