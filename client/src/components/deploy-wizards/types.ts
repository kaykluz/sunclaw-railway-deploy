export interface PlatformWizardProps {
  wizardState: {
    llmProvider: string;
    llmApiKey: string;
    llmModel: string;
    llmEndpoint: string;
    whatsappEnabled: boolean;
    telegramEnabled: boolean;
    telegramToken: string;
    slackEnabled: boolean;
    slackToken: string;
    discordEnabled: boolean;
    discordToken: string;
    kiishaEnabled: boolean;
    kiishaUrl: string;
    kiishaApiKey: string;
    webhookSecret: string;
    instanceName: string;
    [key: string]: any;
  };
  buildEnvVars: () => Record<string, string>;
  envContent: string;
  userPlan: string;
}
