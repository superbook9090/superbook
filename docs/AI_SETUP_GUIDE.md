# AI-Powered Quiz Analysis Setup Guide

This guide will help you set up and configure the FREE local AI-powered quiz analysis system using Gemma models.

## 🎯 What This System Provides

- **Free AI Analysis**: No paid APIs, completely self-hosted
- **Local Processing**: All analysis happens on your local machine
- **Lightweight Models**: Optimized for 8GB RAM systems
- **Educational Focus**: Student-friendly explanations and study tips
- **Privacy**: No data leaves your local environment

## 🚀 Quick Setup

### 1. Install Ollama

**Mac (Recommended):**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
systemctl start ollama
```

**Windows:**
Download and install from [ollama.ai](https://ollama.ai/download)

### 2. Pull Gemma Model

```bash
# Pull the recommended lightweight model (2B parameters)
ollama pull gemma:2b

# Alternative ultra-lightweight model (1B parameters)
ollama pull gemma3:1b

# For very low-resource systems (4GB RAM)
ollama pull tinyllama
```

### 3. Configure Environment Variables

Create or update your `.env.local` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma:2b
OLLAMA_TIMEOUT=30000

# AI Configuration
AI_CACHE_TTL=3600
AI_RATE_LIMIT_MAX=10
AI_RATE_LIMIT_WINDOW=60000
AI_MAX_INPUT_LENGTH=2000
AI_MAX_OUTPUT_LENGTH=500

# Performance Settings
AI_ENABLE_STREAMING=false
AI_RETRY_ATTEMPTS=2
AI_RETRY_DELAY=1000
```

### 4. Start Your Application

```bash
npm run dev
```

## 🧪 Testing the System

### 1. Check AI Service Status

Visit: `http://localhost:3000/api/ai/quiz-analysis`

You should see a response like:
```json
{
  "success": true,
  "data": {
    "service": {
      "isAvailable": true,
      "modelLoaded": true,
      "endpoint": "http://localhost:11434"
    },
    "models": ["gemma:2b", "gemma3:1b"],
    "features": {
      "analysis": true,
      "simplerExplanation": true,
      "examples": true
    }
  }
}
```

### 2. Test Quiz Analysis

Complete a quiz and click the "Analyze Answer" button on the review page. You should see:
- AI analysis modal with detailed feedback
- Processing time and confidence level
- Educational explanations and study tips

## 🔧 Optimization for Low RAM Systems

### For 8GB RAM Systems (Recommended)

```env
OLLAMA_DEFAULT_MODEL=gemma:2b
OLLAMA_TIMEOUT=30000
AI_CACHE_TTL=7200
```

### For 4GB RAM Systems

```env
OLLAMA_DEFAULT_MODEL=tinyllama
OLLAMA_TIMEOUT=20000
AI_CACHE_TTL=3600
AI_MAX_INPUT_LENGTH=1000
AI_MAX_OUTPUT_LENGTH=300
```

### Performance Tips

1. **Enable Caching**: Increases response speed for repeated questions
2. **Use Smaller Models**: `tinyllama` for very low-resource systems
3. **Adjust Timeouts**: Increase if responses are slow
4. **Monitor Memory**: Use Activity Monitor to track RAM usage

## 🛠️ Troubleshooting

### Common Issues

#### 1. "AI service is not available"
- **Solution**: Ensure Ollama is running (`ollama serve`)
- **Check**: `curl http://localhost:11434/api/tags`

#### 2. "Model not found"
- **Solution**: Pull the model (`ollama pull gemma:2b`)
- **Check**: `ollama list`

#### 3. "Request timeout"
- **Solution**: Increase timeout in `.env.local`
- **Try**: `OLLAMA_TIMEOUT=60000`

#### 4. "Rate limit exceeded"
- **Solution**: Wait 1 minute between requests
- **Adjust**: `AI_RATE_LIMIT_MAX=15`

