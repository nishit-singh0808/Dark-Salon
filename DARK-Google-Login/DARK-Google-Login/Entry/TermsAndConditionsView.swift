import SwiftUI

struct TermsAndConditionsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 15) {
                Text("Terms & Conditions")
                    .font(.title)
                    .foregroundColor(Color(hex: "#FFD28F"))
                    .bold()
                
                Text("""
                Your salon booking and usage of DARK salon services are subject to the following terms...

                [Add actual terms here]
                """)
                    .foregroundColor(.white)
                    .padding(.top, 10)
            }
            .padding()
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Terms & Conditions")
        .navigationBarTitleDisplayMode(.inline)
    }
}
