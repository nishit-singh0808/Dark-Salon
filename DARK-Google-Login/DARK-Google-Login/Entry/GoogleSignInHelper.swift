import Foundation
import SwiftUI
import FirebaseAuth
import FirebaseCore
import GoogleSignIn
import FirebaseFirestore

class GoogleSignInHelper: ObservableObject {
    @Published var isSignedIn = false
    @Published var userName = ""
    @AppStorage("isProfileComplete") var isProfileComplete: Bool = false
    
    func signIn(completion: @escaping (Bool) -> Void) {
        guard let clientID = FirebaseApp.app()?.options.clientID else { return }
        let config = GIDConfiguration(clientID: clientID)
        
        guard let rootViewController = UIApplication.shared.windows.first?.rootViewController else {
            print("❌ No root view controller")
            return
        }

        GIDSignIn.sharedInstance.configuration = config
        GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController) { result, error in
            if let error = error {
                print("❌ Google Sign-In error: \(error.localizedDescription)")
                return
            }

            guard let user = result?.user,
                  let idToken = user.idToken?.tokenString else {
                print("❌ Missing Google user credentials")
                return
            }

            let accessToken = user.accessToken.tokenString


            let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)
            
            Auth.auth().signIn(with: credential) { authResult, error in
                if let error = error {
                    print("❌ Firebase Sign-In error: \(error.localizedDescription)")
                    return
                }

                guard let uid = authResult?.user.uid else {
                    print("❌ No Firebase UID")
                    return
                }

                self.isSignedIn = true
                self.userName = authResult?.user.displayName ?? ""

                // Check Firestore if user already exists
                let db = Firestore.firestore()
                let docRef = db.collection("users").document(uid)
                docRef.getDocument { document, error in
                    if let error = error {
                                            print("❌ Firestore fetch error: \(error.localizedDescription)")
                                            self.isProfileComplete = false
                                            completion(true) // Default to signup on error
                                            return
                                        }
                    if let document = document, document.exists {
                                            if let profileComplete = document.get("profileComplete") as? Bool, profileComplete == true {
                                                print("✅ Existing user with complete profile")
                                                self.isProfileComplete = true
                                                completion(false) // Go to LocationView or Home
                                            } else {
                                                print("⚠️ Existing user but profile incomplete")
                                                self.isProfileComplete = false
                                                completion(true) // Go to signup
                                            }
                                        } else {
                                            print("🆕 New user document")
                                            self.isProfileComplete = false
                                            completion(true) // Go to signup
                                        }
                                    }
                                }
                            }
                        }
                    }
