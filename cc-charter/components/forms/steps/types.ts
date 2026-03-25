export type PersonalDetailsData = {
    name: string;
    email: string;
    contactNumber: string;
    age: string;
    sex: "" | "male" | "female" | "prefer-not-to-say";
    serviceAvailed: string;
    clientType: "" | "citizen" | "business" | "government";
};

export type CitizensCharterData = {
    sawCharter: "" | "yes" | "no";
    processClear: "" | "yes" | "no";
    requirementsClear: "" | "yes" | "no";
};

export type ServiceRatingsData = {
    timeliness: "" | "1" | "2" | "3" | "4" | "5";
    professionalism: "" | "1" | "2" | "3" | "4" | "5";
    overall: "" | "1" | "2" | "3" | "4" | "5";
};

export type SuggestionsData = {
    improvement: string;
    additionalComments: string;
};

export type FormState = {
    personalDetails: PersonalDetailsData;
    citizensCharter: CitizensCharterData;
    serviceRatings: ServiceRatingsData;
    suggestions: SuggestionsData;
};

export const INITIAL_FORM_STATE: FormState = {
    personalDetails: {
        name: "",
        email: "",
        contactNumber: "",
        age: "",
        sex: "",
        serviceAvailed: "",
        clientType: "",
    },
    citizensCharter: {
        sawCharter: "",
        processClear: "",
        requirementsClear: "",
    },
    serviceRatings: {
        timeliness: "",
        professionalism: "",
        overall: "",
    },
    suggestions: {
        improvement: "",
        additionalComments: "",
    },
};
