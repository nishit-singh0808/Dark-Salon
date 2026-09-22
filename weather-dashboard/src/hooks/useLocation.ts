import { useState, useEffect } from "react";

type LocationType = {
  lat: number;
  lon: number;
} | null;

export default function useLocation() {
  const [location, setLocation] = useState<LocationType>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported ❌");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("GPS SUCCESS ✅");

        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("GPS ERROR ❌:", err);

        // 👉 fallback location (Delhi)
        setLocation({
          lat: 28.61,
          lon: 77.23,
        });
      }
    );
  }, []);

  return location;
}