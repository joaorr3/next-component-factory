import React from "react";
import Loader from "../components/Loader";

type LoadingContextModel = {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
};

const loadingContext = React.createContext<LoadingContextModel>({
  isLoading: false,
  setLoading: () => console.log(),
});

const LoadingProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setLoading] = React.useState<boolean>(false);

  return (
    <loadingContext.Provider
      value={{ isLoading, setLoading: (loading) => setLoading(loading) }}
    >
      {isLoading && <Loader />}
      {children}
    </loadingContext.Provider>
  );
};

export default LoadingProvider;

export const useLoadingContext = () => {
  return React.useContext(loadingContext);
};

export const useLoading = (loading: boolean) => {
  const { setLoading } = useLoadingContext();
  React.useEffect(() => {
    setLoading(loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
};
