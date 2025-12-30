export type LanguageCode = 'en' | 'mr' | 'hi' | 'ta';
export type QuickActionKey = 'ask' | 'solve';

export const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'Marathi' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
];

const fallbackLanguage: LanguageCode = 'en';

type StepFormatter = (current: number, total: number) => string;
type SummaryFormatter = (count: number, subjectName?: string | null) => string;

type OnboardingCopy = {
  backgroundEyebrow: string;
  backgroundTitle: string;
  motherTongueLabel: string;
  typeOfSchoolLabel: string;
  continueCta: string;
  savingLabel: string;
};

type AuthCopy = {
  stepLabel: StepFormatter;
  eyebrow: string;
  loginTitle: string;
  signupTitle: string;
  loginSubtitle: string;
  signupSubtitle: string;
  modeLogin: string;
  modeSignup: string;
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  validationMessage: string;
  loginCta: string;
  signupCta: string;
  helperText: string;
};

type ClassSelectionCopy = {
  stepLabel: StepFormatter;
  eyebrow: string;
  title: string;
  subtitle: string;
  summaryLabel: string;
  selectedPrefix: string;
  summaryHint: (index: number) => string;
  backCta: string;
  continueCta: string;
  savingLabel: string;
};

type SubjectSelectionCopy = {
  stepLabel: StepFormatter;
  eyebrow: string;
  title: string;
  subtitle: string;
  summaryLabel: string;
  summaryValue: SummaryFormatter;
  summaryHint: string;
  pickOneHelper: string;
  remindersLabel: string;
  loadingLabel: string;
  noSubjectsLabel: string;
  pickOneError: string;
  backCta: string;
  finishCta: string;
  savingLabel: string;
};

type HomeCopy = {
  appBarTitle: string;
  heroGreeting: (name: string) => string;
  statusFallback: string;
  selectedSubjects: string;
  noSubjectsLabel: string;
  addSubject: string;
  quickActions: Record<QuickActionKey, { title: string; description: string }>;
};

type SubjectCopy = {
  offlineModeLabel: string;
  onlineModeLabel: string;
  offlineHint: string;
  onlineHint: string;
  offlinePlaceholder: string;
  onlinePlaceholder: string;
  offlineLoading: string;
  offlineUnavailable: string;
  offlineNoAnswer: string;
  loadPreferenceError: string;
};

type CopyShape = {
  onboarding: OnboardingCopy;
  auth: AuthCopy;
  classSelection: ClassSelectionCopy;
  subjectSelection: SubjectSelectionCopy;
  home: HomeCopy;
  subject: SubjectCopy;
};

