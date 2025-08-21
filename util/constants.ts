import { Libraries } from "../types";

export const MAX_AGE = 1 * 24 * 60 * 60;

enum BRAND_COLORS {
  MASONIC_BLUE = "#2828C8",
  MWPGLDC_PURPLE = "#431250", //#8E0084
  MWPGLDC_GOLD = "#CC9829", //#FED500
  GTGC_PINK = "#9B5BA5",
  GTGC_BLUE = "#009DDC",
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
    mwphgldc: {
      blue: {
        "50": "#edf2ff",
        "100": "#dee8ff",
        "200": "#c3d5ff",
        "300": "#9eb7ff",
        "400": "#788fff",
        "500": "#5868fc",
        "600": "#3a3ef1",
        "700": "#2828c8", // MASONIC_BLUE
        "800": "#2729ac",
        "900": "#282c87",
        "950": "#17174f",
      },
      purple: {
        "50": "#fbf6fd",
        "100": "#f5ebfc",
        "200": "#ecd7f7",
        "300": "#deb7f0",
        "400": "#cc8ce6",
        "500": "#b35fd6",
        "600": "#9940b9",
        "700": "#803299",
        "800": "#6a2b7d",
        "900": "#5a2867",
        "950": "#431250", // GL_PURPLE
      },
      gold: {
        "50": "#fbf8ea",
        "100": "#f6efcb",
        "200": "#eddd9c",
        "300": "#e3c563",
        "400": "#d9aa36",
        "500": "#cc9828", // GL_GOLD
        "600": "#ac7420",
        "700": "#8b561d",
        "800": "#75471f",
        "900": "#643c20",
        "950": "#381d0f",
      },
    },
    gtgc: {
      pink: { 100: BRAND_COLORS.GTGC_PINK },
      blue: { 100: BRAND_COLORS.GTGC_BLUE },
    },
  },
  defaultProps: {
    colorScheme: "mwphgldc.blue",
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
  darkGray: [
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#C3BBAE",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#565250",
        },
      ],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#5C5A6F",
        },
      ],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#FFFAF3",
        },
      ],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#696969",
        },
      ],
    },
    {
      featureType: "administrative.neighborhood",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#696969",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        {
          color: "#FBB03B",
        },
        {
          weight: 2,
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#565250",
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [
        {
          hue: "#003300",
        },
        {
          saturation: -80,
        },
        {
          lightness: -5,
        },
        {
          gamma: 0.3,
        },
        {
          visibility: "simplified",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "poi.business",
      elementType: "geometry",
      stylers: [
        {
          saturation: -10,
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [
        {
          saturation: -60,
        },
        {
          lightness: -45,
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#FBB03B",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [
        {
          weight: 4,
        },
        {
          color: "#484848",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [
        {
          visibility: "simplified",
        },
        {
          color: "#323232",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit.station.bus",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit.station.bus",
      elementType: "geometry",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit.station.bus",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
        {
          hue: "#ff0000",
        },
      ],
    },
    {
      featureType: "transit.station.bus",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
        {
          hue: "#ff2300",
        },
      ],
    },
    {
      featureType: "transit.station.rail",
      elementType: "geometry",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "transit.station.rail",
      elementType: "labels",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "transit.station.rail",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [
        {
          color: "#ffffff",
        },
        {
          visibility: "on",
        },
      ],
    },
  ],
};
// 1000 U ST NW DC:  (38.91657, -77.02631)
export const GEOCENTER = { lat: 38.91657, lng: -77.02631 };

export const LIBRARIES: Libraries = [
  "places",
  "visualization",
  "geometry",
  "localContext",
];

export const CLUSTER_STYLE = [
  {
    url: "img/m1.png",
    height: 53,
    width: 53,
    anchor: [26, 26],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m2.png",
    height: 56,
    width: 56,
    anchor: [28, 28],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m3.png",
    height: 66,
    width: 66,
    anchor: [33, 33],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m4.png",
    height: 78,
    width: 78,
    anchor: [39, 39],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m5.png",
    height: 90,
    width: 90,
    anchor: [45, 45],
    textColor: "#000",
    textSize: 11,
  },
];

export const STATE_ABBREVIATIONS = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DC",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;
