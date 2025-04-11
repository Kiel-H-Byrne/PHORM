import { render } from '@testing-library/react';
import MyInfoWindow from '../InfoWindow';
import { SingleInfoContent, MultipleInfoContent } from '../';

// Mock the SingleInfoContent and MultipleInfoContent components
jest.mock('../SingleInfoContent', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="single-info-content" />),
}));

jest.mock('../MultipleInfoContent', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="multiple-info-content" />),
}));

// Mock the ErrorBoundary component
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('MyInfoWindow', () => {
  const mockPosition = { lat: 40.712776, lng: -74.005974 };
  
  const mockSingleListing = [
    {
      id: '1',
      name: 'Test Business',
      address: '123 Test St, New York, NY',
      lat: 40.712776,
      lng: -74.005974,
    },
  ];
  
  const mockMultipleListings = [
    {
      id: '1',
      name: 'Test Business 1',
      address: '123 Test St, New York, NY',
      lat: 40.712776,
      lng: -74.005974,
    },
    {
      id: '2',
      name: 'Test Business 2',
      address: '456 Test Ave, New York, NY',
      lat: 40.712776,
      lng: -74.005974,
    },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders SingleInfoContent for a single listing', () => {
    const { getByTestId } = render(
      <MyInfoWindow activeData={mockSingleListing} position={mockPosition} />
    );
    
    expect(getByTestId('single-info-content')).toBeInTheDocument();
    expect(SingleInfoContent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockSingleListing,
        options: expect.objectContaining({
          position: { lat: 40.712776, lng: -74.005974 },
        }),
      }),
      expect.anything()
    );
  });
  
  it('renders MultipleInfoContent for multiple listings', () => {
    const { getByTestId } = render(
      <MyInfoWindow activeData={mockMultipleListings} position={mockPosition} />
    );
    
    expect(getByTestId('multiple-info-content')).toBeInTheDocument();
    expect(MultipleInfoContent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockMultipleListings,
        options: expect.objectContaining({
          position: mockPosition,
        }),
      }),
      expect.anything()
    );
  });
  
  it('returns null for empty data', () => {
    const { container } = render(
      <MyInfoWindow activeData={[]} position={mockPosition} />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  it('returns null for null data', () => {
    const { container } = render(
      <MyInfoWindow activeData={null as any} position={mockPosition} />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
