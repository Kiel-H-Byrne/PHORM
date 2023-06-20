import { GLocation } from "../types";

export const targetClient = function (map: any, pos: any) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  map.panTo(pos);
  // google.maps.event.trigger(map, 'resize');
  map.setZoom(17);
};

export const toPositionObj = (location: string | undefined) => {
  if (location) {
    let latLng = location.split(",");
    let lat = Number(latLng[0]);
    let lng = Number(latLng[1]);
    let pos = new (window as any).google.maps.LatLng({ lat: lat, lng: lng });
    return pos;
  }
};

export const findClosestMarker = function (
  markers: any[], //Listing[],
  location: GLocation
) {
  // marker {position: latlngObj, map: mapinstnace, icon: iconurl}
  let distances = [""];
  let closest = -1;
  const start = new (window as any).google.maps.LatLng(location);
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].location) {
      let d = (window as any).google.maps.geometry.spherical.computeDistanceBetween(
        toPositionObj(markers[i].location),
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

