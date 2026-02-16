import prisma from '../config/prisma';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            habits: {
                include: {
                    completions: true,
                    streaks: true
                }
            },
            achievements: {
                include: {
                    achievement: true
                }
            },
            analytics: true,
            streaks: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    const passthrough = new PassThrough();
    archive.pipe(passthrough);

    // Add JSON data
    const userDataJson = JSON.stringify(user, null, 2);
    archive.append(userDataJson, { name: 'data.json' });

    // Add habits CSV
    const habitsCsvLabels = ['id', 'title', 'description', 'frequency', 'created_at', 'is_active'];
    const habitsCsvRows = user.habits.map(h => [
        h.id,
        h.title,
        h.description || '',
        h.frequency,
        h.created_at.toISOString(),
        h.is_active.toString()
    ]);
    const habitsCsvContent = [habitsCsvLabels.join(','), ...habitsCsvRows.map(r => r.join(','))].join('\n');
    archive.append(habitsCsvContent, { name: 'habits.csv' });

    // Add completions CSV
    const completionsCsvLabels = ['id', 'habit_id', 'completed_date', 'created_at'];
    const completionsCsvRows = user.habits.flatMap(h => h.completions.map(c => [
        c.id,
        c.habit_id,
        c.completed_date.toISOString(),
        c.created_at.toISOString()
    ]));
    const completionsCsvContent = [completionsCsvLabels.join(','), ...completionsCsvRows.map(r => r.join(','))].join('\n');
    archive.append(completionsCsvContent, { name: 'completions.csv' });

    archive.finalize();

    return passthrough;
}
