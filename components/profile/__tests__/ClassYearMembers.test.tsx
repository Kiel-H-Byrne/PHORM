import { render, screen, waitFor } from '@testing-library/react';
import { ClassYearMembers } from '../ClassYearMembers';
import { useRouter } from 'next/router';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('ClassYearMembers', () => {
  const mockClassYear = 2020;
  const mockCurrentUserId = 'current-user-id';
  
  const mockMembers = [
    {
      id: 'user-1',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        location: 'DC',
        specialties: ['JavaScript', 'React'],
      },
    },
    {
      id: 'user-2',
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        location: 'MD',
        specialties: ['Node.js', 'Express'],
      },
    },
    {
      id: mockCurrentUserId,
      profile: {
        firstName: 'Current',
        lastName: 'User',
        location: 'VA',
        specialties: ['TypeScript'],
      },
    },
  ];
  
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock successful fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockMembers }),
    });
  });
  
  it('renders the component with members', async () => {
    render(<ClassYearMembers classYear={mockClassYear} currentUserId={mockCurrentUserId} />);
    
    // Check that loading state is shown initially
    expect(screen.getByText(`Class of ${mockClassYear}`)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Check that member data is displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Current User')).toBeInTheDocument();
    
    // Check that locations are displayed
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByText('MD')).toBeInTheDocument();
    expect(screen.getByText('VA')).toBeInTheDocument();
    
    // Check that specialties are displayed
    expect(screen.getByText('Specialties: JavaScript, React')).toBeInTheDocument();
    expect(screen.getByText('Specialties: Node.js, Express')).toBeInTheDocument();
    expect(screen.getByText('Specialties: TypeScript')).toBeInTheDocument();
    
    // Check that buttons are rendered correctly
    expect(screen.getAllByText('View Profile').length).toBe(2);
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
  });
  
  it('shows error message when fetch fails', async () => {
    // Mock failed fetch
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<ClassYearMembers classYear={mockClassYear} currentUserId={mockCurrentUserId} />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load class members')).toBeInTheDocument();
    });
  });
  
  it('shows message when no members are found', async () => {
    // Mock empty response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] }),
    });
    
    render(<ClassYearMembers classYear={mockClassYear} currentUserId={mockCurrentUserId} />);
    
    // Wait for message to be displayed
    await waitFor(() => {
      expect(screen.getByText('No members found for this class year.')).toBeInTheDocument();
    });
  });
});
