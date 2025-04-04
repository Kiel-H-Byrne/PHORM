import { render, screen } from '@testing-library/react';
import FirebaseAuthUI from '@/components/FirebaseAuthUI';
import * as fbAuth from '@/pages/api/auth/fbAuth';
import { useRouter } from 'next/router';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the Firebase auth functions
jest.mock('@/pages/api/auth/fbAuth', () => ({
  startFirebaseUILogin: jest.fn(),
}));

// Mock the appAuth from db/firebase
jest.mock('@/db/firebase', () => ({
  appAuth: {
    onAuthStateChanged: jest.fn((callback) => {
      // Return a function to unsubscribe
      return jest.fn();
    }),
  },
}));

describe('FirebaseAuthUI', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the component with default props', () => {
    render(<FirebaseAuthUI />);
    
    // Check that the title and subtitle are rendered
    expect(screen.getByText('Sign in to PHORM')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred sign-in method')).toBeInTheDocument();
    
    // Check that the FirebaseUI container is rendered
    expect(document.getElementById('firebaseui-auth-container')).toBeInTheDocument();
    
    // Check that startFirebaseUILogin was called
    expect(fbAuth.startFirebaseUILogin).toHaveBeenCalledWith('firebaseui-auth-container');
  });

  it('renders with custom title and subtitle', () => {
    const customTitle = 'Custom Title';
    const customSubtitle = 'Custom Subtitle';
    
    render(
      <FirebaseAuthUI 
        title={customTitle} 
        subtitle={customSubtitle} 
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });
});
