/**
 * Parses address components from Google Places API result
 */
export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: number;
  lat: number;
  lng: number;
  placeId: string;
  formattedAddress: string;
}

export const parseAddressComponents = (
  place: google.maps.places.PlaceResult
): ParsedAddress => {
  const addressComponents = place.address_components || [];
  
  // Initialize with empty values
  const result: Partial<ParsedAddress> = {
    street: '',
    city: '',
    state: '',
    zip: 0,
    formattedAddress: place.formatted_address || '',
    placeId: place.place_id || '',
  };
  
  // Add coordinates if available
  if (place.geometry?.location) {
    result.lat = place.geometry.location.lat();
    result.lng = place.geometry.location.lng();
  }
  
  // Extract street number and street name
  const streetNumber = addressComponents.find(component => 
    component.types.includes('street_number')
  )?.long_name || '';
  
  const streetName = addressComponents.find(component => 
    component.types.includes('route')
  )?.long_name || '';
  
  // Combine street number and name
  result.street = streetNumber && streetName 
    ? `${streetNumber} ${streetName}` 
    : streetName || '';
  
  // Extract city (locality or sublocality)
  result.city = addressComponents.find(component => 
    component.types.includes('locality') || component.types.includes('sublocality')
  )?.long_name || '';
  
  // If city is not found, try neighborhood or administrative_area_level_3
  if (!result.city) {
    result.city = addressComponents.find(component => 
      component.types.includes('neighborhood') || 
      component.types.includes('administrative_area_level_3')
    )?.long_name || '';
  }
  
  // Extract state (administrative_area_level_1)
  result.state = addressComponents.find(component => 
    component.types.includes('administrative_area_level_1')
  )?.short_name || '';
  
  // Extract zip code (postal_code)
  const zipString = addressComponents.find(component => 
    component.types.includes('postal_code')
  )?.long_name || '0';
  
  result.zip = parseInt(zipString, 10) || 0;
  
  return result as ParsedAddress;
};

export default parseAddressComponents;
