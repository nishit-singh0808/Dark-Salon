import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import CoreLocation
import MapKit

struct LocationView: View {
    @State private var userName: String = "Loading..."
    @State private var savedAddresses: [String] = []
    @State private var searchText = ""
    @State private var navigateToHome = false
    @State private var currentCity: String = ""
    @EnvironmentObject var session: SessionManager
    @State private var locationDelegate = LocationDelegate()
    @StateObject private var searchManager = SearchManager()

    @AppStorage("serviceAvailable") var serviceAvailable: Bool = true

    let locationManager = CLLocationManager()
    let geocoder = CLGeocoder()

    let availableCities = [
        "Noida", "Delhi", "Gurgaon", "Ghaziabad", "Greater Noida", "Faridabad"
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("📍 Select Your Location")
                    .font(.title)
                    .bold()
                    .padding(.top)

                // 1. Current Location Button
                Button(action: {
                    fetchCurrentLocation()
                }) {
                    HStack(spacing: 8) { // Add spacing to control gap
                        Text("𖦏")
                            .font(.system(size: 24)) // Smaller emoji size
                        Text("Use Current Location")
                            .font(.system(size: 18)) // Slightly smaller text
                    }
                    .frame(maxWidth: .infinity, minHeight: 44) // Height to standard tap size
                    .padding(.vertical, 8)  // Reduced vertical padding
                    .padding(.horizontal, 16)  // Control horizontal padding
                    .background(Color.brand)
                    .foregroundColor(.black)
                    .cornerRadius(10)
                    .padding(.horizontal)
                }

                // Show current city if available
                if !currentCity.isEmpty {
                    Text("Detected location: \(currentCity)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .padding(.horizontal)
                }
                
                // 2. New "+ Add Address" button
                // "+ Add Address" Navigation
                NavigationLink(destination: AddAddressView()) {
                    Text("+  Add Address")
                        .font(.system(size: 20))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.horizontal)
                }

                // 3. Search Bar with Suggestions
                VStack(alignment: .leading) {
                    TextField("🔍 Search your city...", text: $searchText)
                           .padding(10)
                           .background(Color.white.opacity(0.1))
                           .foregroundColor(.white)
                           .cornerRadius(8)
                           .overlay(
                               RoundedRectangle(cornerRadius: 8)
                                   .stroke(Color.white.opacity(0.5), lineWidth: 2)
                           )

                    if !searchManager.searchResults.isEmpty {
                        List(searchManager.searchResults, id: \.self) { result in
                            Button(action: {
                                currentCity = result
                                checkServiceAvailability(for: result)
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                                    session.onboardingComplete = true
                                    navigateToHome = true
                                }
                            }) {
                                Text(result)
                            }

                        }
                        .frame(maxHeight: 150)
                    }
                }
                .padding(.horizontal)

                // 3. Saved Addresses (unchanged)
                if !savedAddresses.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("📁 Saved Addresses:")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(savedAddresses, id: \.self) { address in
                            Button(action: {
                                session.onboardingComplete = true
                            }) {
                                HStack {
                                    Image(systemName: "house.fill")
                                    Text(address)
                                    Spacer()
                                }
                                .padding()
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(10)
                                .padding(.horizontal)
                            }
                        }
                    }
                }

                Spacer()

                NavigationLink(destination: HomeView(), isActive: $navigateToHome) {
                    EmptyView()
                }
            }
            .onAppear {
                fetchUserName()
                fetchSavedAddresses()
            }
            .onChange(of: searchText) { newValue in
                searchManager.updateSearch(query: newValue)
            }
        }
        .navigationBarBackButtonHidden(true)
        .preferredColorScheme(.dark)
        .environment(\.colorScheme, .dark)
    }

    // MARK: - Firestore Functions
    func fetchUserName() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        let db = Firestore.firestore()
        db.collection("users").document(uid).getDocument { doc, err in
            if let data = doc?.data(), let name = data["name"] as? String {
                userName = name
            }
        }
    }

    func fetchSavedAddresses() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        let db = Firestore.firestore()
        db.collection("users").document(uid).collection("addresses").getDocuments { snapshot, error in
            if let documents = snapshot?.documents {
                self.savedAddresses = documents.compactMap { $0.data()["address"] as? String }
            }
        }
    }

    // MARK: - Location
    func fetchCurrentLocation() {
        locationManager.delegate = locationDelegate
        locationDelegate.onLocationUpdate = { coordinate in
            reverseGeocode(coordinate: coordinate)
        }

        locationManager.requestWhenInUseAuthorization()
        locationManager.requestLocation()
    }

    func reverseGeocode(coordinate: CLLocationCoordinate2D) {
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)

        geocoder.reverseGeocodeLocation(location) { placemarks, error in
            if let error = error {
                print("❌ Reverse geocode error: \(error.localizedDescription)")
                return
            }

            if let placemark = placemarks?.first {
                let city = placemark.locality ?? placemark.subAdministrativeArea ?? "Unknown Location"
                currentCity = city
                checkServiceAvailability(for: city)

                DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                    session.onboardingComplete = true
                    navigateToHome = true
                }
            }
        }
    }


    // MARK: - Availability Check
    func checkServiceAvailability(for city: String) {
        if availableCities.map({ $0.lowercased() }).contains(city.lowercased()) {
            serviceAvailable = true
            print("✅ Service available in: \(city)")
        } else {
            serviceAvailable = false
            print("❌ Service NOT available in: \(city)")
        }
    }
}

// MARK: - Search Manager
class SearchManager: NSObject, ObservableObject, MKLocalSearchCompleterDelegate {
    @Published var searchResults: [String] = []
    private var completer: MKLocalSearchCompleter

    override init() {
        self.completer = MKLocalSearchCompleter()
        super.init()
        self.completer.delegate = self
        self.completer.resultTypes = .address
        self.completer.region = MKCoordinateRegion(.world)
    }

    func updateSearch(query: String) {
        completer.queryFragment = query
    }

    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        let results = completer.results.map { $0.title }
        DispatchQueue.main.async {
            self.searchResults = results
        }
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        print("❌ Search failed: \(error.localizedDescription)")
    }
}

// MARK: - Location Delegate
class LocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocationCoordinate2D) -> Void)?

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            manager.requestLocation()
        case .denied, .restricted:
            print("❌ Location permission denied.")
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        @unknown default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            onLocationUpdate?(location.coordinate)
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ Failed to get location: \(error.localizedDescription)")
    }
}
