export const csmArtaOptions = {
  // Options for question 1 (CC Awareness)
  ccAwareness: [
    "I know what a CC is and I saw this office's CC.",
    "I know what a CC is but I did NOT see this office's CC.",
    "I learned of the CC only when I saw this office's CC.",
    "I do not know what a CC is and I did not see one in this office."
  ],

  // Options for question 2 (CC Visibility)
  ccVisibility: [
    "Easy to See",
    "Somewhat easy to see",
    "Difficult to see",
    "Not visible at all"
  ],

  // Options for question 3 (CC Helpfulness)
  ccHelpfulness: [
    "Helped very much",
    "Somewhat helped",
    "Did not help"
  ],

  // Options for questions 4-12 (Rating questions)
  ratingOptions: [
    {
      value: "strongly-agree",
      label: "Strongly Agree",
      imageSource: "/assets/emojis/smiling_face_with_heart-eyes_animated.png",
      imageSourceStatic: "/assets/emojis/smiling_face_with_heart-eyes_color.svg",
      emoji: "60d"
    },
    {
      value: "agree",
      label: "Agree",
      imageSource: "/assets/emojis/smiling_face_with_smiling_eyes_animated.png",
      imageSourceStatic: "/assets/emojis/smiling_face_with_smiling_eyes_color.svg",
      emoji: "60a"
    },
    {
      value: "neutral",
      label: "Neither Agree nor Disagree",
      imageSource: "/assets/emojis/face_without_mouth_animated.png",
      imageSourceStatic: "/assets/emojis/face_without_mouth_color.svg",
      emoji: "610"
    },
    {
      value: "disagree",
      label: "Disagree",
      imageSource: "/assets/emojis/frowning_face_animated.png",
      imageSourceStatic: "/assets/emojis/frowning_face_color.svg",
      emoji: "615"
    },
    {
      value: "strongly-disagree",
      label: "Strongly Disagree",
      imageSource: "/assets/emojis/pouting_face_animated.png",
      imageSourceStatic: "/assets/emojis/pouting_face_color.svg",
      emoji: "620"
    },
    {
      value: "na",
      label: "Not Applicable",
      imageSource: null,
      emoji: "74c"
    }
  ]
};

// Filipino options
export const csmArtaOptionsFilipino = {
  ccAwareness: [
    "Alam ko ang CC at nakita ko ito sa napuntahang opisina",
    "Alam ko ang CC pero hindi ko ito nakita sa napuntahang opisina",
    "Nalaman ko ang CC nang makita ko ito sa napuntahang opisina",
    "Hindi ko alam kung ano ang CC at wala akong nakita sa napuntahang opisina"
  ],
  ccVisibility: [
    "Madaling makita",
    "Medyo madaling makita",
    "Mahirap makita",
    "Hindi nakita"
  ],
  ccHelpfulness: [
    "Lubos na Nakatulong",
    "Medyo Nakatulong",
    "Hindi Nakatulong"
  ],
  ratingOptions: [
    {
      value: "strongly-agree",
      label: "Lubos na Sang-ayon",
      imageSource: "/assets/emojis/smiling_face_with_heart-eyes_animated.png",
      imageSourceStatic: "/assets/emojis/smiling_face_with_heart-eyes_color.svg",
      emoji: "60d"
    },
    {
      value: "agree",
      label: "Sang-ayon",
      imageSource: "/assets/emojis/smiling_face_with_smiling_eyes_animated.png",
      imageSourceStatic: "/assets/emojis/smiling_face_with_smiling_eyes_color.svg",
      emoji: "60a"
    },
    {
      value: "neutral",
      label: "Neutral",
      imageSource: "/assets/emojis/face_without_mouth_animated.png",
      imageSourceStatic: "/assets/emojis/face_without_mouth_color.svg",
      emoji: "610"
    },
    {
      value: "disagree",
      label: "Di-Sang-ayon",
      imageSource: "/assets/emojis/frowning_face_animated.png",
      imageSourceStatic: "/assets/emojis/frowning_face_color.svg",
      emoji: "615"
    },
    {
      value: "strongly-disagree",
      label: "Lubos na Di-Sang-ayon",
      imageSource: "/assets/emojis/pouting_face_animated.png",
      imageSourceStatic: "/assets/emojis/pouting_face_color.svg",
      emoji: "620"
    },
    {
      value: "na",
      label: "Hindi Naaangkop",
      imageSource: null,
      emoji: "74c"
    }
  ]
}; 