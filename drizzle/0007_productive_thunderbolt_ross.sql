CREATE TABLE `authAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`userId` int,
	`sessionId` varchar(64),
	`ipHash` varchar(64),
	`userAgentHash` varchar(64),
	`details` json,
	`success` boolean NOT NULL,
	`failureReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loginAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifierHash` varchar(64) NOT NULL,
	`ipHash` varchar(64) NOT NULL,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	`success` boolean NOT NULL,
	`failureCount` int DEFAULT 0,
	`lockedUntil` timestamp,
	CONSTRAINT `loginAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serverSessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`revokedReason` varchar(255),
	`ipHash` varchar(64),
	`userAgentHash` varchar(64),
	`refreshTokenHash` varchar(64),
	`csrfSecret` varchar(64),
	`deviceType` varchar(50),
	`browserName` varchar(50),
	`osName` varchar(50),
	CONSTRAINT `serverSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `planSelected` boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX `authAuditLog_userId_idx` ON `authAuditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `authAuditLog_eventType_idx` ON `authAuditLog` (`eventType`);--> statement-breakpoint
CREATE INDEX `authAuditLog_createdAt_idx` ON `authAuditLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `loginAttempts_identifierHash_idx` ON `loginAttempts` (`identifierHash`);--> statement-breakpoint
CREATE INDEX `loginAttempts_ipHash_idx` ON `loginAttempts` (`ipHash`);--> statement-breakpoint
CREATE INDEX `passwordResetTokens_userId_idx` ON `passwordResetTokens` (`userId`);--> statement-breakpoint
CREATE INDEX `passwordResetTokens_token_idx` ON `passwordResetTokens` (`token`);--> statement-breakpoint
CREATE INDEX `serverSessions_userId_idx` ON `serverSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `serverSessions_expiresAt_idx` ON `serverSessions` (`expiresAt`);