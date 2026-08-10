import SwiftUI

struct CompassView: View {
    @EnvironmentObject private var headingService: HeadingService

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.04, green: 0.07, blue: 0.10),
                        Color(red: 0.08, green: 0.12, blue: 0.18),
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 28) {
                    Text("Hogback Ops")
                        .font(.caption.weight(.semibold))
                        .tracking(3)
                        .foregroundStyle(Color(red: 0.77, green: 0.36, blue: 0.24))
                        .textCase(.uppercase)

                    CompassRose(heading: headingService.heading ?? 0)
                        .frame(width: 260, height: 260)

                    VStack(spacing: 6) {
                        Text(headingLabel)
                            .font(.system(size: 42, weight: .semibold, design: .rounded))
                            .foregroundStyle(.white)
                            .monospacedDigit()

                        Text(cardinalLabel)
                            .font(.title3.weight(.medium))
                            .foregroundStyle(.white.opacity(0.85))

                        Text(statusLabel)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    if let coordinate = headingService.coordinate {
                        Text(
                            String(
                                format: "%.5f, %.5f",
                                coordinate.latitude,
                                coordinate.longitude
                            )
                        )
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                    }

                    Spacer(minLength: 0)
                }
                .padding(.top, 24)
            }
            .navigationTitle("Compass")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var headingLabel: String {
        guard let heading = headingService.heading else { return "—" }
        return String(format: "%.0f°", heading)
    }

    private var cardinalLabel: String {
        guard let heading = headingService.heading else { return "Waiting for heading" }
        return cardinal(from: heading)
    }

    private var statusLabel: String {
        switch headingService.authorizationStatus {
        case .notDetermined:
            return "Allow location access to read device heading."
        case .denied, .restricted:
            return "Location permission is off. Enable it in Settings to use the compass."
        default:
            if headingService.heading == nil {
                return "Hold the iPhone flat and move it in a figure‑eight if heading is unavailable."
            }
            return "Native heading via Core Location — pairs with the Ops map AR Compass."
        }
    }

    private func cardinal(from heading: Double) -> String {
        let names = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
        let index = Int((heading + 22.5).truncatingRemainder(dividingBy: 360) / 45.0) % 8
        return names[index]
    }
}

private struct CompassRose: View {
    let heading: Double

    var body: some View {
        ZStack {
            Circle()
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 2)
                .background(Circle().fill(Color.white.opacity(0.04)))

            ForEach(0..<72, id: \.self) { tick in
                Capsule()
                    .fill(Color.white.opacity(tick % 6 == 0 ? 0.7 : 0.25))
                    .frame(width: tick % 6 == 0 ? 2.5 : 1, height: tick % 6 == 0 ? 16 : 8)
                    .offset(y: -112)
                    .rotationEffect(.degrees(Double(tick) * 5))
            }

            Text("N")
                .font(.headline.weight(.bold))
                .foregroundStyle(Color(red: 0.77, green: 0.36, blue: 0.24))
                .offset(y: -95)

            Image(systemName: "location.north.fill")
                .font(.system(size: 36))
                .foregroundStyle(Color(red: 0.77, green: 0.36, blue: 0.24))
                .offset(y: -40)

            Circle()
                .fill(Color.white)
                .frame(width: 10, height: 10)
        }
        .rotationEffect(.degrees(-heading))
        .animation(.easeOut(duration: 0.2), value: heading)
    }
}

#Preview {
    CompassView()
        .environmentObject(HeadingService())
}
