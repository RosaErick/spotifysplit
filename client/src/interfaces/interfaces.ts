export interface UserProfile {
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: [
    {
      height: number;
      url: string;
      width: number;
    }
  ];
  product: string;
  type: string;
  uri: string;
  country: string;
}

export interface LocalStorageValues {
  accessToken: string | null;
  refreshToken: string | null;
  expireTime: string | null;
  timestamp: string | null;
}