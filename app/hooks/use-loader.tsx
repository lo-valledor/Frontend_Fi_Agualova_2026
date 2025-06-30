import { useLoadingBar } from 'react-top-loading-bar';

export const useLoader = () => {
  const { start, complete } = useLoadingBar({
    color: 'blue',
    height: 2,
  });

  return { start, complete };
};
