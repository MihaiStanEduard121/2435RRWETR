
export async function generateStoryImage(qrSvgElement: SVGElement, fgColor: string, bgColor: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#FFF0F3'); // Very light pink
  grad.addColorStop(0.5, '#F0F7FF'); // Very light blue
  grad.addColorStop(1, '#FFE5EC'); // Light pink
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Add Decorative Stars/Circles in background
  ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 50 + 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Draw Header Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // "Scan this QR"
  ctx.font = '900 60px Quicksand, sans-serif';
  ctx.fillStyle = '#4A4A4A';
  ctx.fillText('Scan this QR 💖', canvas.width / 2, 250);

  // 4. Draw QR Frame
  const frameWidth = 800;
  const frameHeight = 800;
  const frameX = (canvas.width - frameWidth) / 2;
  const frameY = (canvas.height - frameHeight) / 2 - 50;

  // Shadow for frame
  ctx.shadowColor = 'rgba(255, 107, 107, 0.2)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  // Frame Background
  ctx.fillStyle = bgColor;
  const radius = 100;
  ctx.beginPath();
  ctx.moveTo(frameX + radius, frameY);
  ctx.lineTo(frameX + frameWidth - radius, frameY);
  ctx.quadraticCurveTo(frameX + frameWidth, frameY, frameX + frameWidth, frameY + radius);
  ctx.lineTo(frameX + frameWidth, frameY + frameHeight - radius);
  ctx.quadraticCurveTo(frameX + frameWidth, frameY + frameHeight, frameX + frameWidth - radius, frameY + frameHeight);
  ctx.lineTo(frameX + radius, frameY + frameHeight);
  ctx.quadraticCurveTo(frameX, frameY + frameHeight, frameX, frameY + frameHeight - radius);
  ctx.lineTo(frameX, frameY + radius);
  ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
  ctx.closePath();
  ctx.fill();

  // Reset shadow for QR
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 5. Draw QR Code
  const svgData = new XMLSerializer().serializeToString(qrSvgElement);
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const qrPadding = 60;
  ctx.drawImage(img, frameX + qrPadding, frameY + qrPadding, frameWidth - qrPadding * 2, frameHeight - qrPadding * 2);
  URL.revokeObjectURL(url);

  // 6. Draw Bottom Branding
  // Logo style
  ctx.font = '900 80px Quicksand, sans-serif';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText('CuteQR 💖', canvas.width / 2, canvas.height - 350);

  ctx.font = '700 40px Quicksand, sans-serif';
  ctx.fillStyle = '#A0A0A0';
  ctx.fillText('cuteqr.com', canvas.width / 2, canvas.height - 280);

  ctx.font = '500 36px Quicksand, sans-serif';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText('Create your own QR in seconds ✨', canvas.width / 2, canvas.height - 150);

  // 7. Subtle Watermark (Top Corner)
  ctx.globalAlpha = 0.3;
  ctx.font = '900 30px Quicksand, sans-serif';
  ctx.fillText('@CuteQR_Magic', canvas.width - 200, 100);
  ctx.globalAlpha = 1.0;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}
