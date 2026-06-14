import { Hero } from "@/components/Hero";
import { Products } from "@/components/Products";
import { Markets } from "@/components/Markets";
import { Pricing } from "@/components/Pricing";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Products />
      <Markets />
      <Pricing />
      <About />
      <Contact />
    </>
  );
}
