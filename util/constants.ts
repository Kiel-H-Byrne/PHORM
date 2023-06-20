export const MAX_AGE = 1 * 24 * 60 * 60;

export enum BRAND_COLORS {
  GREEN = "#330000",
}
export const BRAND_THEME = {
  styles: {
    global: {
      "html, body": {
        height: "100%",
        margin: 0,
        padding: 0,
        width: "100%",
        overflowX: "hidden",
      },
      "#map": {
        height: "100%",
      },
      "#GMap": {
        height: "100%",
      },
      "#__next": {
        height: "100%",
      },
    },
  },
  colors: {
    brand: {
      100: "#fff",
      900: "#000",
    },
  },
};

export const MAP_STYLES = {
  // Map styles; snippets from 'Snazzy Maps'.
  lightGray: [
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [{ color: "#fefefe" }],
    },
    {
      featureType: "administrative",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#b2b2b2" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ff0000" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#696969" }],
    },
    {
      featureType: "administrative.neighborhood",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#696969" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#aaaaaa" }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#b3b3b3" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4f4f4f" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#6a6a6a" }, { visibility: "off" }],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#dbdbdb" }, { visibility: "on" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
  ],
  whiteMono: [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }],
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }],
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7b7b7b" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#46bcec" }, { visibility: "on" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c8d7d4" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#070707" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
  ],
};

export const GEOCENTER = { lat: 39.8283, lng: -98.5795 };
