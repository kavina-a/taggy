export const en = {
  header: {
    addBusiness: "Add a business",
    saved: "Saved",
    login: "Log in",
    logout: "Log out",
    account: "Account",
    language: "Language",
    moderation: "Moderation",
  },
  home: {
    headline: "Find great local businesses in Colombo",
    trending: "Trending Near You",
    newBusinesses: "New Businesses",
    topRated: "Top Rated this month",
    browseCategory: "Browse by Category",
  },
  business: {
    directory: "Directory",
    about: "About",
    address: "Address",
    phone: "Phone",
    hours: "Hours",
    attributes: "Attributes",
    photos: "Photos",
    owner: "Business owner",
    qa: "Questions & Answers",
    writeReview: "Write a Review",
    getDirections: "Get Directions",
    alsoListed: "Also listed under",
    peopleAlsoViewed: "People also viewed",
    consumerAlert: "Consumer Alert",
    loginToReview: "Log in to write a review",
    beenHere: "Have you been here? Share your experience.",
    editListing: "Edit listing",
  },
  hours: {
    openNow: "Open now",
    closed: "Closed",
  },
  profile: {
    title: "What should we call you?",
    description:
      "Optional — add a name so it's clearly you if you write a review or ask a question later. You can skip this for now.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email (optional)",
    emailPlaceholder: "you@example.com",
    skip: "Skip for now",
    save: "Save",
  },
  review: {
    yourRating: "Your rating",
    yourReview: "Your review",
    photosOptional: "Photos (optional)",
    addPhotos: "Add photos",
    removePhoto: "Remove photo",
    submit: "Submit review",
    thanks: "Thanks for your review!",
    alreadyReviewed: "You've reviewed this business.",
    edit: "Edit your review",
    cancel: "Cancel",
    uploading: "Uploading…",
    minChars: "characters minimum",
  },
  owner: {
    verified: "You are the verified owner of this listing.",
    description: "Description",
    address: "Address",
    save: "Save listing",
    saved: "Listing updated.",
    hoursHint: "Leave a day closed to hide it from the hours list.",
    open: "Open",
  },
  moderation: {
    title: "Report queue",
    empty: "No reports in this view.",
    pending: "Pending",
    reviewed: "Reviewed",
    actioned: "Actioned",
    dismissed: "Dismissed",
    setAlert: "Consumer Alert (business listings)",
    saveAlert: "Save alert",
    clearAlert: "Clear alert",
    markDismissed: "Dismiss",
    markActioned: "Mark actioned",
    markReviewed: "Mark reviewed",
  },
} as const;

export type Messages = {
  [K in keyof typeof en]: { [P in keyof (typeof en)[K]]: string };
};

