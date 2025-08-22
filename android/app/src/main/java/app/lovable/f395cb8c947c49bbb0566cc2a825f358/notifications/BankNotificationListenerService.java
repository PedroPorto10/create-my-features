package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.content.Intent;
import android.text.TextUtils;

public class BankNotificationListenerService extends NotificationListenerService {
	public static final String ACTION_NEW_BANK_EVENT = "app.lovable.BANK_NOTIFICATION_EVENT";

	@Override
	public void onNotificationPosted(StatusBarNotification sbn) {
		if (sbn == null) return;
		Notification notification = sbn.getNotification();
		if (notification == null) return;
		Bundle extras = notification.extras;
		if (extras == null) return;

		CharSequence titleCs = extras.getCharSequence(Notification.EXTRA_TITLE);
		CharSequence textCs = extras.getCharSequence(Notification.EXTRA_TEXT);
		CharSequence bigTextCs = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);

		String title = titleCs != null ? titleCs.toString() : "";
		String text = textCs != null ? textCs.toString() : "";
		String bigText = bigTextCs != null ? bigTextCs.toString() : "";

		String content = !TextUtils.isEmpty(bigText) ? bigText : text;

		if (!isFromC6Bank(sbn)) return;

		BankTransaction tx = parseTransaction(title, content);
		if (tx == null) return;

		Intent intent = new Intent(ACTION_NEW_BANK_EVENT);
		intent.putExtra("id", tx.id);
		intent.putExtra("type", tx.type);
		intent.putExtra("amount", tx.amount);
		intent.putExtra("date", tx.dateMs);
		intent.putExtra("contact", tx.contact);
		intent.putExtra("description", tx.description);
		sendBroadcast(intent);
	}

	private boolean isFromC6Bank(StatusBarNotification sbn) {
		String pkg = sbn.getPackageName();
		if (pkg == null) return false;
		// Common C6 Bank packages; adjust if needed
		return pkg.contains("c6bank") || pkg.contains("c6") || pkg.equals("com.c6bank.app");
	}

	private BankTransaction parseTransaction(String title, String content) {
		if (content == null) return null;
		String normalized = content.replace("\n", " ").trim();

		String type = null;
		if (normalized.toLowerCase().contains("pix recebido") || normalized.toLowerCase().contains("crédito") || normalized.toLowerCase().contains("recebido")) {
			type = "received";
		} else if (normalized.toLowerCase().contains("pix enviado") || normalized.toLowerCase().contains("débito") || normalized.toLowerCase().contains("enviado")) {
			type = "sent";
		}
		if (type == null) return null;

		double amount = extractAmountBRL(normalized);
		long now = System.currentTimeMillis();
		String contact = extractContact(normalized);
		String description = title;

		BankTransaction tx = new BankTransaction();
		tx.id = now + "-" + Math.abs(normalized.hashCode());
		tx.type = type;
		tx.amount = amount;
		tx.dateMs = now;
		tx.contact = contact;
		tx.description = description;
		return tx;
	}

	private double extractAmountBRL(String text) {
		// Look for patterns like R$ 123,45 or 123,45
		java.util.regex.Matcher m = java.util.regex.Pattern.compile("R?\$?\s*([0-9]{1,3}(\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})").matcher(text);
		if (m.find()) {
			String raw = m.group(1);
			String normalized = raw.replace(".", "").replace(",", ".");
			try { return Double.parseDouble(normalized); } catch (Exception ignored) {}
		}
		return 0.0;
	}

	private String extractContact(String text) {
		// naive heuristic: names often after "de" or "para" or between quotes
		java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?:de|para)\s+([A-Za-zÀ-ÿ'\s]{2,40})").matcher(text);
		if (m.find()) return m.group(1).trim();
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