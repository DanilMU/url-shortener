import { db } from '../../src/config/db';

export const cleanDatabase = async (): Promise<void> => {
	await db.raw('TRUNCATE TABLE urls RESTART IDENTITY CASCADE;');
};
