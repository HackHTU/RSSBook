/** biome-ignore-all lint/suspicious/noConsole: logger */

enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

interface LoggerConfig {
	level: LogLevel;
	timestamp: boolean;
	colors: boolean;
}
class Logger {
	private config: LoggerConfig;

	constructor(config: Partial<LoggerConfig> = {}) {
		this.config = {
			colors: true,
			level: LogLevel.INFO,
			timestamp: true,
			...config,
		};
	}

	private formatMessage(level: string, message: string): string {
		const timestamp = this.config.timestamp ? `[${new Date().toISOString()}]` : "";
		return `${timestamp} [${level}] ${message}`;
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.config.level;
	}

	debug(message: string, ...args: unknown[]): this {
		if (!this.shouldLog(LogLevel.DEBUG)) return this;
		console.debug(this.formatMessage("DEBUG", message), ...args);
		return this;
	}

	info(message: string, ...args: unknown[]): this {
		if (!this.shouldLog(LogLevel.INFO)) return this;
		console.info(this.formatMessage("INFO", message), ...args);
		return this;
	}

	warn(message: string, ...args: unknown[]): this {
		if (!this.shouldLog(LogLevel.WARN)) return this;
		console.warn(this.formatMessage("WARN", message), ...args);
		return this;
	}

	error(message: string, ...args: unknown[]): this {
		if (!this.shouldLog(LogLevel.ERROR)) return this;
		console.error(this.formatMessage("ERROR", message), ...args);
		return this;
	}

	setLevel(level: LogLevel): this {
		this.config.level = level;
		return this;
	}
}

const logger = new Logger({
	level: process.env.NODE_ENV === "production" ? LogLevel.ERROR : LogLevel.DEBUG,
});

export { logger, LogLevel };
