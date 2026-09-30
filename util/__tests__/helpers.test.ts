import {
  findClosestMarker,
  getTruncated,
  milesToMeters,
  targetClient,
  toPositionObj,
} from "../helpers";

// Minimal google.maps stand-in: LatLng returns the literal and distance is a
// flat-earth approximation, which is enough to rank markers.
beforeAll(() => {
  (global as any).google = {
    maps: {
      LatLng: function (this: any, pos: { lat: number; lng: number }) {
        return pos;
      },
      geometry: {
        spherical: {
          computeDistanceBetween: (
            a: { lat: number; lng: number },
            b: { lat: number; lng: number }
          ) => Math.hypot(a.lat - b.lat, a.lng - b.lng),
        },
      },
    },
  };
});

describe("targetClient", () => {
  it("centers and zooms the map on the position", () => {
    const map = { panTo: jest.fn(), setZoom: jest.fn() };
    const pos = { lat: 40.712776, lng: -74.005974 };
    targetClient(map, pos);
    expect(map.panTo).toHaveBeenCalledWith(pos);
    expect(map.setZoom).toHaveBeenCalledWith(13);
  });
});

describe("toPositionObj", () => {
  it("converts a 'lat,lng' string to a position", () => {
    expect(toPositionObj("40.712776,-74.005974")).toEqual({
      lat: 40.712776,
      lng: -74.005974,
    });
  });

  it("returns undefined without a location", () => {
    expect(toPositionObj(undefined)).toBeUndefined();
  });
});

describe("findClosestMarker", () => {
  it("returns the closest marker", () => {
    const markers = [
      { lat: 41.878113, lng: -87.629799 }, // Chicago
      { lat: 40.712776, lng: -74.005974 }, // New York City
      { lat: 34.052235, lng: -118.243683 }, // Los Angeles
    ];
    const closest = findClosestMarker(markers, {
      lat: 40.748817,
      lng: -73.985428,
    });
    expect(closest).toEqual(markers[1]);
  });

  it("returns undefined when there are no markers", () => {
    expect(
      findClosestMarker([], { lat: 40.748817, lng: -73.985428 })
    ).toBeUndefined();
  });
});

describe("getTruncated", () => {
  it("returns the integer part", () => {
    expect(getTruncated(3.14159)).toEqual(3);
    expect(getTruncated(-3.14159)).toEqual(-3);
  });
});

describe("milesToMeters", () => {
  it("converts miles to meters", () => {
    expect(milesToMeters(1)).toBeCloseTo(1609.34);
    expect(milesToMeters(5)).toBeCloseTo(8046.7);
  });
});
