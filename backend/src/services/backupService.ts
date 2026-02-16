import cron from 'node-cron';
import prisma from '../config/prisma';
import * as exportService from './exportService';
import fs from 'fs';
import path from 'path';

// This service handles scheduled data exports for users who have opted-in.
// For now, it will run once a week and save the exports to a local directory.
// In a production app, these would be sent via email or uploaded to cloud storage.

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export function initBackupJob() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Run every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        console.log('[BackupJob] Starting weekly scheduled exports...');

        try {
            const users = await prisma.user.findMany({
                where: { scheduled_export_enabled: true }
            });

            console.log(`[BackupJob] Found ${users.length} users for scheduled export.`);

            for (const user of users) {
                try {
                    const zipStream = await exportService.exportUserData(user.id);
                    const fileName = `backup-${user.id}-${new Date().toISOString().split('T')[0]}.zip`;
                    const filePath = path.join(BACKUP_DIR, fileName);

                    const writeStream = fs.createWriteStream(filePath);
                    zipStream.pipe(writeStream);

                    await new Promise<void>((resolve, reject) => {
                        writeStream.on('finish', () => resolve());
                        writeStream.on('error', reject);
                    });

                    // Update last export timestamp
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { last_export_at: new Date() }
                    });

                    console.log(`[BackupJob] Successfully backed up data for user ${user.id}`);
                } catch (err) {
                    console.error(`[BackupJob] Failed to backup data for user ${user.id}:`, err);
                }
            }
        } catch (err) {
            console.error('[BackupJob] Critical error in backup job:', err);
        }
    });

    console.log('[BackupJob] Weekly export job scheduled.');
}
