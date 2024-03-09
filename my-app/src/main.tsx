import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Sidebar } from './app/(dashboard)/_components/sidebar/index.tsx'
import { OrgSidebar } from './app/(dashboard)/_components/org-sidebar.tsx'
import { Navbar } from './app/(dashboard)/_components/navbar.tsx'
import { Suspense } from "react";

import { Toaster } from "./components/ui/sonner";

import { ModalProvider } from "./providers/modal-provider";
import  Loading  from "./components/Loading.tsx";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";



// const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
// const convexUrl:any =process.env.REACT_APP_NEXT_PUBLIC_CONVEX_URL;
const convexUrl ='https://fleet-hawk-239.convex.cloud';
const convex = new ConvexReactClient(convexUrl);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <Suspense fallback={<Loading />}>
          <ConvexProvider client={convex}>
            <Toaster />
            <ModalProvider />
            {/* <Navbar /> */}
            <App />
          </ConvexProvider>
        </Suspense>
  </React.StrictMode>
)