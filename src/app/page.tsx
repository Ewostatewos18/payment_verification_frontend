// src/app/page.tsx
'use client'; // This is a Client Component

import React from 'react'; // Import React
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Next.js Image component

export default function Home() {
  const router = useRouter();
  // Reintroduced selectedBank state with its setter
  

  // Corrected handleBankSelect to use the state setter
  const handleBankSelect = (bankName: string) => {
   
    router.push(`/${bankName.toLowerCase()}`);
  };

  // Helper component for individual bank cards with enhanced styling and animations
  // Using string for bank prop for simplicity, matching router.push
  const BankCard = ({ bank, icon, description }: { bank: string; icon: React.ReactNode; description: string }) => (
    <button
      type="button"
      onClick={() => handleBankSelect(bank)} // Corrected: pass a function reference
      className={`
        relative flex flex-col items-center justify-center p-8 rounded-3xl shadow-lg
        transition-all duration-300 ease-in-out transform /* Re-added transform for scale */
        hover:scale-105 hover:shadow-2xl /* Re-added scale and enhanced shadow on hover */
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-400
        bg-white text-blue-500 font-semibold text-lg
        overflow-hidden group /* Re-added group for hover effects */
        min-h-[280px] border border-gray-200 /* Add a subtle border */
      `}
    >
      {/* Subtle overlay for hover effect */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>

      {/* Icon with consistent sizing and animation */}
      <div className="w-60 h-20 flex items-center justify-center rounded-full overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-110"> {/* Re-added group-hover:scale-110 */}
        {icon}
      </div>

      {/* Bank Name */}
      <span className="text-3xl font-extrabold tracking-wide mb-2 text-shadow-sm"> {/* Re-added text-shadow-sm */}
        {bank.toUpperCase()}
      </span>

      {/* Description */}
      <p className="text-sm text-center opacity-90 group-hover:opacity-100 transition-opacity duration-300"> {/* Re-added group-hover:opacity-100 */}
        {description}
      </p>

      {/* Arrow on hover - color set to dark gray for visibility on white cards */}
      <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"> {/* Re-added arrow, set to gray-700 */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-gray-100 font-sans text-gray-800 relative overflow-x-hidden"> {/* Horizontal scroll fix retained */}
      {/* Background circles for dynamic effect - Re-added */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 opacity-20 rounded-full mix-blend-multiply animate-float-slow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 opacity-20 rounded-full mix-blend-multiply animate-float-medium" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/12 w-48 h-48 bg-green-200 opacity-20 rounded-full mix-blend-multiply animate-float-fast" style={{ animationDelay: '4s' }}></div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-6xl w-full border border-gray-200 z-10 animate-fade-in-up"> {/* Re-added animate-fade-in-up */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-center mb-6 text-gray-900 tracking-tight leading-tight drop-shadow-md">
           Payment Verification
        </h1>
        <p className="text-lg sm:text-xl text-center text-gray-700 mb-12 max-w-xl mx-auto leading-relaxed">
          Choose your bank below to access secure and efficient transaction verification services.
        </p>

        {/* Bank Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-full mx-auto">
          <BankCard
            bank="Telebirr" // Use "Telebirr" for display, will be lowercased for route
            icon={
              <Image
                src="https://addisfortune.news/wp-content/uploads/2023/04/Telebir.jpg"
                alt="Telebirr Icon"
                width={80} // Explicit width
                height={80} // Explicit height
                priority // Load eagerly as it's above the fold
                unoptimized={true} // Added to prevent Vercel optimization issues with external URLs
                className="rounded-full w-full h-full object-cover"
              />
            }
            description="Verify mobile money transfers instantly."
          />
          <BankCard
            bank="CBE" // Use "CBE" for display, will be lowercased for route
            icon={
              <Image
                src="https://www.advantechafrica.com/wp-content/uploads/2020/01/images.png"
                alt="CBE Icon"
                width={80} // Explicit width
                height={80} // Explicit height
                priority // Load eagerly
                unoptimized={true} // Added to prevent Vercel optimization issues with external URLs
                className="rounded-full w-full h-full object-cover"
              />
            }
            description="Confirm Commercial Bank of Ethiopia transactions."
          />
          <BankCard
            bank="Boa" // Use "Boa" for display, will be lowercased for route
            icon={
              <Image
                src="https://myviewsonnews.net/wp-content/uploads/2024/04/Bank-of-Abyssinia.png"
                alt="Boa Icon"
                width={80} // Explicit width
                height={80} // Explicit height
                priority // Load eagerly
                unoptimized={true} // Added to prevent Vercel optimization issues with external URLs
                className="rounded-full w-full h-full object-cover"
              />
            }
            description="Validate Bank of Abyssinia payments."
          />
        </div>

        <div className="mt-16 text-center text-gray-600 text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Payment Verifier. All rights reserved. Built with precision and care.</p>
        </div>
      </div>

      {/* Tailwind CSS custom animations style block - Re-added */}
      <style jsx>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 10px) rotate(5deg); }
          50% { transform: translate(0, 20px) rotate(0deg); }
          75% { transform: translate(-20px, 10px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-medium {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, -10px) rotate(-3deg); }
          50% { transform: translate(0, -25px) rotate(0deg); }
          75% { transform: translate(15px, -10px) rotate(3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-fast {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -5px) rotate(2deg); }
          50% { transform: translate(0, -10px) rotate(0deg); }
          75% { transform: translate(-10px, -5px) rotate(-2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-float-slow { animation: float-slow 18s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 22s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 15s ease-in-out infinite; }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .text-shadow-sm {
          text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </main>
  );
}
