/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import PageLoader from "@/components/general/PageLoader";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";

import LimitOrderForm from "@/sections/LimitOrderForm";

const Home = async () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <LimitOrderForm />
      <Toaster />
      <Footer />
    </Suspense>
  );
};

export default Home;
