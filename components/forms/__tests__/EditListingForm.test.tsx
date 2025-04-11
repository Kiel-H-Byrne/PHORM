import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditListingForm } from '../';
import { useAuth } from '@/contexts/AuthContext';
import * as React from 'react';
import useSWR from 'swr';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the Google Maps API
global.google = {
  maps: {
    Geocoder: jest.fn().mockImplementation(() => ({
      geocode: jest.fn((request, callback) => {
        callback([{
          geometry: {
            location: {
              lat: () => 40.712776,
              lng: () => -74.005974,
            }
          },
          place_id: 'test-place-id'
        }], 'OK');
      })
    }))
  }
} as any;

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('EditListingForm', () => {
  const mockOnClose = jest.fn();
  const mockListingId = 'test-listing-id';
  
  const mockListing = {
    id: mockListingId,
    name: 'Test Business',
    description: 'This is a test business',
    street: '123 Test St',
    city: 'Test City',
    state: 'NY',
    zip: 12345,
    phone: '123-456-7890',
    url: 'https://example.com',
    lat: 40.712776,
    lng: -74.005974,
    creator: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: 'test-user-id',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
      }
    });
    
    // Mock SWR to return listing data
    (useSWR as jest.Mock).mockReturnValue({
      data: mockListing,
      error: undefined,
      isLoading: false,
    });
  });
  
  it('renders the form with listing data when authorized', () => {
    render(<EditListingForm listingId={mockListingId} onClose={mockOnClose} />);
    
    // Check that the form title is rendered
    expect(screen.getByText('Edit Business Listing')).toBeInTheDocument();
    
    // Check that form fields are populated with listing data
    expect(screen.getByLabelText('Business Name')).toHaveValue('Test Business');
    expect(screen.getByLabelText('Description')).toHaveValue('This is a test business');
    expect(screen.getByLabelText('Street Address')).toHaveValue('123 Test St');
    expect(screen.getByLabelText('City')).toHaveValue('Test City');
    expect(screen.getByLabelText('State')).toHaveValue('NY');
    expect(screen.getByLabelText('Zip Code')).toHaveValue(12345);
    
    // Check that buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update Listing')).toBeInTheDocument();
  });
  
  it('shows loading state when data is loading', () => {
    // Mock loading state
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    
    render(<EditListingForm listingId={mockListingId} onClose={mockOnClose} />);
    
    // Check that skeletons are rendered for loading state
    expect(screen.getAllByTestId('skeleton')).toHaveLength(7);
  });
  
  it('shows error message when data fails to load', () => {
    // Mock error state
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: new Error('Failed to load listing'),
      isLoading: false,
    });
    
    render(<EditListingForm listingId={mockListingId} onClose={mockOnClose} />);
    
    // Check that error message is shown
    expect(screen.getByText('Error Loading Listing')).toBeInTheDocument();
    expect(screen.getByText('Failed to load listing')).toBeInTheDocument();
  });
  
  it('shows unauthorized message when user is not the creator', () => {
    // Mock different user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: 'different-user-id',
        displayName: 'Different User',
        email: 'different@example.com',
      }
    });
    
    render(<EditListingForm listingId={mockListingId} onClose={mockOnClose} />);
    
    // Check that unauthorized message is shown
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.getByText('You are not authorized to edit this listing.')).toBeInTheDocument();
  });
  
  it('submits the form with updated data', async () => {
    render(<EditListingForm listingId={mockListingId} onClose={mockOnClose} />);
    
    // Update a field
    fireEvent.change(screen.getByLabelText('Business Name'), {
      target: { value: 'Updated Business Name' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Listing'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/listings/${mockListingId}`, {
        method: 'PUT',
        body: expect.any(String),
      });
    });
    
    // Check that the modal was closed
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
