import SwiftUI

struct RootView: View {
    @EnvironmentObject var session: SessionManager

    var body: some View {
        Group {
            if session.isChecking {
                ProgressView("Loading...")
                    .scaleEffect(1.5)
            } else {
                if session.isLoggedIn {
                    if session.onboardingComplete {
                        HomeView()
                    } else {
                        LocationView()
                    }
                } else {
                    LoginView()
                }
            }
        }
    }
}
