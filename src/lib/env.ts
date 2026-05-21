import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is missing'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is missing'),
  YOUTUBE_REFRESH_TOKEN: z.string().min(1, 'YOUTUBE_REFRESH_TOKEN is missing'),
  YOUTUBE_CHANNEL_ID: z.string().optional(), // If not explicitly required for uploads, make it optional
});

export const getYouTubeEnv = () => {
  const parsed = envSchema.safeParse({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    YOUTUBE_REFRESH_TOKEN: process.env.YOUTUBE_REFRESH_TOKEN,
    YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
  });

  if (!parsed.success) {
    console.error('YouTube Environment Validation Error:', parsed.error.format());
    throw new Error('Missing YouTube API environment configuration keys.');
  }

  return parsed.data;
};
