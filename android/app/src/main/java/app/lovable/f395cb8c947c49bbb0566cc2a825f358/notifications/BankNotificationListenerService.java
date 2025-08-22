package app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.content.Intent;
import android.text.TextUtils;

import java.util.ArrayList;
import java.util.List;

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

		Intent intent = new Intent(ACTION_NEW_BANK_EVENT);
		intent.putExtra("id", tx.id);
		intent.putExtra("type", tx.type);
		intent.putExtra("amount", tx.amount);
		intent.putExtra("date", tx.dateMs);
		intent.putExtra("contact", tx.contact);
		intent.putExtra("description", tx.description);
		sendBroadcast(intent);
	}

	private BankTransaction parseTransaction(String title, String content, String pkg) {
		if (content == null) return null;
		String normalized = normalize(content);
		String normalizedTitle = normalize(title);
		String nl = normalized.toLowerCase(java.util.Locale.ROOT);
		String tl = normalizedTitle != null ? normalizedTitle.toLowerCase(java.util.Locale.ROOT) : "";

		// Only proceed if it looks like a PIX/transfer notification
		boolean looksLikePix = nl.contains("pix") || nl.contains("transferencia") || nl.contains("transferência") || tl.contains("pix");
		boolean hasAmount = extractAmountBRL(nl) > 0;
		if (!(looksLikePix && hasAmount)) {
			// allow C6 Bank by package name or title mention as fallback
			if (!isLikelyC6(pkg, tl)) return null;
		}

		String type = null;
		if (nl.contains("pix enviado") || nl.contains("enviado") || nl.contains("debito") || nl.contains("débito")) {
			type = "sent";
		}
		if (type == null && (nl.contains("pix recebido") || nl.contains("recebido") || nl.contains("credito") || nl.contains("crédito") || nl.contains("recebido(a) de"))) {
			type = "received";
		}
		if (type == null) return null;

		double amount = extractAmountBRL(nl);
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
		if (pkg.contains("c6bank") || pkg.contains("c6") || pkg.equals("com.c6bank.app")) return true;
		return title != null && title.toLowerCase().contains("c6");
	}

	private String normalize(String s) {
		String out = s.replace("\n", " ").replace("\u00a0", " ").trim();
		while (out.contains("  ")) out = out.replace("  ", " ");
		return out;
	}

	private double extractAmountBRL(String text) {
		java.util.regex.Pattern p = java.util.regex.Pattern.compile("R?\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})");
		java.util.regex.Matcher m = p.matcher(text);
		if (m.find()) {
			String raw = m.group(1);
			String normalized = raw.replace(".", "").replace(",", ".");
			try { return Double.parseDouble(normalized); } catch (Exception ignored) {}
		}
		return 0.0;
	}

	private String extractContact(String text) {
		List<java.util.regex.Pattern> patterns = new ArrayList<>();
		patterns.add(java.util.regex.Pattern.compile("(?i)para\s+([A-Za-zÀ-ÿ'\s]{2,80})"));
		patterns.add(java.util.regex.Pattern.compile("(?i)recebido\(a\)\s+de\s+['\"]?([A-Za-zÀ-ÿ'\s]{2,80})['\"]?"));
		patterns.add(java.util.regex.Pattern.compile("(?i)de\s+['\"]?([A-Za-zÀ-ÿ'\s]{2,80})['\"]?"));
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