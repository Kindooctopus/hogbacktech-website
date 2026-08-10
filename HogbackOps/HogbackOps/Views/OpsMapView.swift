import SwiftUI
import WebKit

/// Full Hogback Ops map — bundled web app (Geo layers, wind, places, AVL, AR Compass).
struct OpsMapView: View {
    @ObservedObject private var server = LocalWebAppServer.shared
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadToken = 0

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.07, blue: 0.10).ignoresSafeArea()

            if let url = server.opsURL {
                OpsWebView(
                    startURL: url,
                    isLoading: $isLoading,
                    loadError: $loadError,
                    reloadToken: reloadToken
                )
                .ignoresSafeArea()
            }

            if server.opsURL == nil || isLoading {
                VStack(spacing: 12) {
                    ProgressView()
                        .tint(Color(red: 0.77, green: 0.36, blue: 0.24))
                    Text(server.opsURL == nil ? "Starting Hogback Ops…" : "Loading Hogback Ops…")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white.opacity(0.85))
                }
                .padding(20)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
            }

            if let message = loadError ?? server.lastError {
                VStack(spacing: 14) {
                    Text("Couldn’t load Ops map")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(message)
                        .font(.footnote)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.white.opacity(0.7))
                    Button("Retry") {
                        loadError = nil
                        isLoading = true
                        server.start()
                        reloadToken += 1
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(red: 0.77, green: 0.36, blue: 0.24))
                }
                .padding(24)
                .background(Color.black.opacity(0.72), in: RoundedRectangle(cornerRadius: 16))
                .padding()
            }
        }
        .onAppear { server.start() }
    }
}

struct OpsWebView: UIViewRepresentable {
    let startURL: URL
    @Binding var isLoading: Bool
    @Binding var loadError: String?
    var reloadToken: Int

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.04, green: 0.07, blue: 0.1, alpha: 1)
        webView.load(URLRequest(url: startURL))
        context.coordinator.webView = webView
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        if context.coordinator.lastReloadToken != reloadToken {
            context.coordinator.lastReloadToken = reloadToken
            uiView.load(URLRequest(url: startURL))
        } else if context.coordinator.lastURL != startURL {
            context.coordinator.lastURL = startURL
            uiView.load(URLRequest(url: startURL))
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: OpsWebView
        weak var webView: WKWebView?
        var lastReloadToken: Int = -1
        var lastURL: URL?

        init(parent: OpsWebView) {
            self.parent = parent
            self.lastURL = parent.startURL
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.isLoading = true
            parent.loadError = nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.isLoading = false
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            parent.isLoading = false
            parent.loadError = error.localizedDescription
        }

        func webView(
            _ webView: WKWebView,
            didFail navigation: WKNavigation!,
            withError error: Error
        ) {
            parent.isLoading = false
            parent.loadError = error.localizedDescription
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            decisionHandler(.allow)
        }

        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            decisionHandler(.grant)
        }
    }
}

#Preview {
    OpsMapView()
}
