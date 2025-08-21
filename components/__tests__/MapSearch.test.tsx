import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapSearch from '../MapSearch';
import { searchListings } from '@/db/listings';

// Mock the searchListings function
jest.mock('@/db/listings', () => ({
  searchListings: jest.fn(),
}));

// Mock Google Maps API
global.google = {
  maps: {
    geometry: {
      spherical: {
        computeDistanceBetween: jest.fn().mockReturnValue(1000),
      },
    },
    LatLng: jest.fn().mockImplementation((lat, lng) => ({ lat, lng })),
  },
} as any;

describe('MapSearch', () => {
  const mockOnSelectListing = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockMapInstance = {
    getCenter: jest.fn().mockReturnValue({ lat: 40.712776, lng: -74.005974 }),
    panTo: jest.fn(),
    setZoom: jest.fn(),
  } as any;
  
  const mockListings = [
    {
      id: '1',
      name: 'Test Business 1',
      address: '123 Test St, New York, NY',
      lat: 40.712776,
      lng: -74.005974,
      categories: ['restaurant'],
    },
    {
      id: '2',
      name: 'Test Business 2',
      address: '456 Test Ave, New York, NY',
      lat: 40.712776,
      lng: -74.005974,
      categories: ['retail'],
    },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    (searchListings as jest.Mock).mockResolvedValue(mockListings);
  });
  
  it('renders the search input', () => {
    render(
      <MapSearch 
        onSelectListing={mockOnSelectListing} 
        mapInstance={mockMapInstance}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    expect(screen.getByPlaceholderText('Search for businesses...')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });
  
  it('searches for listings when input changes', async () => {
    render(
      <MapSearch 
        onSelectListing={mockOnSelectListing} 
        mapInstance={mockMapInstance}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for businesses...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for the debounced search to be called
    await waitFor(() => {
      expect(searchListings).toHaveBeenCalledWith('test', 10);
    });
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
      expect(screen.getByText('Test Business 2')).toBeInTheDocument();
    });
  });
  
  it('filters results by category', async () => {
    render(
      <MapSearch 
        onSelectListing={mockOnSelectListing} 
        mapInstance={mockMapInstance}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search for businesses...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });
    
    // Open filter menu
    fireEvent.click(screen.getByText('Filter'));
    
    // Select restaurant category
    fireEvent.click(screen.getByText('Restaurant'));
    
    // Check that onFilterChange was called with the correct filter
    expect(mockOnFilterChange).toHaveBeenCalledWith({ category: 'restaurant' });
    
    // Check that searchListings was called again
    expect(searchListings).toHaveBeenCalledTimes(2);
  });
  
  it('clears filters when clear button is clicked', async () => {
    render(
      <MapSearch 
        onSelectListing={mockOnSelectListing} 
        mapInstance={mockMapInstance}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search for businesses...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });
    
    // Open filter menu
    fireEvent.click(screen.getByText('Filter'));
    
    // Select restaurant category
    fireEvent.click(screen.getByText('Restaurant'));
    
    // Clear filters
    fireEvent.click(screen.getByText('Clear Filters'));
    
    // Check that onFilterChange was called with empty filters
    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });
  
  it('selects a listing when clicked', async () => {
    render(
      <MapSearch 
        onSelectListing={mockOnSelectListing} 
        mapInstance={mockMapInstance}
        onFilterChange={mockOnFilterChange}
      />
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search for businesses...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });
    
    // Click on a listing
    fireEvent.click(screen.getByText('Test Business 1'));
    
    // Check that onSelectListing was called with the correct listing
    expect(mockOnSelectListing).toHaveBeenCalledWith(mockListings[0]);
    
    // Check that map was centered on the selected listing
    expect(mockMapInstance.panTo).toHaveBeenCalledWith({ lat: 40.712776, lng: -74.005974 });
    expect(mockMapInstance.setZoom).toHaveBeenCalledWith(16);
  });
});
