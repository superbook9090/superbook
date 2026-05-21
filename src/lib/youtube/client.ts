import { google } from 'googleapis';
import { getYouTubeEnv } from '../env';

export function getYouTubeClient() {
  const env = getYouTubeEnv();

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000'
  );

  oauth2Client.setCredentials({
    refresh_token: env.YOUTUBE_REFRESH_TOKEN,
  });

  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });
}
