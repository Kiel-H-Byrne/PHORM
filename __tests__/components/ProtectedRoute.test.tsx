import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders loading state when loading', () => {
    // Mock auth context with loading state
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Should show loading indicator
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Should not render children
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    // Mock auth context with authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: '123' },
      loading: false,
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Should render children
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not show loading indicator
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    const mockPush = jest.fn();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock auth context with no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Should not render children
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Should redirect to login
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});
