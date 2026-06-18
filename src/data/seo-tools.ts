export interface ToolFeature {
  title: string;
  description: string;
  iconName: 'Zap' | 'Brain' | 'Clock' | 'Globe' | 'Shield' | 'Sparkles' | 'BookOpen' | 'CheckCircle';
}

export interface ToolBenefit {
  title: string;
  description: string;
}

export interface ToolStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface SeoToolData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  h2: string;
  intro: string;
  features: ToolFeature[];
  benefits: ToolBenefit[];
  howItWorks: ToolStep[];
  faqs: ToolFAQ[];
  callToAction: string;
}

export const SEO_TOOLS_DATA: Record<string, SeoToolData> = {
  'quiz-maker-free': {
    slug: 'quiz-maker-free',
    title: 'Free Quiz Maker - Create Online Quizzes Easily | Quiz-Do',
    description: 'Create engaging quizzes for free with Quiz-Do. Our online quiz maker is perfect for teachers, students, and professionals to test knowledge instantly.',
    h1: 'The Best Free Quiz Maker Online',
    h2: 'Create Interactive Quizzes in Minutes',
    intro: 'Whether you are a teacher looking to assess your students or a corporate trainer building assessments, our free online quiz maker provides all the tools you need to create, share, and analyze quizzes effortlessly.',
    features: [
      { title: 'Easy to Use Builder', description: 'Drag and drop interface to create questions quickly without any coding.', iconName: 'Zap' },
      { title: 'Multiple Question Types', description: 'Support for MCQs, true/false, fill-in-the-blanks, and more.', iconName: 'CheckCircle' },
      { title: 'Instant Analytics', description: 'Get immediate insights into performance with detailed reporting.', iconName: 'Brain' }
    ],
    benefits: [
      { title: 'Save Hours of Time', description: 'Stop manually grading papers. Our automated system does it for you instantly.' },
      { title: 'Engage Your Audience', description: 'Interactive elements keep learners focused and improve retention rates.' },
      { title: 'Zero Cost', description: 'Start building assessments completely free, with premium features available as you grow.' }
    ],
    howItWorks: [
      { step: 1, title: 'Create', description: 'Sign up and open the quiz builder. Add your questions and answers.' },
      { step: 2, title: 'Customize', description: 'Set time limits, randomize questions, and adjust scoring rules.' },
      { step: 3, title: 'Share', description: 'Generate a unique link to share with your students or audience globally.' }
    ],
    faqs: [
      { question: 'Is this quiz maker really free?', answer: 'Yes! You can create and share quizzes for free. We also offer premium features for advanced analytics.' },
      { question: 'Can I export the results?', answer: 'Absolutely. You can export student scores and detailed question analytics to CSV format.' },
      { question: 'Is it mobile friendly?', answer: 'Yes, all quizzes taken on Quiz-Do are fully responsive and look great on any device.' }
    ],
    callToAction: 'Create Your Free Quiz Now'
  },
  'ai-quiz-maker-free': {
    slug: 'ai-quiz-maker-free',
    title: 'Free AI Quiz Maker - Generate Quizzes from Text | Quiz-Do',
    description: 'Generate quizzes automatically using AI. Paste text, documents, or topics, and let our Free AI Quiz Maker instantly create MCQs and assessments.',
    h1: 'Free AI Quiz Maker',
    h2: 'Turn Any Text into a Quiz Instantly with AI',
    intro: 'Transform your study notes, training manuals, or articles into interactive quizzes in seconds. Our AI-powered quiz generator analyzes your content and automatically creates challenging questions and answers.',
    features: [
      { title: 'AI Question Generation', description: 'State-of-the-art AI reads your text and crafts contextual questions.', iconName: 'Sparkles' },
      { title: 'Context Aware', description: 'The AI ensures distractors (wrong answers) are plausible and educational.', iconName: 'Brain' },
      { title: 'Lightning Fast', description: 'Generate a full 20-question assessment in under 30 seconds.', iconName: 'Clock' }
    ],
    benefits: [
      { title: 'Eliminate Writer\'s Block', description: 'Never struggle to come up with tricky wrong answers again.' },
      { title: 'Scale Your Content', description: 'Create vast test banks for your courses with minimal manual effort.' },
      { title: 'Focus on Teaching', description: 'Spend less time writing questions and more time interacting with students.' }
    ],
    howItWorks: [
      { step: 1, title: 'Provide Content', description: 'Paste your text, upload a document, or simply enter a topic.' },
      { step: 2, title: 'Generate', description: 'Our AI analyzes the material and extracts key concepts to test.' },
      { step: 3, title: 'Review & Publish', description: 'Review the AI-generated questions, make any edits, and publish instantly.' }
    ],
    faqs: [
      { question: 'How accurate is the AI Quiz Maker?', answer: 'Our AI is highly accurate and specifically fine-tuned for educational content, but we always recommend reviewing the output before publishing.' },
      { question: 'Can I generate quizzes from PDF?', answer: 'Yes, you can extract text from your PDFs or notes and paste it directly into our AI engine.' },
      { question: 'Is the AI quiz generator free?', answer: 'Yes, we offer free AI generations so you can experience the power of automated quiz creation.' }
    ],
    callToAction: 'Generate AI Quiz Now'
  },
  'online-quiz-maker': {
    slug: 'online-quiz-maker',
    title: 'Online Quiz Maker - Fast & Secure Assessments | Quiz-Do',
    description: 'The premier online quiz maker for educators. Build robust online tests, exams, and assessments with automated grading and instant feedback.',
    h1: 'Professional Online Quiz Maker',
    h2: 'Build Secure and Engaging Online Assessments',
    intro: 'Quiz-Do is a powerful online platform designed for modern educators. Whether you are conducting a high-stakes exam or a casual practice test, our platform ensures a smooth experience for both creators and test-takers.',
    features: [
      { title: 'Secure Testing', description: 'Features like randomized questions help prevent cheating during online exams.', iconName: 'Shield' },
      { title: 'Global Access', description: 'Students can take quizzes from anywhere in the world on any device.', iconName: 'Globe' },
      { title: 'Rich Media', description: 'Embed images and code snippets directly into your questions.', iconName: 'BookOpen' }
    ],
    benefits: [
      { title: 'Centralized Platform', description: 'Keep all your educational materials, quizzes, and analytics in one place.' },
      { title: 'Improved Student Outcomes', description: 'Provide immediate feedback to help students learn from their mistakes instantly.' },
      { title: 'Professional Branding', description: 'Deliver a sleek, modern assessment experience that reflects your educational standards.' }
    ],
    howItWorks: [
      { step: 1, title: 'Design', description: 'Use our intuitive web interface to design your assessment.' },
      { step: 2, title: 'Configure', description: 'Set availability windows, time limits, and feedback rules.' },
      { step: 3, title: 'Analyze', description: 'Watch results come in real-time and analyze cohort performance.' }
    ],
    faqs: [
      { question: 'Do students need an account to take a quiz?', answer: 'It depends on your settings. You can require a login for secure exams or allow public access for practice tests.' },
      { question: 'Can I set a time limit?', answer: 'Yes, you can set an overall time limit for the quiz, which automatically submits when time expires.' },
      { question: 'What happens if a student loses internet connection?', answer: 'Our platform automatically saves progress, so students can resume exactly where they left off once reconnected.' }
    ],
    callToAction: 'Start Building Online'
  }
};

