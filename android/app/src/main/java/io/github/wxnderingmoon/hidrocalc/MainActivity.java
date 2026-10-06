package io.github.wxnderingmoon.hidrocalc;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Pantalla única de HidroCalc: muestra la calculadora web que viaja
 * dentro del paquete (carpeta assets/www), por lo que no necesita internet.
 */
public class MainActivity extends Activity {

    private static final String INICIO = "file:///android_asset/www/index.html";
    private WebView vista;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        vista = new WebView(this);
        setContentView(vista);

        WebSettings ajustes = vista.getSettings();
        ajustes.setJavaScriptEnabled(true);       // la calculadora está hecha en JavaScript
        ajustes.setAllowContentAccess(false);     // no lee contenido de otras apps
        ajustes.setGeolocationEnabled(false);     // no usa ubicación
        ajustes.setSaveFormData(false);           // no guarda lo que se escribe

        // Solo se permite navegar entre las páginas que vienen dentro de la app.
        vista.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return !url.startsWith("file:///android_asset/www/");
            }
        });

        if (estado != null) {
            vista.restoreState(estado);
        } else {
            vista.loadUrl(INICIO);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        vista.saveState(estado);
    }

    @Override
    public void onBackPressed() {
        if (vista.canGoBack()) {
            vista.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
