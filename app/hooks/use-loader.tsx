/**
 * Loading Bar Hook
 *
 * Provides a simple hook for controlling a global top loading bar indicator.
 * Uses react-top-loading-bar for smooth progress animations.
 *
 * This hook is useful for indicating loading states during navigation,
 * data fetching, or any async operations that benefit from visual feedback.
 */

import { useLoadingBar } from 'react-top-loading-bar';

/**
 * Return type for useLoader hook
 */
interface UseLoaderReturn {
  start: () => void;
  complete: () => void;
}

/**
 * Hook for controlling the global loading bar
 *
 * Provides simple start/complete functions to show/hide a loading bar
 * at the top of the page. Useful for indicating loading states during
 * navigation or async operations.
 *
 * The loading bar is:
 * - Blue color (matching application theme)
 * - 2px height (subtle but visible)
 * - Smooth animations
 * - Positioned at top of viewport
 *
 * @returns {UseLoaderReturn} Loading bar control functions
 *
 * @example
 * ```tsx
 * const { start, complete } = useLoader();
 *
 * const handleNavigation = async () => {
 *   start();
 *   try {
 *     await fetchData();
 *     navigate('/next-page');
 *   } finally {
 *     complete();
 *   }
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Use with async data fetching
 * const { start, complete } = useLoader();
 *
 * useEffect(() => {
 *   const loadData = async () => {
 *     start();
 *     try {
 *       const data = await api.fetchData();
 *       setData(data);
 *     } finally {
 *       complete();
 *     }
 *   };
 *   loadData();
 * }, []);
 * ```
 *
 * @example
 * ```tsx
 * // Use with form submission
 * const { start, complete } = useLoader();
 *
 * const handleSubmit = async (formData) => {
 *   start();
 *   try {
 *     await api.submitForm(formData);
 *     toast.success('Form submitted!');
 *   } catch (error) {
 *     toast.error('Submission failed');
 *   } finally {
 *     complete();
 *   }
 * };
 * ```
 */
export const useLoader = (): UseLoaderReturn => {
  const { start, complete } = useLoadingBar({
    color: 'blue',
    height: 2
  });

  return { start, complete };
};
