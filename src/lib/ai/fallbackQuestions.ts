/**
 * High-quality fallback question pools for Indian competitive exams.
 * Ensures the daily contest generation NEVER fails even when external AI APIs
 * hit rate limits, quotas, timeouts, or downtime.
 */

export interface FallbackContestTheme {
  topic: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export const FALLBACK_CONTEST_THEMES: FallbackContestTheme[] = [
  {
    topic: 'भारतीय संविधान एवं राजव्यवस्था (Indian Polity & Constitution)',
    slug: 'indian-polity-and-constitution',
    metaTitle: 'भारतीय संविधान एवं राजव्यवस्था प्रतियोगिता | Quiz-Do',
    metaDescription: 'भारतीय संविधान, मौलिक अधिकार, संसद एवं राजव्यवस्था पर आधारित दैनिक ऑनलाइन क्विज प्रतियोगिता में भाग लें।',
    questions: [
      {
        question: 'भारतीय संविधान के किस अनुच्छेद के तहत "समानता का अधिकार" प्रदान किया गया है?',
        options: ['अनुच्छेद 14 से 18', 'अनुच्छेद 19 से 22', 'अनुच्छेद 23 से 24', 'अनुच्छेद 25 से 28'],
        correctAnswer: 0,
      },
      {
        question: 'भारतीय संविधान की प्रस्तावना में किस संशोधन अधिनियम द्वारा "समाजवादी" और "पंथनिरपेक्ष" शब्द जोड़े गए?',
        options: ['42वां संशोधन अधिनियम, 1976', '44वां संशोधन अधिनियम, 1978', '52वां संशोधन अधिनियम, 1985', '73वां संशोधन अधिनियम, 1992'],
        correctAnswer: 0,
      },
      {
        question: 'भारत के राष्ट्रपति पर महाभियोग चलाने की प्रक्रिया किस देश के संविधान से ली गई है?',
        options: ['संयुक्त राज्य अमेरिका', 'ब्रिटेन', 'कनाडा', 'आयरलैंड'],
        correctAnswer: 0,
      },
      {
        question: 'संविधान सभा की प्रथम बैठक कब आयोजित की गई थी?',
        options: ['9 दिसंबर 1946', '11 दिसंबर 1946', '26 नवंबर 1949', '26 जनवरी 1950'],
        correctAnswer: 0,
      },
      {
        question: 'भारतीय संसद के दोनों सदनों की संयुक्त बैठक की अध्यक्षता कौन करता है?',
        options: ['लोकसभा अध्यक्ष', 'भारत का राष्ट्रपति', 'राज्यसभा का सभापति', 'प्रधानमंत्री'],
        correctAnswer: 0,
      },
      {
        question: 'भारतीय संविधान में राज्य के नीति निदेशक तत्व किस देश के संविधान से प्रेरित हैं?',
        options: ['आयरलैंड', 'ऑस्ट्रेलिया', 'जर्मनी', 'दक्षिण अफ्रीका'],
        correctAnswer: 0,
      },
      {
        question: 'संविधान के किस अनुच्छेद के तहत वित्तीय आपातकाल की घोषणा की जा सकती है?',
        options: ['अनुच्छेद 360', 'अनुच्छेद 352', 'अनुच्छेद 356', 'अनुच्छेद 368'],
        correctAnswer: 0,
      },
      {
        question: 'भारत के मुख्य चुनाव आयुक्त की नियुक्ति किसके द्वारा की जाती है?',
        options: ['राष्ट्रपति', 'प्रधानमंत्री', 'संसद', 'भारत के मुख्य न्यायाधीश'],
        correctAnswer: 0,
      },
      {
        question: 'किस संविधान संशोधन द्वारा मतदान की न्यूनतम आयु 21 वर्ष से घटाकर 18 वर्ष की गई?',
        options: ['61वां संविधान संशोधन', '42वां संविधान संशोधन', '44वां संविधान संशोधन', '86वां संविधान संशोधन'],
        correctAnswer: 0,
      },
      {
        question: 'भारतीय संविधान की आठवीं अनुसूची में वर्तमान में कुल कितनी भाषाएं मान्यता प्राप्त हैं?',
        options: ['22 भाषाएं', '18 भाषाएं', '20 भाषाएं', '24 भाषाएं'],
        correctAnswer: 0,
      },
      {
        question: 'संविधान के किस अनुच्छेद को डॉ. भीमराव अंबेडकर ने "संविधान का हृदय और आत्मा" कहा था?',
        options: ['अनुच्छेद 32', 'अनुच्छेद 19', 'अनुच्छेद 21', 'अनुच्छेद 14'],
        correctAnswer: 0,
      },
      {
        question: 'भारत के नियंत्रक एवं महालेखा परीक्षक (CAG) का कार्यकाल कितना होता है?',
        options: ['6 वर्ष या 65 वर्ष की आयु (जो भी पहले हो)', '5 वर्ष या 65 वर्ष की आयु', '6 वर्ष या 62 वर्ष की आयु', '5 वर्ष या 60 वर्ष की आयु'],
        correctAnswer: 0,
      },
    ],
  },
  {
    topic: 'भारतीय राष्ट्रीय आंदोलन एवं आधुनिक इतिहास (Modern Indian History)',
    slug: 'modern-indian-history-and-national-movement',
    metaTitle: 'भारतीय राष्ट्रीय आंदोलन एवं इतिहास प्रतियोगिता | Quiz-Do',
    metaDescription: '1857 की क्रांति, स्वतंत्रता संग्राम एवं राष्ट्रीय आंदोलन पर आधारित प्रतियोगी परीक्षा क्विज।',
    questions: [
      {
        question: '1857 के प्रथम स्वतंत्रता संग्राम के समय भारत का गवर्नर जनरल कौन था?',
        options: ['लॉर्ड कैनिंग', 'लॉर्ड डलहौजी', 'लॉर्ड विलियम बेंटिंक', 'लॉर्ड कर्जन'],
        correctAnswer: 0,
      },
      {
        question: 'महात्मा गांधी ने दांडी मार्च (नमक सत्याग्रह) किस वर्ष और किस तारीख को प्रारंभ किया था?',
        options: ['12 मार्च 1930', '6 अप्रैल 1930', '1 अगस्त 1920', '8 अगस्त 1942'],
        correctAnswer: 0,
      },
      {
        question: 'भारतीय राष्ट्रीय कांग्रेस के प्रथम मुस्लिम अध्यक्ष कौन थे?',
        options: ['बदरुद्दीन तैयबजी', 'मौलाना अबुल कलाम आजाद', 'रहीमतुल्ला एम. सयानी', 'हकीम अजमल खान'],
        correctAnswer: 0,
      },
      {
        question: 'जलियांवाला बाग हत्याकांड के विरोध में किसने अपनी "नाइटहुड" की उपाधि त्याग दी थी?',
        options: ['रवींद्रनाथ टैगोर', 'महात्मा गांधी', 'सुभाष चंद्र बोस', 'बाल गंगाधर तिलक'],
        correctAnswer: 0,
      },
      {
        question: '"करो या मरो" का प्रसिद्ध नारा गांधीजी ने किस आंदोलन के दौरान दिया था?',
        options: ['भारत छोड़ो आंदोलन (1942)', 'असहयोग आंदोलन (1920)', 'सविनय अवज्ञा आंदोलन (1930)', 'चंपारण सत्याग्रह (1917)'],
        correctAnswer: 0,
      },
      {
        question: '1905 में बंगाल विभाजन की घोषणा किस वायसराय के कार्यकाल में हुई थी?',
        options: ['लॉर्ड कर्जन', 'लॉर्ड मिंटो', 'लॉर्ड हार्डिंग', 'लॉर्ड चेम्सफोर्ड'],
        correctAnswer: 0,
      },
      {
        question: 'फॉरवर्ड ब्लॉक (Forward Bloc) की स्थापना किसने की थी?',
        options: ['सुभाष चंद्र बोस', 'रास बिहारी बोस', 'भगत सिंह', 'चंद्रशेखर आजाद'],
        correctAnswer: 0,
      },
      {
        question: 'पूना पैक्ट (1932) किन दो प्रमुख नेताओं के मध्य हस्ताक्षरित हुआ था?',
        options: ['महात्मा गांधी और डॉ. भीमराव अंबेडकर', 'महात्मा गांधी और मोहम्मद अली जिन्ना', 'जवाहरलाल नेहरू और सुभाष चंद्र बोस', 'सरदार पटेल और लॉर्ड इरविन'],
        correctAnswer: 0,
      },
      {
        question: 'साइमन कमीशन किस वर्ष भारत पहुंचा था?',
        options: ['1928 में', '1927 में', '1930 में', '1929 में'],
        correctAnswer: 0,
      },
      {
        question: '"स्वराज मेरा जन्मसिद्ध अधिकार है और मैं इसे लेकर रहूँगा" यह कथन किसका है?',
        options: ['बाल गंगाधर तिलक', 'लाला लाजपत राय', 'बिपिन चंद्र पाल', 'गोपाल कृष्ण गोखले'],
        correctAnswer: 0,
      },
    ],
  },
  {
    topic: 'भारत का भूगोल एवं नदियाँ (Geography of India & Rivers)',
    slug: 'geography-of-india-and-rivers',
    metaTitle: 'भारत का भूगोल एवं नदियाँ प्रतियोगिता | Quiz-Do',
    metaDescription: 'भारत की नदियाँ, पर्वत, जलवायु एवं भौगोलिक संरचना पर आधारित महत्वपूर्ण बहुविकल्पीय प्रश्न।',
    questions: [
      {
        question: 'भारत की सबसे लंबी नदी कौन सी है?',
        options: ['गंगा नदी', 'गोदावरी नदी', 'ब्रह्मपुत्र नदी', 'सिंधु नदी'],
        correctAnswer: 0,
      },
      {
        question: 'भारत का एकमात्र सक्रिय ज्वालामुखी किस द्वीप पर स्थित है?',
        options: ['बैरन द्वीप', 'नारकोंडम द्वीप', 'अमीनी द्वीप', 'मिनिकॉय द्वीप'],
        correctAnswer: 0,
      },
      {
        question: 'कर्क रेखा भारत के कितने राज्यों से होकर गुजरती है?',
        options: ['8 राज्यों से', '7 राज्यों से', '9 राज्यों से', '6 राज्यों से'],
        correctAnswer: 0,
      },
      {
        question: 'दक्षिण भारत की सबसे ऊंची पर्वत चोटी कौन सी है?',
        options: ['अनाईमुडी (Anaimudi)', 'दोद्दाबेटा (Doddabetta)', 'महेंद्रगिरि', 'कलसुबाई'],
        correctAnswer: 0,
      },
      {
        question: 'भारत और चीन के बीच की अंतरराष्ट्रीय सीमा रेखा को क्या कहा जाता है?',
        options: ['मैकमोहन रेखा', 'रेडक्लिफ रेखा', 'डूरंड रेखा', '24वीं समानांतर रेखा'],
        correctAnswer: 0,
      },
      {
        question: 'काजीरंगा राष्ट्रीय उद्यान किस राज्य में स्थित है और किसके लिए प्रसिद्ध है?',
        options: ['असम (एक सींग वाले गैंडे हेतु)', 'पश्चिम बंगाल (रॉयल बंगाल टाइगर हेतु)', 'मध्य प्रदेश (तेंदुए हेतु)', 'उत्तराखंड (हाथी हेतु)'],
        correctAnswer: 0,
      },
      {
        question: 'भाखड़ा नांगल बहुउद्देशीय परियोजना किस नदी पर निर्मित है?',
        options: ['सतलुज नदी', 'व्यास नदी', 'चिनाब नदी', 'रावी नदी'],
        correctAnswer: 0,
      },
      {
        question: 'सुंदरवन डेल्टा का निर्माण किन प्रमुख नदियों के संगम द्वारा होता है?',
        options: ['गंगा और ब्रह्मपुत्र', 'महानदी और गोदावरी', 'कृष्णा और कावेरी', 'नर्मदा और ताप्ती'],
        correctAnswer: 0,
      },
      {
        question: 'भारत में सर्वाधिक वर्षा किस स्थान पर दर्ज की जाती है?',
        options: ['मासिनराम (मेघालय)', 'चेरापूंजी (मेघालय)', 'अगुम्बे (कर्नाटक)', 'महाबलेश्वर (महाराष्ट्र)'],
        correctAnswer: 0,
      },
      {
        question: 'चिल्का झील किस राज्य में स्थित खारे पानी की सबसे बड़ी लैगून झील है?',
        options: ['ओडिशा', 'आंध्र प्रदेश', 'केरल', 'तमिलनाडु'],
        correctAnswer: 0,
      },
    ],
  },
  {
    topic: 'भारतीय अर्थव्यवस्था एवं सामान्य ज्ञान (Indian Economy & General Knowledge)',
    slug: 'indian-economy-and-general-knowledge',
    metaTitle: 'भारतीय अर्थव्यवस्था एवं सामान्य ज्ञान प्रतियोगिता | Quiz-Do',
    metaDescription: 'रिजर्व बैंक, मौद्रिक नीति, बजट एवं भारतीय अर्थव्यवस्था के मुख्य अवधारणाओं पर आधारित क्विज।',
    questions: [
      {
        question: 'भारतीय रिजर्व बैंक (RBI) की स्थापना किस वर्ष की गई थी?',
        options: ['1 अप्रैल 1935', '1 जनवरी 1949', '15 अगस्त 1947', '26 जनवरी 1950'],
        correctAnswer: 0,
      },
      {
        question: 'भारत में वस्तु एवं सेवा कर (GST) किस तिथि से लागू हुआ था?',
        options: ['1 जुलाई 2017', '1 अप्रैल 2016', '1 जनवरी 2018', '8 नवंबर 2016'],
        correctAnswer: 0,
      },
      {
        question: 'नीति आयोग (NITI Aayog) का पदेन अध्यक्ष कौन होता है?',
        options: ['भारत का प्रधानमंत्री', 'वित्त मंत्री', 'राष्ट्रपति', 'आरबीआई गवर्नर'],
        correctAnswer: 0,
      },
      {
        question: 'भारत में हरित क्रांति का जनक किसे माना जाता है?',
        options: ['एम. एस. स्वामीनाथन', 'वर्गीज कुरियन', 'सैम पित्रोदा', 'होमी जहांगीर भाभा'],
        correctAnswer: 0,
      },
      {
        question: 'मुद्रास्फीति (Inflation) को नियंत्रित करने हेतु रेपो दर का निर्धारण कौन करता है?',
        options: ['मौद्रिक नीति समिति (RBI)', 'वित्त मंत्रालय', 'नीति आयोग', 'सेबी (SEBI)'],
        correctAnswer: 0,
      },
      {
        question: 'भारत की प्रथम पंचवर्षीय योजना (1951-1956) किस मॉडल पर आधारित थी?',
        options: ['हैरोड-डोमर मॉडल', 'पीसी महालनोबिस मॉडल', 'गाडगिल योजना', 'रोलिंग प्लान'],
        correctAnswer: 0,
      },
      {
        question: 'सिक्योरिटीज एंड एक्सचेंज बोर्ड ऑफ इंडिया (SEBI) का मुख्यालय कहाँ स्थित है?',
        options: ['मुंबई', 'नई दिल्ली', 'कोलकाता', 'चेन्नई'],
        correctAnswer: 0,
      },
      {
        question: 'प्रत्यक्ष कर (Direct Tax) का सही उदाहरण निम्नलिखित में से कौन सा है?',
        options: ['आयकर (Income Tax)', 'जीएसटी (GST)', 'सीमा शुल्क (Customs Duty)', 'केंद्रीय उत्पाद शुल्क'],
        correctAnswer: 0,
      },
      {
        question: 'भारत में राष्ट्रीय आय की गणना मुख्य रूप से किस संस्था द्वारा की जाती है?',
        options: ['राष्ट्रीय सांख्यिकी कार्यालय (NSO)', 'नीति आयोग', 'भारतीय रिजर्व बैंक', 'वित्त मंत्रालय'],
        correctAnswer: 0,
      },
      {
        question: 'श्वेत क्रांति (White Revolution) का संबंध भारत में किस उत्पाद के विकास से है?',
        options: ['दूध उत्पादन (दुग्ध क्रांति)', 'मत्स्य उत्पादन', 'अंडा उत्पादन', 'कपास उत्पादन'],
        correctAnswer: 0,
      },
    ],
  },
  {
    topic: 'सामान्य विज्ञान एवं प्रौद्योगिकी (General Science & Technology)',
    slug: 'general-science-and-technology',
    metaTitle: 'सामान्य विज्ञान एवं प्रौद्योगिकी प्रतियोगिता | Quiz-Do',
    metaDescription: 'प्रतियोगी परीक्षाओं में पूछे जाने वाले भौतिक विज्ञान, रसायन एवं जीव विज्ञान के महत्वपूर्ण प्रश्न।',
    questions: [
      {
        question: 'मानव शरीर में रक्त का शुद्धिकरण (रक्त निस्यंदन) किस अंग द्वारा होता है?',
        options: ['वृक्क (किडनी)', 'यकृत (लीवर)', 'हृदय', 'फेफड़े'],
        correctAnswer: 0,
      },
      {
        question: 'सूर्य के प्रकाश से मानव त्वचा में किस विटामिन का संश्लेषण होता है?',
        options: ['विटामिन D', 'विटामिन C', 'विटामिन A', 'विटामिन K'],
        correctAnswer: 0,
      },
      {
        question: 'ध्वनि की तीव्रता मापने की मानक इकाई क्या है?',
        options: ['डेसिबल (Decibel)', 'हर्ट्ज (Hertz)', 'पास्कल (Pascal)', 'ल्यूमेन (Lumen)'],
        correctAnswer: 0,
      },
      {
        question: 'इसरो (ISRO) का मुख्यालय भारत के किस शहर में स्थित है?',
        options: ['बेंगलुरु (कर्नाटक)', 'श्रीहरिकोटा (आंध्र प्रदेश)', 'तिरुवनंतपुरम (केरल)', 'अहमदाबाद (गुजरात)'],
        correctAnswer: 0,
      },
      {
        question: 'विद्युत बल्ब का फिलामेंट किस धातु का बना होता है?',
        options: ['टंगस्टन (Tungsten)', 'नाइक्रोम (Nichrome)', 'तांबा', 'लोहा'],
        correctAnswer: 0,
      },
      {
        question: 'रक्त समूह (Blood Group) की खोज किस वैज्ञानिक ने की थी?',
        options: ['कार्ल लैंडस्टीनर', 'एडवर्ड जेनर', 'अलेक्जेंडर फ्लेमिंग', 'लुई पाश्चर'],
        correctAnswer: 0,
      },
      {
        question: 'जल का अधिकतम घनत्व किस तापमान पर होता है?',
        options: ['4°C पर', '0°C पर', '100°C पर', '-4°C पर'],
        correctAnswer: 0,
      },
      {
        question: 'पौधों में प्रकाश संश्लेषण के दौरान निकलने वाली ऑक्सीजन गैस का मुख्य स्रोत क्या है?',
        options: ['जल (H2O)', 'कार्बन डाइऑक्साइड (CO2)', 'ग्लूकोज', 'क्लोरोफिल'],
        correctAnswer: 0,
      },
      {
        question: 'कंप्यूटर और संचार में "URL" का पूर्ण रूप क्या होता है?',
        options: ['Uniform Resource Locator', 'Universal Resource Link', 'Unified Resource Language', 'Uniform Real-time Locator'],
        correctAnswer: 0,
      },
      {
        question: 'चंद्रयान-3 मिशन के लैंडर मॉड्यूल का नाम क्या था?',
        options: ['विक्रम (Vikram)', 'प्रज्ञान (Pragyan)', 'ध्रुव (Dhruv)', 'आदित्य (Aditya)'],
        correctAnswer: 0,
      },
    ],
  },
];

/**
 * Returns a high-quality fallback contest theme and shuffled questions.
 * Ensures the quiz question count requirement is always satisfied.
 */
export function getFallbackContestData(targetQuestions = 10): FallbackContestTheme {
  const themeIndex = Math.floor(Math.random() * FALLBACK_CONTEST_THEMES.length);
  const selectedTheme = FALLBACK_CONTEST_THEMES[themeIndex];

  // Shuffle questions array
  const shuffledQuestions = [...selectedTheme.questions].sort(() => Math.random() - 0.5);

  const selectedQuestions = shuffledQuestions.slice(0, targetQuestions);

  // If theme has fewer than target, duplicate or cycle
  while (selectedQuestions.length < targetQuestions) {
    const extra = selectedTheme.questions[selectedQuestions.length % selectedTheme.questions.length];
    selectedQuestions.push({ ...extra });
  }

  // Generate unique slug with date/timestamp to prevent unique index collision
  const dateStr = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const uniqueSlug = `${selectedTheme.slug}-${dateStr}-${randomSuffix}`;

  return {
    topic: selectedTheme.topic,
    slug: uniqueSlug,
    metaTitle: selectedTheme.metaTitle,
    metaDescription: selectedTheme.metaDescription,
    questions: selectedQuestions,
  };
}
