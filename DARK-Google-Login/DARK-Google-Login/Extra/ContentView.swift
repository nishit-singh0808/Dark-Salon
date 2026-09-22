import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct ContentView: View {
    @AppStorage("isLoggedIn") var isLoggedIn: Bool = false

    @State private var userName: String = ""
    @State private var authChecked = false // ✅ Control when to show main view
    
    var body: some View {
        NavigationStack {
            if !authChecked {
                ProgressView("Checking login...")
                    .scaleEffect(1.5)
            } else {
                if isLoggedIn {
                    HomeView()
                } else {
                    LoginView()
                }
            }
        }
        .environment(\.colorScheme, .dark)
        .onAppear {
            checkLoginStatus()
        }
    }

    func checkLoginStatus() {
        if let user = Auth.auth().currentUser {
            let uid = user.uid
            userName = user.displayName ?? "Guest"

            // Optional: Check if user profile is saved in Firestore
            Firestore.firestore().collection("users").document(uid).getDocument { doc, error in
                if doc?.exists == true {
                    isLoggedIn = true
                } else {
                    isLoggedIn = true // Still logged in, just needs to complete profile
                }
                authChecked = true
            }
        } else {
            isLoggedIn = false
            authChecked = true
        }
    }
}
