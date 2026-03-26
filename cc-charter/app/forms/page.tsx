"use client";

import { useState } from "react";
import Image from "next/image";
import InputForm from "@/components/forms/InputForm";
import { INITIAL_FORM_STATE } from "@/components/forms/steps/types";
import Steps from "../../components/forms/Steps";

export default function MainForm(){
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    return (
        <>
            <div className="min-h-screen relative px-3 py-5 pb-8 sm:px-5 sm:py-6 lg:px-8 lg:pb-10">
                <div className="mx-auto w-full max-w-[1400px]">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:gap-8">
                        <aside className="w-full self-start lg:sticky lg:top-4 lg:h-fit">
                            <div className="space-y-6 sm:space-y-8">
                                <div className="flex flex-row items-center justify-start pt-8">
                                    <Image src="/DOST_Logo.png" alt="DOST Logo" width={64} height={64} className="h-14 w-auto sm:h-16" />
                                    <div className="px-4 flex flex-col justify-center">
                                        <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-[1.55rem] font-bold text-gray-800 leading-tight">Client Feedback Form</h1>
                                        <h1 className="text-sm sm:text-base text-gray-800">Department Of Science & Technology V</h1>
                                    </div>
                                </div>

                                <div className="z-30 bg-white/90 backdrop-blur-sm lg:bg-transparent">
                                    <Steps currentStep={currentStep} />
                                </div>

                                <div className="hidden flex-row items-center justify-center gap-4 lg:flex">
                                    <Image src="/ARTA_Logo.png" alt="ARTA Logo" width={120} height={48} className="h-12 w-auto" />
                                    <Image src="/CC_Logo.png" alt="CC Logo" width={120} height={48} className="h-12 w-auto" />
                                    <Image src="/BP_Logo.png" alt="BP Logo" width={120} height={48} className="h-12 w-auto" />
                                </div>
                            </div>
                        </aside>
                        <main className="w-full min-w-0">
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-5 text-sm text-gray-500 sm:p-6 lg:p-7">
                               <InputForm
                                    currentStep={currentStep}
                                    onStepChange={setCurrentStep}
                                    totalSteps={5}
                                    formData={formData}
                                    onFormDataChange={setFormData}
                                />
                            </div>
                        </main>
                    </div>
                </div>

                <div className="mt-6 flex flex-row items-center justify-center gap-4 lg:hidden">
                    <Image src="/ARTA_Logo.png" alt="ARTA Logo" width={120} height={48} className="h-12 w-auto" />
                    <Image src="/CC_Logo.png" alt="CC Logo" width={120} height={48} className="h-12 w-auto" />
                    <Image src="/BP_Logo.png" alt="BP Logo" width={120} height={48} className="h-12 w-auto" />
                </div>
            </div>
        </>
    )
}