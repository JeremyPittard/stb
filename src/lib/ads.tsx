export interface AdConfig {
  title: string;
  body?: string;
  imageUrl?: string;
  link?: string;
  linkText?: string;
}

export type AdCallback = (success: boolean) => void;

const DEFAULT_AD: AdConfig = {
  title: 'STB Design',
  body: 'Your trusted design agency',
  link: 'https://example.com',
  linkText: 'Learn More',
};

let adConfig: AdConfig = DEFAULT_AD;

export function configureAd(config: Partial<AdConfig>): void {
  adConfig = { ...DEFAULT_AD, ...config };
}

export function getAdConfig(): AdConfig {
  return adConfig;
}

let adCallback: AdCallback | null = null;

export function showAd(callback: AdCallback): void {
  adCallback = callback;
}

export function closeAd(success: boolean): void {
  if (adCallback) {
    adCallback(success);
    adCallback = null;
  }
}
