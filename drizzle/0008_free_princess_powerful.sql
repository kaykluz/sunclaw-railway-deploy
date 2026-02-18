CREATE TABLE `emailVerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailVerificationTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `emailVerificationTokens_userId_idx` ON `emailVerificationTokens` (`userId`);--> statement-breakpoint
CREATE INDEX `emailVerificationTokens_token_idx` ON `emailVerificationTokens` (`token`);