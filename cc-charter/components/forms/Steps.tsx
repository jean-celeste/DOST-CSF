import {
    CheckSquareIcon,
    ClipboardListIcon,
    MessageSquare,
    QrCodeIcon,
    SmileIcon,
    UserIcon,
} from "lucide-react";

type StepIcon =
    | "UserIcon"
    | "CheckSquareIcon"
    | "SmileIcon"
    | "QrCodeIcon"
    | "ClipboardListIcon"
    | "MessageSquare";

type Step = {
    step: number;
    title: string;
    mobileTitle: string;
    description: string;
    icon: StepIcon;
};

type StepsProps = {
    currentStep?: number;
    clientType?: "internal" | "external";
    steps?: Step[];
};

const DEFAULT_STEPS: Step[] = [
    {
        step: 1,
        title: "Personal Details",
        mobileTitle: "Personal\nDetails",
        description: "All these details are needed to be accomplished.",
        icon: "UserIcon",
    },
    {
        step: 2,
        title: "Citizen's Charter",
        mobileTitle: "CC",
        description: "Please answer questions about the Citizen's Charter.",
        icon: "CheckSquareIcon",
    },
    {
        step: 3,
        title: "Service Ratings",
        mobileTitle: "SQD",
        description: "Rate your satisfaction with our services.",
        icon: "SmileIcon",
    },
    {
        step: 4,
        title: "Suggestions",
        mobileTitle: "Suggestions",
        description: "Share your suggestions to help us improve.",
        icon: "MessageSquare",
    },
    {
        step: 5,
        title: "Review",
        mobileTitle: "Review",
        description: "Review your answers before submission.",
        icon: "ClipboardListIcon",
    },
];

const ICON_MAP = {
    UserIcon,
    CheckSquareIcon,
    SmileIcon,
    QrCodeIcon,
    ClipboardListIcon,
    MessageSquare,
} as const;

export default function Steps({
    currentStep = 1,
    steps = DEFAULT_STEPS,
}: StepsProps) {
    const isStepActive = (step: number) => {
        return true;
    };

    const DesktopProgress = () => (
        <div className="bg-white/80 rounded-2xl px-6 py-8 shadow-sm backdrop-blur-sm w-full">
            <div className="relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100"></div>
                <div className="space-y-0">
                    {steps.map(({ step, title, description, icon }) => {
                        const active = isStepActive(step);
                        const isCompleted = currentStep >= step;
                        const shouldShowBlue = active && isCompleted;
                        const Icon = ICON_MAP[icon];

                        return (
                            <div key={step} className="relative flex items-start group py-3">
                                <div
                                    className={`relative shrink-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out bg-white ${
                                        shouldShowBlue
                                            ? "border-blue-500 text-blue-500 shadow-sm"
                                            : active
                                                ? "border-gray-300 text-gray-400"
                                                : "border-gray-200 text-gray-300"
                                    }`}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <Icon className="w-full h-full" />
                                    </div>
                                </div>

                                <div className="ml-4 min-w-0 flex-1">
                                    <h3
                                        className={`text-sm font-medium transition-all duration-300 ${
                                            shouldShowBlue
                                                ? "text-blue-500"
                                                : active
                                                    ? "text-gray-700"
                                                    : "text-gray-400"
                                        }`}
                                    >
                                        {title}
                                        {!active && (
                                            <span className="ml-2 text-xs text-gray-300 italic">
                                                (Not applicable)
                                            </span>
                                        )}
                                    </h3>
                                    <p className={`text-xs mt-1 ${active ? "text-gray-500" : "text-gray-300"}`}>
                                        {description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const MobileProgress = () => (
        <div className="relative w-full overflow-hidden">
            <div className="flex absolute top-3 left-2 right-2 h-[1px]">
                {[...Array(steps.length - 1)].map((_, index) => {
                    const segmentStep = index + 1;
                    return (
                        <div
                            key={`segment-${segmentStep}`}
                            className={`flex-1 h-full transition-all duration-300 ease-in-out ${
                                currentStep > segmentStep ? "bg-[#3B82F6]" : "bg-gray-100"
                            }`}
                        ></div>
                    );
                })}
            </div>

            <div className="flex justify-between items-start px-1 relative z-10">
                {steps.map(({ step, mobileTitle }) => {
                    const active = isStepActive(step);
                    const isCompleted = currentStep >= step;
                    const shouldShowBlue = active && isCompleted;

                    return (
                        <div key={step} className="flex flex-col items-center min-w-[2.5rem]">
                            <div
                                className={`h-6 w-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ease-in-out leading-none mb-1 bg-white ${
                                    shouldShowBlue
                                        ? "border-[#3B82F6] text-[#3B82F6] shadow-sm"
                                        : active
                                            ? "border-gray-300 text-gray-400"
                                            : "border-gray-200 text-gray-300"
                                }`}
                            >
                                <span className="text-xs">{step}</span>
                            </div>
                            <span
                                className={`text-[8px] text-center whitespace-pre-line leading-tight transition-colors duration-300 ${
                                    shouldShowBlue
                                        ? "text-[#3B82F6] font-medium"
                                        : active
                                            ? "text-gray-500"
                                            : "text-gray-300"
                                }`}
                            >
                                {mobileTitle.split("\n").map((line, i) => (
                                    <span key={i} className="block">
                                        {line}
                                    </span>
                                ))}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <div className="lg:hidden w-full">
                <MobileProgress />
            </div>

            <div className="hidden lg:block w-full">
                <DesktopProgress />
            </div>
        </>
    );
}