// Generate placeholders for remaining keywords
const remainingKeywords = [
  'mcq-generator-free',
  'course-maker-free',
  'ai-course-maker',
  'course-generator-free',
  'test-series-maker-free',
  'ai-test-series-generator',
  'lesson-maker-free',
  'chapter-generator',
  'question-paper-maker',
  'practice-test-generator',
  'online-exam-maker',
  'quiz-creator-for-teachers',
  'quiz-generator-from-text',
  'quiz-generator-from-pdf',
  'course-builder-online',
  'lms-course-creator',
  'ai-education-tools'
];

remainingKeywords.forEach(keyword => {
  if (!SEO_TOOLS_DATA[keyword]) {
    const formattedTitle = keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    SEO_TOOLS_DATA[keyword] = {
      slug: keyword,
      title: `${formattedTitle} | Quiz-Do`,
      description: `Discover our ${formattedTitle} tool. Quiz-Do provides the best solutions for modern education and automated learning.`,
      h1: formattedTitle,
      h2: `Create with our ${formattedTitle} tool today`,
      intro: `Quiz-Do offers a comprehensive platform designed for educators and students. Our ${formattedTitle} capabilities ensure you have the resources you need.`,
      features: [
        { title: 'Fast & Reliable', description: 'Built on modern infrastructure to ensure zero downtime.', iconName: 'Zap' },
        { title: 'AI Powered', description: 'Leverage the latest AI to enhance your workflow.', iconName: 'Brain' }
      ],
      benefits: [
        { title: 'Efficiency', description: 'Save countless hours of manual work.' },
        { title: 'Quality', description: 'Deliver high-quality content to your audience.' }
      ],
      howItWorks: [
        { step: 1, title: 'Sign Up', description: 'Create your free account to get started.' },
        { step: 2, title: 'Create', description: 'Use our intuitive tools to build your content.' }
      ],
      faqs: [
        { question: `Is the ${formattedTitle} free?`, answer: 'We offer a robust free tier for all our core educational tools.' }
      ],
      callToAction: `Try ${formattedTitle}`
    };
  }
});
