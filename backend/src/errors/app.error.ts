export class AppError extends Error {
	public readonly statusCode: number;

	public constructor(message: string, statusCode: number = 400) {
		super(message);
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NotFoundError extends AppError {
	public constructor(message: string = 'Resource not found') {
		super(message, 404);
	}
}

export class ConflictError extends AppError {
	public constructor(message: string = 'Resource conflict') {
		super(message, 409);
	}
}

export class BadRequestError extends AppError {
	public constructor(message: string = 'Bad request') {
		super(message, 400);
	}
}
