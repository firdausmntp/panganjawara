import { useState, useEffect } from 'react';

interface IPLocationData {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    ip: string;
    country: {
      code: string;
      code3: string;
      name: string;
      official_name: string;
      capital: string;
      flag: string;
      emoji: string;
      is_eu: boolean;
    };
    region: {
      state_prov: string;
      state_code: string;
      district: string;
      city: string;
      zipcode: string;
    };
    location: {
      latitude: number;
      longitude: number;
      continent_code: string;
      continent_name: string;
      geoname_id: string;
    };
    metadata: {
      calling_code: string;
      tld: string;
      languages: string[];
    };
    currency: {
      code: string;
      name: string;
      symbol: string;
    };
    provider: string;
    meta: {
      queried_at: string;
      api_version: string;
      api_key_used: string;
    };
  };
}

export const useIPLocation = () => {
  const [data, setData] = useState<IPLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://api.fsu.my.id/pajar/location');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const locationData: IPLocationData = await response.json();
        setData(locationData);
      } catch (err) {
        console.error('Error fetching IP location:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch location');
      } finally {
        setLoading(false);
      }
    };

    fetchIPLocation();
  }, []);

  const city = data?.properties.region.city || '';
  const district = data?.properties.region.district || '';
  const state = data?.properties.region.state_prov || '';
  const coordinates = data?.geometry.coordinates || [0, 0];
  
  return {
    data,
    loading,
    error,
    city,
    district,
    state,
    coordinates,
    longitude: coordinates[0],
    latitude: coordinates[1]
  };
};
