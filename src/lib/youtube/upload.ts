import { getYouTubeClient } from './client';
import fs from 'fs';

export interface UploadResult {
  youtubeVideoId: string;
  videoEmbedUrl: string;
  thumbnail: string;
}

export async function uploadVideoToYouTube(
  filePath: string,
  metadata: { title: string; description?: string }
): Promise<UploadResult> {
  const youtube = getYouTubeClient();

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title.substring(0, 100),
        description: metadata.description || 'Uploaded via Quiz-Do LMS platform.',
        categoryId: '27', // Education
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  const videoId = response.data.id;
  if (!videoId) {
    throw new Error('Failed to retrieve video ID from YouTube upload response.');
  }

  return {
    youtubeVideoId: videoId,
    videoEmbedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  };
}
