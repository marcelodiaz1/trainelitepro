// lib/locations.ts

export const LOCATIONS_DATA = {
  Australia: [
    "New South Wales", "Victoria", "Queensland", "Western Australia", 
    "South Australia", "Tasmania", "Northern Territory", "ACT"
  ],
  Taiwan: [
    "Taipei", "New Taipei", "Taoyuan", "Taichung", "Tainan", "Kaohsiung", 
    "Keelung", "Hsinchu", "Chiayi", "Changhua", "Nantou", "Yunlin", 
    "Pingtung", "Yilan", "Hualien", "Taitung", "Penghu", "Kinmen", "Lienchiang"
  ],
  Chile: [
    "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
    "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", 
    "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
  ]
};

export type CountryName = keyof typeof LOCATIONS_DATA;
export const COUNTRIES = Object.keys(LOCATIONS_DATA) as CountryName[];