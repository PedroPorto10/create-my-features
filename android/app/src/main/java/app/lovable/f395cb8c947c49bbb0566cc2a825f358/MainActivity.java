package app.lovable.f395cb8c947c49bbb0566cc2a825f358;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import app.lovable.f395cb8c947c49bbb0566cc2a825f358.notifications.BankNotificationsPlugin;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		registerPlugin(BankNotificationsPlugin.class);
	}
}
