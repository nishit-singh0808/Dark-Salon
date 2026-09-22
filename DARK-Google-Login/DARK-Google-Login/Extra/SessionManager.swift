import FirebaseAuth
import FirebaseFirestore

class SessionManager: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var onboardingComplete: Bool = false
    @Published var isChecking: Bool = true // ✅ New flag

    init() {
        checkLoginStatus()
    }

    func checkLoginStatus() {
        isChecking = true // 🔄 Begin loading

        if let user = Auth.auth().currentUser {
            isLoggedIn = true
            let uid = user.uid

            Firestore.firestore().collection("users").document(uid).getDocument { doc, error in
                defer { self.isChecking = false } // ✅ Always mark check complete

                if let data = doc?.data(), let location = data["location"] as? String, !location.isEmpty {
                    self.onboardingComplete = true
                } else {
                    self.onboardingComplete = false
                }
            }
        } else {
            isLoggedIn = false
            onboardingComplete = false
            isChecking = false
        }
    }

    func logout() {
        do {
            try Auth.auth().signOut()
            isLoggedIn = false
            onboardingComplete = false
        } catch {
            print("Logout error: \(error)")
        }
    }
}
