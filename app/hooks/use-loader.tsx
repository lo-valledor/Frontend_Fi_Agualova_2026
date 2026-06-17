import { useLoadingBar } from 'react-top-loading-bar';


interface UseLoaderReturn {
  start: () => void;
  complete: () => void;
}


export const useLoader = (): UseLoaderReturn => {
  const { start, complete } = useLoadingBar({
    color: 'blue',
    height: 2
  });

  return { start, complete };
};
