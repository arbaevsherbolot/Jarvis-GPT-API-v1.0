import axios from 'axios';

type IpInfo = {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
};

export type LocationData = {
  city: string;
  region: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
};

export const getLocation = async (): Promise<LocationData> => {
  const { city, region, country_name, latitude, longitude, timezone }: IpInfo =
    (await axios.get('https://ipapi.co/json/')).data;

  const locationData: LocationData = {
    city,
    region,
    country: country_name,
    latitude: `${latitude}`,
    longitude: `${longitude}`,
    timezone,
  };

  return locationData;
};
