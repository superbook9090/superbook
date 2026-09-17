import { describe, it, expect } from 'vitest';
import { parseRawTextQuestions, normalizeHindiDigits } from '../rawTextQuizParser';

describe('rawTextQuizParser', () => {
  it('normalizes Devanagari numerals to ASCII digits', () => {
    expect(normalizeHindiDigits('प्रश्न १. उत्तर: ३')).toBe('प्रश्न 1. उत्तर: 3');
    expect(normalizeHindiDigits('०१२३४५६७८९')).toBe('0123456789');
  });

  it('correctly parses user exact 15 Hindi questions with compressed text and separate answer key', () => {
    const userSample = `1.प्रतिवर्ष 'राष्ट्रीय हिंदी दिवस' किस तिथि को मनाया जाता है?A) 10 जनवरीB) 14 सितंबरC) 14 नवंबरD) 5 सितंबर2.भारतीय संविधान के किस अनुच्छेद के अंतर्गत हिंदी को संघ की राजभाषा और देवनागरी को लिपि घोषित किया गया है?A) अनुच्छेद 352B) अनुच्छेद 370C) अनुच्छेद 343 (1)D) अनुच्छेद 3563.आधिकारिक तौर पर पहला राष्ट्रीय हिंदी दिवस किस वर्ष मनाया गया था?A) 1953B) 1949C) 1965D) 19754.'विश्व हिंदी दिवस' (World Hindi Day) प्रतिवर्ष कब मनाया जाता है?A) 14 सितंबरB) 29 फरवरीC) 5 अक्टूबरD) 10 जनवरी5.हिंदी भाषा को लिखने के लिए किस लिपि का प्रयोग किया जाता है?A) ब्राह्मी लिपिB) देवनागरी लिपिC) रोमन लिपिD) गुरुमुखी लिपि6.हिंदी साहित्य का प्रथम मौलिक उपन्यास किसे माना जाता है?A) गोदानB) चंद्रकांताC) परीक्षागुरुD) यामा7.भारतीय संविधान की किस अनुसूची में हिंदी सहित 22 आधिकारिक भाषाओं को शामिल किया गया है?A) आठवीं अनुसूचीB) सातवीं अनुसूचीC) नौवीं अनुसूचीD) दसवीं अनुसूची8.प्रसिद्ध छायावादी महाकाव्य 'कामायनी' के रचयिता निम्नलिखित में से कौन हैं?A) सूर्यकांत त्रिपाठी 'निराला'B) सुमित्रानंदन पंतC) महादेवी वर्माD) जयशंकर प्रसाद9.संविधान सभा में किस दिन हिंदी को राजभाषा बनाने का ऐतिहासिक निर्णय लिया गया था?A) 15 अगस्त 1947B) 14 सितंबर 1949C) 26 जनवरी 1950D) 2 अक्टूबर 195210.प्रथम विश्व हिंदी सम्मेलन (First World Hindi Conference) का आयोजन वर्ष 1975 में भारत के किस शहर में हुआ था?A) नई दिल्लीB) वाराणसीC) नागपुरD) भोपाल11.प्रसिद्ध आंचलिक उपन्यास 'मैला आंचल' के लेखक का नाम क्या है?A) फणीश्वरनाथ रेणुB) मुंशी प्रेमचंदC) नागार्जुनD) अमृतलाल नागर12.भारतीय भाषाओं की 'आदि जननी' यानी मुख्य स्रोत किस प्राचीन भाषा को माना जाता है?A) पालीB) प्राकृतC) वैदिक तमिलD) संस्कृत13.किस प्रथम हिंदी साहित्यकार को उनकी कृति 'चिदंबरा' के लिए 'ज्ञानपीठ पुरस्कार' से सम्मानित किया गया था?A) महादेवी वर्माB) सुमित्रानंदन पंतC) रामधारी सिंह 'दिनकर'D) सच्चिदानंद हीरानंद वात्स्यायन 'अज्ञेय'14.14 सितंबर को हिंदी दिवस के रूप में चुने जाने के पीछे किस विद्वान व स्वतंत्रता सेनानी के अथक प्रयासों का सबसे बड़ा योगदान था, जिनकी उस दिन 50वीं जयंती थी?A) आचार्य हजारी प्रसाद द्विवेदीB) महात्मा गांधीC) ब्यौहार राजेन्द्र सिंहD) भारतेंदु हरिश्चंद्र15.भारतीय संविधान के किस भाग (Part) में राजभाषा (Official Language) से संबंधित प्रावधानों का वर्णन किया गया है?A) भाग XVII (17)B) भाग XV (15)C) भाग XVI (16)D) भाग XVIII (18)Answer key and explanations1. B) 14 सितंबरExplanation: सही! 14 सितंबर को राष्ट्रीय हिंदी दिवस मनाया जाता है क्योंकि इसी दिन 1949 में संविधान सभा ने हिंदी को भारत की राजभाषा के रूप में स्वीकार किया था।2. C) अनुच्छेद 343 (1)Explanation: सही! संविधान के अनुच्छेद 343 (1) के अनुसार संघ की राजभाषा हिंदी और लिपि देवनागरी होगी।3. A) 1953Explanation: सही! पहला आधिकारिक राष्ट्रीय हिंदी दिवस 14 सितंबर 1953 को मनाया गया था।4. D) 10 जनवरीExplanation: सही! 10 जनवरी को विश्व स्तर पर हिंदी के प्रसार के लिए विश्व हिंदी दिवस मनाया जाता है।5. B) देवनागरी लिपिExplanation: सही! हिंदी भाषा देवनागरी लिपि में बाईं से दाईं ओर लिखी जाती है।6. C) परीक्षागुरुExplanation: सही! लाला श्रीनिवास दास द्वारा रचित 'परीक्षागुरु' (1882) को हिंदी का प्रथम मौलिक उपन्यास माना जाता है।7. A) आठवीं अनुसूचीExplanation: सही! भारतीय संविधान की आठवीं अनुसूची में 22 अनुसूचित भाषाओं का उल्लेख है, जिसमें हिंदी भी शामिल है।8. D) जयशंकर प्रसादExplanation: सही! 'कामायनी' महाकाव्य के रचयिता महान नाटककार और छायावादी कवि जयशंकर प्रसाद हैं।9. B) 14 सितंबर 1949Explanation: सही! लंबी चर्चा के बाद 14 सितंबर 1949 को हिंदी को भारत की राजभाषा के रूप में स्वीकार किया गया था।10. C) नागपुरExplanation: सही! 10 जनवरी 1975 को महाराष्ट्र के नागपुर शहर में प्रथम विश्व हिंदी सम्मेलन का उद्घाटन हुआ था।11. A) फणीश्वरनाथ रेणुExplanation: सही! 'मैला आंचल' (1954) फणीश्वरनाथ रेणु द्वारा लिखित हिंदी का एक मील का पत्थर साबित होने वाला आंचलिक उपन्यास है।12. D) संस्कृतExplanation: सही! संस्कृत को सभी भारतीय भाषाओं की 'आदि जननी' माना जाता है, जिससे प्राकृत, अपभ्रंश होते हुए हिंदी का विकास हुआ।13. B) सुमित्रानंदन पंतExplanation: सही! सुमित्रानंदन पंत पहले हिंदी कवि थे जिन्हें 1968 में उनकी रचना 'चिदंबरा' के लिए ज्ञानपीठ पुरस्कार मिला।14. C) ब्यौहार राजेन्द्र सिंहExplanation: सही! ब्यौहार राजेन्द्र सिंह के 50वें जन्मदिन (14 सितंबर 1949) पर हिंदी को राजभाषा बनाने का आम सहमति का निर्णय लिया गया था, जिनके सम्मान में यह दिन चुना गया।15. A) भाग XVII (17)Explanation: सही! भारतीय संविधान के भाग XVII (अनुच्छेद 343 से 351) में राजभाषा से जुड़े सभी प्रावधानों का उल्लेख किया गया है।`;

    const { questions, errors } = parseRawTextQuestions(userSample);

    expect(errors).toHaveLength(0);
    expect(questions).toHaveLength(15);

    // Q1
    expect(questions[0].question).toBe("प्रतिवर्ष 'राष्ट्रीय हिंदी दिवस' किस तिथि को मनाया जाता है?");
    expect(questions[0].optionA).toBe('10 जनवरी');
    expect(questions[0].optionB).toBe('14 सितंबर');
    expect(questions[0].optionC).toBe('14 नवंबर');
    expect(questions[0].optionD).toBe('5 सितंबर');
    expect(questions[0].correctAnswer).toBe(1); // Option B
    expect(questions[0].explanation).toContain('14 सितंबर को राष्ट्रीय हिंदी दिवस');

    // Q2
    expect(questions[1].question).toBe('भारतीय संविधान के किस अनुच्छेद के अंतर्गत हिंदी को संघ की राजभाषा और देवनागरी को लिपि घोषित किया गया है?');
    expect(questions[1].optionC).toBe('अनुच्छेद 343 (1)');
    expect(questions[1].optionD).toBe('अनुच्छेद 356');
    expect(questions[1].correctAnswer).toBe(2); // Option C

    // Q3
    expect(questions[2].question).toBe('आधिकारिक तौर पर पहला राष्ट्रीय हिंदी दिवस किस वर्ष मनाया गया था?');
    expect(questions[2].optionA).toBe('1953');
    expect(questions[2].correctAnswer).toBe(0); // Option A

    // Q14 with inner date numbers
    expect(questions[13].question).toContain('14 सितंबर को हिंदी दिवस');
    expect(questions[13].optionC).toBe('ब्यौहार राजेन्द्र सिंह');
    expect(questions[13].correctAnswer).toBe(2); // Option C

    // Q15
    expect(questions[14].question).toBe('भारतीय संविधान के किस भाग (Part) में राजभाषा (Official Language) से संबंधित प्रावधानों का वर्णन किया गया है?');
    expect(questions[14].optionA).toBe('भाग XVII (17)');
    expect(questions[14].correctAnswer).toBe(0); // Option A
  });

  it('parses standard multi-line English questions with separate Answer key', () => {
    const text = `1. What is the capital of India?
A) Mumbai
B) New Delhi
C) Kolkata
D) Chennai

2. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6

Answers:
1. B
2. B`;

    const { questions } = parseRawTextQuestions(text);
    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe('What is the capital of India?');
    expect(questions[0].correctAnswer).toBe(1);
    expect(questions[1].question).toBe('What is 2 + 2?');
    expect(questions[1].correctAnswer).toBe(1);
  });

  it('parses questions with inline answers and explanations', () => {
    const text = `1. What is the capital of France?
(A) London
(B) Paris
(C) Berlin
(D) Rome
Answer: B
Explanation: Paris is the capital of France.

2. What is H2O?
(A) Oxygen
(B) Nitrogen
(C) Water
(D) Hydrogen
Ans: C
Explanation: H2O is water.`;

    const { questions } = parseRawTextQuestions(text);
    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe('What is the capital of France?');
    expect(questions[0].optionD).toBe('Rome');
    expect(questions[0].correctAnswer).toBe(1);
    expect(questions[0].explanation).toBe('Paris is the capital of France.');

    expect(questions[1].question).toBe('What is H2O?');
    expect(questions[1].optionD).toBe('Hydrogen');
    expect(questions[1].correctAnswer).toBe(2);
    expect(questions[1].explanation).toBe('H2O is water.');
  });

  it('parses Hindi questions with Hindi option markers (क, ख, ग, घ)', () => {
    const text = `1. भारत का राष्ट्रीय पशु कौन सा है?
(क) शेर
(ख) बाघ
(ग) हाथी
(घ) चीता
उत्तर: ख
व्याख्या: बाघ भारत का राष्ट्रीय पशु है।`;

    const { questions } = parseRawTextQuestions(text);
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe('भारत का राष्ट्रीय पशु कौन सा है?');
    expect(questions[0].optionA).toBe('शेर');
    expect(questions[0].optionB).toBe('बाघ');
    expect(questions[0].optionC).toBe('हाथी');
    expect(questions[0].optionD).toBe('चीता');
    expect(questions[0].correctAnswer).toBe(1);
    expect(questions[0].explanation).toBe('बाघ भारत का राष्ट्रीय पशु है।');
  });

  it('returns empty array when text is empty', () => {
    const { questions, errors } = parseRawTextQuestions('');
    expect(questions).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('returns error when text does not have question 1', () => {
    const { questions, errors } = parseRawTextQuestions('Just some random text without questions');
    expect(questions).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });
});
