import IPinfo from 'node-ipinfo';

export type LocationData = {
  city: string;
  region: string;
  country: string;
  timezone: string;
};

const iPinfo = new IPinfo(process.env.IP_INFO_SECRET_KEY);

export const getLocation = async (ip: string): Promise<LocationData> => {
  const response = await iPinfo.lookupIp(ip);
  const { city, region, country, timezone }: LocationData = response;

  const locationData: LocationData = {
    city,
    region,
    country,
    timezone,
  };
  
  return locationData;
};
