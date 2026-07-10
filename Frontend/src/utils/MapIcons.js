import L from 'leaflet';

import pickupMarker from '../assets/pickupLocation.svg';
import destinationMarker from '../assets/destination.svg';
import captainMarker from '../assets/rider.svg';

export const pickupIcon = L.icon({
    iconUrl: pickupMarker,
    iconSize: [48, 60],
    iconAnchor: [24, 60],
    popupAnchor: [0, -60]
});

export const destinationIcon = L.icon({
    iconUrl: destinationMarker,
    iconSize: [48, 60],
    iconAnchor: [24, 60],
    popupAnchor: [0, -60]
});
export const captainIcon = L.icon({
    iconUrl: captainMarker,
    iconSize: [48, 60],
    iconAnchor: [24, 60],
    popupAnchor: [0, -60]
});