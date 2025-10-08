"use client";

import Hero from "@/components/home/hero";
import Testimonials from "@/components/home/testimonials";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";
import Footer from "@/components/home/footer";
import FeaturesSlide from "@/components/home/features-slide";

export default function Home() {
	return (
		<>
			<Hero />
			<Testimonials />
			<FeaturesSlide />
			<Pricing />
			<FAQ />
			<Footer />
		</>
	);
}
