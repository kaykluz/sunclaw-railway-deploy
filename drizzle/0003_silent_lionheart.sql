CREATE TABLE `agent_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deploymentId` int,
	`contextSummary` text,
	`fullLog` json,
	`lastModelUsed` varchar(128),
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deploymentId` int,
	`eventType` varchar(64) NOT NULL,
	`eventData` json,
	`eventTimestamp` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`label` varchar(255),
	`apiKey` text NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`keyStatus` enum('healthy','degraded','failed','unchecked') NOT NULL DEFAULT 'unchecked',
	`lastCheckedAt` timestamp,
	`lastError` text,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deploymentId` int,
	`title` varchar(512) NOT NULL DEFAULT 'Untitled Conversation',
	`messages` json NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`model` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `failover_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromProvider` varchar(64) NOT NULL,
	`toProvider` varchar(64) NOT NULL,
	`reason` text,
	`usedManusFallback` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `failover_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(64) NOT NULL,
	`title` varchar(512) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','error','success') NOT NULL DEFAULT 'info',
	`isRead` int NOT NULL DEFAULT 0,
	`actionUrl` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
