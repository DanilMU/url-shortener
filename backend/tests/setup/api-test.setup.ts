import { createApp } from '../../src/app';
import { db } from '../../src/config/db';
import { redis } from '../../src/config/redis';
import { cleanDatabase } from './test-db.helper';

export const app = createApp();

export const resetStorage = async (): Promise<void> => {
	await cleanDatabase();
	await redis.flushdb();
};

export const closeStorage = async (): Promise<void> => {
	await redis.close();
	await db.close();
};
