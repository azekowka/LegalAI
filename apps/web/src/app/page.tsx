"use client";

import Hero from "@/components/home/hero";
import OrganizationHero from "@/components/home/new-hero";	
import Testimonials from "@/components/home/testimonials";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";
import Footer from "@/components/home/footer";
import FeaturesSlide from "@/components/home/features-slide";
import CookieToast from "@/components/ui/cookie-toast";
import LenisScroller from "@/components/lenis-scroller";
import "lenis/dist/lenis.css";


export default function Home() {
	return (
		<>
            <LenisScroller />
			<OrganizationHero />
			<Testimonials />
			{/*<FeaturesSlide /> TODO: Edit features slide */}
			<Pricing />
			<FAQ />
			<Footer />
			<CookieToast />
		</>
	);
}
