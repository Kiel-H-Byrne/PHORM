import { GLocation, IListing } from "../types";

export const targetClient = function (map: any, pos: any) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  map.panTo(pos);
  // google.maps.event.trigger(map, 'resize');
  map.setZoom(13);
};

export const toPositionObj = (location: string | undefined) => {
  if (location) {
    let latLng = location.split(",");
    let lat = Number(latLng[0]);
    let lng = Number(latLng[1]);
    let pos = new google.maps.LatLng({ lat: lat, lng: lng });
    return pos;
  }
};

export const findClosestMarker = function (
  markers: IListing[],
  location: GLocation
) {
  // marker {position: latlngObj, map: mapinstnace, icon: iconurl}
  let distances: number[] = [];
  let closest = -1;
  const start = new google.maps.LatLng(location);
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].lat && markers[i].lng) {
      let d = google.maps.geometry.spherical.computeDistanceBetween(
        { lat: markers[i].lat!, lng: markers[i].lng! },
        start
      );
      distances[i] = d;
      if (closest === -1 || d < distances[closest]) {
        closest = i;
      }
    }
  }
  const closestMarker = markers[closest];
  return closestMarker;
};

export const getTruncated = (float: number) => Math.trunc(float);

export const milesToMeters = (radius: number) => radius * 1609.34;

export const checkForOverlaps = (data: IListing[]) => {
  const result: { [key: string]: IListing[] } = data.reduce((r, a) => {
    if (a.lng && a.lat) {
      const locString = `{lng: ${a.lng.toString().slice(0, -3)}, lat: ${a.lat
        .toString()
        .slice(0, -3)}}`;
      r[locString] = r[locString] || [];
      r[locString].push(a);
      return r;
    }
    return {};
  }, {} as { [key: string]: IListing[] });
  // console.log(result)
  const dupes = Object.values(result).find((el) => el.length > 1);
  return dupes;
};
export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);
const checkForDuplicates = (data: IListing[]) => {
  const result: { [key: string]: IListing[] } = data.reduce((r, a) => {
    if (a.lng && a.lat) {
      const locString = `{lng: ${a.lng.toString().slice(0, -3)}, lat: ${a.lat
        .toString()
        .slice(0, -3)}}`;
      r[locString] = r[locString] || [];
      r[locString].push(a);
      return r;
    }
    return {};
  }, {} as { [key: string]: IListing[] });
  // console.log(result)
  const dupes = Object.values(result).find((el) => el.length > 1);
  return dupes;
};

export const camelToSentenceCase = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
export const toSentenceCase = (s: string) => {
  s = s.toLocaleLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function generateRandomUSGeoLocation(): { lat: number; lng: number } {
  // Define boundaries for latitude and longitude for the contiguous United States
  const minLat = 24.396308; // Southernmost point (Key West, Florida)
  const maxLat = 49.384358; // Northernmost point (Angle Inlet, Minnesota)
  const minLng = -125.0; // Westernmost point (Point Arena, California)
  const maxLng = -66.93457; // Easternmost point (West Quoddy Head, Maine)

  // Generate random latitude and longitude within the defined boundaries
  const lat = Math.random() * (maxLat - minLat) + minLat;
  const lng = Math.random() * (maxLng - minLng) + minLng;

  return { lat, lng };
}
