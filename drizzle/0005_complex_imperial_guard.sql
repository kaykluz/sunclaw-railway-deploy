CREATE TABLE `token_budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthlyLimit` int NOT NULL,
	`currentUsage` int NOT NULL DEFAULT 0,
	`budgetPeriod` varchar(7) NOT NULL,
	`notified80` int NOT NULL DEFAULT 0,
	`notified100` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_budgets_id` PRIMARY KEY(`id`)
);
