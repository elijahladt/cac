import { calculateDistance, estimateTravelTimes } from './resources';

export interface RouteEstimate {
  distanceMiles: number;
  drivingTime: string;
  walkingTime: string;
  transitAvailable: boolean;
}

// Server-side Route calculation per PRD Section 26
export async function getRouteEstimate(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<RouteEstimate> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      // Use Google Maps Distance Matrix API if key is provided
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        const meters = element.distance.value;
        const seconds = element.duration.value;
        const miles = Math.round((meters / 1609.34) * 10) / 10;
        const drivingMin = Math.round(seconds / 60);

        return {
          distanceMiles: miles,
          drivingTime: `${drivingMin} min`,
          walkingTime: `${Math.round(miles * 19)} min`,
          transitAvailable: true,
        };
      }
    } catch (err) {
      console.warn('Google Maps API request failed, using mathematical fallback:', err);
    }
  }

  // Fallback using Haversine calculation
  const distanceMiles = calculateDistance(originLat, originLng, destLat, destLng);
  const times = estimateTravelTimes(distanceMiles);

  return {
    distanceMiles,
    drivingTime: times.driving,
    walkingTime: times.walking,
    transitAvailable: true,
  };
}
