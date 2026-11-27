import type { SeoToolGuide } from './types';

export const AI_QUIZ_GUIDE: SeoToolGuide = {
  interactiveMode: 'builder',
  interactiveTitle: 'Interactive MCQ & AI Quiz Draft Sandbox (No Sign-Up Needed)',
  interactiveSubtitle:
    'Edit sample questions below or add your own MCQs, preview how students experience the quiz live, and copy formatted questions instantly.',
  quickAnswerHeading: 'How AI Quiz Generation Works for Educators',
  quickAnswer:
    'An AI quiz generator converts raw lecture notes, textbook paragraphs, PDF text, or syllabus topics into structured multiple-choice questions (MCQs) with four balanced options, one verified answer, and concise explanations. On Quiz Do, teachers review, edit, set time limits or negative marking, and publish directly to students in English or Hindi.',
  keyFacts: [
    { label: 'Input Formats', value: 'Topic, Study Notes, PDF Text' },
    { label: 'Question Quality', value: '4 Options + Distractors + Explanations' },
    { label: 'Languages Supported', value: 'English & Hindi' },
    { label: 'Workflow Time', value: 'Under 60 Seconds per Draft' },
  ],
  table: {
    heading: 'Bloom’s Taxonomy Guide for AI-Assisted Quiz Questions',
    caption: 'How teachers structure prompts to generate higher-order assessments instead of trivial recall items',
    headers: ['Cognitive Level', 'Prompt Focus', 'Best Use Case'],
    rows: [
      ['Remember & Understand', 'Definitions, classifications, key dates, concept summaries', 'Daily exit tickets & chapter warm-ups'],
      ['Apply', 'Numerical problems, formula application, case vignettes', 'Math, Physics, Accounting, Bank PO drills'],
      ['Analyze', 'Assertion-reason, compare-and-contrast, error spotting', 'CTET Pedagogy, UPSC/SSC Prelims, Board Exams'],
      ['Evaluate', 'Best-practice decisions & scenario trade-offs', 'Higher education & professional certifications'],
    ],
  },
  sections: [
    {
      heading: '4-Step Educator Checklist Before Publishing AI-Generated MCQs',
      paragraphs: [
        'AI drafts eliminate 80% of repetitive question-writing effort, but human editorial review ensures academic rigor. Always run a quick 2-minute quality check before sharing a quiz with your batch.',
      ],
      bullets: [
        'Verify factual accuracy against your official textbook or exam board syllabus (NCERT, CBSE, UPBEB, SSC).',
        'Check distractor length: make sure the correct option is not consistently longer or more detailed than distractors.',
        'Avoid ambiguous wording like "always", "never", or double negatives unless intentionally testing precision.',
        'Include a 1-sentence explanation so students learn immediately upon submission.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'ai-1',
      subject: 'Biology',
      question: 'During photosynthesis, in which part of the chloroplast do the light-dependent reactions take place?',
      options: ['Stroma', 'Thylakoid membrane', 'Outer envelope', 'Nucleoid'],
      correctIndex: 1,
      explanation: 'Chlorophyll pigments embedded in the thylakoid membranes absorb light energy to drive ATP and NADPH production.',
    },
    {
      id: 'ai-2',
      subject: 'Physics',
      question: 'According to Ohm’s Law, if resistance doubles while voltage remains constant, the electric current will:',
      options: ['Double', 'Remain unchanged', 'Become half', 'Become four times'],
      correctIndex: 2,
      explanation: 'Since I = V / R, doubling resistance R with constant voltage V reduces current I to half its original value.',
    },
    {
      id: 'ai-3',
      subject: 'History',
      question: 'The Quit India Resolution was passed by the All India Congress Committee on which date?',
      options: ['15 August 1942', '8 August 1942', '26 January 1930', '13 April 1919'],
      correctIndex: 1,
      explanation: 'The All India Congress Committee ratified the Quit India Resolution on 8 August 1942 at Gowalia Tank Maidan in Bombay.',
    },
  ],
};

export const QUIZ_MAKER_GUIDE: SeoToolGuide = {
  interactiveMode: 'builder',
  interactiveTitle: 'Try the Live MCQ & Quiz Builder Sandbox (Free, No Login)',
  interactiveSubtitle:
    'Build, edit, and preview an interactive timed quiz right inside this page—then copy the formatted set or save it to your free Quiz Do teacher dashboard.',
  quickAnswerHeading: 'What Makes an Effective Online Quiz Maker?',
  quickAnswer:
    'A strong online quiz maker lets teachers author multiple-choice questions quickly, configure timers and negative marking, prevent casual cheating via randomized question order, auto-grade every submission immediately, and view question-level accuracy analytics—without requiring students to install heavy software.',
  keyFacts: [
    { label: 'Pricing', value: 'Free Tier for Teachers & Students' },
    { label: 'Auto-Grading', value: 'Instant Score + Answer Breakdown' },
    { label: 'Access Control', value: 'Public Link or Private Course Code' },
    { label: 'Analytics', value: 'Score Distribution & Weak-Topic Insights' },
  ],
  table: {
    heading: 'Choosing the Right Quiz Format for Your Classroom',
    caption: 'Recommended timing, grading, and visibility settings by assessment goal',
    headers: ['Assessment Type', 'Ideal Length', 'Timer & Negative Marking', 'Recommended Visibility'],
    rows: [
      ['Classroom Exit Ticket', '5–10 MCQs', '5–8 mins • No negative marks', 'Course-linked / Batch only'],
      ['Chapter Mastery Check', '15–25 MCQs', '20 mins • Optional -0.25', 'Attached to Chapter / Lesson'],
      ['Weekly Coaching Test', '30–50 MCQs', '30–45 mins • Exam marking', 'Private Organization / Code'],
      ['Public Practice Challenge', '10–20 MCQs', '15 mins • Live leaderboard', 'Public Shareable Link'],
    ],
  },
  sections: [
    {
      heading: 'Best Practices for Writing High-Discrimination MCQs',
      paragraphs: [
        'Well-crafted multiple-choice questions measure conceptual understanding rather than guesswork. Keep the question stem self-contained so a prepared student can formulate the answer before reading the four options.',
      ],
      bullets: [
        'Use 4 homogeneous options (same unit, grammar, and approximate word count).',
        'Base distractors on common student misconceptions (e.g., sign errors, unit conversions, confused definitions).',
        'Limit "All of the above" and "None of the above" to fewer than 10% of items.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'qm-1',
      subject: 'Mathematics',
      question: 'If 3x + 7 = 22, what is the value of x?',
      options: ['3', '5', '7', '15'],
      correctIndex: 1,
      explanation: 'Subtract 7 from both sides to get 3x = 15, then divide by 3 to find x = 5.',
    },
    {
      id: 'qm-2',
      subject: 'English Grammar',
      question: 'Choose the sentence with correct subject-verb agreement:',
      options: [
        'Each of the students have submitted the quiz.',
        'Each of the students has submitted the quiz.',
        'Each of the student have submitted the quiz.',
        'Each of the students are submitting the quiz.',
      ],
      correctIndex: 1,
      explanation: 'The distributive pronoun "Each" is singular and therefore takes the singular verb "has".',
    },
    {
      id: 'qm-3',
      subject: 'Science',
      question: 'Which gas makes up approximately 78% of Earth’s dry atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      correctIndex: 2,
      explanation: 'Earth’s dry atmosphere consists of ~78% nitrogen, ~21% oxygen, ~0.93% argon, and ~0.04% carbon dioxide.',
    },
  ],
};

export const EXAM_MAKER_GUIDE: SeoToolGuide = {
  interactiveMode: 'builder',
  interactiveTitle: 'Build & Preview a Sample Mock Exam Right Here',
  interactiveSubtitle:
    'Customize exam questions, test negative-marking readiness in Live Preview mode, and export or move to full timed mock series on Quiz Do.',
  quickAnswerHeading: 'Designing Competitive Mock Tests & Question Papers',
  quickAnswer:
    'Competitive mock tests and online exams replicate official exam pressure—combining strict countdown timers, negative marking rules (such as +1/-0.25 for SSC/Banking or +4/-1 for JEE/NEET), section blueprints, and rank leaderboards. Running structured test series helps coaching institutes track batch progress every week.',
  keyFacts: [
    { label: 'Negative Marking', value: 'Configurable Penalty per Wrong Answer' },
    { label: 'Anti-Distraction', value: 'Auto-Submit on Timeout & Violation Tracking' },
    { label: 'Rankings', value: 'Live Score & Time-Tiebreak Leaderboards' },
    { label: 'Use Cases', value: 'SSC, Banking, TET, JEE/NEET, School Exams' },
  ],
  table: {
    heading: 'Standard Indian Competitive Exam Marking Schemes',
    caption: 'Configure matching scoring rules when creating mock tests for your students',
    headers: ['Exam Category', 'Correct Marks', 'Negative Penalty', 'Recommended Pace'],
    rows: [
      ['SSC CGL / CHSL / Bank PO', '+1 or +2', '-0.25 or -0.50 (1/4th)', '36–45 sec / question'],
      ['JEE Main / NEET UG', '+4', '-1 (1/4th)', '60–120 sec / question'],
      ['UPSC Civil Services Prelims', '+2', '-0.66 (1/3rd)', '72 sec / question'],
      ['UPTET / CTET / State TET / PAT', '+1', '0 (No negative marking)', '54–60 sec / question'],
    ],
  },
  sections: [
    {
      heading: 'How to Balance Difficulty in a Question Paper Blueprint',
      paragraphs: [
        'A reliable mock exam follows a 30-50-20 difficulty curve: 30% direct foundational questions to build confidence, 50% moderate application questions that separate prepared candidates, and 20% high-discrimination items that determine top ranks.',
      ],
      bullets: [
        'Map every question to a specific chapter so post-test analytics pinpoint exact weak units.',
        'Schedule solution release right after the test window closes to keep leaderboard fairness intact.',
        'Combine chapter quizzes into weekly full-length test series for continuous cohort benchmarking.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'ex-1',
      subject: 'Reasoning',
      question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
      options: ['36', '40', '42', '48'],
      correctIndex: 2,
      explanation: 'The differences increase by 2 each step (+4, +6, +8, +10, +12). So 30 + 12 = 42.',
    },
    {
      id: 'ex-2',
      subject: 'Banking Awareness',
      question: 'Which institution serves as the central bank and monetary policy authority of India?',
      options: ['State Bank of India (SBI)', 'Reserve Bank of India (RBI)', 'SEBI', 'NABARD'],
      correctIndex: 1,
      explanation: 'The Reserve Bank of India (established April 1, 1935) regulates currency issuance, banking supervision, and monetary policy.',
    },
    {
      id: 'ex-3',
      subject: 'Quantitative Aptitude',
      question: 'A train 150 m long passes a pole in 10 seconds. What is its speed in km/h?',
      options: ['45 km/h', '50 km/h', '54 km/h', '60 km/h'],
      correctIndex: 2,
      explanation: 'Speed = 150 / 10 = 15 m/s. Converting to km/h: 15 × (18/5) = 54 km/h.',
    },
  ],
};

export const COURSE_LMS_GUIDE: SeoToolGuide = {
  interactiveMode: 'builder',
  interactiveTitle: 'Preview a Course Milestone Quiz Right Here (No Sign-Up)',
  interactiveSubtitle:
    'Every Quiz Do course pairs structured chapters and lessons with embedded milestone quizzes—try editing and previewing a lesson checkpoint quiz below.',
  quickAnswerHeading: 'Structuring Online Courses & Institutional LMS Batches',
  quickAnswer:
    'An effective online course builder organizes learning into clear Chapters -> Lessons (rich notes, PDFs, or unlisted video lectures) -> Embedded Milestone Quizzes -> Verifiable Completion Certificates. For schools and coaching institutes, organization-scoped LMS workspaces keep student batches private via invite codes while providing admin-level analytics.',
  keyFacts: [
    { label: 'Hierarchy', value: 'Course → Chapters → Lessons → Quizzes' },
    { label: 'Access Modes', value: 'Public Catalog or Private Invite Code' },
    { label: 'Credentials', value: 'Automatic Verifiable Certificates' },
    { label: 'Multi-Tenant LMS', value: 'Dedicated Organization Branding & Roles' },
  ],
  table: {
    heading: 'Course Delivery Models Supported on Quiz Do',
    caption: 'Match your course structure to independent teaching or institutional coaching cohorts',
    headers: ['Delivery Model', 'Access Type', 'Core Features Used', 'Ideal Audience'],
    rows: [
      ['Open Public Course', 'Free public catalog', 'SEO course page, structured lessons, certificates', 'Self-paced learners & exam aspirants'],
      ['Private Batch Course', 'Unique Course Code', 'Invite-only enrollment, chapter quizzes, progress tracking', 'Tuition & coaching institute batches'],
      ['Institutional Organization LMS', 'Org Invite Link', 'Branded portal, multiple teachers, admin user analytics', 'Schools, colleges, multi-teacher academies'],
    ],
  },
  sections: [
    {
      heading: 'How to Design High-Completion Online Courses',
      paragraphs: [
        'Online courses with 5- to 10-minute bite-sized lessons followed immediately by a 5-question checkpoint quiz achieve significantly higher completion rates than multi-hour unbroken lectures. Tracking lesson completion automatically unlocks verifiable certificates once every module is finished.',
      ],
      bullets: [
        'Break each syllabus unit into 3–6 focused lessons with clear learning outcomes.',
        'Attach a short formative quiz to every chapter so learners verify mastery before moving on.',
        'Share a single organization invite link so students join your branded workspace in one step.',
      ],
    },
  ],
  sampleQuestions: [
    {
      id: 'lms-1',
      subject: 'Course Design',
      question: 'Which practice most effectively improves student completion rates in self-paced online courses?',
      options: [
        'Uploading a single 4-hour unedited lecture',
        'Chunking lessons into short modules with checkpoint quizzes',
        'Removing all progress indicators',
        'Requiring manual email submission for every worksheet',
      ],
      correctIndex: 1,
      explanation: 'Micro-lessons paired with immediate retrieval quizzes sustain motivation and make progress visible.',
    },
    {
      id: 'lms-2',
      subject: 'Assessment',
      question: 'When are completion certificates issued automatically on Quiz Do?',
      options: [
        'Immediately upon enrollment',
        'When the instructor marks the course completed and the student finishes all published lessons and quizzes',
        'Only after manual paper verification',
        'After viewing only the course syllabus',
      ],
      correctIndex: 1,
      explanation: 'Quiz Do issues verifiable serial-numbered certificates once the course is marked complete and every published lesson and quiz is finished.',
    },
    {
      id: 'lms-3',
      subject: 'EdTech',
      question: 'How do coaching institutes restrict a private course to enrolled batch students only?',
      options: [
        'By leaving the course unpublished forever',
        'By assigning a unique private Course Code or Organization Invite Code',
        'By disabling all quizzes',
        'By manually creating passwords for every student',
      ],
      correctIndex: 1,
      explanation: 'Private course codes and organization invite codes let authorized students self-enroll cleanly without exposing private batches publicly.',
    },
  ],
};
