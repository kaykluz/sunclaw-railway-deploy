ALTER TABLE `deployments` MODIFY COLUMN `method` enum('railway','docker','render','hostinger','emergent','northflank','cloudflare','alibaba') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `managedKeysActive` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `managedKeysSubscriptionId` varchar(255);