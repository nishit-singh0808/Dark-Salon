import SwiftUI
import FirebaseAuth

struct LoginView: View {
    @EnvironmentObject var session: SessionManager
    @StateObject private var signInHelper = GoogleSignInHelper()
    @State private var navigateToTerms = false
    @State private var navigateToPrivacy = false
    @State private var navigateToSignup = false
    @State private var navigateToLocation = false
    
    let brandColor = Color(hex: "#FFD28F")

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 25) {
                    Spacer()
                    
                    // Logo
                    Image("logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 180, height: 180)
                    
                    // Welcome Text
                    Text("Welcome to DARK Salon")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(brandColor)
                        .multilineTextAlignment(.center)
                    
                    // Subtitle
                    Text("Your Personal Salon, Anytime. Anywhere.")
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                    
                    // Google Sign-In Button
                    Button(action: {
                        signInHelper.signIn { isNewUser in
                            if isNewUser {
                                navigateToSignup = true
                            } else {
                                navigateToLocation = true
                            }
                        }
                    }) {
                        HStack(spacing: 10) {
                            Image("google")
                                .resizable()
                                .frame(width: 20, height: 20)
                            
                            Text("Sign in with Google")
                                .font(.headline)
                                .bold()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.white)
                        .foregroundColor(.black)
                        .cornerRadius(25)
                        .shadow(color: brandColor.opacity(0.6), radius: 8, x: 0, y: 5)
                    }
                    .padding(.horizontal, 40)
                    
                    Spacer()
                    
//MARK: Terms & Condition
                    VStack(spacing: 4) {
                        Text("By continuing, you agree to our")
                            .foregroundColor(.gray)
                            .font(.footnote)

                        HStack(spacing: 4) {
                            Button(action: {
                                navigateToTerms = true
                            }) {
                                Text("Terms & Conditions")
                                    .foregroundColor(brandColor)
                                    
                            }
                            Text("and")
                                .foregroundColor(.gray)
                                .font(.footnote)
                            Button(action: {
                                navigateToPrivacy = true
                            }) {
                                Text("Privacy Policy")
                                    .foregroundColor(brandColor)
                                    
                            }
                        }
                        .font(.footnote)

                        NavigationLink("", destination: TermsAndConditionsView(), isActive: $navigateToTerms).hidden()
                        NavigationLink("", destination: PrivacyPolicyView(), isActive: $navigateToPrivacy).hidden()
                    }
                    .multilineTextAlignment(.center)

                    
                }
                .padding()
            }

            // 🔁 Navigation destinations
            NavigationLink(destination: SignupView(navigateToLocation: $navigateToLocation), isActive: $navigateToSignup) {
                EmptyView()
            }
            .navigationDestination(isPresented: $navigateToLocation) {
                LocationView()
            }
        }
    }
}

// MARK: - HEX Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0

        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}
