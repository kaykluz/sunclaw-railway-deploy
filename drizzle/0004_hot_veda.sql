CREATE TABLE `channel_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` varchar(64) NOT NULL,
	`label` varchar(255),
	`channelStatus` enum('connected','disconnected','pending','error') NOT NULL DEFAULT 'pending',
	`credentials` json,
	`webhookUrl` varchar(512),
	`channelConfig` json,
	`lastStatusMessage` text,
	`lastVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channel_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`apiKeyId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`promptTokens` int NOT NULL DEFAULT 0,
	`completionTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`estimatedCostCents` int NOT NULL DEFAULT 0,
	`usageDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_usage_id` PRIMARY KEY(`id`)
);
