import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseBackButtonOptions {
  targetRoute: string;
  fallbackRoute?: string;
}

export const useBackButton = ({ targetRoute, fallbackRoute = '/' }: UseBackButtonOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      // Determine where to navigate based on current location
      const currentPath = location.pathname;
      
      // Navigate to the specified target route or fallback
      navigate(targetRoute, { replace: true });
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopState);

    // Push current state to history to enable back button handling
    window.history.pushState({ page: location.pathname }, '', location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, targetRoute, fallbackRoute, location.pathname]);

  // Function to manually handle back navigation (for custom back buttons)
  const handleBack = () => {
    navigate(targetRoute);
  };

  return { handleBack };
};