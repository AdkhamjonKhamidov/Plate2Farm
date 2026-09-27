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
  { elementType: 'geometry', stylers: [{ color: '#EAF1EA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3E5248' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F2F5F0' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#D7E0D7' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#6B7C73' }] },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#EAF1EA' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7C73' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#D9EFE4' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ color: '#EAF1EA' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7C73' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D7E0D7' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#D7E0D7' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#D9EFE4' }],
  },
];

export function getSupplyPinColor(category: string) {
  switch (category) {
    case 'produce':
      return '#1F6B4A';
    case 'dairy':
      return '#5C86A4';
    case 'bakery':
      return '#B86E14';
    case 'prepared':
      return '#C45C26';
    case 'pantry':
      return '#8774A8';
    default:
      return '#1F6B4A';
  }
}
