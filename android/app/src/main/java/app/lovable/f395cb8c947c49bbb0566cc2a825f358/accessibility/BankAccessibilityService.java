package app.lovable.f395cb8c947c49bbb0566cc2a825f358.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.text.TextUtils;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BankAccessibilityService extends AccessibilityService {
    public static final String ACTION_NEW_BANK_EVENT = "app.lovable.BANK_ACCESSIBILITY_EVENT";
    private static final String QUEUE_PREF = "bank_events_queue";
    private static final String QUEUE_KEY = "events";
    private static final String TAG = "BankAccessibilityService";

    // C6 Bank and banking-related package names
    private static final String[] BANK_PACKAGES = {
        "com.c6bank.app",
        "com.c6bank",
        "com.bancointer.android",
        "com.nubank",
        "com.bradesco",
        "com.itau",
        "com.santander.app",
        "com.bb.android"
    };

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        // Only process events from banking apps
        if (!isBankingApp(packageName)) return;
        
        Log.d(TAG, "Banking app event detected from: " + packageName);
        Log.d(TAG, "Event type: " + AccessibilityEvent.eventTypeToString(event.getEventType()));
        
        // Process different types of events
        switch (event.getEventType()) {
            case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
            case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
            case AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED:
                processScreenContent(event, packageName);
                break;
        }
    }

    private void processScreenContent(AccessibilityEvent event, String packageName) {
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            String screenText = extractScreenText(rootNode);
            Log.d(TAG, "Screen content: " + screenText);
            
            if (containsTransactionInfo(screenText)) {
                BankTransaction transaction = parseTransactionFromScreen(screenText, packageName);
                if (transaction != null) {
                    Log.d(TAG, "Transaction detected: " + transaction.toString());
                    persistTransaction(transaction);
                    broadcastTransaction(transaction);
                }
            }
        } finally {
            rootNode.recycle();
        }
    }

    private String extractScreenText(AccessibilityNodeInfo node) {
        if (node == null) return "";
        
        StringBuilder screenText = new StringBuilder();
        extractTextRecursively(node, screenText);
        return screenText.toString();
    }

    private void extractTextRecursively(AccessibilityNodeInfo node, StringBuilder text) {
        if (node == null) return;
        
        // Get text from this node
        CharSequence nodeText = node.getText();
        if (nodeText != null && !TextUtils.isEmpty(nodeText.toString().trim())) {
            text.append(nodeText.toString().trim()).append(" ");
        }
        
        // Get content description
        CharSequence contentDesc = node.getContentDescription();
        if (contentDesc != null && !TextUtils.isEmpty(contentDesc.toString().trim())) {
            text.append(contentDesc.toString().trim()).append(" ");
        }
        
        // Recursively process children
        int childCount = node.getChildCount();
        for (int i = 0; i < childCount; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                extractTextRecursively(child, text);
                child.recycle();
            }
        }
    }

    private boolean containsTransactionInfo(String text) {
        if (TextUtils.isEmpty(text)) return false;
        
        String lowerText = text.toLowerCase();
        
        // Look for PIX or transaction keywords
        boolean hasPixKeywords = lowerText.contains("pix") || 
                                lowerText.contains("transferência") || 
                                lowerText.contains("transferencia") ||
                                lowerText.contains("enviado") ||
                                lowerText.contains("recebido") ||
                                lowerText.contains("pagamento") ||
                                lowerText.contains("recebimento");
        
        // Look for monetary values
        boolean hasMonetaryValue = extractAmountBRL(text) > 0;
        
        return hasPixKeywords && hasMonetaryValue;
    }

    private BankTransaction parseTransactionFromScreen(String screenText, String packageName) {
        if (TextUtils.isEmpty(screenText)) return null;
        
        String normalizedText = screenText.toLowerCase().trim();
        
        // Determine transaction type
        String type = null;
        if (normalizedText.contains("enviado") || normalizedText.contains("pix enviado") || 
            normalizedText.contains("débito") || normalizedText.contains("debito")) {
            type = "sent";
        } else if (normalizedText.contains("recebido") || normalizedText.contains("pix recebido") || 
                  normalizedText.contains("crédito") || normalizedText.contains("credito")) {
            type = "received";
        }
        
        if (type == null) return null;
        
        // Extract amount
        double amount = extractAmountBRL(screenText);
        if (amount <= 0) return null;
        
        // Extract contact/recipient
        String contact = extractContact(screenText);
        
        // Create transaction
        BankTransaction transaction = new BankTransaction();
        transaction.id = System.currentTimeMillis() + "-" + Math.abs(screenText.hashCode());
        transaction.type = type;
        transaction.amount = amount;
        transaction.dateMs = System.currentTimeMillis();
        transaction.contact = contact;
        transaction.description = determineDescription(screenText, type);
        transaction.source = packageName;
        
        return transaction;
    }

    private double extractAmountBRL(String text) {
        List<Pattern> patterns = new ArrayList<>();
        // Standard format: R$ 1.234,56
        patterns.add(Pattern.compile("R\\$\\s*([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})"));
        // Small amounts: R$ 0,01 to R$ 9,99
        patterns.add(Pattern.compile("R\\$\\s*([0-9],[0-9]{2})"));
        // Simple format: R$ 123,45
        patterns.add(Pattern.compile("R\\$\\s*([0-9]+,[0-9]{2})"));
        // "valor de" pattern
        patterns.add(Pattern.compile("valor de R\\$\\s*([0-9]+,[0-9]{2})"));
        // Without R$ symbol
        patterns.add(Pattern.compile("([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})"));
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                String raw = matcher.group(1);
                Log.d(TAG, "Found amount match: " + raw);
                
                try {
                    String normalized = raw.replace(".", "").replace(",", ".");
                    double amount = Double.parseDouble(normalized);
                    if (amount > 0) {
                        Log.d(TAG, "Extracted amount: " + amount);
                        return amount;
                    }
                } catch (Exception e) {
                    Log.w(TAG, "Failed to parse amount: " + raw, e);
                }
            }
        }
        return 0.0;
    }

    private String extractContact(String text) {
        List<Pattern> patterns = new ArrayList<>();
        patterns.add(Pattern.compile("(?i)para\\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\\s]{2,50})"));
        patterns.add(Pattern.compile("(?i)recebido\\s+de\\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\\s]{2,50})"));
        patterns.add(Pattern.compile("(?i)de\\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\\s]{2,50})"));
        patterns.add(Pattern.compile("([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]{2,}\\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]{2,}(?:\\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]{2,})*)")); // Full names
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                String name = matcher.group(1).trim();
                // Clean up the name
                name = name.replaceAll("\\s+", " ");
                name = name.replaceAll("[,.]$", "");
                if (name.length() >= 4 && name.length() <= 50) {
                    return name;
                }
            }
        }
        return "Desconhecido";
    }

    private String determineDescription(String screenText, String type) {
        if (screenText.toLowerCase().contains("pix")) {
            return type.equals("sent") ? "PIX Enviado" : "PIX Recebido";
        }
        return type.equals("sent") ? "Pagamento" : "Recebimento";
    }

    private boolean isBankingApp(String packageName) {
        if (TextUtils.isEmpty(packageName)) return false;
        
        String lowerPackage = packageName.toLowerCase();
        for (String bankPackage : BANK_PACKAGES) {
            if (lowerPackage.equals(bankPackage.toLowerCase()) || 
                lowerPackage.contains(bankPackage.toLowerCase())) {
                return true;
            }
        }
        
        // Also check for generic banking keywords
        return lowerPackage.contains("bank") || lowerPackage.contains("banco") || 
               lowerPackage.contains("c6") || lowerPackage.contains("pix");
    }

    private void persistTransaction(BankTransaction transaction) {
        try {
            SharedPreferences prefs = getSharedPreferences(QUEUE_PREF, MODE_PRIVATE);
            String raw = prefs.getString(QUEUE_KEY, "[]");
            JSONArray arr = new JSONArray(raw);
            
            // Check for duplicates
            String eventKey = transaction.source + ":" + transaction.id + ":" + transaction.dateMs;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                if (eventKey.equals(obj.optString("eventKey"))) {
                    Log.d(TAG, "Duplicate transaction avoided");
                    return;
                }
            }
            
            // Add new transaction
            JSONObject obj = new JSONObject();
            obj.put("eventKey", eventKey);
            obj.put("id", transaction.id);
            obj.put("type", transaction.type);
            obj.put("amount", transaction.amount);
            obj.put("date", transaction.dateMs);
            obj.put("contact", transaction.contact);
            obj.put("description", transaction.description);
            
            arr.put(obj);
            prefs.edit().putString(QUEUE_KEY, arr.toString()).apply();
            
            Log.d(TAG, "Transaction persisted to queue");
        } catch (Exception e) {
            Log.e(TAG, "Failed to persist transaction", e);
        }
    }

    private void broadcastTransaction(BankTransaction transaction) {
        Intent intent = new Intent(ACTION_NEW_BANK_EVENT);
        intent.putExtra("id", transaction.id);
        intent.putExtra("type", transaction.type);
        intent.putExtra("amount", transaction.amount);
        intent.putExtra("date", transaction.dateMs);
        intent.putExtra("contact", transaction.contact);
        intent.putExtra("description", transaction.description);
        sendBroadcast(intent);
        
        Log.d(TAG, "Transaction broadcast sent");
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "AccessibilityService interrupted");
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "BankAccessibilityService connected");
    }

    // Transaction data class
    static class BankTransaction {
        String id;
        String type; // received | sent
        double amount;
        long dateMs;
        String contact;
        String description;
        String source; // package name
        
        @Override
        public String toString() {
            return String.format("BankTransaction{type=%s, amount=%.2f, contact=%s, source=%s}", 
                type, amount, contact, source);
        }
    }
}