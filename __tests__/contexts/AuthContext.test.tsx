import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as fbAuth from '@/pages/api/auth/fbAuth';
import { useRouter } from 'next/router';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the Firebase auth functions
jest.mock('@/pages/api/auth/fbAuth', () => ({
  onAuthStateChanged: jest.fn(),
  logoutUser: jest.fn(),
}));

// Mock the auth cookies utility
jest.mock('@/util/authCookies', () => ({
  setupAuthCookieListener: jest.fn(() => jest.fn()),
  removeAuthCookie: jest.fn(),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    
    // Setup auth state changed mock
    (fbAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      // Initially call with null (not signed in)
      callback(null);
      // Return a function to unsubscribe
      return jest.fn();
    });
  });

  it('provides auth context with initial values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially, user should be null and loading should be false
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('updates context when user signs in', async () => {
    // Mock user object
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
    };
    
    // Setup auth state changed to simulate sign in
    (fbAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      // Call with mock user (signed in)
      callback(mockUser);
      // Return a function to unsubscribe
      return jest.fn();
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // User should be set and loading should be false
    expect(screen.getByTestId('user').textContent).toContain(mockUser.uid);
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('calls signOut when sign out button is clicked', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click the sign out button
    await act(async () => {
      screen.getByText('Sign Out').click();
    });
    
    // Check that logoutUser was called
    expect(fbAuth.logoutUser).toHaveBeenCalled();
  });
});
