import { findClosestMarker, getTruncated, milesToMeters, targetClient, toPositionObj } from '../helpers';

describe('targetClient', () => {
  it('should zoom in and center the map on provided position', () => {
    const map = {
      panTo: jest.fn(),
      setZoom: jest.fn(),
    };
    const pos = { lat: 40.712776, lng: -74.005974 }; // New York City
    targetClient(map, pos);
    expect(map.panTo).toHaveBeenCalledWith(pos);
    expect(map.setZoom).toHaveBeenCalledWith(17);
  });
});

describe('toPositionObj', () => {
  it('should convert a string location to a Google Maps LatLng object', () => {
    const location = '40.712776,-74.005974';
    const expectedLatLng = new window.google.maps.LatLng({ lat: 40.712776, lng: -74.005974 });
    expect(toPositionObj(location)).toEqual(expectedLatLng);
  });

  it('should return undefined if no location is provided', () => {
    expect(toPositionObj(undefined)).toBeUndefined();
  });
});

describe('findClosestMarker', () => {
  it('should return the closest marker to the provided location', () => {
    const markers = [
      { location: '40.712776,-74.005974' }, // New York City
      { location: '41.878113,-87.629799' }, // Chicago
      { location: '34.052235,-118.243683' }, // Los Angeles
    ];
    const location = { lat: 40.748817, lng: -73.985428 }; // Manhattan, NY
    const closestMarker = findClosestMarker(markers, location);
    expect(closestMarker.location).toEqual('40.712776,-74.005974');
  });

  it('should return undefined if no markers are provided', () => {
    expect(findClosestMarker([], { lat: 40.748817, lng: -73.985428 })).toBeUndefined();
  });
});

describe('getTruncated', () => {
  it('should return the integer part of a float number', () => {
    expect(getTruncated(3.14159)).toEqual(3);
    expect(getTruncated(-3.14159)).toEqual(-3);
  });
});

describe('milesToMeters', () => {
  it('should convert miles to meters', () => {
    expect(milesToMeters(1)).toEqual(1609.34);
    expect(milesToMeters(5)).toEqual(8046.7);
  });
});