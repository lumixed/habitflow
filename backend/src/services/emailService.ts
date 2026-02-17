/**
 * Email Service
 * Handles sending emails for reports and notifications
 */

import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || 'habitflow@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    try {
        await transporter.sendMail({
            from: `"HabitFlow" <${EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
        });
        console.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

/**
 * Send a weekly report email
 */
export async function sendWeeklyReport(
    email: string,
    displayName: string,
    stats: {
        weeklyCompletions: number;
        longestStreak: number;
        xpGained: number;
        topHabits: Array<{ title: string; completions: number }>;
    }
): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 40px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 800; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .content { padding: 32px 24px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
        .stat { text-align: center; padding: 20px; background: #f9fafb; border-radius: 16px; }
        .stat-value { font-size: 36px; font-weight: 800; color: #6366F1; margin: 0; }
        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 8px 0 0; }
        .habits-list { margin: 24px 0; }
        .habit-item { display: flex; justify-content: space-between; padding: 12px 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 8px; }
        .cta { display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin: 24px 0; }
        .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Weekly Report</h1>
            <p>Hi ${displayName}, here's your week in review!</p>
        </div>
        <div class="content">
            <div class="stat-grid">
                <div class="stat">
                    <p class="stat-value">${stats.weeklyCompletions}</p>
                    <p class="stat-label">Completions</p>
                </div>
                <div class="stat">
                    <p class="stat-value">${stats.longestStreak}</p>
                    <p class="stat-label">Best Streak</p>
                </div>
                <div class="stat">
                    <p class="stat-value">+${stats.xpGained}</p>
                    <p class="stat-label">XP Gained</p>
                </div>
            </div>
            
            ${stats.topHabits.length > 0 ? `
            <h3>Top Habits</h3>
            <div class="habits-list">
                ${stats.topHabits.map(h => `
                <div class="habit-item">
                    <span>${h.title}</span>
                    <strong>${h.completions} times</strong>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics" class="cta">
                    View Full Analytics →
                </a>
            </center>
        </div>
        <div class="footer">
            <p>Keep up the great work!</p>
            <p>HabitFlow | Unsubscribe preferences in Settings</p>
        </div>
    </div>
</body>
</html>
    `;

    await sendEmail({
        to: email,
        subject: 'Weekly HabitFlow Report',
        html,
    });
}

/**
 * Send a monthly wrap-up email
 */
export async function sendMonthlyReport(
    email: string,
    displayName: string,
    stats: {
        totalCompletions: number;
        daysActive: number;
        topStreak: number;
        levelsGained: number;
        achievementsUnlocked: number;
    }
): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #050505; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 48px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 40px; font-weight: 900; }
        .header p { margin: 12px 0 0; font-size: 18px; }
        .content { padding: 40px 24px; color: white; }
        .stat-highlight { text-align: center; margin: 32px 0; }
        .stat-highlight-value { font-size: 64px; font-weight: 900; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        .stat-highlight-label { font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin: 8px 0 0; }
        .achievement-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
        .achievement { padding: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; text-align: center; }
        .cta { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: 800; margin: 32px 0; text-transform: uppercase; letter-spacing: 0.05em; }
                .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Monthly Wrap-Up</h1>
            <p>Your incredible month, ${displayName}</p>
        </div>
        <div class="content">
            <div class="stat-highlight">
                <p class="stat-highlight-value">${stats.totalCompletions}</p>
                <p class="stat-highlight-label">Total Completions</p>
            </div>
            
            <div class="achievement-grid">
                <div class="achievement">
                    <div style="font-size: 32px; font-weight: 900; color: #f59e0b;">${stats.daysActive}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Days Active</div>
                </div>
                <div class="achievement">
                    <div style="font-size: 32px; font-weight: 900; color: #f59e0b;">${stats.topStreak}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Best Streak</div>
                </div>
                <div class="achievement">
                    <div style="font-size: 32px; font-weight: 900; color: #f59e0b;">+${stats.levelsGained}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Levels Gained</div>
                </div>
                <div class="achievement">
                    <div style="font-size: 32px; font-weight: 900; color: #f59e0b;">${stats.achievementsUnlocked}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Achievements</div>
                </div>
            </div>
            
            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta">
                    Continue Your Journey →
                </a>
            </center>
        </div>
        <div class="footer">
            <p>You're crushing it!</p>
            <p>HabitFlow | Manage email preferences in Settings</p>
        </div>
    </div>
</body>
</html>
    `;

    await sendEmail({
        to: email,
        subject: 'Your Monthly HabitFlow Wrap-Up',
        html,
    });
}
