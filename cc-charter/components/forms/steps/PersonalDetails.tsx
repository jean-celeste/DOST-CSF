import type { PersonalDetailsData } from "@/components/forms/steps/types";
import {
    Calendar,
    Check,
    ChevronDown,
    Mail,
    Phone,
    User,
    UserCircle,
    Wrench,
} from "lucide-react";

type PersonalDetailsProps = {
    data: PersonalDetailsData;
    onChange: (field: keyof PersonalDetailsData, value: string) => void;
};

export default function PersonalDetails({ data, onChange }: PersonalDetailsProps) {
    const emailPattern = /^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/;
    const isEmailInvalid = !!data.email && !emailPattern.test(data.email);
    const isEmailValid = !!data.email && emailPattern.test(data.email);

    const isContactInvalid = !!data.contactNumber && data.contactNumber.length !== 11;
    const isContactValid = data.contactNumber.length === 11;

    const ageNumber = Number(data.age);
    const isAgeInvalid = !!data.age && (ageNumber < 5 || ageNumber > 100);
    const isAgeValid = !!data.age && ageNumber >= 5 && ageNumber <= 100;

    return (
        <div className="space-y-6 sm:space-y-7" id="personal-details">
            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2" htmlFor="name">
                    <UserCircle className="h-4 w-4 text-blue-500" />
                    Name <span className="text-xs sm:text-sm text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(event) => onChange("name", event.target.value)}
                        className="w-full h-10 rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:outline-none"
                        placeholder="Enter your name"
                    />
                    <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    {data.name && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2" htmlFor="email">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address <span className="text-xs sm:text-sm text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => onChange("email", event.target.value)}
                        className={`w-full h-10 rounded-xl border bg-white pl-10 pr-10 text-sm text-gray-700 transition-colors focus:outline-none ${
                            isEmailInvalid
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                        }`}
                        placeholder="Enter your email address"
                    />
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    {isEmailValid && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />}
                </div>
                {isEmailInvalid && (
                    <p className="text-xs text-red-500">Please enter a valid email address.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2" htmlFor="contact">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Contact Number
                </label>
                <div className="relative">
                    <input
                        id="contact"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        value={data.contactNumber}
                        onChange={(event) => {
                            const value = event.target.value.replace(/[^0-9]/g, "");
                            onChange("contactNumber", value);
                        }}
                        className={`w-full h-10 rounded-xl border bg-white pl-10 pr-10 text-sm text-gray-700 transition-colors focus:outline-none ${
                            isContactInvalid
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                        }`}
                        placeholder="09123456789"
                    />
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    {isContactValid && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />}
                </div>
                {isContactInvalid && (
                    <p className="text-xs text-red-500">Contact number must be exactly 11 digits.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2" htmlFor="age">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Age
                </label>
                <div className="relative">
                    <input
                        id="age"
                        type="number"
                        min={5}
                        max={100}
                        value={data.age}
                        onChange={(event) => onChange("age", event.target.value.replace(/[^0-9]/g, ""))}
                        className={`w-full h-10 rounded-xl border bg-white pl-10 pr-10 text-sm text-gray-700 transition-colors focus:outline-none ${
                            isAgeInvalid
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-blue-500"
                        }`}
                        placeholder="Enter your age"
                    />
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    {isAgeValid && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />}
                </div>
                {isAgeInvalid && (
                    <p className="text-xs text-red-500">Age must be between 5 and 100.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Sex
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Prefer Not To Say", value: "prefer-not-to-say" },
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange("sex", option.value)}
                            className={`rounded-xl border px-2 py-2 text-xs sm:text-sm transition-colors ${
                                data.sex === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2" htmlFor="service-availed">
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Services Availed
                </label>
                <div className="relative">
                    <select
                        id="service-availed"
                        value={data.serviceAvailed}
                        onChange={(event) => onChange("serviceAvailed", event.target.value)}
                        className="w-full h-10 appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">Select a service</option>
                        <option value="service-1">Service 1</option>
                        <option value="service-2">Service 2</option>
                        <option value="service-3">Service 3</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>
    );
}

