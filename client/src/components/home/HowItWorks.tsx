import React from 'react';
import { Users, ShieldCheck, MapPin, QrCode } from 'lucide-react';

const steps = [
    { icon: Users, title: "Choose User Type", desc: "Staff, Student, or Visitor – no login required." },
    { icon: ShieldCheck, title: "Verify & Add Vehicle", desc: "Students/Staff verified with Campus ID." },
    { icon: MapPin, title: "Select Date & Zone", desc: "Pick your faculty, zone and available lot." },
    { icon: QrCode, title: "Get Digital Pass", desc: "Show the QR/permit to the guard on arrival." }
];

const HowItWorks: React.FC = () => {
    return (
        <section className="py-16 bg-slate-900 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500 blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-base text-cyan-400 font-semibold tracking-wide uppercase">Process</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                        How It Works
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 hover:bg-white/10">
                            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 mb-4">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-sm text-gray-400">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
