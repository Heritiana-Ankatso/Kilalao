package io.github.heritianaankatso.kilalao;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Kilalao for Android: a full-screen WebView that serves the web app packaged
 * in the APK's assets (assets/www). Everything works offline and the app asks
 * for no permissions. Pages are served from https://appassets.androidplatform.net
 * (a name reserved for this purpose that never reaches the network), so ES
 * modules and localStorage behave exactly as on the web.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String PREFIX = "/www/";
    private static final String START = "https://" + HOST + PREFIX + "index.html";

    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html");
        MIME.put("js", "text/javascript"); // required for ES modules
        MIME.put("css", "text/css");
        MIME.put("svg", "image/svg+xml");
        MIME.put("png", "image/png");
        MIME.put("json", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
    }

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 28) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        web = new WebView(this);
        web.setBackgroundColor(0xFFEFE4CF);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setHapticFeedbackEnabled(false);
        web.setLongClickable(false);
        web.setOnLongClickListener(v -> true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100); // ignore the system font size: the toys have no text
        s.setSupportMultipleWindows(false);

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serveAsset(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Never leave the playroom.
                return !HOST.equals(request.getUrl().getHost());
            }
        });

        web.addJavascriptInterface(new Bridge(), "KilalaoAndroid");
        setContentView(web);
        hideSystemBars();

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int r = tts.setLanguage(Locale.US);
                if (r < 0) r = tts.setLanguage(Locale.ENGLISH);
                ttsReady = r >= 0;
            }
        });

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        }

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START);
    }

    /** Serves https://appassets.androidplatform.net/www/... from assets/www/. */
    private WebResourceResponse serveAsset(Uri url) {
        String path = url.getPath();
        if (!HOST.equals(url.getHost()) || path == null || !path.startsWith(PREFIX) || path.contains("..")) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
        }
        String file = "www/" + path.substring(PREFIX.length());
        if (file.endsWith("/")) file += "index.html";
        String ext = file.substring(file.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
        try {
            InputStream in = getAssets().open(file);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            return new WebResourceResponse(mime, mime.startsWith("text") ? "utf-8" : null, 200, "OK", headers, in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
        }
    }

    /** Back closes the open toy or adult panel; on the shelf it does nothing. */
    private void goBack() {
        web.evaluateJavascript("window.kilalaoBack && window.kilalaoBack()", null);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        goBack(); // Android 12 and older
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                c.hide(WindowInsets.Type.systemBars());
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onPause() {
        if (tts != null) tts.stop();
        web.onPause();
        web.pauseTimers();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.resumeTimers();
        web.onResume();
        hideSystemBars();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }

    /** Exposed to the page as window.KilalaoAndroid (used by the Phonics toy). */
    private class Bridge {
        @JavascriptInterface
        public void say(String text, double rate, double pitch, double volume, String lang) {
            if (!ttsReady || text == null || text.length() > 200) return;
            tts.setSpeechRate((float) Math.max(0.3, Math.min(2, rate)));
            tts.setPitch((float) Math.max(0.5, Math.min(2, pitch)));
            Bundle p = new Bundle();
            p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, (float) Math.max(0, Math.min(1, volume)));
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, p, "kilalao");
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) tts.stop();
        }
    }
}
