import SwiftUI
import Firebase

@main
struct DARK_Google_LoginApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @StateObject var session = SessionManager()
    @AppStorage("isProfileComplete") var isProfileComplete: Bool = false

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
        }
    }
}
