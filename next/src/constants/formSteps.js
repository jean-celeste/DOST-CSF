export const FORM_STEPS = [
  { 
    step: 1, 
    title: "Personal Details",
    mobileTitle: "Personal\nDetails",
    description: "All these details are needed to be accomplished.",
    icon: "UserIcon"
  },
  { 
    step: 2, 
    title: "Citizen's Charter",
    mobileTitle: "CC",
    description: "Please answer questions about the Citizen's Charter.",
    icon: "CheckSquareIcon"
  },
  { 
    step: 3, 
    title: "Service Ratings",
    mobileTitle: "SQD",
    description: "Rate your satisfaction with our services.",
    icon: "SmileIcon"
  },
  { 
    step: 4, 
    title: "QMS Checkmark",
    mobileTitle: "QMS",
    description: "Please provide feedback",
    icon: "QrCodeIcon"
  },
  { 
    step: 5, 
    title: "QMS Ratings",
    mobileTitle: "Checkmark",
    description: "Rate your experience",
    icon: "SmileIcon"
  },
  { 
    step: 6, 
    title: "Review",
    mobileTitle: "Review",
    description: "Review your answers before submission.",
    icon: "ClipboardListIcon"
  }
]

export const INITIAL_FORM_STATE = {
  showMainForm: false,
  currentStep: 1
}

export const INITIAL_PERSONAL_DETAILS = {
  email: '',
  contact: '',
  services: '',
  sex: 'male',
  age: ''
}

export const INITIAL_CSM_ARTA_CHECKMARK = {
  selectedOption: null,
  additionalAnswers: {}
}

export const INITIAL_CSM_ARTA_RATINGS = {
  ratings: {
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    question6: ""
  },
  currentPage: 0
}

export const INITIAL_QMS_CHECKMARK = {
  selectedOption: null
}

export const INITIAL_QMS_RATINGS = {
  ratings: {
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: ""
  },
  currentPage: 0
} 