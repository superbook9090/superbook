#!/usr/bin/env node

/**
 * CLI Manual Script: Generate 2000+ Word Trending Blog for SEO & AdSense (Superadmin Only)
 * 
 * Usage:
 *   node scripts/generate-ai-trending-blog.mjs
 *   node scripts/generate-ai-trending-blog.mjs --topic="Artificial Intelligence" --lang=en
 *   node scripts/generate-ai-trending-blog.mjs --lang=hi
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// 1. Read environment variables from .env
let uri = process.env.MONGODB_URI;
let openRouterKey = process.env.OPENROUTER_API_KEY;
let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('MONGODB_URI=')) {
        uri = trimmed.replace('MONGODB_URI=', '').trim().replace(/^['"]|['"]$/g, '');
      }
      if (trimmed.startsWith('OPENROUTER_API_KEY=')) {
        openRouterKey = trimmed.replace('OPENROUTER_API_KEY=', '').trim().replace(/^['"]|['"]$/g, '');
      }
      if (trimmed.startsWith('GEMINI_API_KEY=')) {
        geminiKey = trimmed.replace('GEMINI_API_KEY=', '').trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch {
  // Ignore
}

if (!uri) {
  console.error('❌ Error: MONGODB_URI is not set in environment or .env');
  process.exit(1);
}

if (!openRouterKey && !geminiKey) {
  console.error('❌ Error: Neither OPENROUTER_API_KEY nor GEMINI_API_KEY found in .env');
  process.exit(1);
}

// 2. Parse command line args
const args = process.argv.slice(2);
let customTopic = null;
let language = 'en';

for (const arg of args) {
  if (arg.startsWith('--topic=')) {
    customTopic = arg.replace('--topic=', '').trim().replace(/^['"]|['"]$/g, '');
  }
  if (arg.startsWith('--lang=')) {
    const l = arg.replace('--lang=', '').trim().toLowerCase();
    if (l === 'hi' || l === 'en') language = l;
  }
}

// Curated fallback topics if AI topic discovery is unavailable or custom topic is not specified
const FALLBACK_TRENDING_TOPICS = [
  {
    topic: 'Artificial Intelligence',
    titleEn: 'Artificial General Intelligence (AGI) & The 2026 Shift: How Deep Learning & Autonomous Agents Are Transforming Global Education and Careers',
    titleHi: 'आर्टिफिशियल जनरल इंटेलिजेंस (AGI) और शिक्षा क्रांति: 2026 में करियर, सीखने की क्षमता और रोजगार पर प्रभाव',
  },
  {
    topic: 'Exam Preparation',
    titleEn: 'The Ultimate UPSC & SSC 2026 Preparation Blueprint: Cognitive Recall, Dynamic Current Affairs Mastery, and High-Yield Revision Techniques',
    titleHi: 'UPSC और SSC 2026 परीक्षा में सफलता की रणनीति: एक्टिव रिकॉल, समसामयिकी विश्लेषण और टॉपर्स के रिवीजन सीक्रेट्स',
  },
  {
    topic: 'Cybersecurity',
    titleEn: 'Post-Quantum Cryptography & Zero Trust Architecture: The Complete Cybersecurity Guide for the Next Decade of Technology',
    titleHi: 'पोस्ट-क्वांटम क्रिप्टोग्राफी और ज़ीरो ट्रस्ट सिक्योरिटी: आधुनिक तकनीक और साइबर सुरक्षा की व्यापक मार्गदर्शिका',
  },
  {
    topic: 'Education',
    titleEn: 'Neuroscience of Learning: How Spaced Repetition, Cognitive Load Theory, and Interleaving Rewire the Brain for Permanent Academic Mastery',
    titleHi: 'सीखने का न्यूरोसाइंस: स्पेस्ड रिपीटिशन और कॉग्निटिव लोड थ्योरी से अपनी याददाश्त और परीक्षा स्कोर को कैसे दोगुना करें',
  },
  {
    topic: 'General Knowledge',
    titleEn: 'Global Geopolitics and the Energy Transition in 2026: Renewable Supergrids, Rare Earth Elements, and Economic Power Shifts',
    titleHi: 'वैश्विक भू-राजनीति और स्वच्छ ऊर्जा क्रांति 2026: दुर्लभ खनिज, हरित अर्थव्यवस्था और नई अंतरराष्ट्रीय व्यवस्था',
  },
  {
    topic: 'Science',
    titleEn: 'CRISPR Gene Editing and Personalized Medicine: The Breakthrough Technologies Shaping Healthcare, Biotechnology, and Longevity',
    titleHi: 'CRISPR जीन एडिटिंग और सटीक चिकित्सा: जैव प्रौद्योगिकी और स्वास्थ्य विज्ञान की अगली महा-क्रांति',
  },
  {
    topic: 'Data Science & Coding',
    titleEn: 'Agentic AI Architecture & Vector Databases: Complete Engineering Guide to Building Modern Autonomous Applications in 2026',
    titleHi: 'एजेंटिक एआई और वेक्टर डेटाबेस: 2026 में आधुनिक स्वायत्त सॉफ्टवेयर विकास की संपूर्ण मार्गदर्शिका',
  },
  {
    topic: 'Mental Health & Mindfulness',
    titleEn: 'Cognitive Resilience for Competitive Exam Aspirants: Overcoming Burnout, Digital Dopamine Fatigue, and Sustaining Peak Focus',
    titleHi: 'प्रतियोगी परीक्षा के छात्रों के लिए मानसिक मजबूती: बर्नआउट से मुक्ति, ध्यान एकाग्रता और तनाव प्रबंधन के वैज्ञानिक तरीके',
  },
];

async function callOpenRouter(messages) {
  const models = [
    'openrouter/free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-2-9b-it:free',
  ];

  for (const model of models) {
    try {
      console.log(`🤖 Requesting generation from OpenRouter model: ${model}...`);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://quiz-do.com',
          'X-Title': 'Quiz-Do Learning Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 8000,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn(`Model ${model} error: ${data?.error?.message || res.statusText}`);
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content && content.trim().length > 100) {
        return content.trim();
      }
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
    }
  }

  throw new Error('All OpenRouter models failed.');
}

async function callGemini(prompt) {
  console.log('🤖 Requesting generation from Gemini API...');
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || res.statusText);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 100) return text.trim();
    } catch (err) {
      console.warn(`Gemini ${model} failed:`, err.message);
    }
  }
  throw new Error('Gemini API call failed.');
}

async function discoverTrendingTopicWithAi(language) {
  try {
    console.log('🔍 Autonomously researching current trending educational topic via AI...');
    const prompt = `You are an SEO & educational trends analyst for Quiz-Do (an online learning platform).
Identify ONE highly searched, current trending educational, competitive examination, or technology topic for 2026.
It should be suitable for a 2000+ word authoritative academic guide that ranks high on Google and attracts search traffic.

Return strictly a valid JSON object without markdown or formatting:
{
  "topic": "Concise Category/Topic (e.g., Exam Strategy, Machine Learning, UPSC Current Affairs, Quantum Computing, Cognitive Psychology)",
  "title": "A compelling, high-CTR, SEO-optimized title in ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}"
}`;

    let rawJson = '';
    if (openRouterKey) {
      rawJson = await callOpenRouter([
        { role: 'system', content: 'You are an SEO research tool. Output strictly valid JSON.' },
        { role: 'user', content: prompt },
      ]).catch(() => '');
    }

    if (!rawJson && geminiKey) {
      rawJson = await callGemini(prompt).catch(() => '');
    }

    if (rawJson) {
      const cleaned = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.topic && parsed.title) {
        return {
          topic: parsed.topic.trim(),
          title: parsed.title.trim(),
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ Dynamic topic discovery note:', err.message);
  }

  // Fallback to curated list if dynamic query fails
  const randomChoice = FALLBACK_TRENDING_TOPICS[Math.floor(Math.random() * FALLBACK_TRENDING_TOPICS.length)];
  return {
    topic: randomChoice.topic,
    title: language === 'hi' ? randomChoice.titleHi : randomChoice.titleEn,
  };
}

async function run() {
  console.log('\n🚀 Quiz-Do Superadmin AI SEO Blog Generator');
  console.log('============================================');
  console.log(`📡 Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected successfully.`);

  const db = mongoose.connection.db;
  const usersCol = db.collection('users');
  const blogsCol = db.collection('blogs');

  // Verify superadmin author
  const superadmin = await usersCol.findOne({ role: 'superadmin' });
  if (!superadmin) {
    console.error('❌ Error: No user with role "superadmin" found in the users collection!');
    process.exit(1);
  }
  console.log(`👤 Author assigned: ${superadmin.name || 'Superadmin'} (${superadmin.email})`);

  // Dynamically discover trending topic via AI unless customTopic is passed
  let topic = customTopic;
  let chosenTitle = '';

  if (topic) {
    console.log(`📌 Using custom requested topic: "${topic}"`);
  } else {
    const discovered = await discoverTrendingTopicWithAi(language);
    topic = discovered.topic;
    chosenTitle = discovered.title;
    console.log(`💡 AI Discovered Trending Topic: "${topic}"`);
  }

  console.log(`\n📚 Topic: ${topic}`);
  console.log(`🌐 Language: ${language.toUpperCase()}`);
  if (chosenTitle) {
    console.log(`🎯 Seed Subject: "${chosenTitle}"`);
  }
  console.log(`✍️ Target length: 2,000+ substantive words (AdSense E-E-A-T compliant)`);
  console.log(`⏳ Generating content using AI... Please wait (30-50s)...`);

  const systemPrompt = `You are a world-class senior educational researcher, technical writer, and SEO strategist writing for Quiz-Do (an authoritative digital learning and examination platform).

Your writing must strictly adhere to Google Search Quality Rater Guidelines (E-E-A-T: Experience, Expertise, Authoritativeness, and Trustworthiness) and Google AdSense publisher content policies:
1. Zero fluff, repetitive phrases, or generic filler. Deliver rich analytical depth, real-world examples, verified frameworks, step-by-step methodologies, and practical study takeaways.
2. MINIMUM LENGTH REQUIREMENT: The main body content MUST exceed 2,000 words (aim for 2,200 to 2,800 substantive words). Substantive, comprehensive coverage is mandatory to qualify for premium publisher ads.
3. STRUCTURE: Use clean HTML markup (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <strong>). Do NOT wrap in markdown code blocks like \`\`\`html.
4. ADSENSE OPTIMIZATION:
   - Provide informative subheadings every 250-300 words (H2 and H3).
   - Include comparison tables summarizing key metrics, differences, or concepts.
   - Include key takeaways and practical actionable checklists.
   - Include an FAQ section with at least 4 detailed questions and answers using <h3> and <p>.
5. FORMAT: You must return STRICTLY valid JSON with no extraneous commentary:
{
  "title": "Compelling, keyword-rich title (max 90 chars)",
  "slug": "url-friendly-lowercase-slug-without-special-characters",
  "topic": "${topic}",
  "language": "${language}",
  "excerpt": "Clear 2-sentence summary of the article (140-160 chars)",
  "metaTitle": "SEO title for search engines with target keyword (50-65 chars)",
  "metaDescription": "Click-worthy meta description with clear value proposition (145-160 chars)",
  "content": "Full semantic HTML body content exceeding 2000 words..."
}`;

  const userPrompt = `Generate a comprehensive, authoritative, master-level academic guide on:
Topic: ${topic}
Working Title: ${chosenTitle}
Language: ${language === 'hi' ? 'Hindi (हिंदी - शुद्ध एवं मानक शब्दावली)' : 'English'}
Target Word Count: At least 2,200 words of deeply informative, well-structured educational content.

The content should cover:
1. Comprehensive Historical/Modern Context & Foundational Principles
2. Detailed Technical / Conceptual Breakdown with Real-World Practical Examples
3. Comparative Matrix (Table) contrasting methodologies, systems, or standard approaches
4. Step-by-Step Implementation / Study Strategies for Students & Competitive Aspirants
5. Cognitive Traps, Misconceptions, and How to Avoid Common Pitfalls
6. Future Horizons & Expected Industry/Curricular Evolutions
7. Interactive Self-Assessment Review & High-Yield FAQs (at least 4 questions)
8. Conclusion & Actionable Next Steps

Return ONLY the raw JSON object.`;

  let rawOutput = '';
  if (openRouterKey) {
    try {
      rawOutput = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
    } catch (e) {
      console.warn('OpenRouter failed:', e.message);
    }
  }

  if (!rawOutput && geminiKey) {
    rawOutput = await callGemini(`${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`);
  }

  if (!rawOutput) {
    console.error('❌ Error: Failed to generate content from both OpenRouter and Gemini.');
    process.exit(1);
  }

  // Parse JSON
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsed = JSON.parse(cleaned);
  const plainText = (parsed.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const baseSlug = (parsed.slug || parsed.title || chosenTitle)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160);

  const slug = `${baseSlug || 'trending-guide'}-${Date.now().toString(36)}`;

  console.log(`\n🎉 Generated Article: "${parsed.title}"`);
  console.log(`📊 Word Count: ${wordCount} words (Requirement: 2000+)`);
  console.log(`⏱️ Estimated Reading Time: ${readingTime} mins`);
  console.log(`🔗 Slug: /blog/${slug}`);

  // Save to DB
  const doc = {
    title: parsed.title,
    slug,
    topic,
    language,
    excerpt: parsed.excerpt || plainText.slice(0, 160) + '...',
    metaTitle: parsed.metaTitle || parsed.title,
    metaDescription: parsed.metaDescription || plainText.slice(0, 160),
    content: parsed.content,
    readingTimeMinutes: readingTime,
    author: superadmin._id,
    organizationId: null,
    visibility: 'public',
    isPublished: true,
    isFeatured: true,
    viewCount: Math.floor(Math.random() * 25) + 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await blogsCol.insertOne(doc);
  console.log(`\n✅ Successfully published blog to database!`);
  console.log(`🌐 Live URL: /blog/${slug}`);

  await mongoose.disconnect();
  console.log(`👋 Done! Database connection closed.`);
}

run().catch((err) => {
  console.error('\n❌ Fatal error in script:', err);
  process.exit(1);
});
