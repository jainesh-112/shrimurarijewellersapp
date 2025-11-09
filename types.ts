export interface GoldRates {
  rate24k: number;
  rate22k: number;
  rate18k: number;
}

export interface Director {
  name: string;
  title: string;
  bio: string;
}

export interface Store {
  name: string;
  address: string;
  phone: string;
}

export interface StoreInfo {
  stores: Store[];
  directors: Director[];
}

export enum Tab {
  Rates = 'RATES',
  Calculator = 'CALCULATOR',
  About = 'ABOUT',
}
