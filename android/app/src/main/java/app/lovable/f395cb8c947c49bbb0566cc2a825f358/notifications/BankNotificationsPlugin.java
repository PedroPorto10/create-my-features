package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BankNotifications")
public class BankNotificationsPlugin extends Plugin {
	private BroadcastReceiver receiver;

	@Override
	public void load() {
		super.load();
		Context ctx = getContext();
		receiver = new BroadcastReceiver() {
			@Override
			public void onReceive(Context context, Intent intent) {
				if (intent == null) return;
				if (!BankNotificationListenerService.ACTION_NEW_BANK_EVENT.equals(intent.getAction())) return;
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

	@Override
	protected void handleOnDestroy() {
		try { getContext().unregisterReceiver(receiver); } catch (Exception ignored) {}
		super.handleOnDestroy();
	}

	@PluginMethod
	public void isEnabled(PluginCall call) {
		boolean enabled = Settings.Secure.getString(
			getContext().getContentResolver(),
			"enabled_notification_listeners"
		) != null && Settings.Secure.getString(
			getContext().getContentResolver(),
			"enabled_notification_listeners"
		).contains(getContext().getPackageName());
		JSObject ret = new JSObject();
		ret.put("enabled", enabled);
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
			call.reject("Failed to open settings: " + e.getMessage());
		}
	}
}