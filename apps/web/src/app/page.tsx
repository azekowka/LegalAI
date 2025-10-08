"use client";

import Hero from "@/components/home/hero";
import Testimonials from "@/components/home/testimonials";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";
import Footer from "@/components/home/footer";

export default function Home() {
	return (
		<>
			<Hero />
			<Testimonials />
			<Pricing />
			<FAQ />
			<Footer />
		</>
	);
}
