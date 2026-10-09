/**
 * Bank PO 2026 (IBPS PO / SBI PO / RRB Scale-I) Complete Syllabus Blueprint
 * 9 Comprehensive Chapters covering Quantitative Aptitude, Reasoning, English,
 * Banking/Financial Awareness, and Computer Aptitude for Prelims & Mains.
 */

export interface BankPoLessonBlueprint {
  title: string;
  order: number;
  durationMinutes: number;
  focusSubtopics: string[];
  examTips: string;
  quizTitle: string;
  questionCount: number;
}

export interface BankPoChapterBlueprint {
  order: number;
  title: string;
  summary: string;
  marks: number;
  lessons: BankPoLessonBlueprint[];
}

export const BANK_PO_EXAM_KEY = 'bank_po_2026';
export const BANK_PO_COURSE_TITLE = 'Bank PO 2026: Complete Preparation Course (बैंक पीओ 2026 संपूर्ण तैयारी)';
export const BANK_PO_COURSE_SLUG = 'bank-po-2026-complete-preparation-course';
export const BANK_PO_COURSE_CATEGORY = 'Banking Exams';

export const BANK_PO_SEO_DATA = {
  metaTitle: 'Bank PO 2026: Complete Preparation Course (बैंक पीओ 2026 संपूर्ण तैयारी)',
  metaDescription:
    'बैंक पीओ 2026 (IBPS PO, SBI PO, RRB Scale-I) की संपूर्ण तैयारी हेतु विस्तृत फ्री कोर्स। इसमें Quantitative Aptitude, Reasoning, English, Banking & Financial Awareness के सभी अध्याय, परीक्षा नोट्स और प्रैक्टिस क्विज़ शामिल हैं।',
  keywords: [
    'bank po 2026',
    'bank po preparation',
    'ibps po 2026 syllabus',
    'sbi po study material',
    'rrb po scale 1 preparation',
    'banking awareness quiz in hindi',
    'quantitative aptitude tricks bank po',
    'reasoning puzzles sbi po',
    'free banking exam course',
    'bank po practice quizzes',
    'banking exams syllabus notes',
  ],
  faq: [
    {
      question: 'क्या यह Bank PO 2026 कोर्स पूरी तरह से निःशुल्क (Free) है?',
      answer:
        'हाँ, Quiz Do पर यह कोर्स 100% निःशुल्क है। इसमें Quantitative Aptitude, Reasoning, English, Banking Awareness तथा Computer Aptitude के सभी अध्याय, नोट्स और क्विज़ शामिल हैं।',
    },
    {
      question: 'क्या यह कोर्स IBPS PO, SBI PO और RRB Scale-I तीनों के लिए उपयोगी है?',
      answer:
        'हाँ, इस कोर्स का पाठ्यक्रम विशेष रूप से IBPS PO, SBI PO, और IBPS RRB Officer Scale-I के प्रीलिम्स और मेन्स दोनों चरणों के नवीनतम पैटर्न के अनुसार तैयार किया गया है।',
    },
    {
      question: 'क्या प्रत्येक पाठ (Lesson) के साथ अभ्यास प्रश्न और क्विज़ दिए गए हैं?',
      answer:
        'हाँ, प्रत्येक पाठ के अंत में परीक्षा मानक के अनुसार 5 से 8 बहुविकल्पीय प्रश्न (MCQ) विस्तृत व्याख्या के साथ उपलब्ध कराए गए हैं।',
    },
    {
      question: 'कोर्स पूरा करने के बाद क्या डिजिटल सर्टिफिकेट मिलेगा?',
      answer:
        'हाँ, सभी अध्यायों को पूरा करने और क्विज़ में उत्तीर्ण होने के बाद आप Quiz Do से वेरिफाइड पूर्णता प्रमाणपत्र (Completion Certificate) प्राप्त कर सकते हैं।',
    },
  ],
};

