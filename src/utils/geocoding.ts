export interface GeocodedAddress {
  address: string;
  houseNumber?: string;
  street?: string;
  area?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Session-based in-memory cache
const reverseCache: Record<string, GeocodedAddress> = {};
const forwardCache: Record<string, { lat: number; lon: number; display_name: string }[]> = {};

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodedAddress> {
  const cacheKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  if (reverseCache[cacheKey]) {
    return reverseCache[cacheKey];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GeoTagProApp/1.0.0 (https://github.com/example/geotag-pro-webapp)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding response failed');
    }

    const data = await response.json();
    const addr = data.address || {};

    const result: GeocodedAddress = {
      address: data.display_name || 'Unknown Location',
      houseNumber: addr.house_number || addr.building,
      street: addr.road || addr.pedestrian || addr.suburb,
      area: addr.neighbourhood || addr.suburb,
      locality: addr.suburb || addr.village || addr.town,
      city: addr.city || addr.town || addr.municipality || addr.county,
      state: addr.state || addr.region,
      country: addr.country,
      postalCode: addr.postcode,
    };

    reverseCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error('Error in reverseGeocode:', error);
    return {
      address: `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    };
  }
}

export async function searchAddress(query: string): Promise<{ lat: number; lon: number; display_name: string }[]> {
  if (!query || query.trim() === '') return [];
  
  if (forwardCache[query]) {
    return forwardCache[query];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GeoTagProApp/1.0.0 (https://github.com/example/geotag-pro-webapp)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Search response failed');
    }

    const data = await response.json();
    const results = data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));

    forwardCache[query] = results;
    return results;
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
}

export function generateGoogleMapsUrl(lat: number, lon: number): string {
  return `https://maps.google.com/?q=${lat},${lon}`;
}
