export type Locale = "en" | "hi" | "ta";

export const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
  { code: "ta", label: "த" },
];

type Dict = Record<Locale, string>;

export const t = {
  // header
  appName: { en: "RoadWatch", hi: "रोडवॉच", ta: "ரோட்வாட்ச்" } as Dict,
  sampleDataNote: {
    en: "Sample data - for demonstration only",
    hi: "नमूना डेटा - केवल प्रदर्शन के लिए",
    ta: "மாதிரித் தரவு - செயல்விளக்கத்திற்கு மட்டும்",
  } as Dict,
  needPhoto: {
    en: "To find who built a road, I need a photo of it. Please attach or capture a picture of the road, and I'll trace the contractor, budget, warranty and the officer responsible.",
    hi: "यह जानने के लिए कि सड़क किसने बनाई, मुझे उसकी एक तस्वीर चाहिए। कृपया सड़क की फ़ोटो जोड़ें या खींचें।",
    ta: "சாலையை யார் கட்டினார் என அறிய, அதன் புகைப்படம் தேவை. சாலையின் படத்தை இணைக்கவும் அல்லது எடுக்கவும்.",
  } as Dict,
  removeImage: {
    en: "Remove photo",
    hi: "फ़ोटो हटाएँ",
    ta: "புகைப்படத்தை அகற்று",
  } as Dict,
  photoReady: {
    en: "Photo ready - add a note or send",
    hi: "फ़ोटो तैयार - नोट जोड़ें या भेजें",
    ta: "புகைப்படம் தயார் - குறிப்பு சேர்க்கவும் அல்லது அனுப்பவும்",
  } as Dict,
  addNote: {
    en: "Add a note (optional)...",
    hi: "एक नोट जोड़ें (वैकल्पिक)...",
    ta: "குறிப்பு சேர்க்கவும் (விரும்பினால்)...",
  } as Dict,
  tagline: {
    en: "Road accountability",
    hi: "सड़क जवाबदेही",
    ta: "சாலை பொறுப்புணர்வு",
  } as Dict,
  searchChats: { en: "Search chats", hi: "चैट खोजें", ta: "அரட்டைகளைத் தேடு" } as Dict,
  recent: { en: "Recent", hi: "हाल ही में", ta: "சமீபத்தியவை" } as Dict,
  noMatches: { en: "No matching chats", hi: "कोई मेल नहीं", ta: "பொருத்தம் இல்லை" } as Dict,
  noChats: { en: "No chats yet", hi: "अभी कोई चैट नहीं", ta: "இன்னும் அரட்டை இல்லை" } as Dict,
  citizen: { en: "Citizen", hi: "नागरिक", ta: "குடிமகன்" } as Dict,
  adminTag: { en: "Admin", hi: "एडमिन", ta: "அட்மின்" } as Dict,
  signOut: { en: "Log out", hi: "लॉग आउट", ta: "வெளியேறு" } as Dict,
  online: { en: "Online", hi: "ऑनलाइन", ta: "ஆன்லைன்" } as Dict,

  // chat
  emptyTitle: {
    en: "Ask about any road.",
    hi: "किसी भी सड़क के बारे में पूछें।",
    ta: "எந்த சாலை பற்றியும் கேளுங்கள்.",
  } as Dict,
  emptySub: {
    en: "Contractor, budget, safety, warranty status. Right here in chat.",
    hi: "ठेकेदार, बजट, सुरक्षा, वारंटी - सब कुछ चैट में।",
    ta: "ஒப்பந்ததாரர், பட்ஜெட், பாதுகாப்பு, உத்தரவாதம் - அனைத்தும் இங்கே.",
  } as Dict,
  placeholder: {
    en: "Message RoadWatch…",
    hi: "RoadWatch को लिखें…",
    ta: "RoadWatch-க்கு எழுது…",
  } as Dict,
  send: { en: "Send", hi: "भेजें", ta: "அனுப்பு" } as Dict,
  attachPhoto: { en: "Photo", hi: "फोटो", ta: "படம்" } as Dict,
  voice: { en: "Voice", hi: "आवाज़", ta: "குரல்" } as Dict,

  // cards
  roadType: { en: "Road type", hi: "सड़क प्रकार", ta: "சாலை வகை" } as Dict,
  lastRelay: { en: "Last relaying", hi: "पिछली मरम्मत", ta: "கடைசி பழுதுபார்ப்பு" } as Dict,
  contractor: { en: "Contractor", hi: "ठेकेदार", ta: "ஒப்பந்ததாரர்" } as Dict,
  warranty: { en: "Warranty (DLP)", hi: "वारंटी (DLP)", ta: "உத்தரவாதம் (DLP)" } as Dict,
  warrantyActive: { en: "Active", hi: "सक्रिय", ta: "செயலில்" } as Dict,
  warrantyExpired: { en: "Warranty (DLP) expired", hi: "वारंटी (DLP) समाप्त", ta: "உத்தரவாதம் (DLP) காலாவதி" } as Dict,
  noContract: {
    en: "No contract on file for this stretch yet. Routing to the area authority is still available below.",
    hi: "इस हिस्से के लिए अभी कोई ठेका रिकॉर्ड नहीं है। नीचे क्षेत्र अधिकारी को शिकायत भेजी जा सकती है।",
    ta: "இந்தப் பகுதிக்கு இன்னும் ஒப்பந்தப் பதிவு இல்லை. கீழே உள்ள அதிகாரிக்கு புகார் அனுப்பலாம்.",
  } as Dict,
  budget: { en: "Budget", hi: "बजट", ta: "பட்ஜெட்" } as Dict,
  roadName: { en: "Road name", hi: "सड़क का नाम", ta: "சாலை பெயர்" } as Dict,
  workDone: { en: "Work done", hi: "कार्य अवधि", ta: "பணி காலம்" } as Dict,
  liveGps: { en: "LIVE", hi: "लाइव", ta: "நேரடி" } as Dict,
  contractorLicense: { en: "Contractor license", hi: "ठेकेदार लाइसेंस", ta: "ஒப்பந்ததாரர் உரிமம்" } as Dict,
  valid: { en: "Valid", hi: "वैध", ta: "செல்லுபடி" } as Dict,
  expired: { en: "Expired", hi: "समाप्त", ta: "காலாவதி" } as Dict,
  licenseNo: { en: "Licence no", hi: "लाइसेंस सं.", ta: "உரிம எண்" } as Dict,
  licenseClass: { en: "Class", hi: "श्रेणी", ta: "வகை" } as Dict,
  issued: { en: "Issued", hi: "जारी", ta: "வழங்கப்பட்டது" } as Dict,
  renewed: { en: "Renewed", hi: "नवीनीकृत", ta: "புதுப்பிக்கப்பட்டது" } as Dict,
  validTill: { en: "Valid till", hi: "वैध तक", ta: "செல்லுபடி வரை" } as Dict,
  tender: { en: "Tender", hi: "टेंडर", ta: "டெண்டர்" } as Dict,
  verificationDisabled: {
    en: "Real road-safety verification is disabled from admin. Records shown are sample data.",
    hi: "वास्तविक सड़क-सुरक्षा सत्यापन एडमिन से बंद है। दिखाए गए रिकॉर्ड नमूना डेटा हैं।",
    ta: "உண்மையான சாலை-பாதுகாப்பு சரிபார்ப்பு நிர்வாகத்தில் முடக்கப்பட்டுள்ளது. காட்டப்படும் பதிவுகள் மாதிரி தரவு.",
  } as Dict,
  gpsOffTitle: { en: "Location is off", hi: "लोकेशन बंद है", ta: "இருப்பிடம் அணைக்கப்பட்டது" } as Dict,
  gpsOffBody: {
    en: "RoadWatch needs your GPS to detect which road you're on. Enable location and retry, or continue with an approximate area.",
    hi: "RoadWatch को यह पता लगाने के लिए GPS चाहिए कि आप किस सड़क पर हैं। लोकेशन चालू करें और पुनः प्रयास करें, या अनुमानित क्षेत्र के साथ जारी रखें।",
    ta: "நீங்கள் எந்தச் சாலையில் இருக்கிறீர்கள் என அறிய GPS தேவை. இயக்கி மீண்டும் முயற்சிக்கவும் அல்லது தோராயமான பகுதியுடன் தொடரவும்.",
  } as Dict,
  continueAnyway: { en: "Continue anyway", hi: "फिर भी जारी रखें", ta: "தொடரவும்" } as Dict,
  enableRetry: { en: "Enable & retry", hi: "चालू करें", ta: "இயக்கு" } as Dict,
  gpsWarnChat: {
    en: "⚠️ Your GPS is off - I'm using an approximate location. Turn on location for exact road matching.",
    hi: "⚠️ आपका GPS बंद है - मैं अनुमानित स्थान उपयोग कर रहा हूँ। सटीक मिलान के लिए लोकेशन चालू करें।",
    ta: "⚠️ உங்கள் GPS அணைந்துள்ளது - தோராயமான இடம் பயன்படுத்துகிறேன். துல்லியத்திற்கு இருப்பிடத்தை இயக்கவும்.",
  } as Dict,
  locating: {
    en: "Capturing your live location…",
    hi: "आपका लाइव स्थान प्राप्त किया जा रहा है…",
    ta: "உங்கள் நேரடி இருப்பிடம் பெறப்படுகிறது…",
  } as Dict,
  askLocation: {
    en: "Which road do you mean? Tap the camera to share a photo - then I'll pull up the contractor, budget, officer and warranty.",
    hi: "आप किस सड़क की बात कर रहे हैं? कैमरे से फ़ोटो भेजें - फिर मैं ठेकेदार, बजट, अधिकारी और वारंटी दिखाऊँगा।",
    ta: "எந்தச் சாலை? கேமராவில் படம் பகிரவும் - பிறகு ஒப்பந்ததாரர், பட்ஜெட், அதிகாரி, உத்தரவாதத்தைக் காட்டுகிறேன்.",
  } as Dict,
  demoHere: {
    en: "Here are the details for",
    hi: "इसका विवरण यहाँ है -",
    ta: "இதற்கான விவரங்கள் -",
  } as Dict,
  sanctioned: { en: "Sanctioned", hi: "स्वीकृत", ta: "அனுமதிக்கப்பட்டது" } as Dict,
  spent: { en: "Spent", hi: "खर्च", ta: "செலவானது" } as Dict,
  norm: { en: "₹/km vs norm", hi: "₹/किमी बनाम मानक", ta: "₹/கிமீ vs தரம்" } as Dict,
  source: { en: "source", hi: "स्रोत", ta: "மூலம்" } as Dict,
  officer: { en: "Responsible officer", hi: "जिम्मेदार अधिकारी", ta: "பொறுப்பான அதிகாரி" } as Dict,
  sla: { en: "SLA", hi: "SLA", ta: "SLA" } as Dict,
  days: { en: "days", hi: "दिन", ta: "நாட்கள்" } as Dict,
  fileComplaint: {
    en: "File complaint",
    hi: "शिकायत दर्ज करें",
    ta: "புகார் பதிவு",
  } as Dict,
  filedTo: { en: "Filed to", hi: "दर्ज किया गया", ta: "சமர்ப்பிக்கப்பட்டது" } as Dict,
  cpgrams: { en: "CPGRAMS", hi: "CPGRAMS", ta: "CPGRAMS" } as Dict,

  // tracking
  tracking: { en: "Complaint tracking", hi: "शिकायत ट्रैकिंग", ta: "புகார் கண்காணிப்பு" } as Dict,
  ticket: { en: "Ticket", hi: "टिकट", ta: "டிக்கெட்" } as Dict,
  status: { en: "Status", hi: "स्थिति", ta: "நிலை" } as Dict,
  inProgress: { en: "In progress", hi: "प्रगति पर", ta: "முன்னேற்றத்தில்" } as Dict,
  slaRemaining: { en: "SLA remaining", hi: "SLA शेष", ta: "SLA மீதம்" } as Dict,
  currentlyWith: { en: "Currently with", hi: "वर्तमान में", ta: "தற்போது" } as Dict,
  escalationPath: { en: "Escalation path", hi: "एस्केलेशन पथ", ta: "மேல்நிலைப் பாதை" } as Dict,
  timeline: { en: "Timeline", hi: "समयरेखा", ta: "காலவரிசை" } as Dict,
  copyTicket: { en: "Copy ticket ID", hi: "टिकट ID कॉपी करें", ta: "டிக்கெட் ID நகலெடு" } as Dict,
  copied: { en: "Copied", hi: "कॉपी किया", ta: "நகலெடுக்கப்பட்டது" } as Dict,
  trackLater: {
    en: "You can track this anytime - just say \"track my complaint\".",
    hi: "आप कभी भी ट्रैक कर सकते हैं - बस कहें \"मेरी शिकायत ट्रैक करें\"।",
    ta: "எப்போது வேண்டுமானாலும் கண்காணிக்கலாம் - \"என் புகாரை கண்காணி\" என சொல்லுங்கள்.",
  } as Dict,

  // stretch cards
  crashHistory: { en: "Crash history", hi: "दुर्घटना रिकॉर्ड", ta: "விபத்து பதிவு" } as Dict,
  fatalities: { en: "Fatalities", hi: "मृत्यु", ta: "இறப்புகள்" } as Dict,
  injuries: { en: "Injuries", hi: "घायल", ta: "காயங்கள்" } as Dict,
  costOfBadRoad: {
    en: "True cost of this pothole",
    hi: "इस गड्ढे की असली लागत",
    ta: "இந்தப் பள்ளத்தின் உண்மை விலை",
  } as Dict,
  perDay: { en: "per day", hi: "प्रति दिन", ta: "நாள் ஒன்றுக்கு" } as Dict,
  perYear: { en: "per year", hi: "प्रति वर्ष", ta: "ஆண்டுக்கு" } as Dict,
  monsoonWatch: { en: "Monsoon forecast", hi: "मानसून पूर्वानुमान", ta: "மழைக்கால முன்னறிவிப்பு" } as Dict,
  now: { en: "Now", hi: "अभी", ta: "இப்போது" } as Dict,
  bySep: { en: "By Sep", hi: "सितंबर तक", ta: "செப்டம்பர் வரை" } as Dict,

  // admin
  adminTitle: {
    en: "Chennai South · District view",
    hi: "चेन्नई दक्षिण · जिला",
    ta: "சென்னை தெற்கு · மாவட்டம்",
  } as Dict,
  openComplaints: { en: "Open complaints", hi: "खुली शिकायतें", ta: "திறந்த புகார்கள்" } as Dict,
  slaBreaches: { en: "SLA breaches", hi: "SLA उल्लंघन", ta: "SLA மீறல்கள்" } as Dict,
  costInaction: {
    en: "Cost of inaction / day",
    hi: "निष्क्रियता की लागत",
    ta: "செயலற்ற விலை / நாள்",
  } as Dict,
  topContractor: { en: "Top contractor", hi: "शीर्ष ठेकेदार", ta: "முதன்மை ஒப்பந்ததாரர்" } as Dict,
  stretchesByCost: {
    en: "Stretches by cost of inaction",
    hi: "निष्क्रियता की लागत द्वारा",
    ta: "செயலற்ற விலை மூலம் பாதைகள்",
  } as Dict,
  heatmap: { en: "Defect heatmap", hi: "खराबी हीटमैप", ta: "சேதம் ஹீட்மேப்" } as Dict,

  // sidebar / nav
  newChat: { en: "New chat", hi: "नई चैट", ta: "புதிய அரட்டை" } as Dict,
  chats: { en: "Chats", hi: "चैट्स", ta: "அரட்டைகள்" } as Dict,
  myComplaints: {
    en: "My complaints",
    hi: "मेरी शिकायतें",
    ta: "என் புகார்கள்",
  } as Dict,

  // complaint list
  allComplaints: {
    en: "All complaints",
    hi: "सभी शिकायतें",
    ta: "அனைத்து புகார்கள்",
  } as Dict,
  filedOn: { en: "Filed", hi: "दर्ज", ta: "பதிவு" } as Dict,
  updated: { en: "Updated", hi: "अद्यतन", ta: "புதுப்பிப்பு" } as Dict,
  noComplaintsTitle: {
    en: "No complaints yet",
    hi: "अभी तक कोई शिकायत नहीं",
    ta: "இதுவரை புகார்கள் இல்லை",
  } as Dict,
  noComplaintsSub: {
    en: "Complaints you file from a chat will show up here.",
    hi: "आपकी चैट से दर्ज की गई शिकायतें यहाँ दिखेंगी।",
    ta: "உங்கள் அரட்டையிலிருந்து பதிவுசெய்த புகார்கள் இங்கே தோன்றும்.",
  } as Dict,

  // complaint detail
  subjectLine: { en: "Subject", hi: "विषय", ta: "பொருள்" } as Dict,
  description: { en: "Description", hi: "विवरण", ta: "விளக்கம்" } as Dict,
  yourWords: {
    en: "Your original words",
    hi: "आपके मूल शब्द",
    ta: "உங்கள் அசல் வார்த்தைகள்",
  } as Dict,
  aiPolished: {
    en: "AI-polished · submitted to CPGRAMS",
    hi: "AI-परिष्कृत · CPGRAMS में भेजा गया",
    ta: "AI-மெருகூட்டப்பட்டது · CPGRAMS-க்கு சமர்ப்பிக்கப்பட்டது",
  } as Dict,
  photos: { en: "Photos", hi: "फ़ोटो", ta: "படங்கள்" } as Dict,
  call: { en: "Call", hi: "कॉल", ta: "அழை" } as Dict,
  email: { en: "Email", hi: "ईमेल", ta: "மின்னஞ்சல்" } as Dict,
  escalate: { en: "Escalate", hi: "एस्केलेट करें", ta: "மேல்நிலைக்கு" } as Dict,
  escalateConfirm: {
    en: "Escalate to the next level?",
    hi: "अगले स्तर पर एस्केलेट करें?",
    ta: "அடுத்த நிலைக்கு மேல்நிலைப்படுத்தவா?",
  } as Dict,
  yes: { en: "Yes, escalate", hi: "हाँ, एस्केलेट", ta: "ஆம், மேல்நிலை" } as Dict,
  cancel: { en: "Cancel", hi: "रद्द", ta: "ரத்து" } as Dict,

  // camera
  camera: { en: "Camera", hi: "कैमरा", ta: "கேமரா" } as Dict,
  capture: { en: "Capture", hi: "खींचें", ta: "எடு" } as Dict,
  ready: { en: "Ready", hi: "तैयार", ta: "தயார்" } as Dict,
  camDenied: {
    en: "Camera permission was blocked. Enable it in your browser settings, or attach a photo instead.",
    hi: "कैमरा अनुमति अवरुद्ध है। ब्राउज़र सेटिंग्स में चालू करें, या फ़ोटो जोड़ें।",
    ta: "கேமரா அனுமதி தடுக்கப்பட்டது. உலாவி அமைப்பில் அனுமதிக்கவும், அல்லது படத்தை இணைக்கவும்.",
  } as Dict,
  camNone: {
    en: "No camera found on this device. Try attaching a photo instead.",
    hi: "इस डिवाइस में कैमरा नहीं मिला। फ़ोटो जोड़ें।",
    ta: "இந்தச் சாதனத்தில் கேமரா இல்லை. படத்தை இணைக்கவும்.",
  } as Dict,
  camUnsupported: {
    en: "Your browser can't open the camera here. Try attaching a photo.",
    hi: "ब्राउज़र कैमरा नहीं खोल सकता। फ़ोटो जोड़ें।",
    ta: "உலாவி கேமராவைத் திறக்க முடியவில்லை. படத்தை இணைக்கவும்.",
  } as Dict,
  attach: { en: "Attach", hi: "जोड़ें", ta: "இணை" } as Dict,
  takePhoto: { en: "Take photo", hi: "फ़ोटो लें", ta: "படம் எடு" } as Dict,
  attachImage: { en: "Attach image", hi: "छवि जोड़ें", ta: "படத்தை இணை" } as Dict,
  captureScreenshot: {
    en: "Capture screenshot",
    hi: "स्क्रीनशॉट लें",
    ta: "ஸ்கிரீன்ஷாட் எடு",
  } as Dict,
  uploadPhoto: {
    en: "Upload a photo",
    hi: "फ़ोटो अपलोड करें",
    ta: "படத்தை பதிவேற்று",
  } as Dict,

  // location picker
  whereIsThis: {
    en: "Where is this? Tap on the map.",
    hi: "यह कहाँ है? नक़्शे पर टैप करें।",
    ta: "இது எங்கே? வரைபடத்தில் தட்டு.",
  } as Dict,
  optionalSkip: {
    en: "Optional - you can skip.",
    hi: "वैकल्पिक - छोड़ सकते हैं।",
    ta: "விருப்பத்தேர்வு - தவிர்க்கலாம்.",
  } as Dict,
  useMyLocation: {
    en: "Use my location",
    hi: "मेरी लोकेशन",
    ta: "என் இடம்",
  } as Dict,
  skip: { en: "Skip", hi: "छोड़ें", ta: "தவிர்" } as Dict,
  confirmLocation: {
    en: "Confirm",
    hi: "पुष्टि करें",
    ta: "உறுதிப்படுத்து",
  } as Dict,
  removePhoto: { en: "Remove", hi: "हटाएँ", ta: "அகற்று" } as Dict,
  // demo toggle
  demoMode: { en: "Demo mode", hi: "डेमो मोड", ta: "டெமோ பயன்முறை" } as Dict,
  liveMode: { en: "Live", hi: "लाइव", ta: "நேரடி" } as Dict,
  demoOnTip: {
    en: "Sample data - no DB writes.",
    hi: "नमूना डेटा - DB में नहीं लिखा जा रहा।",
    ta: "மாதிரி தரவு - DB-இல் எழுதப்படவில்லை.",
  } as Dict,
  liveOnTip: {
    en: "Live data - chats and complaints persist.",
    hi: "लाइव डेटा - चैट और शिकायतें सुरक्षित होती हैं।",
    ta: "நேரடி தரவு - அரட்டைகள் & புகார்கள் சேமிக்கப்படும்.",
  } as Dict,

  // contractor lookup
  contractorUnknown: {
    en: "Contractor not in our database for this district yet.",
    hi: "इस जिले के लिए अभी ठेकेदार डेटा उपलब्ध नहीं है।",
    ta: "இந்த மாவட்டத்திற்கான ஒப்பந்ததாரர் தரவு இன்னும் இல்லை.",
  } as Dict,

  locationAdded: {
    en: "Location set",
    hi: "स्थान सेट",
    ta: "இடம் அமைக்கப்பட்டது",
  } as Dict,
  backToComplaints: {
    en: "Back to complaints",
    hi: "शिकायतों पर वापस",
    ta: "புகார்களுக்குத் திரும்பு",
  } as Dict,
  openChat: {
    en: "Open original chat",
    hi: "मूल चैट खोलें",
    ta: "அசல் அரட்டை திற",
  } as Dict,
};

export const msg = {
  default: {
    en: "Here is what I found for this stretch.",
    hi: "इस सड़क के लिए जानकारी यहाँ है।",
    ta: "இந்த சாலைக்கான தகவல் இங்கே உள்ளது.",
  } as Dict,
  filed: {
    en: "Complaint filed to CPGRAMS. SLA 30 days; I'll auto-escalate if breached.",
    hi: "शिकायत CPGRAMS में दर्ज। 30 दिन में समाधान न हुआ तो अपने आप आगे बढ़ेगी।",
    ta: "புகார் CPGRAMS-க்கு பதிவு. 30 நாட்களில் தீர்க்கப்படாவிட்டால் தானாக மேல்நிலைக்கு செல்லும்.",
  } as Dict,
};