export const BANK_PO_SYLLABUS_ROADMAP: BankPoChapterBlueprint[] = [
  // 1. Quantitative Aptitude - Arithmetic & Speed Math
  {
    order: 0,
    title: 'Quantitative Aptitude - Arithmetic & Speed Math (मात्रात्मक योग्यता)',
    summary: 'स्पीड मैथ्स, संख्या श्रृंखला, द्विघात समीकरण एवं मूलभूत अंकगणित की अवधारणाएं।',
    marks: 20,
    lessons: [
      {
        title: 'Simplification, Approximation & Vedic Math Tricks (सरलीकरण एवं सन्निकटन)',
        order: 0,
        durationMinutes: 30,
        focusSubtopics: [
          'BODMAS/VBODMAS नियम एवं कोष्ठकों का हल',
          'Square & Cube Tricks (1 से 50 के वर्ग एवं 1 से 30 के घन)',
          'Percentage-to-Fraction Tables (1/1 से 1/20 तक के मान)',
          'Decimals, Surds & Indices का सरलीकरण',
          'Approximation Techniques for Bank Prelims',
        ],
        examTips: 'बैंक प्रीलिम्स में 5 प्रश्न सीधे सरलीकरण/सन्निकटन से आते हैं। फ्रैक्शन वैल्यू याद रखने से 40% समय बचता है।',
        quizTitle: 'Simplification & Approximation - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Number Series: Missing & Wrong Number Series (संख्या श्रृंखला)',
        order: 1,
        durationMinutes: 35,
        focusSubtopics: [
          'Arithmetic Progression (AP) एवं निरंतर अंतर पैटर्न',
          'Geometric Patterns एवं गुणा/भाग आधारित श्रृंखला',
          'Double Difference Pattern (दोहरा अंतर नियम)',
          'Squares, Cubes & Prime Number Series Patterns',
          'Wrong Number Series की पहचान करने की स्टेप-बाय-स्टेप विधि',
        ],
        examTips: 'Wrong Number Series में पहले अंतर (Difference) निकालें; 80% मामलों में पैटर्न वहीं से स्पष्ट हो जाता है।',
        quizTitle: 'Number Series - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Quadratic Equations & Inequalities (द्विघात समीकरण एवं असमानताएं)',
        order: 2,
        durationMinutes: 30,
        focusSubtopics: [
          'द्विघात समीकरण ax² + bx + c = 0 के मूल (Roots) निकालना',
          'Sign Method Trick: बिना गुणनखंड निकाले सीधे चिन्हों से तुलना',
          'x और y के मानों में संबंध (x > y, x < y, x ≥ y, x ≤ y, CND)',
          'Square Root Based Quadratic Equations',
          'High Level Cubic & Two-Variable Linear Equations for Mains',
        ],
        examTips: 'यदि दोनों समीकरणों में अचर पद (Constant c) ऋणात्मक (-) है, तो उत्तर हमेशा "No Relation" (CND) होता है।',
        quizTitle: 'Quadratic Equations - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Percentage, Profit, Loss & Discount (प्रतिशत एवं लाभ-हानि)',
        order: 3,
        durationMinutes: 40,
        focusSubtopics: [
          'Percentage Change & Successive Percentage Formula (a + b + ab/100)',
          'Cost Price (CP), Selling Price (SP) एवं Marked Price (MP) संबंध',
          'Dishonest Shopkeeper (बेईमान दुकानदार) आधारित समस्याएं',
          'Successive Discounts एवं Equivalent Single Discount',
          'Partnership & Profit Sharing Ratios',
        ],
        examTips: 'लाभ और हानि की गणना हमेशा क्रय मूल्य (CP) पर और छूट (Discount) की गणना अंकित मूल्य (MP) पर होती है।',
        quizTitle: 'Percentage & Profit-Loss - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Ratio, Proportion, Mixture & Alligation (अनुपात एवं मिश्रण)',
        order: 4,
        durationMinutes: 35,
        focusSubtopics: [
          'Ratio Comparison & Compound Ratio',
          'Ages Problems (आयु संबंधी अनुपात आधारित प्रश्न)',
          'Rule of Alligation का व्यावहारिक प्रयोग',
          'Replacement Formula: बार-बार दूध/पानी निकालने की प्रक्रिया',
          'Three-Vessel Mixture Problems',
        ],
        examTips: 'Alligation का नियम औसत, लाभ-हानि, साधारण ब्याज और गति सभी में तेजी से उत्तर निकालने के लिए लागू होता है।',
        quizTitle: 'Ratio & Mixture Alligation - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Time & Work, Pipes & Cisterns (समय, कार्य एवं नल-टंकी)',
        order: 5,
        durationMinutes: 35,
        focusSubtopics: [
          'LCM Method to find Total Work Units',
          'Efficiency & Days Inverse Relationship',
          'Wages Distribution based on Efficiency',
          'Alternate Days Work Concept (एकांतर दिनों में कार्य)',
          'Inlet & Outlet Pipes एवं Leakage Problems',
        ],
        examTips: 'कुल कार्य को दिनों का लघुत्तम समापवर्त्य (LCM) मान लें, इससे गणना भिन्न (fraction) से बच जाती है।',
        quizTitle: 'Time, Work & Pipes - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Speed, Time, Distance, Trains & Boats (गति, समय, दूरी एवं नाव-धारा)',
        order: 6,
        durationMinutes: 40,
        focusSubtopics: [
          'km/h से m/s रूपांतरण (x 5/18)',
          'Relative Speed: विपरीत दिशा (s1 + s2) एवं समान दिशा (s1 - s2)',
          'Trains: पोल, प्लेटफॉर्म एवं दूसरी ट्रेन को पार करने का समय',
          'Boats & Streams: Downstream (u + v) एवं Upstream (u - v)',
          'Average Speed Concept for equal distance (2xy / (x + y))',
        ],
        examTips: 'नाव-धारा में शांत जल में नाव की गति = (Downstream + Upstream)/2, धारा की गति = (Downstream - Upstream)/2।',
        quizTitle: 'Speed, Time & Distance - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Simple & Compound Interest, Permutation & Probability (ब्याज एवं प्रायिकता)',
        order: 7,
        durationMinutes: 40,
        focusSubtopics: [
          'SI vs CI Difference Formula for 2 Years and 3 Years',
          'Tree Method / Pascal Triangle for CI Calculation',
          'Compounding Annually, Half-yearly & Quarterly',
          'Permutations & Combinations Basics (nPr and nCr)',
          'Probability: Dice, Coins, Cards and Ball Pick Problems',
        ],
        examTips: '2 वर्ष के लिए CI - SI = P(R/100)²। यह सूत्र बैंक प्रीलिम्स में बार-बार पूछा जाता है।',
        quizTitle: 'Interest & Probability - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 2. Data Interpretation & Data Analysis
  {
    order: 1,
    title: 'Data Interpretation & Analysis (डेटा व्याख्या एवं विश्लेषण)',
    summary: 'तालिका, दंड आरेख, वृत्त आरेख, केसलेट एवं उच्च स्तरीय मेन्स डीआई।',
    marks: 25,
    lessons: [
      {
        title: 'Tabular & Bar Graph Data Interpretation (तालिका एवं बार ग्राफ डीआई)',
        order: 0,
        durationMinutes: 40,
        focusSubtopics: [
          'Reading complex data tables accurately',
          'Single & Double Bar Graphs',
          'Stacked / Sub-divided Bar Graphs',
          'Calculating Percent Increase/Decrease quickly',
          'Ratio based questions in Tabular DI',
        ],
        examTips: 'पूरे मान निकालने से बचें; विकल्पों को देखकर सन्निकटन (Approximation) से गणना करें।',
        quizTitle: 'Tabular & Bar DI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Pie Charts & Line Graphs DI (पाई चार्ट एवं रेखा आरेख)',
        order: 1,
        durationMinutes: 40,
        focusSubtopics: [
          'Single Pie Chart (Percentage based vs Degree based: 360° = 100%)',
          'Dual Pie Charts (Total students vs Enrolled girls)',
          'Single & Multi-line Graphs trend analysis',
          'Income-Expenditure Line Graphs',
          'Combination of Pie Chart with Table',
        ],
        examTips: 'डिग्री को प्रतिशत में बदलने के लिए 1% = 3.6° का सीधा संबंध प्रयोग करें।',
        quizTitle: 'Pie Chart & Line Graph DI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Caselet DI & Paragraph-based DI (केसलेट डीआई)',
        order: 2,
        durationMinutes: 45,
        focusSubtopics: [
          'Decoding raw textual data into structured tables',
          'Venn Diagram based Caselets (2-set and 3-set overlap)',
          'Arithmetic based Caselets (Time-Work, SI-CI data)',
          'Handling unknown variables (x, y) in Caselet text',
          'Time management strategy for Caselets',
        ],
        examTips: 'केसलेट पढ़ते समय साथ-साथ एक खाली टेबल या वेन आरेख बनाते चलें। अंतिम वाक्य का इंतज़ार न करें।',
        quizTitle: 'Caselet DI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Radar, Funnel Charts & Missing DI (उन्नत एवं लुप्त मान डीआई)',
        order: 3,
        durationMinutes: 45,
        focusSubtopics: [
          'Spider / Radar Charts data extraction',
          'Missing DI: लुप्त मानों को दी गई शर्तों से निकालना',
          'Scatter & Bubble plots for Bank PO Mains',
          'Probability & Mensuration based Mains DI',
          'Cumulative Frequency DI',
        ],
        examTips: 'Missing DI में प्रश्नों में दी गई अतिरिक्त जानकारी से टेबल के खाली खानों को क्रमिक रूप से भरें।',
        quizTitle: 'Advanced & Missing DI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Data Sufficiency & Quantity Comparison (आंकड़ों की पर्याप्तता एवं मात्रा तुलना)',
        order: 4,
        durationMinutes: 35,
        focusSubtopics: [
          'Data Sufficiency (DS) Rules: Statement I alone vs Statement II alone',
          'Both Together Necessary vs Neither Sufficient',
          'Quantity 1 vs Quantity 2 (Q1 > Q2, Q1 < Q2, Q1 = Q2)',
          'Arithmetic concept verification in Data Sufficiency',
          'Eliminating calculations: केवल पर्याप्तता जांचना, मान नहीं निकालना',
        ],
        examTips: 'डेटा सफिशिएंसी में पूरा उत्तर निकालने की जरूरत नहीं होती, केवल यह देखना होता है कि उत्तर अद्वितीय (unique) रूप से निकल सकता है या नहीं।',
        quizTitle: 'Data Sufficiency & Quantity Comparison - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 3. Reasoning Ability - Puzzles & Seating Arrangements
  {
    order: 2,
    title: 'Puzzles & Seating Arrangements (बैठक व्यवस्था एवं पहेलियां)',
    summary: 'वृत्ताकार, रैखिक, वर्गाकार व्यवस्थाएं, फ्लोर, बॉक्स एवं शेड्यूलिंग पहेलियां।',
    marks: 25,
    lessons: [
      {
        title: 'Circular & Triangular Seating Arrangements (वृत्ताकार एवं त्रिकोणीय बैठक व्यवस्था)',
        order: 0,
        durationMinutes: 45,
        focusSubtopics: [
          'All Facing Centre (सभी केंद्रोन्मुख)',
          'All Facing Outside (सभी केंद्र से विमुख)',
          'In-Out Mixed Facing (कुछ अंदर, कुछ बाहर देख रहे हों)',
          'Concentric Circles (एक के अंदर दूसरा वृत्त)',
          'Triangular Seating with corners vs edges facing rules',
        ],
        examTips: 'हमेशा दो समानांतर संभावनाएं (Case 1 & Case 2) बनाकर शुरू करें। एक केस स्वतः गलत होकर कट जाएगा।',
        quizTitle: 'Circular Seating - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Linear & Parallel Rows Seating Arrangement (रैखिक एवं समानांतर पंक्ति व्यवस्था)',
        order: 1,
        durationMinutes: 45,
        focusSubtopics: [
          'Single Row: North facing vs South facing',
          'Single Row: Mixed North-South facing direction',
          'Parallel Rows: 10/12/14 persons facing each other',
          'Uncertain Number of Persons in a Single Row (अनिश्चित संख्या)',
          'Linear Seating with single variable (Colors/Ages/Fruits)',
        ],
        examTips: 'अनिश्चित संख्या वाली पंक्ति में निश्चित छोर (Extreme End) या सबसे अधिक गैप वाले क्लू से शुरुआत करें।',
        quizTitle: 'Linear Seating - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Floor, Flat & Box Puzzles (फ्लोर, फ्लैट एवं बॉक्स पहेलियां)',
        order: 2,
        durationMinutes: 45,
        focusSubtopics: [
          'Floor Puzzles: 7, 8, 9 floors numbering bottom to top',
          'Flat & Floor Hybrid (e.g. 4 floors, Flat A to west of Flat B)',
          'Box Stacking Puzzles: एक के ऊपर एक रखे 7-9 बॉक्स',
          'Position relative terms: Immediately above vs Somewhere above',
          'Odd/Even numbered floors placement strategy',
        ],
        examTips: 'Flat-Floor में "East/West" और "Immediately above in same flat" शब्दों को ध्यान से पढ़ें।',
        quizTitle: 'Floor & Box Puzzles - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Scheduling, Day, Month & Year Puzzles (दिन, माह एवं वर्ष पहेलियां)',
        order: 3,
        durationMinutes: 45,
        focusSubtopics: [
          'Monday to Sunday Day-based scheduling',
          'Months & Dates (e.g. March, April, May on 7th and 22nd)',
          'Base Year Calculations (e.g. ages calculated relative to 2026)',
          'Leap year & days count in months (30 vs 31 days rule)',
          'Multi-variable scheduling puzzles with professions/cities',
        ],
        examTips: 'महीनों के दिनों की संख्या (30 या 31) पहले ही लिख लें; कई शर्तें "30 दिन वाले महीने" पर आधारित होती हैं।',
        quizTitle: 'Scheduling & Month Puzzles - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Matrix, Category & Multi-Variable Mains Puzzles (मैट्रिक्स एवं विविध पहेलियां)',
        order: 4,
        durationMinutes: 50,
        focusSubtopics: [
          'Designation & Hierarchy Puzzles (MD, GM, DGM, Manager, Clerk)',
          'Matrix Puzzles: 3 से 4 गुणों का क्रॉस-वेरिफिकेशन',
          'Direction and Distance embedded in Puzzles',
          'Blood relation combined with Seating Arrangement',
          'Elimination of cases and time-budgeting in Mains exam',
        ],
        examTips: 'डेजिग्नेशन पहेली में पदक्रम (Hierarchy) को हमेशा निश्चित आधार (Base) मानकर लिखें।',
        quizTitle: 'Advanced Mains Puzzles - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 4. Logical, Verbal & Analytical Reasoning
  {
    order: 3,
    title: 'Verbal, Logical & Miscellaneous Reasoning (तार्किक एवं विविध तर्कशक्ति)',
    summary: 'न्याय निगमन, असमानताएं, कोडिंग-डिकोडिंग, रक्त संबंध, दिशा एवं विश्लेषणात्मक तर्क।',
    marks: 20,
    lessons: [
      {
        title: 'Syllogism: Only A Few, Possibility & Reverse Syllogism (न्याय निगमन)',
        order: 0,
        durationMinutes: 40,
        focusSubtopics: [
          'Standard Syllogism statements: All, Some, No, Some Not',
          'Modern Patterns: "Only a few" (केवल कुछ ही - Some + Some Not)',
          '"Only A are B" (केवल A ही B हैं = All B are A, no others can be B)',
          'Possibility Rules and Conditionals',
          'Either-Or condition criteria (Complementary pairs)',
        ],
        examTips: '"Only a few A are B" का अर्थ है कि कुछ A, B हैं तथा कुछ A निश्चित रूप से B नहीं हैं।',
        quizTitle: 'Syllogism - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Inequalities: Direct, Coded & Reverse Inequalities (असमानता)',
        order: 1,
        durationMinutes: 30,
        focusSubtopics: [
          'Direct Inequalities: Open Gate vs Closed Gate method',
          'Priority of Signs: > over ≥ over =',
          'Either-Or in Inequalities (A ≥ B and A < B, or equal with unknown relation)',
          'Coded Inequalities: @, #, $, %, * प्रतीकों का डिकोडिंग बॉक्स',
          'Missing signs in equations to satisfy a given conclusion',
        ],
        examTips: 'ओपन गेट (Open Gate) ट्रिक अपनाएं: यदि रास्ता खुला है और कम से कम एक प्राथमिकता चिन्ह है, तो निष्कर्ष सत्य होता है।',
        quizTitle: 'Inequalities - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Coding-Decoding: Chinese & New Pattern Matrix Coding (कोडिंग-डिकोडिंग)',
        order: 2,
        durationMinutes: 35,
        focusSubtopics: [
          'Chinese Coding / Substitution Method (सामान्य शब्दों की तुलना)',
          'New Pattern Symbol-Letter-Number Logic for Mains',
          'Logic Decoders: First letter, last letter, total vowels, consonants count',
          'Binary & Clock-based Coding',
          'Matrix & Conditional Step Coding',
        ],
        examTips: 'न्यू पैटर्न कोडिंग में सबसे पहले शब्दों के अक्षरों की कुल संख्या, पहले/अंतिम अक्षर के विपरीत अक्षर देखें।',
        quizTitle: 'Coding-Decoding - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Blood Relations & Direction-Distance Sense (रक्त संबंध एवं दिशा-दूरी)',
        order: 3,
        durationMinutes: 35,
        focusSubtopics: [
          'Generation Tree Method (+ पुरुष, - महिला, = दंपति, - भाई-बहन)',
          'Coded Blood Relations (P + Q means P is father of Q)',
          'Standard 8 Directions & Angle Rotations (45°, 90°, 180°)',
          'Pythagoras Theorem for shortest distance calculation',
          'Shadow Based Direction Problems (Sunrise vs Sunset rules)',
        ],
        examTips: 'सुबह के समय परछाई पश्चिम में और शाम के समय पूर्व में बनती है। 12 बजे कोई परछाई नहीं बनती।',
        quizTitle: 'Blood Relations & Directions - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Machine Input-Output: Shifting & Number Arranging (मशीन इनपुट-आउटपुट)',
        order: 4,
        durationMinutes: 40,
        focusSubtopics: [
          'Left-Right Shifting Models',
          'Simultaneous Two-End Arrangement',
          'Mathematical Operations on Numbers in Steps (+, -, x, digits sum)',
          'Box & Arrow based New Pattern Input-Output for Mains',
          'Identifying the Final Step (Logic Decryption)',
        ],
        examTips: 'इनपुट के पहले स्टेप और अंतिम स्टेप की तुलना करके समझें कि शब्दों को वर्णमाला क्रम में और संख्याओं को आरोही/अवरोही क्रम में व्यवस्थित किया गया है।',
        quizTitle: 'Machine Input-Output - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Critical & Analytical Reasoning for Mains (विश्लेषणात्मक तर्कशक्ति)',
        order: 5,
        durationMinutes: 40,
        focusSubtopics: [
          'Statement and Assumptions (कथन एवं पूर्वधारणाएं)',
          'Statement and Course of Action (कथन एवं कार्यवाही)',
          'Cause and Effect (कारण एवं प्रभाव)',
          'Strong and Weak Arguments (प्रबल एवं निर्बल तर्क)',
          'Drawing Inferences and Conclusions from Passage',
        ],
        examTips: 'पूर्वधारणा कथन में अंतर्निहित होती है; निजी राय या बाहरी ज्ञान के आधार पर उत्तर न चुनें।',
        quizTitle: 'Critical Reasoning - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 5. English Language - Grammar & Structural Skills
  {
    order: 4,
    title: 'English Language - Grammar & Sentence Structure (अंग्रेजी भाषा - व्याकरण)',
    summary: 'त्रुटि पहचान, वाक्य सुधार, शब्द विनिमय एवं पैरा जंबल्स।',
    marks: 15,
    lessons: [
      {
        title: 'Subject-Verb Agreement & Tense Rules (कर्ता-क्रिया सामंजस्य एवं काल)',
        order: 0,
        durationMinutes: 30,
        focusSubtopics: [
          'Singular vs Plural Subject rules with collective nouns',
          'Rules with "Either...or", "Neither...nor", "Not only...but also"',
          'Rules with "As well as", "Along with", "In addition to"',
          'Conditional Sentences (If + Had + V3, would have + V3)',
          'Present Perfect vs Simple Past distinction in financial contexts',
        ],
        examTips: 'जब दो कर्ता "as well as" से जुड़े हों, तो क्रिया हमेशा पहले कर्ता के अनुसार आती है।',
        quizTitle: 'Subject-Verb Agreement - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'Error Spotting & Sentence Correction (त्रुटि पहचान एवं वाक्य सुधार)',
        order: 1,
        durationMinutes: 35,
        focusSubtopics: [
          'Prepositional Errors (in, at, on, between, among, despite vs in spite of)',
          'Pronoun Cases & Relative Pronouns (who vs whom, which vs that)',
          'Adjectives vs Adverbs usage traps',
          'Inversion of Verbs (Hardly, Scarcely, Seldom, No sooner)',
          'Parallelism in coordinate structures (and, or, but)',
        ],
        examTips: '"Hardly/Scarcely" के साथ "when" और "No sooner" के साथ "than" का प्रयोग होता है (then का नहीं)।',
        quizTitle: 'Error Spotting - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'Word Swap, Misspelled Words & Column Matching (शब्द विनिमय एवं कॉलम मिलान)',
        order: 2,
        durationMinutes: 30,
        focusSubtopics: [
          'Word Swap (4 highlighted words A, B, C, D in a sentence)',
          'Contextual meaning vs Grammatical fit in Word Swap',
          'Commonly confused banking words (Affect vs Effect, Compliment vs Complement)',
          'Match the Columns (Column 1 with Column 2 sentence pairing)',
          'Sentence Connectors & Starters (Although, However, In spite of, Moreover)',
        ],
        examTips: 'Word Swap में पार्ट्स ऑफ स्पीच (Noun, Verb, Adjective) की स्थिति देखकर सही विकल्प तुरंत पहचाना जा सकता है।',
        quizTitle: 'Word Swap & Column Match - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'Para Jumbles & Sentence Rearrangement (पैरा जंबल्स एवं वाक्य पुनर्व्यवस्था)',
        order: 3,
        durationMinutes: 35,
        focusSubtopics: [
          'Identifying the Independent Opening Sentence',
          'Mandatory Pairs using Pronouns, Acronyms and Full Names',
          'Chronological and Cause-Effect sequence clues',
          'Odd Sentence Out (Find the sentence that does not fit the theme)',
          'Sentence Rearrangement with fixed first or last sentence',
        ],
        examTips: 'शुरुआती वाक्य कभी भी सर्वनाम (He, She, It, They) या संयोजक (However, But, Therefore) से शुरू नहीं होता।',
        quizTitle: 'Para Jumbles - Practice Quiz',
        questionCount: 8,
      },
    ],
  },

  // 6. English Language - Comprehension & Vocabulary
  {
    order: 5,
    title: 'English Language - Comprehension & Vocabulary (रीडिंग एवं वोकैबुलरी)',
    summary: 'रीडिंग कॉम्प्रिहेंशन, क्लोज़ टेस्ट, फिलर्स एवं उच्च स्तरीय शब्दावली।',
    marks: 15,
    lessons: [
      {
        title: 'Reading Comprehension Strategies (रीडिंग कॉम्प्रिहेंशन रणनीति)',
        order: 0,
        durationMinutes: 40,
        focusSubtopics: [
          'Skimming & Scanning economic and editorial passages',
          'Tone of the Passage (Critical, Objective, Sarcastic, Informative)',
          'Central Theme & Title selection strategies',
          'Direct Fact-based questions vs Inference-based questions',
          'Contextual Synonyms and Antonyms within the passage',
        ],
        examTips: 'पहले प्रश्नों के कीवर्ड्स (Keywords) पढ़ें, फिर पैसेज स्कैन करें; इससे उत्तर बहुत जल्दी मिलते हैं।',
        quizTitle: 'Reading Comprehension - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'Cloze Test: Single & Multi-Blank Passages (क्लोज़ टेस्ट)',
        order: 1,
        durationMinutes: 35,
        focusSubtopics: [
          'Standard 5-to-10 blank Cloze Test passage solving technique',
          'Tone analysis of the paragraph before picking options',
          'Collocations & Preposition combinations (e.g. prone to, capable of)',
          'New pattern Cloze Test with replaceable words',
          'Eliminating out-of-context vocabulary choices',
        ],
        examTips: 'रिक्त स्थान से ठीक पहले और ठीक बाद के शब्दों को देखकर उपयुक्त Preposition या Grammar form तय करें।',
        quizTitle: 'Cloze Test - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'Fill in the Blanks: Single, Double & Triple Fillers (रिक्त स्थान पूर्ति)',
        order: 2,
        durationMinutes: 30,
        focusSubtopics: [
          'Single Fillers testing advanced banking vocabulary',
          'Double Fillers: Positive vs Negative sentiment words pairing',
          'Sentence Completion using Transitional Words',
          'Phrasal Verbs in blanks (Look into, Put off, Call upon, Break down)',
          'Idioms and Phrases context fitting',
        ],
        examTips: 'Double Fillers में यदि एक शब्द का अर्थ नहीं भी आता, तो दूसरे शब्द के फिट होने से 3 विकल्प बाहर हो जाते हैं।',
        quizTitle: 'Fill in the Blanks - Practice Quiz',
        questionCount: 8,
      },
      {
        title: 'High-Yield Editorial Vocabulary & Idioms (बैंकिंग संपादकीय वोकैबुलरी)',
        order: 3,
        durationMinutes: 35,
        focusSubtopics: [
          'The Hindu & Indian Express banking editorial roots (Greco-Latin roots)',
          'Top 100 Financial and Economic Terms (Fiscal, Monetary, Deficit, Liquidity)',
          'Frequently tested Phrasal Verbs in IBPS & SBI PO',
          'Common Idioms with financial undertones (Cut corners, In the red, Bull & Bear)',
          'Mnemonics and Spaced Repetition for lasting retention',
        ],
        examTips: 'रूट वर्ड्स (जैसे Cred = विश्वास, Mal = बुरा, Bene = अच्छा) से अनजान शब्दों का भाव तुरंत समझा जा सकता है।',
        quizTitle: 'High-Yield Vocabulary - Practice Quiz',
        questionCount: 8,
      },
    ],
  },

  // 7. Banking & Financial Awareness
  {
    order: 6,
    title: 'Banking & Financial Awareness (बैंकिंग एवं वित्तीय जागरूकता)',
    summary: 'आरबीआई, मौद्रिक नीति, भारतीय बैंकिंग इतिहास, एनपीए, डिजिटल बैंकिंग एवं बेसल मानक।',
    marks: 25,
    lessons: [
      {
        title: 'Reserve Bank of India (RBI) & Monetary Policy (आरबीआई एवं मौद्रिक नीति)',
        order: 0,
        durationMinutes: 35,
        focusSubtopics: [
          'RBI Act 1934, स्थापना (1 अप्रैल 1935), हिल्टन यंग कमीशन एवं राष्ट्रीयकरण (1949)',
          'Monetary Policy Committee (MPC): 6 सदस्य, संरचना एवं बैठकें',
          'Quantitative Tools: Repo Rate, Reverse Repo, SDF, MSF, Bank Rate',
          'Reserve Ratios: Cash Reserve Ratio (CRR) एवं Statutory Liquidity Ratio (SLR)',
          'Qualitative Tools: Margin Requirement, Moral Suasion, Credit Rationing',
        ],
        examTips: 'SDF (Standing Deposit Facility) बिना किसी कोलैटरल के अतिरिक्त लिक्विडिटी सोखने का RBI का उपकरण है।',
        quizTitle: 'RBI & Monetary Policy - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Indian Banking System & Nationalization History (भारतीय बैंकिंग प्रणाली)',
        order: 1,
        durationMinutes: 35,
        focusSubtopics: [
          'बैंक राष्ट्रीयकरण: 1969 में 14 बैंक एवं 1980 में 6 बैंक',
          'Scheduled Commercial Banks (Public, Private, Foreign Banks)',
          'Regional Rural Banks (RRBs): नरसिम्हम समिति, 1975 स्थापना, शेयरधारिता (50:15:35)',
          'Small Finance Banks (SFBs) & Payments Banks: दिशानिर्देश, पूंजी आवश्यकता (₹200 करोड़ / ₹100 करोड़)',
          'Cooperative Banks एवं DICGC (जमा बीमा कवर: ₹5 लाख प्रति खाताधारक)',
        ],
        examTips: 'पेमेंट्स बैंक ऋण (Loans) और क्रेडिट कार्ड जारी नहीं कर सकते, केवल जमा (अधिकतम ₹2 लाख) स्वीकार कर सकते हैं।',
        quizTitle: 'Banking System Structure - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Bank Accounts, Negotiable Instruments & Cheques (खाते एवं परक्राम्य लिखत)',
        order: 2,
        durationMinutes: 30,
        focusSubtopics: [
          'CASA (Current & Savings Account) vs Time Deposits (FD, RD)',
          'BSBD Accounts (जन धन खाते) एवं ओवरड्राफ्ट सुविधा (₹10,000)',
          'Negotiable Instruments Act 1881: Cheques, Promissory Notes, Bills of Exchange',
          'Cheque Truncation System (CTS-2010) एवं Positive Pay System',
          'Types of Cheques: Bearer, Order, Crossed, Stale, Post-Dated',
        ],
        examTips: 'चेक की वैधता जारी होने की तिथि से 3 माह होती है; पॉजिटिव पे सिस्टम ₹50,000 से अधिक के चेक पर लागू है।',
        quizTitle: 'Accounts & Cheques - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'NPA Management, SARFAESI Act & IBC 2016 (एनपीए एवं ऋण वसूली)',
        order: 3,
        durationMinutes: 35,
        focusSubtopics: [
          'NPA परिभाषा: 90 दिन का ओवरड्यू नियम (कृषि ऋण: 1 या 2 फसल सत्र)',
          'NPA वर्गीकरण: Sub-standard (≤ 12 माह), Doubtful (> 12 माह), Loss Assets',
          'SARFAESI Act 2002: बिना न्यायालय के संपत्ति जब्ती का अधिकार',
          'Insolvency and Bankruptcy Code (IBC 2016) एवं NCLT',
          'NARCL (Bad Bank), IDRCL एवं प्रॉम्प्ट करेक्टिव एक्शन (PCA) फ्रेमवर्क',
        ],
        examTips: 'SMA-0 (1-30 दिन), SMA-1 (31-60 दिन), SMA-2 (61-90 दिन) स्पेशल मेंशन अकाउंट्स के चरण हैं।',
        quizTitle: 'NPA & SARFAESI Act - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Digital Banking, UPI, NPCI & Payment Systems (डिजिटल भुगतान प्रणालियां)',
        order: 4,
        durationMinutes: 35,
        focusSubtopics: [
          'National Payments Corporation of India (NPCI) एवं उत्पाद',
          'NEFT (24x7 बैच आधारित) vs RTGS (न्यूनतम ₹2 लाख, रियल टाइम)',
          'UPI (Unified Payments Interface), UPI 123Pay, UPI Lite, RuPay',
          'IMPS, NACH, AePS (Aadhaar-enabled Payment System), BBPS',
          'Central Bank Digital Currency (CBDC - e₹) एवं रिटेल/होलसेल पायलट',
        ],
        examTips: 'RTGS के लिए न्यूनतम सीमा ₹2 लाख है, जबकि NEFT के लिए कोई न्यूनतम या अधिकतम सीमा नहीं है।',
        quizTitle: 'Digital Banking & NPCI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Priority Sector Lending (PSL) & Basel Accords (पीएसएल एवं बेसल मानक)',
        order: 5,
        durationMinutes: 35,
        focusSubtopics: [
          'PSL Target: कुल ANBC का 40% (घरेलू बैंक) एवं 75% (RRBs/SFBs)',
          'PSL 8 श्रेणियां: कृषि, MSME, निर्यात ऋण, शिक्षा, आवास, सामाजिक अवसंरचना, नवीकरणीय ऊर्जा, अन्य',
          'Basel I, Basel II, Basel III Norms एवं Bank for International Settlements (BIS)',
          'Capital Adequacy Ratio (CAR/CRAR) - न्यूनतम 9% (भारत में 11.5% CCB सहित)',
          'Three Pillars of Basel: Minimum Capital, Supervisory Review, Market Discipline',
        ],
        examTips: 'भारत में वाणिज्यिक बैंकों के लिए न्यूनतम CRAR 9% है और 2.5% कैपिटल कंजर्वेशन बफर (CCB) जोड़कर 11.5% है।',
        quizTitle: 'PSL & Basel Norms - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 8. Economic Awareness, Budget & General Knowledge
  {
    order: 7,
    title: 'Economic Awareness & Financial Markets (आर्थिक जागरूकता एवं वित्तीय बाजार)',
    summary: 'मुद्रा बाजार, पूंजी बाजार, केंद्रीय बजट, राष्ट्रीय आय, मुद्रास्फीति एवं प्रमुख संस्थान।',
    marks: 20,
    lessons: [
      {
        title: 'Money Market vs Capital Market & SEBI (मुद्रा एवं पूंजी बाजार)',
        order: 0,
        durationMinutes: 35,
        focusSubtopics: [
          'Money Market Instruments: Treasury Bills (T-Bills: 91, 182, 364 दिन), Commercial Paper, Certificate of Deposit, Call/Notice Money',
          'Capital Market: Primary Market (IPO, FPO) vs Secondary Market (Stock Exchanges)',
          'SEBI (स्थापना 1988, वैधानिक दर्जा 1992): कार्य, संरचना एवं नियमन',
          'BSE (Sensex: 30 कंपनियां) एवं NSE (Nifty 50)',
          'Mutual Funds, SIPs, Demat Accounts एवं ASBA प्रक्रिया',
        ],
        examTips: 'T-Bills केवल केंद्र सरकार जारी करती है (राज्य सरकारें नहीं) और ये शून्य कूपन दर पर छूट पर जारी होते हैं।',
        quizTitle: 'Financial Markets & SEBI - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Inflation, GDP & National Income (मुद्रास्फीति एवं राष्ट्रीय आय)',
        order: 1,
        durationMinutes: 35,
        focusSubtopics: [
          'GDP, GNP, NNP एवं Per Capita Income की गणना विधियां',
          'Headline Inflation vs Core Inflation (खाद्य एवं ऊर्जा निकाल कर)',
          'Consumer Price Index (CPI) - RBI का मुख्य मुद्रास्फीति पैमाना (लक्ष्य 4% ± 2%)',
          'Wholesale Price Index (WPI) - आधार वर्ष 2011-12',
          'Deflation, Stagflation एवं Recession की अवधारणाएं',
        ],
        examTips: 'RBI मौद्रिक नीति तय करने के लिए संयुक्त CPI (CPI Combined) मुद्रास्फीति दर का उपयोग करता है।',
        quizTitle: 'Inflation & National Income - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Union Budget, Taxation & Government Financial Schemes (केंद्रीय बजट एवं योजनाएं)',
        order: 2,
        durationMinutes: 35,
        focusSubtopics: [
          'अनुच्छेद 112: वार्षिक वित्तीय विवरण (Annual Financial Statement)',
          'Revenue Deficit, Fiscal Deficit (राजकोषीय घाटा), Primary Deficit',
          'Direct Taxes (Income Tax, Corporate Tax) vs Indirect Taxes (GST)',
          'PM Jan Dhan Yojana, PM Jeevan Jyoti Bima, PM Suraksha Bima, Atal Pension Yojana',
          'PM SVANidhi, Mudra Yojana (शिशु, किशोर, तरुण श्रेणियां)',
        ],
        examTips: 'मुद्रा योजना में ऋण सीमा: शिशु (₹50,000 तक), किशोर (₹50,000 से ₹5 लाख), तरुण (₹5 लाख से ₹10 लाख/₹20 लाख)।',
        quizTitle: 'Union Budget & Schemes - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'International Financial Organizations: IMF, World Bank, ADB, NDB (अंतरराष्ट्रीय वित्तीय संस्थाएं)',
        order: 3,
        durationMinutes: 30,
        focusSubtopics: [
          'अंतरराष्ट्रीय मुद्रा कोष (IMF): वाशिंगटन डीसी, SDR (स्पेशल ड्रॉइंग राइट्स बास्केट)',
          'विश्व बैंक समूह (World Bank - IBRD, IDA, IFC, MIGA, ICSID)',
          'एशियाई विकास बैंक (ADB) - मनीला (फिलीपींस)',
          'न्यू डेवलपमेंट बैंक (NDB - BRICS बैंक) - शंघाई (चीन)',
          'एशियन इंफ्रास्ट्रक्चर इन्वेस्टमेंट बैंक (AIIB) - बीजिंग (चीन)',
        ],
        examTips: 'SDR बास्केट में 5 मुद्राएं शामिल हैं: US Dollar, Euro, Chinese Yuan, Japanese Yen, British Pound।',
        quizTitle: 'International Organizations - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },

  // 9. Computer Aptitude & Digital Awareness
  {
    order: 8,
    title: 'Computer Aptitude & Digital Awareness (कंप्यूटर अभिरुचि एवं डिजिटल प्रणाली)',
    summary: 'हार्डवेयर, सॉफ्टवेयर, नेटवर्किंग, डेटाबेस, एमएस ऑफिस एवं साइबर सुरक्षा।',
    marks: 15,
    lessons: [
      {
        title: 'Computer Hardware, Operating Systems & Architecture (हार्डवेयर एवं ऑपरेटिंग सिस्टम)',
        order: 0,
        durationMinutes: 30,
        focusSubtopics: [
          'CPU Architecture (ALU, CU, Registers, Cache Memory)',
          'Primary Memory (RAM, ROM: PROM, EPROM, EEPROM) vs Secondary (SSD, HDD)',
          'Memory Units: Bit, Byte, KB, MB, GB, TB, PB (1 Byte = 8 Bits, 1 Nibble = 4 Bits)',
          'Operating Systems types: Windows, Linux, macOS, Android (Kernel vs Shell)',
          'Input and Output Devices (OCR, OMR, MICR: 9 digits banking code)',
        ],
        examTips: 'MICR कोड में कुल 9 अंक होते हैं: पहले 3 शहर, बीच के 3 बैंक और अंतिम 3 शाखा कोड दर्शाते हैं।',
        quizTitle: 'Computer Hardware & Architecture - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Networking, Internet & Network Security Protocols (नेटवर्किंग एवं प्रोटोकॉल)',
        order: 1,
        durationMinutes: 30,
        focusSubtopics: [
          'Network Topologies: Star, Bus, Ring, Mesh, Tree, Hybrid',
          'OSI 7 Layer Model (Physical, Data Link, Network, Transport, Session, Presentation, Application)',
          'TCP/IP Protocols: HTTP, HTTPS, FTP, SMTP, POP3, DNS, DHCP',
          'IP Addressing: IPv4 (32 bits) vs IPv6 (128 bits), MAC Address (48 bits)',
          'LAN, MAN, WAN, PAN एवं Cloud Computing Basics',
        ],
        examTips: 'IPv4 का आकार 32 बिट और IPv6 का आकार 128 बिट होता है; HTTPS में पोर्ट 443 और HTTP में पोर्ट 80 का प्रयोग होता है।',
        quizTitle: 'Networking & Protocols - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'DBMS, Microsoft Office & Shortcut Keys (डेटाबेस एवं एमएस ऑफिस)',
        order: 2,
        durationMinutes: 30,
        focusSubtopics: [
          'Relational DBMS (RDBMS) Concepts: Tables, Tuples, Primary Key, Foreign Key',
          'SQL Basics: DDL (CREATE, ALTER), DML (SELECT, INSERT, UPDATE, DELETE)',
          'MS Excel Formulas: SUM, AVERAGE, VLOOKUP, IF, Cell Referencing ($A$1)',
          'Essential Windows & MS Office Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+K, F5, Alt+Tab)',
          'File Extensions: .docx, .xlsx, .pdf, .csv, .db',
        ],
        examTips: 'Ctrl + K का उपयोग हाइपरलिंक इंसर्ट करने के लिए और F5 का उपयोग स्लाइड शो / रिफ्रेश के लिए किया जाता है।',
        quizTitle: 'DBMS & MS Office - अभ्यास प्रश्न',
        questionCount: 8,
      },
      {
        title: 'Cyber Security, Malware & Digital Banking Safety (साइबर सुरक्षा एवं मैलवेयर)',
        order: 3,
        durationMinutes: 30,
        focusSubtopics: [
          'Types of Malware: Virus, Worm, Trojan Horse, Ransomware, Spyware, Keylogger',
          'Phishing, Vishing, Smishing, Spoofing एवं Man-in-the-Middle Attacks',
          'Encryption & Cryptography: Symmetric vs Asymmetric (Public/Private Key)',
          'Two-Factor Authentication (2FA), OTP, Biometrics in Banking',
          'Firewalls, Antivirus एवं CERT-In (Computer Emergency Response Team India)',
        ],
        examTips: 'Worm स्वयं को बिना किसी होस्ट फाइल के स्वतंत्र रूप से नेटवर्क पर दोहरा (replicate) सकता है, जबकि Virus को होस्ट प्रोग्राम की आवश्यकता होती है।',
        quizTitle: 'Cyber Security & Banking Safety - अभ्यास प्रश्न',
        questionCount: 8,
      },
    ],
  },
];
