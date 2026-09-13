import QRCode from 'qrcode';

export interface ScorecardData {
  studentName: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  percentile?: number;
  rank?: number;
  shareUrl: string;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export async function renderScorecardToCanvas(
  canvas: HTMLCanvasElement,
  data: ScorecardData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  // 1. Dark Premium Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090D16');
  bgGrad.addColorStop(0.4, '#0F172A');
  bgGrad.addColorStop(0.8, '#1E1B4B');
  bgGrad.addColorStop(1, '#090D16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Glow Effects
  const glow = ctx.createRadialGradient(width / 2, 850, 50, width / 2, 850, 450);
  glow.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 400, width, 900);

  // 3. Subtle Card Container
  const cardX = 60;
  const cardY = 80;
  const cardW = width - 120;
  const cardH = height - 160;
  const radius = 48;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();
  ctx.restore();

  // 4. Header & Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('QUIZDO', width / 2, 220);

  // Tagline Badge
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = '#818CF8';
  ctx.fillText('OFFICIAL SCORECARD & BADGE', width / 2, 270);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 320);
  ctx.lineTo(width - 140, 320);
  ctx.stroke();

  // 5. Candidate & Quiz Info
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.letterSpacing = '1px';
  ctx.fillText('CANDIDATE', width / 2, 380);

  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(data.studentName || 'Quizdo Scholar', width / 2, 440);

  // Quiz Title (wrapped if long)
  ctx.font = '600 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#CBD5E1';
  let title = data.quizTitle || 'Quiz Assessment';
  if (title.length > 36) title = title.substring(0, 33) + '...';
  ctx.fillText(`“${title}”`, width / 2, 510);

  // 6. Hero Score Circle / Box
  const scoreY = 820;
  const circleGrad = ctx.createLinearGradient(width / 2 - 180, scoreY - 180, width / 2 + 180, scoreY + 180);
  circleGrad.addColorStop(0, '#4F46E5');
  circleGrad.addColorStop(1, '#9333EA');

  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, scoreY, 190, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = circleGrad;
  ctx.stroke();
  ctx.restore();

  // Big Score Number
  ctx.font = '900 130px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${data.score}%`, width / 2, scoreY + 40);

  // Subtitle
  ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#A5B4FC';
  ctx.letterSpacing = '1px';
  ctx.fillText(`${data.correctCount} / ${data.totalQuestions} CORRECT`, width / 2, scoreY + 105);

  // 7. Stats Metric Cards (Accuracy, Speed, Percentile)
  const statsY = 1100;
  const statBoxW = 270;
  const statBoxH = 150;
  const statGap = 35;
  const statsStartX = (width - (statBoxW * 3 + statGap * 2)) / 2;

  const stats = [
    { label: 'ACCURACY', val: `${data.score}%`, color: '#34D399' },
    { label: 'TIME SPENT', val: formatTime(data.timeTaken), color: '#38BDF8' },
    {
      label: 'PERCENTILE',
      val: data.percentile ? `${Math.round(data.percentile)}%` : 'Top 10%',
      color: '#FBBF24',
    },
  ];

  stats.forEach((s, idx) => {
    const x = statsStartX + idx * (statBoxW + statGap);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, statsY, statBoxW, statBoxH, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.letterSpacing = '1px';
    ctx.fillText(s.label, x + statBoxW / 2, statsY + 45);

    ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = s.color;
    ctx.fillText(s.val, x + statBoxW / 2, statsY + 105);
    ctx.restore();
  });

  // 8. Challenge Callout Card with QR Code
  const ctaY = 1320;
  const ctaW = width - 200;
  const ctaH = 340;
  const ctaX = 100;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 32);
  const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY + ctaH);
  ctaGrad.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
  ctaGrad.addColorStop(1, 'rgba(147, 51, 234, 0.2)');
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.stroke();
  ctx.restore();

  // Challenge text left side
  ctx.textAlign = 'left';
  ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('⚔️ THINK YOU CAN', ctaX + 50, ctaY + 90);
  ctx.fillText('BEAT THIS SCORE?', ctaX + 50, ctaY + 140);

  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('Scan the QR code to play this', ctaX + 50, ctaY + 195);
  ctx.fillText('challenge without login!', ctaX + 50, ctaY + 230);

  // Dynamic QR Code generation on the right
  try {
    const qrDataUrl = await QRCode.toDataURL(data.shareUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    const qrImg = new Image();
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    const qrX = ctaX + ctaW - 250;
    const qrY = ctaY + 45;

    // White rounded backing for QR code
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, 234, 234, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, 210, 210);
    ctx.restore();
  } catch (err) {
    console.error('Failed to draw QR code on scorecard:', err);
  }

  // 9. Footer Watermark
  ctx.textAlign = 'center';
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('quizdo.in · Learn, Practice & Compete Daily', width / 2, height - 120);
}
