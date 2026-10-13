import SwiftUI
import WebKit

/// Pantalla principal: la calculadora ocupa toda la pantalla y la franja
/// superior toma el mismo azul del encabezado.
struct ContentView: View {
    var body: some View {
        CalculadoraWebView()
            .background(Color("AccentColor").ignoresSafeArea())
    }
}

/// Muestra la calculadora web que viaja dentro de la app (carpeta www),
/// por lo que funciona sin conexión a internet.
struct CalculadoraWebView: UIViewRepresentable {

    func makeCoordinator() -> Coordinador { Coordinador() }

    func makeUIView(context: Context) -> WKWebView {
        let configuracion = WKWebViewConfiguration()
        configuracion.websiteDataStore = .nonPersistent()          // no guarda cookies ni datos
        configuracion.userContentController.add(context.coordinator, name: "compartir")

        let web = WKWebView(frame: .zero, configuration: configuracion)
        web.navigationDelegate = context.coordinator
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.contentInsetAdjustmentBehavior = .automatic

        if let inicio = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            web.loadFileURL(inicio, allowingReadAccessTo: inicio.deletingLastPathComponent())
        }
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {}

    @MainActor
    final class Coordinador: NSObject, WKScriptMessageHandler, WKNavigationDelegate {

        /// Recibe el resumen desde JavaScript y abre la hoja para compartir de iOS.
        func userContentController(_ controller: WKUserContentController, didReceive mensaje: WKScriptMessage) {
            guard mensaje.name == "compartir",
                  let texto = mensaje.body as? String,
                  let escena = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let raiz = escena.keyWindow?.rootViewController else { return }

            let hoja = UIActivityViewController(activityItems: [texto], applicationActivities: nil)
            // En iPad la hoja se muestra como ventana flotante y necesita un punto de origen.
            hoja.popoverPresentationController?.sourceView = raiz.view
            hoja.popoverPresentationController?.sourceRect = CGRect(x: raiz.view.bounds.midX,
                                                                    y: raiz.view.bounds.midY,
                                                                    width: 1, height: 1)
            raiz.present(hoja, animated: true)
        }

        /// Solo se permite abrir las páginas que vienen dentro de la app.
        func webView(_ webView: WKWebView,
                     decidePolicyFor accion: WKNavigationAction) async -> WKNavigationActionPolicy {
            accion.request.url?.isFileURL == true ? .allow : .cancel
        }
    }
}
