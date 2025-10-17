/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import PageLoader from "@/components/general/PageLoader";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import SwapForm from "@/sections/SwapForm";

const Home = async () => {
  return (
    // <MaxWidth>
    <Suspense fallback={<PageLoader />}>
      <SwapForm />
      <Toaster />
      <Footer />
    </Suspense>
    // </MaxWidth>
  );
};

export default Home;
