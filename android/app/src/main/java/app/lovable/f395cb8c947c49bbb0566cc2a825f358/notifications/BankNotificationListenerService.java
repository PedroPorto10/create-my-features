package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.content.Intent;
import android.text.TextUtils;
import android.os.Build;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class BankNotificationListenerService extends NotificationListenerService {
	public static final String ACTION_NEW_BANK_EVENT = "app.lovable.BANK_NOTIFICATION_EVENT";
	private static final String QUEUE_PREF = "bank_events_queue";
	private static final String QUEUE_KEY = "events";
	private static final String TAG = "BankNotificationListener";

	@Override
	public void onListenerConnected() {
		super.onListenerConnected();
		Log.d(TAG, "NotificationListenerService connected");
		
		// Start foreground service to keep this service alive
		startForegroundService();
		
		// Seed from active notifications
		try {
			StatusBarNotification[] actives = getActiveNotifications();
			if (actives != null) {
				Log.d(TAG, "Processing " + actives.length + " active notifications");
				for (StatusBarNotification sbn : actives) {
					persistIfTransaction(sbn);
				}
			}
		} catch (Throwable e) {
			Log.e(TAG, "Error processing active notifications", e);
		}
	}

	@Override
	public void onNotificationPosted(StatusBarNotification sbn) {
		if (sbn == null) return;
		Log.d(TAG, "New notification from: " + sbn.getPackageName());
		persistIfTransaction(sbn);
	}
	
	private void startForegroundService() {
		try {
			Intent serviceIntent = new Intent(this, BankNotificationForegroundService.class);
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
				startForegroundService(serviceIntent);
			} else {
				startService(serviceIntent);
			}
		} catch (Exception e) {
			Log.e(TAG, "Failed to start foreground service", e);
		}
	}

	private void persistIfTransaction(StatusBarNotification sbn) {
		Notification notification = sbn.getNotification();
		if (notification == null) return;
		Bundle extras = notification.extras;
		if (extras == null) return;

		CharSequence titleCs = extras.getCharSequence(Notification.EXTRA_TITLE);
		CharSequence textCs = extras.getCharSequence(Notification.EXTRA_TEXT);
		CharSequence bigTextCs = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
		CharSequence[] lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);

		String title = titleCs != null ? titleCs.toString() : "";
		String text = textCs != null ? textCs.toString() : "";
		String bigText = bigTextCs != null ? bigTextCs.toString() : "";

		StringBuilder sb = new StringBuilder();
		if (!TextUtils.isEmpty(bigText)) sb.append(bigText).append(' ');
		if (!TextUtils.isEmpty(text)) sb.append(text).append(' ');
		if (lines != null) {
			for (CharSequence l : lines) {
				if (l != null) sb.append(l).append(' ');
			}
		}
		String content = sb.toString().trim();

		BankTransaction tx = parseTransaction(title, content, sbn.getPackageName());
		if (tx == null) return;

		// stable key for dedupe
		String eventKey = sbn.getPackageName() + ":" + sbn.getId() + ":" + sbn.getPostTime();
		enqueueEvent(tx, eventKey);

		// Also broadcast if app is running to update UI immediately
		Intent intent = new Intent(ACTION_NEW_BANK_EVENT);
		intent.putExtra("id", tx.id);
		intent.putExtra("type", tx.type);
		intent.putExtra("amount", tx.amount);
		intent.putExtra("date", tx.dateMs);
		intent.putExtra("contact", tx.contact);
		intent.putExtra("description", tx.description);
		sendBroadcast(intent);
	}

	private void enqueueEvent(BankTransaction tx, String eventKey) {
		try {
			android.content.SharedPreferences prefs = getSharedPreferences(QUEUE_PREF, MODE_PRIVATE);
			String raw = prefs.getString(QUEUE_KEY, "[]");
			org.json.JSONArray arr = new org.json.JSONArray(raw);
			// dedupe by eventKey
			for (int i = 0; i < arr.length(); i++) {
				org.json.JSONObject o = arr.getJSONObject(i);
				if (eventKey.equals(o.optString("eventKey"))) return;
			}
			org.json.JSONObject obj = new org.json.JSONObject();
			obj.put("eventKey", eventKey);
			obj.put("id", tx.id);
			obj.put("type", tx.type);
			obj.put("amount", tx.amount);
			obj.put("date", tx.dateMs);
			obj.put("contact", tx.contact);
			obj.put("description", tx.description);
			arr.put(obj);
			prefs.edit().putString(QUEUE_KEY, arr.toString()).apply();
		} catch (Throwable ignored) {}
	}

	private BankTransaction parseTransaction(String title, String content, String pkg) {
		if (content == null) return null;
		String normalized = normalize(content);
		String normalizedTitle = normalize(title);
		String nl = normalized.toLowerCase(java.util.Locale.ROOT);
		String tl = normalizedTitle != null ? normalizedTitle.toLowerCase(java.util.Locale.ROOT) : "";

		// Enhanced detection for financial notifications
		boolean looksLikePix = nl.contains("pix") || nl.contains("transferencia") || nl.contains("transferência") || 
						   tl.contains("pix") || nl.contains("ted") || nl.contains("doc") || 
						   nl.contains("pagamento") || nl.contains("recebimento") ||
						   nl.contains("débito") || nl.contains("crédito") || nl.contains("saque") ||
						   nl.contains("depósito") || nl.contains("deposito");
		boolean hasAmount = extractAmountBRL(nl + " " + tl) > 0;
		boolean isC6 = isLikelyC6(pkg, tl);
		
		Log.d(TAG, String.format("Notification analysis - Package: %s, LooksPix: %b, HasAmount: %b, IsC6: %b", 
			pkg, looksLikePix, hasAmount, isC6));
		
		// Accept if it's from a known bank AND (has financial keywords OR has amount)
		if (!isC6 || !(looksLikePix || hasAmount)) {
			return null;
		}

		String type = null;
		if (nl.contains("pix enviado") || nl.contains("enviado") || nl.contains("debito") || nl.contains("débito")) {
			type = "sent";
		}
		if (type == null && (nl.contains("pix recebido") || nl.contains("recebido") || nl.contains("credito") || nl.contains("crédito") || nl.contains("recebido(a) de"))) {
			type = "received";
		}
		if (type == null) return null;

		double amount = extractAmountBRL(nl + " " + tl); // Check both content and title for amount
		long now = System.currentTimeMillis();
		String contact = extractContact(normalized);
		String description = !TextUtils.isEmpty(title) ? title : "PIX";

		BankTransaction tx = new BankTransaction();
		tx.id = now + "-" + Math.abs(normalized.hashCode());
		tx.type = type;
		tx.amount = amount;
		tx.dateMs = now;
		tx.contact = contact;
		tx.description = description;
		return tx;
	}

	private boolean isLikelyC6(String pkg, String title) {
		if (pkg == null) pkg = "";
		pkg = pkg.toLowerCase();
		
		// Enhanced C6 Bank package detection
		if (pkg.contains("c6bank") || pkg.equals("com.c6bank.app") || 
			pkg.equals("com.c6bank") || pkg.contains("banco.c6") ||
			pkg.contains("bancointer") || pkg.contains("inter")) {
			Log.d(TAG, "Detected C6/Inter bank package: " + pkg);
			return true;
		}
		
		// Check title for bank indicators
		if (title != null) {
			String tl = title.toLowerCase();
			if (tl.contains("c6") || tl.contains("banco c6") || tl.contains("inter") ||
				tl.contains("pix") || tl.contains("transferência") || tl.contains("transferencia")) {
				Log.d(TAG, "Detected bank keywords in title: " + title);
				return true;
			}
		}
		
		return false;
	}

	private String normalize(String s) {
		String out = s.replace("\n", " ").replace("\u00a0", " ").trim();
		while (out.contains("  ")) out = out.replace("  ", " ");
		return out;
	}

	private double extractAmountBRL(String text) {
		// Multiple regex patterns for different BRL formats
		java.util.List<java.util.regex.Pattern> patterns = new java.util.ArrayList<>();
		// Standard format: R$ 1.234,56
		patterns.add(java.util.regex.Pattern.compile("R\\$\\s*([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})"));
		// Without R$: 1.234,56
		patterns.add(java.util.regex.Pattern.compile("([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})"));
		// Simple format: R$ 123,45 or 123,45
		patterns.add(java.util.regex.Pattern.compile("R?\\$?\\s*([0-9]+,[0-9]{2})"));
		// Alternative format: R$ 0,01
		patterns.add(java.util.regex.Pattern.compile("R\\$\\s*([0-9]+,[0-9]{1,2})"));
		// International format: R$ 1,234.56 (sometimes used)
		patterns.add(java.util.regex.Pattern.compile("R\\$\\s*([0-9]{1,3}(?:,[0-9]{3})*\\.[0-9]{2})"));
		
		for (java.util.regex.Pattern p : patterns) {
			java.util.regex.Matcher m = p.matcher(text);
			if (m.find()) {
				String raw = m.group(1);
				Log.d(TAG, "Found amount match: " + raw);
				
				// Handle different decimal separators
				String normalized;
				if (raw.contains(".") && raw.contains(",")) {
					// Format: 1.234,56
					normalized = raw.replace(".", "").replace(",", ".");
				} else if (raw.contains(",") && !raw.contains(".")) {
					// Format: 123,45
					normalized = raw.replace(",", ".");
				} else {
					// Format: 123.45 or just numbers
					normalized = raw;
				}
				
				try { 
					double amount = Double.parseDouble(normalized);
					if (amount > 0) {
						Log.d(TAG, "Extracted amount: " + amount);
						return amount;
					}
				} catch (Exception e) {
					Log.w(TAG, "Failed to parse amount: " + normalized, e);
				}
			}
		}
		return 0.0;
	}

	private String extractContact(String text) {
		List<java.util.regex.Pattern> patterns = new ArrayList<>();
		patterns.add(java.util.regex.Pattern.compile("(?i)para\\s+([A-Za-zÀ-ÿ'\\s]{2,80})"));
		patterns.add(java.util.regex.Pattern.compile("(?i)recebido\\(a\\)\\s+de\\s+['\"]?([A-Za-zÀ-ÿ'\\s]{2,80})['\"]?"));
		patterns.add(java.util.regex.Pattern.compile("(?i)de\\s+['\"]?([A-Za-zÀ-ÿ'\\s]{2,80})['\"]?"));
		for (java.util.regex.Pattern p : patterns) {
			java.util.regex.Matcher m = p.matcher(text);
			if (m.find()) {
				String name = m.group(1).trim();
				name = name.replace("…", "").replace("...", "").replaceAll("[.,]$", "").trim();
				return name;
			}
		}
		return "Desconhecido";
	}

	static class BankTransaction {
		String id;
		String type; // received | sent
		double amount;
		long dateMs;
		String contact;
		String description;
	}
}