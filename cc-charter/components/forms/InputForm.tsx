"use client";

import type { Dispatch, SetStateAction } from "react";
import CitizensCharter from "@/components/forms/steps/CitizensCharter";
import PersonalDetails from "@/components/forms/steps/PersonalDetails";
import Review from "@/components/forms/steps/Review";
import ServiceRatings from "@/components/forms/steps/ServiceRatings";
import Suggestions from "@/components/forms/steps/Suggestions";
import type {
    CitizensCharterData,
    FormState,
    PersonalDetailsData,
    ServiceRatingsData,
    SuggestionsData,
} from "@/components/forms/steps/types";

type InputFormProps = {
    currentStep: number;
    totalSteps: number;
    onStepChange: (step: number) => void;
    formData: FormState;
    onFormDataChange: Dispatch<SetStateAction<FormState>>;
};

type StepMeta = {
    title: string;
    subtitle: string;
};

const STEP_META: Record<number, StepMeta> = {
    1: {
        title: "Personal Details",
        subtitle: "Please provide your personal information.",
    },
    2: {
        title: "Citizen's Charter",
        subtitle: "Share your experience with the Citizen's Charter process.",
    },
    3: {
        title: "Service Ratings",
        subtitle: "Rate your satisfaction with the service quality.",
    },
    4: {
        title: "Suggestions",
        subtitle: "Tell us how we can improve your experience.",
    },
    5: {
        title: "Review",
        subtitle: "Review your answers before submission.",
    },
};

export default function InputForm({
    currentStep,
    totalSteps,
    onStepChange,
    formData,
    onFormDataChange,
}: InputFormProps) {
    const stepData = STEP_META[currentStep] ?? STEP_META[1];

    const updatePersonalDetails = (field: keyof PersonalDetailsData, value: string) => {
        onFormDataChange((prev) => ({
            ...prev,
            personalDetails: {
                ...prev.personalDetails,
                [field]: value,
            },
        }));
    };

    const updateCitizensCharter = (field: keyof CitizensCharterData, value: CitizensCharterData[keyof CitizensCharterData]) => {
        onFormDataChange((prev) => ({
            ...prev,
            citizensCharter: {
                ...prev.citizensCharter,
                [field]: value,
            },
        }));
    };

    const updateServiceRatings = (field: keyof ServiceRatingsData, value: ServiceRatingsData[keyof ServiceRatingsData]) => {
        onFormDataChange((prev) => ({
            ...prev,
            serviceRatings: {
                ...prev.serviceRatings,
                [field]: value,
            },
        }));
    };

    const updateSuggestions = (field: keyof SuggestionsData, value: string) => {
        onFormDataChange((prev) => ({
            ...prev,
            suggestions: {
                ...prev.suggestions,
                [field]: value,
            },
        }));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalDetails
                        data={formData.personalDetails}
                        onChange={updatePersonalDetails}
                    />
                );
            case 2:
                return (
                    <CitizensCharter
                        data={formData.citizensCharter}
                        onChange={updateCitizensCharter}
                    />
                );
            case 3:
                return (
                    <ServiceRatings
                        data={formData.serviceRatings}
                        onChange={updateServiceRatings}
                    />
                );
            case 4:
                return (
                    <Suggestions
                        data={formData.suggestions}
                        onChange={updateSuggestions}
                    />
                );
            case 5:
                return <Review formData={formData} />;
            default:
                return (
                    <PersonalDetails
                        data={formData.personalDetails}
                        onChange={updatePersonalDetails}
                    />
                );
        }
    };

    const handlePrevious = () => {
        onStepChange(Math.max(1, currentStep - 1));
    };

    const handleNext = () => {
        onStepChange(Math.min(totalSteps, currentStep + 1));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Step {currentStep} of {totalSteps}: {stepData.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600">{stepData.subtitle}</p>
            </div>

            <div className="space-y-3">{renderStepContent()}</div>

            <div className="flex items-center justify-between pt-2">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStep === totalSteps}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}