import { db } from '../../src/config/db';
import { redis } from '../../src/config/redis';

export default async function teardown(): Promise<void> {
	await redis.close();
	await db.close();
}
