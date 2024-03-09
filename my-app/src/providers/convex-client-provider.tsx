import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

interface ConvexClientProviderProps {
  children: React.ReactNode;
}

// const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
// const convexUrl:any =process.env.REACT_APP_NEXT_PUBLIC_CONVEX_URL;
const convexUrl ='https://fleet-hawk-239.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

export const ConvexClientProvider = ({ children }: ConvexClientProviderProps) => {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
};
