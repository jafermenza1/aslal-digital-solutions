import { GrowthBuilder } from "@/components/GrowthBuilder";

export default function GrowthBuilderPage() {
  return <main>
    <section className="relative overflow-hidden bg-[#0F3E8A] py-24 text-white hero-glow"><div className="container-aslal relative z-10"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Growth System Builder</div><h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl">Start with the business problem. Build the system around it.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">Choose a growth priority and the channels you care about. We'll turn your starting point into a focused conversation with Aslal.</p></div></section>
    <section className="bg-[#F8FAFC] py-20"><div className="container-aslal"><GrowthBuilder /></div></section>
  </main>;
}