### Performance Issues

#### Slow Response Times
- Use smaller model (`tinyllama`)
- Increase timeout
- Check system resources
- Close other applications

#### High Memory Usage
- Use `tinyllama` model
- Reduce concurrent requests
- Restart Ollama service

## 🎨 Customization

### Model Selection

Edit `src/features/ai/config/index.ts`:

```typescript
export const DEFAULT_MODEL = 'gemma3:1b'; // Change default model
```

### Prompt Templates

Edit `src/features/ai/prompts/index.ts` to customize:
- Response format
- Educational tone
- Length constraints
- Subject-specific prompts

### UI Customization

Edit components in `src/features/ai/components/`:
- `QuizAnalysisModal.tsx` - Main modal
- `AIResponseCard.tsx` - Response display
- `AnalysisButton.tsx` - Button styling

## 📊 Monitoring

### Check System Performance

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Monitor memory usage (Mac)
top -o mem

# Monitor memory usage (Linux)
htop
```

### Application Logs

Check your application logs for:
- AI response times
- Error rates
- Cache hit rates
- Rate limiting activity

## 🔒 Security

### Built-in Protections

- **Rate Limiting**: 10 requests per minute per user
- **Input Sanitization**: Removes HTML and special characters
- **Timeout Protection**: Prevents hanging requests
- **Content Filtering**: Validates input length and format

### Additional Security

```env
# Restrict allowed origins
AI_ALLOWED_ORIGINS=localhost,yourdomain.com

# Reduce rate limits for production
AI_RATE_LIMIT_MAX=5
AI_RATE_LIMIT_WINDOW=120000
```

## 🌍 Translation Support

The system supports English and Hindi translations:

```typescript
// Add new translations in src/features/ai/translations/index.ts
export const aiTranslations = {
  analyzeAnswer: {
    en: 'Analyze Answer',
    hi: 'उत्तर का विश्लेषण करें',
  },
  // ... more translations
};
```

## 🚀 Advanced Features

### Custom Models

Add custom models to `src/features/ai/config/index.ts`:

```typescript
export const AI_MODELS = {
  'custom-model': {
    name: 'custom-model',
    size: '3b',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    maxTokens: 512,
    temperature: 0.3,
    timeout: 30000,
  },
};
```

### Batch Processing

For multiple question analysis:

```typescript
// Process multiple questions concurrently
const analyses = await Promise.all(
  questions.map(q => aiService.analyzeQuizAnswer(q))
);
```

### Custom Prompts

Create specialized prompts for different subjects:

```typescript
export const generateMathPrompt = (request: QuizAnalysisRequest) => {
  return `As a math tutor, analyze this problem step by step...`;
};
```

## 📈 Performance Benchmarks

### Expected Response Times

| Model | RAM Usage | Response Time | Quality |
|-------|-----------|---------------|---------|
| gemma:2b | ~2GB | 2-4 seconds | High |
| gemma3:1b | ~1.5GB | 1-3 seconds | Medium |
| tinyllama | ~800MB | 1-2 seconds | Low |

### System Requirements

**Minimum Requirements:**
- RAM: 4GB
- Storage: 10GB
- CPU: 2+ cores

**Recommended Requirements:**
- RAM: 8GB
- Storage: 20GB
- CPU: 4+ cores

## 🆘 Getting Help

### Debug Mode

Enable debug logging:

```env
DEBUG=ai:*
```

### Health Check

```bash
curl http://localhost:3000/api/ai/quiz-analysis
```

### Logs

Check application logs for AI-related errors and performance metrics.

---

## 🎉 Success!

You now have a fully functional AI-powered quiz analysis system running locally! Students can get instant, personalized feedback on their quiz answers without any external dependencies or costs.

**Next Steps:**
1. Test with various quiz questions
2. Monitor performance
3. Customize prompts for your subjects
4. Add custom models if needed
5. Deploy to your production environment
