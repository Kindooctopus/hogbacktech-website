import SwiftUI

enum OpsTab: Hashable {
    case map
    case compass
}

struct ContentView: View {
    @State private var tab: OpsTab = .map
    @EnvironmentObject private var headingService: HeadingService

    var body: some View {
        TabView(selection: $tab) {
            OpsMapView()
                .tabItem {
                    Label("Map", systemImage: "map.fill")
                }
                .tag(OpsTab.map)

            CompassView()
                .tabItem {
                    Label("Compass", systemImage: "location.north.line.fill")
                }
                .tag(OpsTab.compass)
        }
        .tint(Color("AccentColor"))
        .onAppear {
            headingService.requestAuthorization()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(HeadingService())
}
