import SwiftUI

@main
struct HogbackOpsApp: App {
    @StateObject private var headingService = HeadingService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(headingService)
                .preferredColorScheme(.dark)
        }
    }
}
