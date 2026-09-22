import SwiftUI
import MapKit
import CoreLocation
import FirebaseAuth
import FirebaseFirestore

// ✅ Make CLLocationCoordinate2D Equatable for onChange usage
extension CLLocationCoordinate2D: Equatable {
    public static func == (lhs: CLLocationCoordinate2D, rhs: CLLocationCoordinate2D) -> Bool {
        let epsilon = 1e-6
        return abs(lhs.latitude - rhs.latitude) < epsilon &&
               abs(lhs.longitude - rhs.longitude) < epsilon
    }
}

// Keyboard helper to keep suggestions above the keyboard
final class KeyboardResponder: ObservableObject {
    @Published var height: CGFloat = 0
    private var willShow: NSObjectProtocol?
    private var willHide: NSObjectProtocol?

    init() {
        willShow = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillShowNotification, object: nil, queue: .main
        ) { [weak self] notif in
            guard let self = self,
                  let info = notif.userInfo,
                  let rect = info[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
            self.height = rect.height
        }

        willHide = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main
        ) { [weak self] _ in
            self?.height = 0
        }
    }

    deinit {
        if let w = willShow { NotificationCenter.default.removeObserver(w) }
        if let h = willHide { NotificationCenter.default.removeObserver(h) }
    }
}

struct AddAddressView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var session: SessionManager   // ✅ same as LocationView

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 28.6139, longitude: 77.2090),
        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
    )

    @State private var address: String = ""
    @State private var landmark: String = ""
    @State private var saveMessage: String = ""
    @State private var navigateToHome = false

    // reuse SearchManager
    @StateObject private var searchManager = SearchManager()

    @State private var showSuggestions = false
    @FocusState private var addressFocused: Bool
    @StateObject private var keyboard = KeyboardResponder()

    @AppStorage("serviceAvailable") var serviceAvailable: Bool = true

    // ✅ Same cities as in LocationView
    let availableCities = [
        "Noida", "Delhi", "Gurgaon", "Ghaziabad", "Greater Noida", "Faridabad"
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                VStack(spacing: 16) {
                    // Header
                    HStack {
                        Button(action: { dismiss() }) {
                            Image(systemName: "chevron.left")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                        Spacer()
                        Text("Add Address")
                            .font(.title2)
                            .foregroundColor(.white)
                            .bold()
                        Spacer().frame(width: 28)
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    ScrollView {
                        VStack(spacing: 16) {
                            // Map
                            ZStack {
                                Map(coordinateRegion: $region)
                                    .frame(height: 250)
                                    .cornerRadius(12)

                                Image(systemName: "mappin.circle.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.red)
                                    .offset(y: -10)
                            }
                            .onChange(of: region.center) { newCenter in
                                reverseGeocode(newCenter)
                            }
                            .padding(.horizontal)

                            // Address input + suggestions
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Address")
                                    .foregroundColor(.white)
                                    .font(.headline)

                                ZStack(alignment: .topLeading) {
                                    VStack(spacing: 0) {
                                        TextField("Enter address", text: $address)
                                            .padding()
                                            .background(Color.gray.opacity(0.18))
                                            .cornerRadius(8)
                                            .foregroundColor(.white)
                                            .focused($addressFocused)
                                            .onChange(of: address) { newValue in
                                                if newValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                                    searchManager.searchResults.removeAll()
                                                    showSuggestions = false
                                                } else {
                                                    searchManager.updateSearch(query: newValue)
                                                    showSuggestions = addressFocused
                                                }
                                            }
                                            .onChange(of: addressFocused) { focused in
                                                if focused && !address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                                    showSuggestions = true
                                                }
                                                if !focused {
                                                    showSuggestions = false
                                                }
                                            }

                                        if showSuggestions && !searchManager.searchResults.isEmpty {
                                            ScrollView {
                                                VStack(spacing: 0) {
                                                    ForEach(searchManager.searchResults, id: \.self) { item in
                                                        Button(action: {
                                                            onSelectSuggestion(item)
                                                        }) {
                                                            HStack {
                                                                Text(item)
                                                                    .foregroundColor(.white)
                                                                Spacer()
                                                            }
                                                            .padding(.vertical, 10)
                                                            .padding(.horizontal, 12)
                                                        }
                                                        .background(Color(.secondarySystemBackground).opacity(0.15))
                                                        Divider().background(Color.gray.opacity(0.3))
                                                    }
                                                }
                                            }
                                            .frame(maxHeight: 200)
                                            .background(Color.black)
                                            .cornerRadius(8)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 8)
                                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                            )
                                            .padding(.top, 4)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)

                            // Landmark
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Landmark")
                                    .foregroundColor(.white)
                                    .font(.headline)
                                TextField("Enter landmark", text: $landmark)
                                    .padding()
                                    .background(Color.gray.opacity(0.18))
                                    .cornerRadius(8)
                                    .foregroundColor(.white)
                            }
                            .padding(.horizontal)

                            Spacer(minLength: 32)
                        }
                        .padding(.bottom, keyboard.height)
                        .animation(.easeOut(duration: 0.2), value: keyboard.height)
                    }

                    // Save button
                    VStack(spacing: 8) {
                        Button(action: saveAddress) {
                            Text("Save Address")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.brand)
                                .foregroundColor(.black)
                                .cornerRadius(10)
                                .padding(.horizontal)
                        }

                        if !saveMessage.isEmpty {
                            Text(saveMessage)
                                .foregroundColor(saveMessage.lowercased().contains("error") ? .red : .green)
                                .padding(.top, 6)
                        }
                    }
                    .padding(.bottom, max(16, keyboard.height > 0 ? 8 : 20))
                }
            }
            .preferredColorScheme(.dark)
            .navigationBarBackButtonHidden(true)
            .navigationBarHidden(true)
            // ✅ Navigate to Home after save + service check
            NavigationLink(destination: HomeView(), isActive: $navigateToHome) {
                EmptyView()
            }
        }
    }

    // MARK: - Selecting a suggestion
    private func onSelectSuggestion(_ suggestion: String) {
        address = suggestion
        searchForLocation(suggestion)
        showSuggestions = false
        searchManager.searchResults.removeAll()
        addressFocused = false
    }

    // MARK: - Forward Geocode
    private func searchForLocation(_ query: String) {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        let search = MKLocalSearch(request: request)
        search.start { response, _ in
            guard let item = response?.mapItems.first else { return }
            DispatchQueue.main.async {
                withAnimation {
                    region.center = item.placemark.coordinate
                }
                reverseGeocode(item.placemark.coordinate)
            }
        }
    }

    // MARK: - Reverse Geocode
    private func reverseGeocode(_ coordinate: CLLocationCoordinate2D) {
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        CLGeocoder().reverseGeocodeLocation(location) { placemarks, _ in
            if let placemark = placemarks?.first {
                let name = placemark.name ?? ""
                let locality = placemark.locality ?? ""
                let country = placemark.country ?? ""
                address = [name, locality, country].compactMap { $0 }.joined(separator: ", ")
            }
        }
    }

    // MARK: - Save + Availability Check
    private func saveAddress() {
        guard let user = Auth.auth().currentUser else {
            saveMessage = "Error: User not logged in"
            return
        }

        let db = Firestore.firestore()
        let newAddress: [String: Any] = [
            "address": address,
            "landmark": landmark,
            "latitude": region.center.latitude,
            "longitude": region.center.longitude,
            "timestamp": Timestamp(date: Date())
        ]

        db.collection("users").document(user.uid).collection("addresses").addDocument(data: newAddress) { error in
            if let error = error {
                saveMessage = "Error: \(error.localizedDescription)"
            } else {
                // Check service availability from locality
                let city = extractCity(from: address)
                checkServiceAvailability(for: city)

                session.onboardingComplete = true
                navigateToHome = true
            }
        }
    }

    // Extract city from full address string
    private func extractCity(from fullAddress: String) -> String {
        let parts = fullAddress.components(separatedBy: ",")
        return parts.dropLast().last?.trimmingCharacters(in: .whitespacesAndNewlines) ?? fullAddress
    }

    private func checkServiceAvailability(for city: String) {
        if availableCities.map({ $0.lowercased() }).contains(city.lowercased()) {
            serviceAvailable = true
            print("✅ Service available in: \(city)")
        } else {
            serviceAvailable = false
            print("❌ Service NOT available in: \(city)")
        }
    }
}
