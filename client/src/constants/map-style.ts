type MapStyleRule = {
  elementType?:
    | 'all'
    | 'geometry'
    | 'geometry.fill'
    | 'geometry.stroke'
    | 'labels'
    | 'labels.icon'
    | 'labels.text'
    | 'labels.text.fill'
    | 'labels.text.stroke';
  featureType?:
    | 'administrative'
    | 'landscape'
    | 'poi'
    | 'poi.business'
    | 'road'
    | 'transit'
    | 'water';
  stylers: Array<{ color: string }>;
};

export const GOOGLE_MAP_STYLE: MapStyleRule[] = [
  { elementType: 'geometry', stylers: [{ color: '#edf0e8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#536151' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8f8f1' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d0dac9' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#71806c' }] },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e8eddf' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#71806c' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#dce7d1' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ color: '#e4eadb' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#73806e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d9dfd1' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#dce4d4' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#c9ddd6' }],
  },
];

export function getSupplyPinColor(category: string) {
  switch (category) {
    case 'produce':
      return '#5B8548';
    case 'dairy':
      return '#5C86A4';
    case 'bakery':
      return '#B68A4B';
    case 'prepared':
      return '#A66B55';
    case 'pantry':
      return '#8774A8';
    default:
      return '#86A95D';
  }
}