export const si: Messages = {
  header: {
    addBusiness: "ව්‍යාපාරයක් එක් කරන්න",
    saved: "සුරැකුම්",
    login: "ඇතුළු වන්න",
    logout: "ඉවත් වන්න",
    account: "ගිණුම",
    language: "භාෂාව",
    moderation: "මධ්‍යස්ථකරණය",
  },
  home: {
    headline: "කොළඹ සුපිරි දේශීය ව්‍යාපාර සොයන්න",
    trending: "ඔබ අසල ජනප්‍රියයි",
    newBusinesses: "අලුත් ව්‍යාපාර",
    topRated: "මේ මාසයේ ඉහළම ඇගයීම්",
    browseCategory: "ප්‍රවර්ග අනුව බලන්න",
  },
  business: {
    directory: "නාමාවලිය",
    about: "පිළිබඳව",
    address: "ලිපිනය",
    phone: "දුරකථනය",
    hours: "වේලාවන්",
    attributes: "ලක්ෂණ",
    photos: "ඡායාරූප",
    owner: "ව්‍යාපාර හිමිකරු",
    qa: "ප්‍රශ්න සහ පිළිතුරු",
    writeReview: "සමාලෝචනයක් ලියන්න",
    getDirections: "මාර්ගය ලබාගන්න",
    alsoListed: "මේ යටතේද ලැයිස්තුගතයි",
    peopleAlsoViewed: "අය බැලූ වෙනත් තැන්",
    consumerAlert: "පාරිභෝගික දැනුම්දීම",
    loginToReview: "සමාලෝචනයක් ලිවීමට ඇතුළු වන්න",
    beenHere: "මෙහි ගොස් තිබේද? ඔබේ අත්දැකීම බෙදා ගන්න.",
    editListing: "ලැයිස්තුව සංස්කරණය කරන්න",
  },
  hours: {
    openNow: "දැන් විවෘතයි",
    closed: "වසා ඇත",
  },
  profile: {
    title: "ඔබට කියන්නේ කෙසේද?",
    description:
      "විකල්පයි — සමාලෝචනයක් හෝ ප්‍රශ්නයක් ලියන විට ඔබ බව පැහැදිලි වන පරිදි නමක් එක් කරන්න. දැන් මඟ හැරිය හැක.",
    name: "නම",
    namePlaceholder: "ඔබේ නම",
    email: "විද්‍යුත් තැපෑල (විකල්ප)",
    emailPlaceholder: "you@example.com",
    skip: "දැන් මඟ හරින්න",
    save: "සුරකින්න",
  },
  review: {
    yourRating: "ඔබේ ඇගයීම",
    yourReview: "ඔබේ සමාලෝචනය",
    photosOptional: "ඡායාරූප (විකල්ප)",
    addPhotos: "ඡායාරූප එක් කරන්න",
    removePhoto: "ඡායාරූපය ඉවත් කරන්න",
    submit: "සමාලෝචනය යවන්න",
    thanks: "ඔබේ සමාලෝචනයට ස්තූතියි!",
    alreadyReviewed: "ඔබ මෙම ව්‍යාපාරය සමාලෝචනය කර ඇත.",
    edit: "ඔබේ සමාලෝචනය සංස්කරණය කරන්න",
    cancel: "අවලංගු කරන්න",
    uploading: "උඩුගත වෙමින්…",
    minChars: "අවම අක්ෂර",
  },
  owner: {
    verified: "ඔබ මෙම ලැයිස්තුවේ සත්‍යාපිත හිමිකරු වේ.",
    description: "විස්තරය",
    address: "ලිපිනය",
    save: "ලැයිස්තුව සුරකින්න",
    saved: "ලැයිස්තුව යාවත්කාලීන විය.",
    hoursHint: "වේලාවන් ලැයිස්තුවෙන් සඟවන්න දවසක් වසා තබන්න.",
    open: "විවෘතයි",
  },
  moderation: {
    title: "වාර්තා පෝලිම",
    empty: "මෙම දසුනේ වාර්තා නැත.",
    pending: "බලාපොරොත්තු",
    reviewed: "සමාලෝචිත",
    actioned: "පියවර ගත්",
    dismissed: "ඉවතලූ",
    setAlert: "පාරිභෝගික දැනුම්දීම (ව්‍යාපාර)",
    saveAlert: "දැනුම්දීම සුරකින්න",
    clearAlert: "දැනුම්දීම ඉවත් කරන්න",
    markDismissed: "ඉවතලන්න",
    markActioned: "පියවර ගත් ලෙස සලකුණු කරන්න",
    markReviewed: "සමාලෝචිත ලෙස සලකුණු කරන්න",
  },
};

