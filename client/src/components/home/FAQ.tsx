import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    { q: "Do I need to log in to book parking?", a: "No. Only administrators log in. Students, staff and visitors can reserve without an account." },
    { q: "Is parking free?", a: "Yes, parking is free. You only pay if you receive a parking fine." },
    { q: "Can visitors reserve a slot?", a: "Yes. Visitors simply enter their name, contact number and vehicle plate without campus verification." },
    { q: "What happens if I don't arrive for my reservation?", a: "Your reservation will expire automatically after the end time. Repeated abuse can lead to enforcement action." },
    { q: "How do I pay a fine online?", a: "Go to the 'Check & Pay Fines' page, search by plate number or student/staff number, and pay using the online payment option." }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-base text-cyan-600 font-semibold tracking-wide uppercase">Support</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Frequently Asked Questions
                    </p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <button
                                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            >
                                <span className="font-medium text-gray-900">{faq.q}</span>
                                {openIndex === idx ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>
                            {openIndex === idx && (
                                <div className="px-6 pb-4 text-gray-500 text-sm">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
