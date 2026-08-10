import Foundation
import Network

/// Serves the bundled `WebApp` static export on loopback so WKWebView can
/// load Hogback Ops with normal http:// absolute paths (`/_next/...`, `/apps/ops`).
@MainActor
final class LocalWebAppServer: ObservableObject {
    static let shared = LocalWebAppServer()

    @Published private(set) var port: UInt16?
    @Published private(set) var lastError: String?

    private var listener: NWListener?
    private let queue = DispatchQueue(label: "com.hogbacktech.ops.webapp")

    var opsURL: URL? {
        guard let port else { return nil }
        return URL(string: "http://127.0.0.1:\(port)/apps/ops")
    }

    func start() {
        if listener != nil, port != nil { return }

        do {
            let listener = try NWListener(using: .tcp, on: .any)
            self.listener = listener

            listener.stateUpdateHandler = { [weak self] state in
                Task { @MainActor in
                    guard let self else { return }
                    switch state {
                    case .ready:
                        if let p = listener.port?.rawValue {
                            self.port = p
                            self.lastError = nil
                        }
                    case .failed(let error):
                        self.lastError = error.localizedDescription
                        self.port = nil
                    default:
                        break
                    }
                }
            }

            listener.newConnectionHandler = { [weak self] connection in
                self?.handle(connection)
            }

            listener.start(queue: queue)
        } catch {
            lastError = error.localizedDescription
        }
    }

    func stop() {
        listener?.cancel()
        listener = nil
        port = nil
    }

    private func handle(_ connection: NWConnection) {
        connection.start(queue: queue)
        receive(on: connection, buffer: Data())
    }

    private func receive(on connection: NWConnection, buffer: Data) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 64 * 1024) { [weak self] data, _, isComplete, error in
            var buffer = buffer
            if let data { buffer.append(data) }

            if let range = buffer.range(of: Data("\r\n\r\n".utf8)) {
                let headerData = buffer.subdata(in: buffer.startIndex..<range.lowerBound)
                self?.respond(to: headerData, on: connection)
                return
            }

            if isComplete || error != nil {
                connection.cancel()
                return
            }

            self?.receive(on: connection, buffer: buffer)
        }
    }

    private func respond(to headerData: Data, on connection: NWConnection) {
        guard let header = String(data: headerData, encoding: .utf8),
              let requestLine = header.split(separator: "\r\n").first
        else {
            connection.cancel()
            return
        }

        let parts = requestLine.split(separator: " ")
        guard parts.count >= 2 else {
            connection.cancel()
            return
        }

        var path = String(parts[1])
        if let q = path.firstIndex(of: "?") {
            path = String(path[..<q])
        }
        path = path.removingPercentEncoding ?? path
        if path == "/" { path = "/apps/ops" }

        guard let fileURL = Self.resolveFile(path: path),
              let body = try? Data(contentsOf: fileURL)
        else {
            let message = "Not Found: \(path)"
            let payload = Data(message.utf8)
            let response = httpResponse(status: "404 Not Found", contentType: "text/plain", body: payload)
            connection.send(content: response, completion: .contentProcessed { _ in
                connection.cancel()
            })
            return
        }

        let response = httpResponse(
            status: "200 OK",
            contentType: Self.mimeType(for: fileURL),
            body: body
        )
        connection.send(content: response, completion: .contentProcessed { _ in
            connection.cancel()
        })
    }

    private func httpResponse(status: String, contentType: String, body: Data) -> Data {
        let header = """
        HTTP/1.1 \(status)\r
        Content-Type: \(contentType)\r
        Content-Length: \(body.count)\r
        Connection: close\r
        Access-Control-Allow-Origin: *\r
        Cache-Control: no-cache\r
        \r

        """
        var data = Data(header.utf8)
        data.append(body)
        return data
    }

    private static func webRoot() -> URL? {
        if let bundled = Bundle.main.resourceURL?.appendingPathComponent("WebApp", isDirectory: true),
           FileManager.default.fileExists(atPath: bundled.path) {
            return bundled
        }
        return Bundle.main.url(forResource: "WebApp", withExtension: nil)
    }

    private static func resolveFile(path: String) -> URL? {
        guard let root = webRoot() else { return nil }
        var relative = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if relative.isEmpty { relative = "apps/ops.html" }

        var candidate = root.appendingPathComponent(relative)
        if candidate.pathExtension.isEmpty {
            let html = root.appendingPathComponent(relative + ".html")
            if FileManager.default.fileExists(atPath: html.path) {
                candidate = html
            } else {
                let index = candidate.appendingPathComponent("index.html")
                if FileManager.default.fileExists(atPath: index.path) {
                    candidate = index
                }
            }
        }
        return FileManager.default.fileExists(atPath: candidate.path) ? candidate : nil
    }

    private static func mimeType(for fileURL: URL) -> String {
        switch fileURL.pathExtension.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "woff": return "font/woff"
        case "woff2": return "font/woff2"
        case "txt": return "text/plain; charset=utf-8"
        case "map": return "application/json"
        default: return "application/octet-stream"
        }
    }
}
