"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { createReactMarker } from "@/lib/createReactMarker";
import Header from "@/components/Header/Header";
import MapLandPin from "@/components/Map/MapLandPin";
import MapLandDetails from "@/components/Map/MapLandDetails";
import MapLandPinHover from "@/components/Map/MapLandPinHover";

export default function Map() {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [land, setLand] = useState({});
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);
  const lastSearchLocation = useRef(null);
  const markersRef = useRef([]);

  // Fetch land data from Firebase
  useEffect(() => {
    const landRef = ref(database, "land");
    const unsubscribe = onValue(landRef, (snapshot) => {
      const data = snapshot.val();
      setLand(data || {});
    });

    return () => unsubscribe();
  }, []);

  // Move map when URL changes (from search filter) - only if lat/lng actually changed
  useEffect(() => {
    if (googleMapRef.current) {
      const lat = parseFloat(searchParams.get("lat"));
      const lng = parseFloat(searchParams.get("lng"));

      const locationKey = `${lat},${lng}`;

      // Only move if lat/lng actually changed
      if (lat && lng && lastSearchLocation.current !== locationKey) {
        lastSearchLocation.current = locationKey;

        googleMapRef.current.panTo({ lat, lng });

        // Update/add red search marker
        if (searchMarkerRef.current) {
          searchMarkerRef.current.setPosition({ lat, lng });
        } else {
          searchMarkerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: googleMapRef.current,
          });
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const lat = parseFloat(searchParams.get("lat")) || 37.0902;
    const lng = parseFloat(searchParams.get("lng")) || -95.7129;
    const zoom = 4; // Default zoom level

    const mapOptions = {
      center: { lat, lng },
      zoom: zoom,
      mapTypeId: "roadmap",
      tilt: 0,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      rotateControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
      ],
    };

    const createMapWithMarkers = (map) => {
      googleMapRef.current = map;

      // Add red pin for searched location if lat/lng exists
      if (searchParams.get("lat") && searchParams.get("lng")) {
        const searchLat = parseFloat(searchParams.get("lat"));
        const searchLng = parseFloat(searchParams.get("lng"));

        searchMarkerRef.current = new window.google.maps.Marker({
          position: { lat: searchLat, lng: searchLng },
          map: map,
        });
      }

      // Clear old markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      Object.values(land).forEach((property) => {
        const handleClick = () => {
          setSelectedParcel(property);
          router.push(`/map?lat=${property.lat}&lng=${property.lng}`);
        };

        const marker = createReactMarker(
          map,
          { lat: property.lat, lng: property.lng },
          <MapLandPin address={property.address} zoom={currentZoom} />,
          handleClick,
          <MapLandPinHover property={property} />
        );

        markersRef.current.push({ marker, property });
      });

      // Log zoom, lat, lng when map changes
      map.addListener("zoom_changed", () => {
        const zoom = map.getZoom();
        setCurrentZoom(zoom);
        const center = map.getCenter();
        console.log("Zoom:", zoom, "Lat:", center.lat(), "Lng:", center.lng());

        // Update all markers with new zoom level
        markersRef.current.forEach(({ marker, property }) => {
          marker.updateComponent(<MapLandPin address={property.address} zoom={zoom} />);
        });
      });

      map.addListener("center_changed", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        console.log("Zoom:", zoom, "Lat:", center.lat(), "Lng:", center.lng());
      });
    };

    if (window.google && window.google.maps) {
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      map.setTilt(0); // Force disable tilt
      createMapWithMarkers(map);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      map.setTilt(0); // Force disable tilt
      createMapWithMarkers(map);
    };
    document.head.appendChild(script);
  }, [land]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <MapLandDetails
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
      />
    </div>
  );
}
