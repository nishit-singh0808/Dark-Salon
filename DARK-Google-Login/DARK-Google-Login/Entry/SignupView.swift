import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage

struct SignupView: View {
    @Binding var navigateToLocation: Bool

    @State private var gender: String = ""
    @State private var maritalStatus: String = ""
    @State private var selectedImage: UIImage?
    @State private var googleImageURL: URL?
    @State private var isImagePickerPresented = false
    @State private var isSaving = false
    @State private var fullName: String = ""
    @State private var email: String = ""
    @State private var phoneNumber: String = ""
    @State private var dateOfBirth: Date = Calendar.current.date(byAdding: .year, value: -18, to: Date())!
    @State private var isShowingPicker = false
    @AppStorage("isProfileComplete") var isProfileComplete: Bool = false
    
    // 🔶 Brand color
    let brandColor = Color(hex: "#FFD28F")

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                
                // Profile Image
                ZStack(alignment: .bottomTrailing) {
                    if let selectedImage = selectedImage {
                        Image(uiImage: selectedImage)
                            .resizable()
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())
                    } else if let url = googleImageURL {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } placeholder: {
                            ProgressView()
                                .frame(width: 100, height: 100)
                        }
                    } else {
                        Image(systemName: "person.crop.circle.badge.plus")
                            .resizable()
                            .frame(width: 100, height: 100)
                            .foregroundColor(.gray)
                    }

                    Button(action: {
                        isImagePickerPresented = true
                    }) {
                        Image(systemName: "pencil.circle.fill")
                            .foregroundColor(brandColor)
                            .background(Color.black)
                            .clipShape(Circle())
                            .frame(width: 30, height: 30)
                    }
                }
                .sheet(isPresented: $isImagePickerPresented) {
                    ImagePicker(image: $selectedImage)
                }

                // Name
                VStack(alignment: .leading) {
                    Text("Full Name")
                        .foregroundColor(.white.opacity(0.7))
                    TextField("Enter your full name", text: $fullName)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(10)
                }

                // Email (non-editable)
                VStack(alignment: .leading) {
                    Text("Email")
                        .foregroundColor(.white.opacity(0.7))
                    Text(email)
                        .foregroundColor(.gray)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(10)
                }

                // Phone Number
                VStack(alignment: .leading) {
                    Text("Phone Number")
                        .foregroundColor(.white.opacity(0.7))
                    TextField("Enter phone number", text: $phoneNumber)
                        .keyboardType(.phonePad)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(10)
                }
                
                

                // Date of Birth
                VStack(alignment: .leading) {
                            Text("Date of Birth")
                                .foregroundColor(.white.opacity(0.7))

                            Button(action: {
                                isShowingPicker.toggle()
                            }) {
                                HStack {
                                    Text(dateOfBirth, style: .date)
                                        .foregroundColor(.white)
                                    Spacer()
                                    Image(systemName: "calendar")
                                        .foregroundColor(.white)
                                }
                                .padding()
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(10)
                            }
                        }
                        .sheet(isPresented: $isShowingPicker) {
                            VStack {
                                DatePicker(
                                                    "Select Date",
                                                    selection: $dateOfBirth,
                                                    in: ...Calendar.current.date(byAdding: .year, value: -18, to: Date())!,
                                                    displayedComponents: .date
                                                )
                                    .datePickerStyle(.wheel)
                                    .labelsHidden()

                                Button("Done") {
                                    isShowingPicker = false
                                }
                                .padding()
                                .foregroundColor(.black)
                                .background(Color(brandColor))
                                .cornerRadius(10)
                            }
                            .presentationDetents([.height(250)])
                        }

                // Gender
                VStack(alignment: .leading, spacing: 6) {
                    Text("Gender")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.6))

                    HStack(spacing: 12) {
                        ForEach(["Female", "Male"], id: \.self) { option in
                            Button(action: {
                                gender = option
                            }) {
                                Text(option)
                                    .fontWeight(.semibold)
                                    .foregroundColor(gender == option ? .black : .white)
                                    .padding(.vertical, 10)
                                    .padding(.horizontal, 24)
                                    .background(gender == option ? Color(brandColor) : Color(.secondarySystemBackground))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.gray.opacity(0.4), lineWidth: 1)
                                    )
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading) // ✅ Force left alignment
                }
                
                // Marital Status
                VStack(alignment: .leading, spacing: 6) {
                    Text("Marital Status")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.6))

                    HStack(spacing: 12) {
                        ForEach(["Single", "Married"], id: \.self) { option in
                            Button(action: {
                                maritalStatus = option
                            }) {
                                Text(option)
                                    .fontWeight(.semibold)
                                    .foregroundColor(maritalStatus == option ? .black : .white)
                                    .padding(.vertical, 10)
                                    .padding(.horizontal, 24)
                                    .background(maritalStatus == option ? Color(brandColor) : Color(.secondarySystemBackground))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.gray.opacity(0.4), lineWidth: 1)
                                    )
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading) // ✅ Force left alignment
                }


                // Submit Button
                Button(action: {
                    saveUserData { success in
                        if success {
                            navigateToLocation = true
                        }
                    }
                }) {
                    Text(isSaving ? "Saving..." : "Save Profile")
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(brandColor)
                        .foregroundColor(.black)
                        .cornerRadius(12)
                }
                .disabled(isSaving || gender.isEmpty || maritalStatus.isEmpty || phoneNumber.isEmpty || fullName.isEmpty || dateOfBirth > Date())
                .padding(.top)
                
            }
            .padding()
            
        }
        .background(Color.black.ignoresSafeArea())
        .onAppear {
            loadUserData()
        }
        .preferredColorScheme(.dark)
    }

    func loadUserData() {
        if let user = Auth.auth().currentUser {
            googleImageURL = user.photoURL
            fullName = user.displayName ?? ""
            email = user.email ?? ""
        }
    }

    func saveUserData(completion: @escaping (Bool) -> Void) {
        guard let uid = Auth.auth().currentUser?.uid else {
            completion(false)
            return
        }

        isSaving = true
        let db = Firestore.firestore()

        var userData: [String: Any] = [
            "name": fullName,
            "email": email,
            "phone": phoneNumber,
            "gender": gender,
            "maritalStatus": maritalStatus,
            "dob": Timestamp(date: dateOfBirth),
            "timestamp": Timestamp(date: Date()),
            "profileComplete": true
        ]

        if let image = selectedImage,
           let imageData = image.jpegData(compressionQuality: 0.8) {
            let base64String = imageData.base64EncodedString()
            userData["profileImageBase64"] = base64String
        }

        db.collection("users").document(uid).setData(userData) { error in
            isSaving = false
            if let error = error {
                print("❌ Firestore error: \(error)")
                completion(false)
            } else {
                print("✅ User data saved")
                isProfileComplete = true // ✅ Profile is now complete
                completion(true)
            }
        }
    }

}


struct SignupView_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State private var navigate = false
        
        var body: some View {
            SignupView(navigateToLocation: $navigate)
        }
    }

    static var previews: some View {
        PreviewWrapper()
            .preferredColorScheme(.dark) // Matches your black background
            .previewDevice("iPhone 16 Pro") // Optional: choose your target device
    }
}
