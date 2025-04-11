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
      emoji: "😍"
    },
    {
      value: "agree",
      label: "Agree",
      imageSource: "/assets/emojis/smiling_face_with_smiling_eyes_animated.png",
      imageSourceStatic: "/assets/emojis/smiling_face_with_smiling_eyes_color.svg",
      emoji: "😊"
    },
    {
      value: "neutral",
      label: "Neither Agree nor Disagree",
      imageSource: "/assets/emojis/face_without_mouth_animated.png",
      imageSourceStatic: "/assets/emojis/face_without_mouth_color.svg",
      emoji: "😐"
    },
    {
      value: "disagree",
      label: "Disagree",
      imageSource: "/assets/emojis/frowning_face_animated.png",
      imageSourceStatic: "/assets/emojis/frowning_face_color.svg",
      emoji: "😕"
    },
    {
      value: "strongly-disagree",
      label: "Strongly Disagree",
      imageSource: "/assets/emojis/pouting_face_animated.png",
      imageSourceStatic: "/assets/emojis/pouting_face_color.svg",
      emoji: "😠"
    },
    {
      value: "na",
      label: "Not Applicable",
      imageSource: null,
      emoji: "❌"
    }
  ]
}; 