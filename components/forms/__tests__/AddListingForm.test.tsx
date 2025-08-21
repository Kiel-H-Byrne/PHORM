import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddListingForm } from '../';
import { useAuth } from '@/contexts/AuthContext';
import * as React from 'react';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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

describe('AddListingForm', () => {
  const mockOnDrawerClose = jest.fn();
  
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
  });
  
  it('renders the form correctly when user is authenticated', () => {
    render(<AddListingForm onDrawerClose={mockOnDrawerClose} />);
    
    // Check that the form title is rendered
    expect(screen.getByText('Add New Business Listing')).toBeInTheDocument();
    
    // Check that form fields are rendered
    expect(screen.getByLabelText('Business Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('Zip Code')).toBeInTheDocument();
    
    // Check that buttons are rendered
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
  
  it('shows authentication required message when user is not authenticated', () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: null
    });
    
    render(<AddListingForm onDrawerClose={mockOnDrawerClose} />);
    
    // Check that authentication required message is shown
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('You must be logged in to add a business listing.')).toBeInTheDocument();
  });
  
  it('submits the form with valid data', async () => {
    render(<AddListingForm onDrawerClose={mockOnDrawerClose} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Business Name'), {
      target: { value: 'Test Business' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a test business description' }
    });
    
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '123 Test St' }
    });
    
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Test City' }
    });
    
    fireEvent.change(screen.getByLabelText('State'), {
      target: { value: 'NY' }
    });
    
    fireEvent.change(screen.getByLabelText('Zip Code'), {
      target: { value: '12345' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/listings', {
        method: 'POST',
        body: expect.any(String),
      });
    });
    
    // Check that the form was reset and drawer was closed
    await waitFor(() => {
      expect(mockOnDrawerClose).toHaveBeenCalled();
    });
  });
});
