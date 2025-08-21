import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfileForm from '../EditProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock SWR Mutation
jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('EditProfileForm', () => {
  const mockOnUpdate = jest.fn();
  
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
  };
  
  const mockUserData = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/photo.jpg',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      contact: {
        email: 'test@example.com',
        phone: '123-456-7890',
      },
      bio: 'This is a test bio',
      location: 'DC',
      specialties: ['Testing', 'React'],
      experienceLevel: 'intermediate',
      availability: 'fulltime',
      socialLinks: [],
      orgs: [],
      classYear: 2020,
    },
  };
  
  const mockTrigger = jest.fn().mockResolvedValue({ success: true });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
    
    // Mock SWR to return user data
    (useSWR as jest.Mock).mockReturnValue({
      data: mockUserData,
      error: undefined,
      isLoading: false,
    });
    
    // Mock SWR Mutation
    (useSWRMutation as jest.Mock).mockReturnValue({
      trigger: mockTrigger,
      error: undefined,
    });
  });
  
  it('renders the form with user data when loaded', () => {
    render(<EditProfileForm onUpdate={mockOnUpdate} />);
    
    // Check that form fields are populated with user data
    expect(screen.getByLabelText('First Name')).toHaveValue('Test');
    expect(screen.getByLabelText('Last Name')).toHaveValue('User');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Phone')).toHaveValue('123-456-7890');
    expect(screen.getByLabelText('Bio')).toHaveValue('This is a test bio');
    
    // Check that specialties are displayed
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    
    // Check that the update button is rendered
    expect(screen.getByText('Update Profile')).toBeInTheDocument();
  });
  
  it('shows loading state when data is loading', () => {
    // Mock loading state
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    
    render(<EditProfileForm onUpdate={mockOnUpdate} />);
    
    // Check that skeletons are rendered for loading state
    expect(screen.getAllByTestId('skeleton')).toHaveLength(8);
  });
  
  it('shows error state when data fails to load', () => {
    // Mock error state
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: new Error('Failed to load profile'),
      isLoading: false,
    });
    
    render(<EditProfileForm onUpdate={mockOnUpdate} />);
    
    // Check that error message is shown
    expect(screen.getByText('Error loading profile')).toBeInTheDocument();
    expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
  });
  
  it('submits the form with updated data', async () => {
    render(<EditProfileForm onUpdate={mockOnUpdate} />);
    
    // Update a field
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Updated' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Profile'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'User',
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890',
        },
        bio: 'This is a test bio',
        location: 'DC',
        specialties: ['Testing', 'React'],
        experienceLevel: 'intermediate',
        availability: 'fulltime',
        socialLinks: [],
        orgs: [],
        classYear: 2020,
      });
    });
    
    // Check that onUpdate was called
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });
  
  it('adds and removes specialties', () => {
    render(<EditProfileForm onUpdate={mockOnUpdate} />);
    
    // Add a new specialty
    fireEvent.change(screen.getByPlaceholderText('Add a specialty'), {
      target: { value: 'New Specialty' }
    });
    
    fireEvent.click(screen.getByLabelText('Add specialty'));
    
    // Check that the new specialty is added
    expect(screen.getByText('New Specialty')).toBeInTheDocument();
    
    // Remove a specialty
    fireEvent.click(screen.getAllByLabelText('Close')[0]);
    
    // Check that the specialty is removed
    expect(screen.queryByText('Testing')).not.toBeInTheDocument();
  });
});
