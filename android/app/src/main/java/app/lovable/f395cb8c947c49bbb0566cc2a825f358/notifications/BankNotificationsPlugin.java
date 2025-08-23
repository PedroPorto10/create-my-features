package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.os.Build;
import android.os.PowerManager;
import android.net.Uri;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BankNotifications")
public class BankNotificationsPlugin extends Plugin {
	private BroadcastReceiver receiver;
	private static final String TAG = "BankNotificationsPlugin";

	@Override
	public void load() {
		super.load();
		Context ctx = getContext();
		Log.d(TAG, "BankNotificationsPlugin loaded");
		
		// Start foreground service to ensure background operation
		startForegroundService();
		
		receiver = new BroadcastReceiver() {
			@Override
			public void onReceive(Context context, Intent intent) {
				if (intent == null) return;
				if (!BankNotificationListenerService.ACTION_NEW_BANK_EVENT.equals(intent.getAction())) return;
				Log.d(TAG, "Received bank notification event");
				JSObject payload = new JSObject();
				payload.put("id", intent.getStringExtra("id"));
				payload.put("type", intent.getStringExtra("type"));
				payload.put("amount", intent.getDoubleExtra("amount", 0));
				payload.put("date", intent.getLongExtra("date", System.currentTimeMillis()));
				payload.put("contact", intent.getStringExtra("contact"));
				payload.put("description", intent.getStringExtra("description"));
				notifyListeners("bankNotification", payload);
			}
		};
		IntentFilter filter = new IntentFilter(BankNotificationListenerService.ACTION_NEW_BANK_EVENT);
		try {
			ctx.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED);
		} catch (NoSuchMethodError e) {
			// Fallback for older Android SDKs
			ctx.registerReceiver(receiver, filter);
		}
	}
	
	private void startForegroundService() {
		try {
			Intent serviceIntent = new Intent(getContext(), BankNotificationForegroundService.class);
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
				getContext().startForegroundService(serviceIntent);
			} else {
				getContext().startService(serviceIntent);
			}
			Log.d(TAG, "Foreground service started");
		} catch (Exception e) {
			Log.e(TAG, "Failed to start foreground service", e);
		}
	}

	@Override
	protected void handleOnDestroy() {
		try { getContext().unregisterReceiver(receiver); } catch (Exception ignored) {}
		super.handleOnDestroy();
	}

	@PluginMethod
	public void isEnabled(PluginCall call) {
		String enabledListeners = Settings.Secure.getString(
			getContext().getContentResolver(),
			"enabled_notification_listeners"
		);
		boolean enabled = enabledListeners != null && enabledListeners.contains(getContext().getPackageName());
		
		// Also check battery optimization status
		boolean batteryOptimized = true;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
			PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
			if (pm != null) {
				batteryOptimized = !pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
			}
		} else {
			batteryOptimized = false;
		}
		
		Log.d(TAG, String.format("Notification enabled: %b, Battery optimized: %b", enabled, batteryOptimized));
		
		JSObject ret = new JSObject();
		ret.put("enabled", enabled);
		ret.put("batteryOptimized", batteryOptimized);
		call.resolve(ret);
	}

	@PluginMethod
	public void openSettings(PluginCall call) {
		try {
			Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			getContext().startActivity(intent);
			call.resolve();
		} catch (Exception e) {
			Log.e(TAG, "Failed to open notification settings", e);
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
	
	@PluginMethod
	public void requestBatteryOptimization(PluginCall call) {
		try {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
				PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
				String packageName = getContext().getPackageName();
				
				if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
					Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
					intent.setData(Uri.parse("package:" + packageName));
					intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
					getContext().startActivity(intent);
				}
			}
			call.resolve();
		} catch (Exception e) {
			Log.e(TAG, "Failed to request battery optimization", e);
			call.reject("Failed to request battery optimization: " + e.getMessage());
		}
	}
}