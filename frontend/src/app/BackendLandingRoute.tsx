import { useEffect } from "react";
import { BackendLandingPage } from "../features/landing/BackendLandingPage";
import { LandingDetailPage } from "../features/landing/LandingPages";
import { PersonalDataPage } from "../features/landing/PersonalDataPage";
import { initLandingAnalytics } from "../features/landing/analytics";

export function BackendLandingRoute() {
  useEffect(() => { initLandingAnalytics(); }, []);
  const page = window.location.pathname.replace(/\/+$/, "").split("/").pop();
  if (page === "personal-data") return <PersonalDataPage />;
  if (page === "privacy-policy") return <PersonalDataPage policy />;
  if (page === "reviews" || page === "platform" || page === "pricing") return <LandingDetailPage page={page} />;
  return <BackendLandingPage />;
}