const translations: Record<LanguageCode, CopyShape> = {
  en: {
    onboarding: {
      backgroundEyebrow: 'Welcome to Offline AI',
      backgroundTitle: 'Tell us about your learning background',
      motherTongueLabel: 'Mother Tongue',
      typeOfSchoolLabel: 'Type of School',
      continueCta: 'Continue',
      savingLabel: 'Saving…',
    },
    auth: {
      stepLabel: (current, total) => `Step ${current} of ${total}`,
      eyebrow: 'VidyaSetu Offline',
      loginTitle: 'Welcome back',
      signupTitle: 'Create account',
      loginSubtitle: 'Offline AI tutor that keeps you learning anywhere.',
      signupSubtitle: 'Set up your offline-first study companion in minutes.',
      modeLogin: 'Log in',
      modeSignup: 'Sign up',
      nameLabel: 'Full name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      validationMessage: 'Please fill in all required fields.',
      loginCta: 'Continue',
      signupCta: 'Create account',
      helperText: 'By continuing you agree to the Terms & Privacy Policy.',
    },
    classSelection: {
      stepLabel: (current, total) => `Step ${current} of ${total}`,
      eyebrow: 'Welcome',
      title: 'Select Your Class',
      subtitle: "Choose the grade you're currently studying in.",
      summaryLabel: 'Currently selected',
      selectedPrefix: 'Class',
      summaryHint: (index) => `Popular pick #${index}`,
      backCta: 'Back',
      continueCta: 'Continue',
      savingLabel: 'Saving...',
    },
    subjectSelection: {
      stepLabel: (current, total) => `Step ${current} of ${total}`,
      eyebrow: 'Learning focus',
      title: 'What would you like to learn?',
      subtitle: 'Select subjects (you can add more later).',
      summaryLabel: 'Your plan',
      summaryValue: (count, subjectName) => `${count} selected · ${subjectName ?? 'Personalised focus'}`,
      summaryHint: 'Smart reminders',
      pickOneHelper: 'Pick at least one subject to begin.',
      remindersLabel: 'Smart reminders',
      loadingLabel: 'Loading subjects…',
      noSubjectsLabel: 'No subjects available for your class yet.',
      pickOneError: 'Pick at least one subject to continue.',
      backCta: 'Back',
      finishCta: 'Finish',
      savingLabel: 'Saving...',
    },
    home: {
      appBarTitle: 'Offline AI',
      heroGreeting: (name) => `Hello, ${name}!`,
      statusFallback: 'Standard not set',
      selectedSubjects: 'Selected Subjects',
      noSubjectsLabel: 'No subjects yet. Add one!',
      addSubject: 'Add Subject',
      quickActions: {
        ask: {
          title: 'Ask Questions',
          description: 'Speak your doubts',
        },
        solve: {
          title: 'Solve Math',
          description: 'Draw & solve problems',
        },
      },
    },
    subject: {
      offlineModeLabel: 'Offline Mode',
      onlineModeLabel: 'Online Mode',
      offlineHint: 'Offline packs give you instant answers without data.',
      onlineHint: 'Online mode streams richer explanations with the latest knowledge.',
      offlinePlaceholder: 'Ask using the offline pack...',
      onlinePlaceholder: 'Ask anything (requires internet)...',
      offlineLoading: 'Preparing your offline pack…',
      offlineUnavailable: 'Offline pack is not available for this subject yet.',
      offlineNoAnswer: 'I could not find that in the offline pack yet. Try rephrasing or switch to online mode.',
      loadPreferenceError: 'Unable to load your class preference.',
    },
  },
  mr: {
    onboarding: {
      backgroundEyebrow: 'ऑफलाइन एआयमध्ये आपले स्वागत आहे',
      backgroundTitle: 'तुमच्या शिक्षण पार्श्वभूमीबद्दल सांगा',
      motherTongueLabel: 'मातृभाषा',
      typeOfSchoolLabel: 'शाळेचा प्रकार',
      continueCta: 'पुढे जा',
      savingLabel: 'जतन करत आहे…',
    },
    auth: {
      stepLabel: (current, total) => `पायरी ${current} / ${total}`,
      eyebrow: 'विद्यासेतू ऑफलाइन',
      loginTitle: 'पुन्हा स्वागत',
      signupTitle: 'खाते तयार करा',
      loginSubtitle: 'डेटा नसतानाही शिकण्यास मदत करणारा ऑफलाइन एआय गुरु.',
      signupSubtitle: 'काही मिनिटांत ऑफलाइन अभ्यास साथी तयार करा.',
      modeLogin: 'लॉगिन',
      modeSignup: 'साइन अप',
      nameLabel: 'पूर्ण नाव',
      emailLabel: 'ईमेल',
      passwordLabel: 'पासवर्ड',
      validationMessage: 'कृपया सर्व आवश्यक माहिती भरा.',
      loginCta: 'पुढे जा',
      signupCta: 'खाते तयार करा',
      helperText: 'पुढे गेल्यावर तुम्ही नियम व गोपनीयतेशी सहमत आहात.',
    },
    classSelection: {
      stepLabel: (current, total) => `पायरी ${current} / ${total}`,
      eyebrow: 'स्वागत आहे',
      title: 'तुमची इयत्ता निवडा',
      subtitle: 'सध्या शिकत असलेली इयत्ता निवडा.',
      summaryLabel: 'सध्या निवडलेले',
      selectedPrefix: 'इयत्ता',
      summaryHint: (index) => `लोकप्रिय निवड क्रमांक ${index}`,
      backCta: 'मागे',
      continueCta: 'पुढे',
      savingLabel: 'जतन करत आहे...',
    },
    subjectSelection: {
      stepLabel: (current, total) => `पायरी ${current} / ${total}`,
      eyebrow: 'अभ्यासावर लक्ष',
      title: 'काय शिकू इच्छिता?',
      subtitle: 'विषय निवडा (नंतर बदलू शकता).',
      summaryLabel: 'तुमची योजना',
      summaryValue: (count, subjectName) => `${count} निवडले · ${subjectName ?? 'वैयक्तिक लक्ष'}`,
      summaryHint: 'स्मार्ट स्मरणपत्रे',
      pickOneHelper: 'किमान एक विषय निवडा.',
      remindersLabel: 'स्मरणपत्रे',
      loadingLabel: 'विषय लोड होत आहेत…',
      noSubjectsLabel: 'या इयत्तेसाठी विषय उपलब्ध नाहीत.',
      pickOneError: 'पुढे जाण्यासाठी एक विषय निवडा.',
      backCta: 'मागे',
      finishCta: 'पूर्ण करा',
      savingLabel: 'जतन करत आहे...',
    },
    home: {
      appBarTitle: 'ऑफलाइन एआय',
      heroGreeting: (name) => `नमस्कार, ${name}!`,
      statusFallback: 'इयत्ता निवडलेली नाही',
      selectedSubjects: 'निवडलेले विषय',
      noSubjectsLabel: 'अजून विषय नाहीत. एक जोडा!',
      addSubject: 'विषय जोडा',
      quickActions: {
        ask: {
          title: 'प्रश्न विचारा',
          description: 'तुमच्या शंका बोला',
        },
        solve: {
          title: 'गणित सोडवा',
          description: 'प्रश्न रेखाटून सोडवा',
        },
      },
    },
    subject: {
      offlineModeLabel: 'ऑफलाइन मोड',
      onlineModeLabel: 'ऑनलाइन मोड',
      offlineHint: 'डेटा शिवाय त्वरित उत्तरे मिळवा.',
      onlineHint: 'ऑनलाइन मोडमध्ये नवीन माहिती आणि सविस्तर स्पष्टीकरण मिळते.',
      offlinePlaceholder: 'ऑफलाइन पॅक वापरून विचारा...',
      onlinePlaceholder: 'काहीही विचारा (इंटरनेट आवश्यक)...',
      offlineLoading: 'तुमचा ऑफलाइन पॅक तयार होत आहे…',
      offlineUnavailable: 'या विषयासाठी ऑफलाइन पॅक उपलब्ध नाही.',
      offlineNoAnswer: 'त्या प्रश्नाचे उत्तर पॅकमध्ये सापडले नाही. कृपया वेगळे विचार करा किंवा ऑनलाइन मोड वापरा.',
      loadPreferenceError: 'तुमची इयत्ता लोड करता आली नाही.',
    },
  },
  hi: {
    onboarding: {
      backgroundEyebrow: 'ऑफ़लाइन एआई में आपका स्वागत है',
      backgroundTitle: 'हमें अपने सीखने की पृष्ठभूमि बताएं',
      motherTongueLabel: 'मातृभाषा',
      typeOfSchoolLabel: 'विद्यालय का प्रकार',
      continueCta: 'आगे बढ़ें',
      savingLabel: 'सहेजा जा रहा है…',
    },
    auth: {
      stepLabel: (current, total) => `चरण ${current} / ${total}`,
      eyebrow: 'विद्यासेतु ऑफलाइन',
      loginTitle: 'फिर से स्वागत है',
      signupTitle: 'खाता बनाएं',
      loginSubtitle: 'जहाँ भी हों वहाँ सीखने में मदद करने वाला ऑफलाइन एआई ट्यूटर.',
      signupSubtitle: 'कुछ ही मिनटों में ऑफलाइन अध्ययन साथी सेट करें.',
      modeLogin: 'लॉगिन',
      modeSignup: 'साइन अप',
      nameLabel: 'पूरा नाम',
      emailLabel: 'ईमेल',
      passwordLabel: 'पासवर्ड',
      validationMessage: 'कृपया सभी आवश्यक जानकारी भरें.',
      loginCta: 'जारी रखें',
      signupCta: 'खाता बनाएं',
      helperText: 'आगे बढ़ते समय आप नियम और गोपनीयता नीति से सहमत होते हैं.',
    },
    classSelection: {
      stepLabel: (current, total) => `चरण ${current} / ${total}`,
      eyebrow: 'स्वागत है',
      title: 'अपनी कक्षा चुनें',
      subtitle: 'जिस कक्षा में आप पढ़ रहे हैं उसे चुनें.',
      summaryLabel: 'वर्तमान चयन',
      selectedPrefix: 'कक्षा',
      summaryHint: (index) => `लोकप्रिय विकल्प #${index}`,
      backCta: 'वापस',
      continueCta: 'आगे बढ़ें',
      savingLabel: 'सहेजा जा रहा है...',
    },
    subjectSelection: {
      stepLabel: (current, total) => `चरण ${current} / ${total}`,
      eyebrow: 'सीखने का फोकस',
      title: 'आप क्या सीखना चाहेंगे?',
      subtitle: 'विषय चुनें (बाद में और जोड़ सकते हैं).',
      summaryLabel: 'आपकी योजना',
      summaryValue: (count, subjectName) => `${count} चुने गए · ${subjectName ?? 'व्यक्तिगत ध्यान'}`,
      summaryHint: 'स्मार्ट रिमाइंडर',
      pickOneHelper: 'शुरू करने के लिए कम से कम एक विषय चुनें.',
      remindersLabel: 'स्मार्ट रिमाइंडर',
      loadingLabel: 'विषय लोड हो रहे हैं…',
      noSubjectsLabel: 'आपकी कक्षा के लिए विषय उपलब्ध नहीं हैं.',
      pickOneError: 'आगे बढ़ने के लिए एक विषय चुनें.',
      backCta: 'वापस',
      finishCta: 'समाप्त करें',
      savingLabel: 'सहेजा जा रहा है...',
    },
    home: {
      appBarTitle: 'ऑफ़लाइन एआई',
      heroGreeting: (name) => `नमस्ते, ${name}!`,
      statusFallback: 'कक्षा निर्धारित नहीं',
      selectedSubjects: 'चुने गए विषय',
      noSubjectsLabel: 'अभी कोई विषय नहीं। एक जोड़ें!',
      addSubject: 'विषय जोड़ें',
      quickActions: {
        ask: {
          title: 'प्रश्न पूछें',
          description: 'अपनी शंकाएँ बोलें',
        },
        solve: {
          title: 'गणित हल करें',
          description: 'प्रश्न बनाकर हल करें',
        },
      },
    },
    subject: {
      offlineModeLabel: 'ऑफ़लाइन मोड',
      onlineModeLabel: 'ऑनलाइन मोड',
      offlineHint: 'बिना डेटा के तुरंत उत्तर प्राप्त करें।',
      onlineHint: 'ऑनलाइन मोड में नवीन ज्ञान और विस्तृत व्याख्या मिलती है।',
      offlinePlaceholder: 'ऑफ़लाइन पैक से पूछें...',
      onlinePlaceholder: 'कुछ भी पूछें (इंटरनेट आवश्यक)...',
      offlineLoading: 'आपका ऑफ़लाइन पैक तैयार हो रहा है…',
      offlineUnavailable: 'इस विषय के लिए ऑफ़लाइन पैक उपलब्ध नहीं है।',
      offlineNoAnswer: 'यह प्रश्न पैक में नहीं मिला। कृपया दोबारा पूछें या ऑनलाइन मोड अपनाएँ।',
      loadPreferenceError: 'आपकी कक्षा लोड नहीं हो सकी।',
    },
  },
  ta: {
    onboarding: {
      backgroundEyebrow: 'ஆஃப்லைன் ஏஐ-க்கு வரவேற்கிறோம்',
      backgroundTitle: 'உங்கள் கல்விப் பின்னணியை தெரிவியுங்கள்',
      motherTongueLabel: 'தாய்மொழி',
      typeOfSchoolLabel: 'பள்ளியின் வகை',
      continueCta: 'தொடர்க',
      savingLabel: 'சேமித்து கொண்டிருக்கிறது…',
    },
    auth: {
      stepLabel: (current, total) => `படி ${current}/${total}`,
      eyebrow: 'வித்யாசேது ஆஃப்லைன்',
      loginTitle: 'மீண்டும் வருக',
      signupTitle: 'கணக்கு உருவாக்கு',
      loginSubtitle: 'நீங்கள் எங்கே இருந்தாலும் கற்றுக்கொள்ள உதவும் ஆஃப்லைன் ஏஐ ஆசிரியர்.',
      signupSubtitle: 'நிமிடங்களில் ஆஃப்லைன் படிப்பு தோழரை அமைக்கவும்.',
      modeLogin: 'உள்நுழை',
      modeSignup: 'பதிவு',
      nameLabel: 'முழு பெயர்',
      emailLabel: 'மின்னஞ்சல்',
      passwordLabel: 'கடவுச்சொல்',
      validationMessage: 'தயவுசெய்து தேவையான தகவலை நிரப்பவும்.',
      loginCta: 'தொடர்க',
      signupCta: 'கணக்கு உருவாக்கு',
      helperText: 'தொடர்வதனால் விதிமுறைகள் மற்றும் தனியுரிமையை ஒப்புக்கொள்கிறீர்கள்.',
    },
    classSelection: {
      stepLabel: (current, total) => `படி ${current}/${total}`,
      eyebrow: 'வரவேற்கிறோம்',
      title: 'உங்கள் வகுப்பை தேர்வு செய்யவும்',
      subtitle: 'நீங்கள் படிக்கும் தரத்தைத் தேருங்கள்.',
      summaryLabel: 'தற்போதைய தேர்வு',
      selectedPrefix: 'தரம்',
      summaryHint: (index) => `பிரபல தேர்வு #${index}`,
      backCta: 'பின்',
      continueCta: 'தொடர்க',
      savingLabel: 'சேமித்து கொண்டிருக்கிறது...',
    },
    subjectSelection: {
      stepLabel: (current, total) => `படி ${current}/${total}`,
      eyebrow: 'கற்றல் கவனம்',
      title: 'எதை கற்றுக்கொள்ள விரும்புகிறீர்கள்?',
      subtitle: 'பாடங்களைத் தேர்ந்தெடுக்கவும் (பிறகு மாற்றலாம்).',
      summaryLabel: 'உங்கள் திட்டம்',
      summaryValue: (count, subjectName) => `${count} தேர்வு · ${subjectName ?? 'தனிப்பட்ட கவனம்'}`,
      summaryHint: 'ஸ்மார்ட் நினைவூட்டல்கள்',
      pickOneHelper: 'குறைந்தது ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்.',
      remindersLabel: 'ஸ்மார்ட் நினைவூட்டல்கள்',
      loadingLabel: 'பாடங்கள் ஏற்றப்படுகின்றன…',
      noSubjectsLabel: 'இந்த தரத்திற்கு பாடங்கள் இல்லை.',
      pickOneError: 'தொடர ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்.',
      backCta: 'பின்',
      finishCta: 'முடிக்க',
      savingLabel: 'சேமித்து கொண்டிருக்கிறது...',
    },
    home: {
      appBarTitle: 'ஆஃப்லைன் ஏஐ',
      heroGreeting: (name) => `வணக்கம், ${name}!`,
      statusFallback: 'தரம் அமைக்கப்படவில்லை',
      selectedSubjects: 'தேர்ந்தெடுத்த பாடங்கள்',
      noSubjectsLabel: 'பாடங்கள் இல்லை. ஒன்றை சேர்க்கவும்!',
      addSubject: 'பாடம் சேர்க்கவும்',
      quickActions: {
        ask: {
          title: 'கேள்விகள் கேளுங்கள்',
          description: 'உங்கள் சந்தேகங்களை பேசுங்கள்',
        },
        solve: {
          title: 'கணிதத்தை தீர்க்கவும்',
          description: 'வரைந்து தீர்வுகளை காண்க',
        },
      },
    },
    subject: {
      offlineModeLabel: 'ஆஃப்லைன் முறை',
      onlineModeLabel: 'ஆன்லைன் முறை',
      offlineHint: 'தரவு இல்லாமல் உடனடி பதில்கள் கிடைக்கும்.',
      onlineHint: 'ஆன்லைன் முறையில் புதிய அறிவும் விரிவான விளக்கமும் கிடைக்கும்.',
      offlinePlaceholder: 'ஆஃப்லைன் தொகுப்பைப் பயன்படுத்தி கேளுங்கள்...',
      onlinePlaceholder: 'எதையும் கேளுங்கள் (இணையம் தேவையானது)...',
      offlineLoading: 'உங்கள் ஆஃப்லைன் தொகுப்பு தயாராகிறது…',
      offlineUnavailable: 'இந்த பாடத்திற்கு ஆஃப்லைன் தொகுப்பு இல்லை.',
      offlineNoAnswer: 'அந்த கேள்வி தொகுப்பில் கிடைக்கவில்லை. மீண்டும் கேளுங்கள் அல்லது ஆன்லைன் முறைக்கு மாற்றுங்கள்.',
      loadPreferenceError: 'உங்கள் தரத்தை ஏற்ற முடியவில்லை.',
    },
  },
};

export const resolveLanguageCode = (input?: string | null): LanguageCode => {
  if (!input) return fallbackLanguage;
  const normalized = input.toLowerCase();
  if (normalized in translations) {
    return normalized as LanguageCode;
  }
  const labelMatch = languageOptions.find((option) => option.label.toLowerCase() === normalized);
  if (labelMatch) {
    return labelMatch.code;
  }
  return fallbackLanguage;
};

export const getCopy = (language?: string | null): CopyShape => {
  return translations[resolveLanguageCode(language)];
};
