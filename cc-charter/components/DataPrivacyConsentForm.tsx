"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ConsentForm() {
    const [isChecked, setIsChecked] = useState(false)
    const router = useRouter()

    const handleConsent = () => {
        router.push("/forms")
    }

    return (
        <div className="min-h-screen bg-[url('/diamond-pattern.svg')] bg-repeat flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-xl lg:max-w-2xl p-4 sm:p-6 lg:p-6 lg:scale-90 lg:origin-center">
                <div className="flex flex-row justify-center sm:justify-start items-center mb-8">
                    <div className="mr-4 h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                        <Image src="/DOST_Logo.png" alt="DOST Logo" width={64} height={64} className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-sm sm:text-xl font-bold text-gray-800">Department of Science and Technology V</h1>
                        <p className="text-xs sm:text-lg text-gray-600">Client Satisfaction Feedback</p>
                    </div>
                </div>

                <div className="flex justify-center items-center mb-6">
                    <div className="mr-4 h-10 w-10 text-gray-800">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10">
                            <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">Data Privacy Consent</h2>
                </div>

                <div className="space-y-2 sm:space-y-4 text-sm sm:text-base text-gray-700 py-4">
                    <p className="leading-relaxed">
                        This Client Satisfaction Measurement (CSM-ARTA-F1) tracks the client experience of government offices. Your feedback on your recent transaction will help us improve our services.
                    </p>
                    <p className="leading-relaxed">
                        Providing personal information is optional, and all shared details will be kept confidential.
                    </p>
                    <p className="leading-relaxed">
                        By completing this form, you authorize the Department of Science and Technology - V to collect and process the provided data to enhance our products and services.
                    </p>
                    <p className="leading-relaxed">
                        All personal information is protected under Republic Act No. 10173, the Data Privacy Act of 2012.
                    </p>

                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <input
                            id="privacy-consent"
                            type="checkbox"
                            checked={isChecked}
                            onChange={(event) => setIsChecked(event.target.checked)}
                            className="h-4 w-4"
                        />
                        <label htmlFor="privacy-consent" className="text-sm sm:text-base font-medium">
                            I have read and agree to the Data Privacy terms
                        </label>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-end sm:space-x-2 pt-2 ">
                    <button
                        type="button"
                        onClick={handleConsent}
                        disabled={!isChecked}
                        className="px-6 py-2 font-bold rounded-md text-white bg-gradient-to-r from-sky-300 to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Accept and Continue
                    </button>
                </div>

                <div className="flex justify-center mt-8 space-x-4">
                    <Image src="/ARTA_Logo.png" alt="ARTA logo" width={120} height={48} className="h-10 sm:h-12 w-auto" />
                    <Image src="/CC_Logo.png" alt="CC Logo" width={120} height={48} className="h-10 sm:h-12 w-auto" />
                    <Image src="/BP_logo.png" alt="Bagong Pilipinas logo" width={120} height={48} className="h-10 sm:h-12 w-auto" />
                </div>
            </div>
        </div>
    )
}