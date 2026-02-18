import { describe, it, expect, vi } from "vitest";
import { getApiType, generateOpenClawConfig, getOpenClawEnvVars } from "./openclaw-config";
import { buildFullConfig } from "./channel-env-map";

describe("SunClaw Global Fixes Validation", () => {
  describe("getApiType", () => {
    it("should return openai-completions for unknown providers", () => {
      expect(getApiType("some-new-provider")).toBe("openai-completions");
    });

    it("should return openai-completions for openrouter", () => {
      expect(getApiType("openrouter")).toBe("openai-completions");
    });

    it("should return anthropic-messages for anthropic", () => {
      expect(getApiType("anthropic")).toBe("anthropic-messages");
    });
  });

  describe("generateOpenClawConfig", () => {
    it("should handle unknown providers by defaulting to OpenAI base URL", () => {
      const config = generateOpenClawConfig({
        channels: [],
        models: [{ provider: "custom-p", apiKey: "key1" }],
      });
      
      const providers = (config.models as any).providers;
      expect(providers["custom-p"]).toBeDefined();
      expect(providers["custom-p"].baseUrl).toBe("https://api.openai.com/v1");
    });

    it("should use custom baseUrl if provided", () => {
      const config = generateOpenClawConfig({
        channels: [],
        models: [{ provider: "custom-p", apiKey: "key1", baseUrl: "https://my-proxy.com" }],
      });
      
      const providers = (config.models as any).providers;
      expect(providers["custom-p"].baseUrl).toBe("https://my-proxy.com");
    });

    it("should use custom model if provided", () => {
      const config = generateOpenClawConfig({
        channels: [],
        models: [{ provider: "custom-p", apiKey: "key1", model: "my-special-model" }],
      });
      
      const providers = (config.models as any).providers;
      expect(providers["custom-p"].models[0].id).toBe("my-special-model");
    });
  });

  describe("getOpenClawEnvVars", () => {
    it("should include LLM_API_KEY as a global fallback", () => {
      const vars = getOpenClawEnvVars({
        channels: [],
        models: [{ provider: "openai", apiKey: "sk-123" }],
      });
      
      expect(vars.LLM_API_KEY).toBe("sk-123");
      expect(vars.OPENAI_API_KEY).toBe("sk-123");
    });
  });
});
