import SwiftUI
import FirebaseAuth

struct HomeView: View {
    @EnvironmentObject var session: SessionManager
    @AppStorage("serviceAvailable") var serviceAvailable: Bool = true
    @AppStorage("isProfileComplete") var isProfileComplete: Bool = false
    
    @State private var userLocation: String = "Greater Noida, Uttar Pradesh"
    @State private var selectedGender: String = "Men" // default from signup
    @State private var searchText: String = ""
    // Categories
    let categories = ["Facial", "Manicure", "Skin"]
    @State private var selectedCategory = "Facial"
    
    // 🔹 Track scroll state
        @State private var hasScrolled: Bool = false

    // Sample services
    struct Service: Identifiable {
        let id = UUID()
        let name: String
        let imageName: String
        let category: String
    }

    // Example service data
    let allServices = [
        Service(name: "Deep Facial", imageName: "facial", category: "Facial"),
        Service(name: "Basic Facial", imageName: "facial2", category: "Facial"),
        Service(name: "Manicure Deluxe", imageName: "manicure", category: "Manicure"),
        Service(name: "Pedicure", imageName: "pedicure", category: "Manicure"),
        Service(name: "Skin Glow", imageName: "skin", category: "Skin"),
    ]

    // Filtered services based on selected category
    var filteredServices: [Service] {
        allServices.filter { $0.category == selectedCategory }
    }

    
    var body: some View {
        TabView {
            VStack(spacing: 0) {
                // 🏠 Home Tab
                VStack(spacing: 20) {
                    
                    // 🔹 Location Section (Transparent)
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.brand)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Your Location")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(userLocation)
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .onTapGesture {
                        print("Location tapped")
                    }
                    
                    // 🔹 Gender Toggle Button (Left) + Search Bar (Right)
                    HStack(spacing: 15) {
                        Button(action: {
                            selectedGender = (selectedGender == "Men") ? "Women" : "Men"
                        }) {
                            Text(selectedGender)
                                .font(.headline)
                                .frame(width: 70)
                                .padding()
                                .background(Color.black)
                                .foregroundColor(.brand)
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.brand, lineWidth: 3)
                                )
                        }
                        
                        // Search Bar
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.gray)
                            TextField("Search", text: $searchText)
                                .foregroundColor(.white)
                        }
                        .padding(10)
                        .background(Color(.systemGray5).opacity(0.2))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.gray, lineWidth: 2) // <-- border color & thickness
                        )
                        .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
                .background(Color.black)
                .shadow(color: hasScrolled ? .red.opacity(0.6) : .clear, radius: 8, x: 0, y: 4)
                .zIndex(1)
                .padding(.bottom, 2) // Optional for visual separation

                // Invisible measurement at the top inside the same coordinate space
                GeometryReader { geo in
                    Color.clear
                        .preference(key: ScrollOffsetKey.self, value: geo.frame(in: .named("scroll")).minY)
                }
                .frame(height: 0)
                
                // ✅ Scrollable Content
                ScrollView(showsIndicators: false) {
                        VStack(spacing: 20) {
                        // 🔹 Service Cards
                        HStack(spacing: 25) {
                            VStack(spacing: 5) {
                                Image("girl-makeup")
                                    .resizable()
                                    .aspectRatio(1, contentMode: .fill)
                                    .frame(width: 80, height: 90)
                                    .cornerRadius(10)
                                Text("Makeup")
                                    .font(.callout)
                                    .foregroundColor(.white)
                            }
                            
                            VStack(spacing: 5) {
                                Image("girl-hairstyle")
                                    .resizable()
                                    .aspectRatio(1, contentMode: .fill)
                                    .frame(width: 80, height: 90)
                                    .cornerRadius(10)
                                Text("Hairstyle")
                                    .font(.callout)
                                    .foregroundColor(.white)
                            }
                            
                            VStack(spacing: 5) {
                                Image("girl-beauty")
                                    .resizable()
                                    .aspectRatio(1, contentMode: .fill)
                                    .frame(width: 80, height: 90)
                                    .cornerRadius(10)
                                Text("Beauty")
                                    .font(.callout)
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(.top, 30)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        
                            
                           
                            
                            
                            HStack(spacing: 25) {
                                VStack(spacing: 5) {
                                    Image("girl-makeup")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Makeup")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                                
                                VStack(spacing: 5) {
                                    Image("girl-hairstyle")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Hairstyle")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                                
                                VStack(spacing: 5) {
                                    Image("girl-beauty")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Beauty")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(.top, 30)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)
                            HStack(spacing: 25) {
                                VStack(spacing: 5) {
                                    Image("girl-makeup")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Makeup")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                                
                                VStack(spacing: 5) {
                                    Image("girl-hairstyle")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Hairstyle")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                                
                                VStack(spacing: 5) {
                                    Image("girl-beauty")
                                        .resizable()
                                        .aspectRatio(1, contentMode: .fill)
                                        .frame(width: 80, height: 90)
                                        .cornerRadius(10)
                                    Text("Beauty")
                                        .font(.callout)
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(.top, 30)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)
                            
                            
                            
                            
                        // 🔹 Trending Section
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Trending Services")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal)
                            
                            // Category Tabs
                            HStack(spacing: 15) {
                                ForEach(categories, id: \.self) { category in
                                    Button(action: {
                                        selectedCategory = category
                                    }) {
                                        Text(category)
                                            .font(.subheadline)
                                            .padding(.vertical, 6)
                                            .padding(.horizontal, 12)
                                            .background(selectedCategory == category ? Color.brand : Color.gray.opacity(0.3))
                                            .foregroundColor(selectedCategory == category ? .black : .white.opacity(0.7))
                                            .cornerRadius(10)
                                    }
                                }
                            }
                            .padding(.horizontal)
                            
                            // Horizontal service cards
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 15) {
                                    TrendingServiceCard(serviceName: "Makeup",
                                                        price: 7500,
                                                        originalPrice: 10000,
                                                        discount: 25,
                                                        duration: "1hr",
                                                        imageName: "girl-makeup")
                                    
                                    TrendingServiceCard(serviceName: "Facial",
                                                        price: 5000,
                                                        originalPrice: 6500,
                                                        discount: 20,
                                                        duration: "45min",
                                                        imageName: "facial")
                                }
                                .padding(.horizontal)
                            }
                        }
                        
                        // Service Availability
                        if !serviceAvailable {
                            Text("🚫 Service is not available in your city.")
                                .foregroundColor(.red)
                                .padding()
                        }
                        }
                                }
                                .coordinateSpace(name: "scroll") // <-- ADD HERE ON MAIN VERTICAL SCROLLVIEW

                            }
                            // OUTERMOST VStack modifier for scroll offset changes
                            .onPreferenceChange(ScrollOffsetKey.self) { value in // <-- ADD HERE, not inside ScrollView
                                withAnimation(.easeInOut) {
                                    hasScrolled = value < -10 // or value < 0 for instant shadow
                                }
                            }
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            
            // 📖 Bookings Tab
            VStack {
                Text("Your Bookings")
                    .font(.largeTitle)
                    .foregroundColor(.white)
                    .padding()
                Spacer()
            }
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .tabItem {
                Label("Bookings", systemImage: "calendar")
                    
            }
            
            // 👤 Account Tab
            VStack {
                Text("Account")
                    .font(.largeTitle)
                    .foregroundColor(.white)
                    .padding()
                
                Button("Logout") {
                    do {
                        try Auth.auth().signOut()
                        isProfileComplete = false
                    } catch {
                        print("Logout failed: \(error)")
                    }
                }
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
                
                Spacer()
            }
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .tabItem {
                Label("Account", systemImage: "person.fill")
            }
        }
        .accentColor(.brand)
        .preferredColorScheme(.dark) // 🔹 Force dark mode
        .environment(\.colorScheme, .dark)
    }
}
        // MARK: - Scroll Offset PreferenceKey
        struct ScrollOffsetKey: PreferenceKey {
            static var defaultValue: CGFloat = 0
            static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
                value = nextValue()
            }
        }

struct TrendingServiceCard: View {
    let serviceName: String
    let price: Int
    let originalPrice: Int
    let discount: Int
    let duration: String
    let imageName: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black)
                .shadow(color: .gray.opacity(0.5), radius: 10, x: 0, y: 5)
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    // Service Image
                    Image(imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 50, height: 50)
                        .cornerRadius(8)
                    
                    Spacer()
                    
                    // Duration
                    HStack(spacing: 4) {
                        Image(systemName: "hourglass")
                            .foregroundColor(.white)
                            .font(.caption)
                        Text(duration)
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.black.opacity(0.4))
                    .cornerRadius(8)
                }
                
                // Service Title
                Text(serviceName)
                    .font(.headline)
                    .foregroundColor(.white)
                
                // Price Section
                HStack(spacing: 8) {
                    Text("₹\(price)")
                        .font(.headline)
                        .bold()
                        .foregroundColor(.white)
                    
                    Text("₹\(originalPrice)")
                        .strikethrough()
                        .foregroundColor(.gray)
                    
                    Text("\(discount)% OFF")
                        .foregroundColor(.green)
                        .font(.subheadline)
                }
                
                HStack {
                    Button(action: {
                        print("View details tapped")
                    }) {
                        Text("View Details")
                            .font(.subheadline)
                            .foregroundColor(.yellow)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        print("Added to cart")
                    }) {
                        Text("Add to Cart")
                            .font(.subheadline)
                            .foregroundColor(.black)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 16)
                            .background(Color.yellow)
                            .cornerRadius(8)
                    }
                }
            }
            .padding()
        }
        .frame(width: 250, height: 150)
        .padding(.vertical, 25)
    }
}

#Preview {
    HomeView()
        .environmentObject(SessionManager())
        .preferredColorScheme(.dark)
}
