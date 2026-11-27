import type { SeoToolGuide } from './types';

export const UPTET_GUIDE: SeoToolGuide = {
  interactiveMode: 'quiz',
  interactiveTitle: 'Try a Free UPTET Practice Mini-Test (No Sign-Up Needed)',
  interactiveSubtitle:
    'Test your readiness on real UPTET Paper 1 & Paper 2 topics—Child Development, Environmental Studies, Hindi, and Mathematics—with instant answer explanations.',
  quickAnswerHeading: 'UPTET Exam Quick Overview (Key Facts)',
  quickAnswer:
    'The Uttar Pradesh Teacher Eligibility Test (UPTET) is a state-level qualifying exam conducted by UPBEB for primary (Classes 1–5, Paper 1) and upper-primary (Classes 6–8, Paper 2) teaching posts. Each paper has 150 multiple-choice questions for 150 marks, lasts 150 minutes, and carries zero negative marking. General category candidates need 60% (90/150) and reserved categories need 55% (82/150) to qualify.',
  keyFacts: [
    { label: 'Total Questions', value: '150 MCQs per Paper' },
    { label: 'Duration', value: '150 Minutes (2.5 hrs)' },
    { label: 'Negative Marking', value: 'None (0 marks deducted)' },
    { label: 'Qualifying Score', value: '90/150 (Gen) • 82/150 (SC/ST/OBC)' },
  ],
  table: {
    heading: 'UPTET Paper 1 Subject-Wise Exam Blueprint',
    caption: 'Standard 150-question structure for Primary Teacher Eligibility (Classes 1–5)',
    headers: ['Section', 'Questions', 'Marks', 'High-Yield Topics'],
    rows: [
      ['Child Development & Pedagogy (CDP)', '30', '30', 'Piaget, Vygotsky, Kohlberg, Inclusive Education, Learning Theories'],
      ['Language I (Hindi)', '30', '30', 'Unseen Passage, Sandhi, Samas, Alankar, Hindi Pedagogy'],
      ['Language II (English / Urdu / Sanskrit)', '30', '30', 'Comprehension, Parts of Speech, Active-Passive, Language Acquisition'],
      ['Mathematics', '30', '30', 'Number System, LCM/HCF, Geometry, Mensuration, Math Pedagogy'],
      ['Environmental Studies (EVS)', '30', '30', 'Indian Polity Basics, Ecology, UP Geography, Food & Nutrition'],
    ],
  },
  sections: [
    {
      heading: 'How to Score 115+ in UPTET Using Timed Practice Quizzes',
      paragraphs: [
        'Unlike CTET, which emphasizes long scenario-based pedagogy stems, UPTET balances factual recall with core developmental psychology and NCERT/SCERT fundamentals. Candidates who practice full 30-question sectional drills under a 25-minute timer consistently improve accuracy by 15–20% over passive reading.',
        'Because UPTET has no negative marking, leaving questions unanswered directly reduces your probability of crossing the 90-mark threshold. Regular timed quizzes build the pacing needed to finish all 150 items with 15 minutes left to review flagged questions.',
      ],
      bullets: [
        'Revise SCERT Uttar Pradesh Books (Classes 3–8) alongside NCERT summaries for EVS and Science.',
        'Maintain a dedicated mistake log for developmental theorists (Piaget stages, Thorndike laws, Erikson crises).',
        'Solve at least 10 previous-year papers in exam conditions before sitting the real test.',
      ],
    },
    {
      heading: 'Common Mistakes UPTET Aspirants Should Avoid',
      paragraphs: [
        'Many aspirants spend over 45 minutes on Mathematics calculations, forcing rushed guesses in Language II and EVS. Practicing sectional timers trains you to skip time-heavy arithmetic problems on the first pass and secure fast, high-certainty marks in CDP and EVS first.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'uptet-1',
      subject: 'Child Development & Pedagogy',
      question: 'According to Jean Piaget, during which stage of cognitive development does a child develop object permanence?',
      options: ['Pre-operational stage', 'Sensorimotor stage', 'Concrete operational stage', 'Formal operational stage'],
      correctIndex: 1,
      explanation: 'Object permanence—the understanding that objects continue to exist even when out of sight—develops during the Sensorimotor stage (birth to ~2 years).',
    },
    {
      id: 'uptet-2',
      subject: 'Environmental Studies',
      question: 'Which constitutional amendment added Fundamental Duties to the Constitution of India?',
      options: ['42nd Amendment Act, 1976', '44th Amendment Act, 1978', '73rd Amendment Act, 1992', '86th Amendment Act, 2002'],
      correctIndex: 0,
      explanation: 'The 42nd Constitutional Amendment Act (1976) inserted Part IV-A (Article 51A) containing Fundamental Duties based on the Swaran Singh Committee recommendations.',
    },
    {
      id: 'uptet-3',
      subject: 'Child Development & Pedagogy',
      question: 'The concept of the Zone of Proximal Development (ZPD) was introduced by which psychologist?',
      options: ['B. F. Skinner', 'Lev Vygotsky', 'Albert Bandura', 'Edward Thorndike'],
      correctIndex: 1,
      explanation: 'Lev Vygotsky defined ZPD as the gap between what a learner can do independently and what they can achieve with guided scaffolding.',
    },
    {
      id: 'uptet-4',
      subject: 'Environmental Studies',
      question: 'Dudhwa National Park, a major tiger reserve in Uttar Pradesh, is located in which district?',
      options: ['Lakhimpur Kheri', 'Varanasi', 'Sonbhadra', 'Agra'],
      correctIndex: 0,
      explanation: 'Dudhwa National Park is situated in the Terai belt of Lakhimpur Kheri district in Uttar Pradesh and is famous for swamp deer (barasingha) and tigers.',
    },
    {
      id: 'uptet-5',
      subject: 'Mathematics',
      question: 'What is the sum of the interior angles of a regular hexagon?',
      options: ['540°', '600°', '720°', '900°'],
      correctIndex: 2,
      explanation: 'The sum of interior angles of an n-sided polygon is (n − 2) × 180°. For a hexagon (n = 6), (6 − 2) × 180° = 720°.',
    },
  ],
};

export const CTET_GUIDE: SeoToolGuide = {
  interactiveMode: 'quiz',
  interactiveTitle: 'Try a Free CTET Pedagogy & Subject Mini-Test',
  interactiveSubtitle:
    'Practice CBSE CTET scenario-based pedagogy, NCF 2005, NEP 2020, and NCERT concept questions with instant explanations.',
  quickAnswerHeading: 'CTET Exam Quick Overview (Key Facts)',
  quickAnswer:
    'The Central Teacher Eligibility Test (CTET) is conducted by CBSE for teaching appointments in Central Government schools (KVS, NVS, Central Tibetan Schools) and participating state/private schools. Both Paper I (Classes 1–5) and Paper II (Classes 6–8) contain 150 MCQs worth 1 mark each, completed in 150 minutes with no negative marking. CTET certificates carry lifetime validity.',
  keyFacts: [
    { label: 'Conducting Body', value: 'CBSE (Central Board)' },
    { label: 'Questions & Marks', value: '150 MCQs • 150 Marks' },
    { label: 'Negative Marking', value: 'None' },
    { label: 'Certificate Validity', value: 'Lifetime' },
  ],
  table: {
    heading: 'CTET Paper I vs Paper II Structure Comparison',
    caption: 'Pedagogy contributes roughly 50% of total marks across both papers',
    headers: ['Parameter', 'Paper I (Classes 1–5)', 'Paper II (Classes 6–8)'],
    rows: [
      ['Child Development & Pedagogy', '30 Qs (30 Marks)', '30 Qs (30 Marks)'],
      ['Language I & Language II', '30 + 30 Qs (60 Marks)', '30 + 30 Qs (60 Marks)'],
      ['Core Subject Area', 'Math (30) + EVS (30)', 'Math & Science (60) OR Social Studies (60)'],
      ['Primary Syllabus Source', 'NCERT Classes 1–5 + NCF 2005', 'NCERT Classes 6–8 + NEP 2020'],
    ],
  },
  sections: [
    {
      heading: 'Why Pedagogy Strategy Decides Your CTET Score',
      paragraphs: [
        'In CTET, approximately 75 to 90 out of 150 questions test classroom pedagogy—how a teacher responds to diverse learners, errors, multilingual classrooms, and formative assessment. Eliminating rigid, rote-memorization, or punitive options immediately narrows most CTET stems down to the child-centered constructivist answer.',
      ],
      bullets: [
        'Favor options promoting active inquiry, inclusive classrooms, peer collaboration, and formative feedback.',
        'Avoid options emphasizing rote drills, labeling/segregating students, or standardized punishment.',
        'Practice reading long assertion-reason stems cleanly within 45–50 seconds per question.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'ctet-1',
      subject: 'Child Development & Pedagogy',
      question: 'According to NEP 2020, what is the recommended new curricular and pedagogical structure for school education in India?',
      options: ['10 + 2 structure', '5 + 3 + 3 + 4 structure', '6 + 4 + 2 structure', '4 + 4 + 4 + 3 structure'],
      correctIndex: 1,
      explanation: 'NEP 2020 replaces the 10+2 system with the 5+3+3+4 structure covering Foundational (5), Preparatory (3), Middle (3), and Secondary (4) stages.',
    },
    {
      id: 'ctet-2',
      subject: 'Inclusive Education',
      question: 'How should a teacher view students’ errors in a constructivist classroom?',
      options: [
        'As signs of carelessness requiring extra homework',
        'As windows into students’ thinking processes and learning gaps',
        'As reasons to group low-scoring students separately',
        'As failures of memorization',
      ],
      correctIndex: 1,
      explanation: 'In constructivist pedagogy (NCF 2005), errors are valuable diagnostic indicators showing how learners currently conceptualize a topic.',
    },
    {
      id: 'ctet-3',
      subject: 'Language Pedagogy',
      question: 'Multilingualism in a primary classroom should be viewed by a teacher as:',
      options: ['A barrier to learning English', 'A rich pedagogical resource for learning', 'A source of confusion to be discouraged', 'Irrelevant to language acquisition'],
      correctIndex: 1,
      explanation: 'NCF 2005 and NEP 2020 emphasize multilingualism as a cognitive asset and classroom resource that strengthens comprehension and metalinguistic awareness.',
    },
    {
      id: 'ctet-4',
      subject: 'Assessment',
      question: 'Which of the following best describes "Assessment for Learning"?',
      options: [
        'Final year-end board grading',
        'Ongoing formative feedback used to adjust teaching and support student progress',
        'Ranking students strictly on percentile scores',
        'Comparing schools against state averages',
      ],
      correctIndex: 1,
      explanation: 'Assessment for Learning (formative assessment) happens continuously during instruction to diagnose gaps and guide next learning steps.',
    },
    {
      id: 'ctet-5',
      subject: 'EVS Pedagogy',
      question: 'At the primary level (Classes 3–5), EVS integrates concepts from which disciplines?',
      options: [
        'Physics and Chemistry only',
        'Science, Social Studies, and Environmental Education',
        'History and Civics only',
        'Geography and Economics only',
      ],
      correctIndex: 1,
      explanation: 'NCERT designed primary EVS as an integrated subject blending Science, Social Studies, and Environmental Education around everyday themes.',
    },
  ],
};

export const PAT_GUIDE: SeoToolGuide = {
  interactiveMode: 'quiz',
  interactiveTitle: 'Try a Free PAT 2026 Practice Mini-Test',
  interactiveSubtitle:
    'Attempt high-yield Pre-Agriculture Test (PAT) MCQs covering Agriculture Science, Biology, Physics, and Chemistry with instant explanations.',
  quickAnswerHeading: 'PAT Exam 2026 Quick Overview (Key Facts)',
  quickAnswer:
    'The Pre-Agriculture Test (PAT) is an undergraduate state entrance exam (notably MP ESB PAT and CG PAT) for admission to B.Sc. (Hons.) Agriculture, B.Sc. Horticulture, B.Sc. Forestry, and B.Tech. Agricultural Engineering programs. The exam typically consists of 200 objective MCQs (200 marks) completed in 3 hours with no negative marking.',
  keyFacts: [
    { label: 'Total Questions', value: '200 Objective MCQs' },
    { label: 'Duration', value: '180 Minutes (3 Hours)' },
    { label: 'Streams Available', value: 'PCM • PCB • Agriculture (ABC)' },
    { label: 'Marking Scheme', value: '+1 per correct • No negative marking' },
  ],
  table: {
    heading: 'PAT 2026 Subject Group & Marks Distribution',
    caption: 'Typical 200-mark paper breakdown across Agriculture and Science groups',
    headers: ['Stream Option', 'Subjects Tested', 'Marks Split', 'Core Focus Areas'],
    rows: [
      ['Agriculture Group (Ag-1,2,3)', 'Elements of Science & Math + Crop Production + Animal Husbandry', '100 + 50 + 50', 'Soil Science, Irrigation, Kharif/Rabi Crops, Dairy Breeds'],
      ['Science Group (PCB)', 'Physics + Chemistry + Biology', '50 + 50 + 100', 'Plant Physiology, Genetics, Organic Chemistry, Optics'],
      ['Science Group (PCM)', 'Physics + Chemistry + Mathematics', '50 + 50 + 100', 'Calculus, Vectors, Thermodynamics, Electrochemistry'],
    ],
  },
  sections: [
    {
      heading: '90-Day PAT 2026 Test Series Preparation Roadmap',
      paragraphs: [
        'Scoring 145+ out of 200 in PAT opens top government agricultural universities such as JNKVV Jabalpur and RVSKVV Gwalior. Because the syllabus mirrors Class 11 and 12 NCERT/State Board curricula, consistent chapter-wise mock testing beats unfocused textbook rereading.',
      ],
      bullets: [
        'Weeks 1–6: Complete 1 chapter-wise 25-MCQ quiz per subject daily and review every explanation.',
        'Weeks 7–10: Switch to sectional 50-question drills focused on Soil Science, Plant Breeding, and Genetics.',
        'Weeks 11–12: Take 2 full-length 200-question simulated mocks per week to master 3-hour stamina.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'pat-1',
      subject: 'Crop Production',
      question: 'Which soil order covers the largest geographical area in India and is highly fertile for wheat and rice?',
      options: ['Alluvial soil', 'Laterite soil', 'Arid desert soil', 'Peaty soil'],
      correctIndex: 0,
      explanation: 'Alluvial soil covers over 40% of India’s land area (Indo-Gangetic plains and river deltas) and is rich in potash and lime.',
    },
    {
      id: 'pat-2',
      subject: 'Plant Biology',
      question: 'Which plant hormone is primarily responsible for fruit ripening?',
      options: ['Auxin', 'Gibberellin', 'Ethylene', 'Cytokinin'],
      correctIndex: 2,
      explanation: 'Ethylene is a gaseous phytohormone that regulates fruit ripening, leaf senescence, and abscission.',
    },
    {
      id: 'pat-3',
      subject: 'Soil Science',
      question: 'Rhizobium bacteria form a symbiotic nitrogen-fixing relationship in the root nodules of:',
      options: ['Cereal crops (wheat, maize)', 'Leguminous crops (gram, soybean, pea)', 'Fiber crops (cotton, jute)', 'Tuber crops (potato)'],
      correctIndex: 1,
      explanation: 'Rhizobium colonizes root nodules of legumes, converting atmospheric nitrogen (N₂) into plant-usable ammonia.',
    },
    {
      id: 'pat-4',
      subject: 'Animal Husbandry',
      question: 'Which Indian buffalo breed is renowned for the highest milk yield and tightly curled horns?',
      options: ['Murrah', 'Surti', 'Bhadawari', 'Nagpuri'],
      correctIndex: 0,
      explanation: 'Murrah, originating from Haryana and Punjab, is India’s highest milk-producing buffalo breed with jet-black color and tightly curled horns.',
    },
    {
      id: 'pat-5',
      subject: 'Chemistry',
      question: 'What is the approximate nitrogen percentage present in commercial Urea fertilizer?',
      options: ['21%', '33%', '46%', '60%'],
      correctIndex: 2,
      explanation: 'Urea—CO(NH₂)₂—contains approximately 46% nitrogen by weight, making it the most concentrated solid nitrogenous fertilizer.',
    },
  ],
};

export const GENERAL_QUIZ_GUIDE: SeoToolGuide = {
  interactiveMode: 'quiz',
  interactiveTitle: 'Play a Free 5-Question Quick Practice Quiz Now',
  interactiveSubtitle:
    'Experience instant grading, concept explanations, and accuracy tracking right here—no account required.',
  quickAnswerHeading: 'Why Practice Quizzes Accelerate Exam Retention',
  quickAnswer:
    'Cognitive psychology research on the Testing Effect shows that active retrieval via practice quizzes improves long-term knowledge retention by up to 50% compared to passive re-reading. Timed online quizzes also calibrate exam pacing and reveal specific conceptual blind spots immediately.',
  keyFacts: [
    { label: 'Access Model', value: '100% Free to Practice' },
    { label: 'Grading Speed', value: 'Instant Auto-Scoring' },
    { label: 'Languages', value: 'English & Hindi' },
    { label: 'Best For', value: 'Board Exams, SSC, Banking, TET, Coaching' },
  ],
  table: {
    heading: 'Passive Study vs Active Retrieval Quizzes',
    caption: 'How structured online testing improves exam outcomes for students',
    headers: ['Study Dimension', 'Passive Re-Reading', 'Timed Practice Quizzes on Quiz Do'],
    rows: [
      ['Retention after 7 days', 'Low (rapid forgetting curve)', 'High (retrieval strengthens memory pathways)'],
      ['Time-management training', 'None', 'Real countdown timer per quiz & contest'],
      ['Gap identification', 'Often hidden until exam day', 'Immediate wrong-answer breakdown & mistake log'],
      ['Revision efficiency', 'Re-reads known topics equally', 'Focuses strictly on weak concepts & missed MCQs'],
    ],
  },
  sections: [
    {
      heading: 'How to Get Maximum Value from Online Practice Quizzes',
      paragraphs: [
        'Treat every short 5- to 20-question quiz as a diagnostic check rather than a grade. Read the explanation for every question you guessed—even if you guessed right—so the underlying rule sticks before exam day.',
      ],
      bullets: [
        'Attempt a 10-minute quiz within 24 hours of finishing any new chapter.',
        'Bookmark tricky mistakes and revisit them 3 days and 7 days later (spaced repetition).',
        'Use full timed mock tests once per week to measure speed under pressure.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'gen-1',
      subject: 'General Science',
      question: 'Which organelle is known as the powerhouse of the cell because it generates most of the cell’s ATP?',
      options: ['Ribosome', 'Golgi apparatus', 'Mitochondrion', 'Lysosome'],
      correctIndex: 2,
      explanation: 'Mitochondria carry out cellular respiration (oxidative phosphorylation) to synthesize adenosine triphosphate (ATP).',
    },
    {
      id: 'gen-2',
      subject: 'Indian Polity',
      question: 'Who is the ex-officio Chairman of the Rajya Sabha (Council of States) in India?',
      options: ['Prime Minister of India', 'Vice President of India', 'Speaker of Lok Sabha', 'Chief Justice of India'],
      correctIndex: 1,
      explanation: 'Under Article 64 of the Constitution of India, the Vice President of India serves as the ex-officio Chairman of the Rajya Sabha.',
    },
    {
      id: 'gen-3',
      subject: 'Quantitative Aptitude',
      question: 'A shopkeeper buys an item for ₹800 and sells it at a 15% profit. What is the selling price?',
      options: ['₹880', '₹900', '₹920', '₹950'],
      correctIndex: 2,
      explanation: '15% of ₹800 = (15/100) × 800 = ₹120. Selling Price = ₹800 + ₹120 = ₹920.',
    },
    {
      id: 'gen-4',
      subject: 'Computer Awareness',
      question: 'In web communication, what does HTTPS stand for?',
      options: [
        'HyperText Transfer Protocol Secure',
        'High Throughput Text Processing System',
        'Hyperlink Transport Protocol Standard',
        'Host Transfer Text Protocol Service',
      ],
      correctIndex: 0,
      explanation: 'HTTPS stands for HyperText Transfer Protocol Secure, encrypting browser-to-server traffic using TLS.',
    },
    {
      id: 'gen-5',
      subject: 'Geography',
      question: 'Which river is the longest river flowing entirely within India?',
      options: ['Brahmaputra', 'Godavari', 'Indus', 'Sutlej'],
      correctIndex: 1,
      explanation: 'While the Ganga is India’s longest river overall (passing into Bangladesh), the Godavari (~1,465 km) is the longest river flowing entirely within India.',
    },
  ],
};
