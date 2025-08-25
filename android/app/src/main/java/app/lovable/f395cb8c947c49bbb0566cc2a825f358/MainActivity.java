package app.lovable.f395cb8c947c49bbb0566cc2a825f358;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// Register plugin BEFORE super.onCreate() in Capacitor 4+
		registerPlugin(app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications.HybridBankPlugin.class);
		super.onCreate(savedInstanceState);
	}
}
