import { relations } from "drizzle-orm";
import { users, configurations, deployments } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  configurations: many(configurations),
  deployments: many(deployments),
}));

export const configurationsRelations = relations(configurations, ({ one, many }) => ({
  user: one(users, {
    fields: [configurations.userId],
    references: [users.id],
  }),
  deployments: many(deployments),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  user: one(users, {
    fields: [deployments.userId],
    references: [users.id],
  }),
  configuration: one(configurations, {
    fields: [deployments.configurationId],
    references: [configurations.id],
  }),
}));
