/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the page to the top when the route changes
 * This ensures users start at the top of the page when navigating between routes
 * 
 * Uses React Router's useLocation hook to detect route changes
 * Returns null (no visual component)
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation(); // Get current route path

  /**
   * Scroll to top whenever the route changes
   * This provides better UX when navigating between pages
   */
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0, // Scroll to top of page
      left: 0, // Scroll to left edge
      behavior: 'instant' // Instant scroll, no animation
    });
  }, [pathname]); // Re-run when pathname changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;

