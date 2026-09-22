import SwiftUI

struct PrivacyPolicyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 15) {
                Text("Privacy Policy")
                    .font(.title)
                    .foregroundColor(Color(hex: "#FFD28F"))
                    .bold()

                Text("We respect your privacy. Here's what we collect...")
                    .foregroundColor(.white)

                // more text...
                    .padding(.top)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Color.black.ignoresSafeArea())
    }
}

