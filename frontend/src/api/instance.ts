import type { CreateAxiosDefaults } from 'axios';
import axios from 'axios';

const options: CreateAxiosDefaults = {
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
};

const api = axios.create(options);
const instance = axios.create(options);

export { api, instance };