export const ta: Messages = {
  header: {
    addBusiness: "வணிகத்தைச் சேர்க்க",
    saved: "சேமித்தவை",
    login: "உள்நுழைக",
    logout: "வெளியேறு",
    account: "கணக்கு",
    language: "மொழி",
    moderation: "மிதப்படுத்துதல்",
  },
  home: {
    headline: "கொழும்பில் சிறந்த உள்ளூர் வணிகங்களைக் கண்டறியுங்கள்",
    trending: "உங்களுக்கு அருகில் பிரபலம்",
    newBusinesses: "புதிய வணிகங்கள்",
    topRated: "இந்த மாதம் உயர் மதிப்பீடு",
    browseCategory: "வகை வாரியாக பார்க்க",
  },
  business: {
    directory: "அடைவு",
    about: "பற்றி",
    address: "முகவரி",
    phone: "தொலைபேசி",
    hours: "நேரங்கள்",
    attributes: "பண்புகள்",
    photos: "புகைப்படங்கள்",
    owner: "வணிக உரிமையாளர்",
    qa: "கேள்வி பதில்கள்",
    writeReview: "விமர்சனம் எழுதுக",
    getDirections: "வழிகாட்டி",
    alsoListed: "இவற்றிலும் பட்டியலிடப்பட்டுள்ளது",
    peopleAlsoViewed: "பிறரும் பார்த்தவை",
    consumerAlert: "நுகர்வோர் எச்சரிக்கை",
    loginToReview: "விமர்சனம் எழுத உள்நுழைக",
    beenHere: "இங்கு வந்திருக்கிறீர்களா? உங்கள் அனுபவத்தைப் பகிருங்கள்.",
    editListing: "பட்டியலைத் திருத்து",
  },
  hours: {
    openNow: "இப்போது திறந்துள்ளது",
    closed: "மூடப்பட்டுள்ளது",
  },
  profile: {
    title: "உங்களை எப்படி அழைக்கலாம்?",
    description:
      "விருப்பம் — விமர்சனம் அல்லது கேள்வி எழுதும்போது நீங்கள் என்பது தெளிவாகத் தெரிய பெயரைச் சேருங்கள். இப்போது தவிர்க்கலாம்.",
    name: "பெயர்",
    namePlaceholder: "உங்கள் பெயர்",
    email: "மின்னஞ்சல் (விருப்பம்)",
    emailPlaceholder: "you@example.com",
    skip: "இப்போது தவிர்",
    save: "சேமி",
  },
  review: {
    yourRating: "உங்கள் மதிப்பீடு",
    yourReview: "உங்கள் விமர்சனம்",
    photosOptional: "புகைப்படங்கள் (விருப்பம்)",
    addPhotos: "புகைப்படங்களைச் சேர்",
    removePhoto: "புகைப்படத்தை நீக்கு",
    submit: "விமர்சனத்தை அனுப்பு",
    thanks: "உங்கள் விமர்சனத்திற்கு நன்றி!",
    alreadyReviewed: "இந்த வணிகத்தை நீங்கள் விமர்சித்துள்ளீர்கள்.",
    edit: "உங்கள் விமர்சனத்தைத் திருத்து",
    cancel: "ரத்து",
    uploading: "பதிவேறுகிறது…",
    minChars: "குறைந்தபட்ச எழுத்துகள்",
  },
  owner: {
    verified: "நீங்கள் இந்தப் பட்டியலின் சரிபார்க்கப்பட்ட உரிமையாளர்.",
    description: "விளக்கம்",
    address: "முகவரி",
    save: "பட்டியலைச் சேமி",
    saved: "பட்டியல் புதுப்பிக்கப்பட்டது.",
    hoursHint: "நேரப் பட்டியலில் காட்டாமல் இருக்க ஒரு நாளை மூடியதாக விடவும்.",
    open: "திறந்துள்ளது",
  },
  moderation: {
    title: "புகார் வரிசை",
    empty: "இந்தக் காட்சியில் புகார்கள் இல்லை.",
    pending: "நிலுவை",
    reviewed: "பரிசீலிக்கப்பட்டது",
    actioned: "நடவடிக்கை எடுக்கப்பட்டது",
    dismissed: "தள்ளுபடி",
    setAlert: "நுகர்வோர் எச்சரிக்கை (வணிகங்கள்)",
    saveAlert: "எச்சரிக்கையைச் சேமி",
    clearAlert: "எச்சரிக்கையை அகற்று",
    markDismissed: "தள்ளுபடி செய்",
    markActioned: "நடவடிக்கை எடுக்கப்பட்டதாகக் குறி",
    markReviewed: "பரிசீலிக்கப்பட்டதாகக் குறி",
  },
};

export type LanguageCode = "en" | "si" | "ta";

export const dictionaries: Record<LanguageCode, Messages> = { en, si, ta };

export function isLanguageCode(value: string | undefined | null): value is LanguageCode {
  return value === "en" || value === "si" || value === "ta";
}

export function getDictionary(lang: LanguageCode): Messages {
  return dictionaries[lang];
}

export function getMessage(dict: Messages, path: string): string {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}
