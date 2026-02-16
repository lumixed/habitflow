/**
 * Social Share Graphics Utility
 * Generates shareable images for achievements, streaks, and milestones
 */

export interface ShareGraphicOptions {
    type: 'achievement' | 'streak' | 'levelup' | 'milestone';
    data: {
        title: string;
        subtitle?: string;
        icon?: string;
        value?: number;
        userName?: string;
        accentColor?: string;
    };
}

/**
 * Generate a shareable graphic as a data URL
 * @param options Configuration for the graphic
 * @returns Data URL of the generated image
 */
export function generateShareGraphic(options: ShareGraphicOptions): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Standard social media preview size

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const { type, data } = options;
    const accentColor = data.accentColor || '#6366F1';

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#050505');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Brand accent
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, 20, canvas.height);

    // Icon/Emoji
    if (data.icon) {
        ctx.font = 'bold 180px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.icon, 200, 380);
    }

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(data.title, 360, 280);

    // Subtitle
    if (data.subtitle) {
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '48px system-ui';
        ctx.fillText(data.subtitle, 360, 360);
    }

    // Value (for streaks/levels)
    if (data.value) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 120px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(data.value.toString(), canvas.width - 80, 380);
    }

    // User name
    if (data.userName) {
        ctx.fillStyle = '#666666';
        ctx.font = '32px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(`by ${data.userName}`, 360, 520);
    }

    // HabitFlow branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('HabitFlow', canvas.width - 80, canvas.height - 40);

    return canvas.toDataURL('image/png');
}

/**
 * Download a share graphic
 * @param dataUrl Data URL from generateShareGraphic
 * @param filename Filename for the download
 */
export function downloadShareGraphic(dataUrl: string, filename: string = 'habitflow-share.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}

/**
 * Copy share graphic to clipboard
 * @param dataUrl Data URL from generateShareGraphic
 */
export async function copyShareGraphicToClipboard(dataUrl: string): Promise<void> {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
    ]);
}

/**
 * Share via Web Share API (mobile-friendly)
 * @param dataUrl Data URL from generateShareGraphic
 * @param title Title for the share
 * @param text Text for the share
 */
export async function shareGraphic(dataUrl: string, title: string, text: string): Promise<void> {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'habitflow-achievement.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title,
            text,
            files: [file]
        });
    } else {
        // Fallback to download
        downloadShareGraphic(dataUrl);
    }
}
