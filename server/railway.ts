/**
 * Railway API Integration
 * Handles zero-touch provisioning: project creation, service setup, env vars, domain, and deploy.
 */

import { ENV } from "./_core/env";

const RAILWAY_API_URL = "https://backboard.railway.com/graphql/v2";

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

async function railwayGQL<T = any>(
  query: string,
  variables?: Record<string, any>,
  retries = 2
): Promise<T> {
  const token = ENV.railwayApiToken;
  if (!token) throw new Error("RAILWAY_API_TOKEN is not configured");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(RAILWAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Railway API HTTP ${res.status}: ${text}`);
      }

      const json: GraphQLResponse<T> = await res.json();
      if (json.errors?.length) {
        throw new Error(
          `Railway API error: ${json.errors.map((e) => e.message).join(", ")}`
        );
      }

      return json.data as T;
    } catch (err: any) {
      lastError = err;
      const isRetryable = err?.message?.includes("fetch failed") ||
        err?.message?.includes("ECONNRESET") ||
        err?.message?.includes("ETIMEDOUT") ||
        err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
      if (isRetryable && attempt < retries) {
        console.warn(`[Railway] Attempt ${attempt + 1} failed (${err.message}), retrying in ${(attempt + 1) * 2}s...`);
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Railway API call failed after retries");
}

// ── Step 1: Create a new Railway project ──
export async function createProject(
  name: string
): Promise<{ projectId: string; environmentId: string }> {
  const data = await railwayGQL<{
    projectCreate: { id: string; environments: { edges: Array<{ node: { id: string; name: string } }> } };
  }>(
    `mutation projectCreate($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        id
        environments { edges { node { id name } } }
      }
    }`,
    { input: { name } }
  );

  const project = data.projectCreate;
  const prodEnv = project.environments.edges.find(
    (e) => e.node.name === "production"
  );
  const environmentId = prodEnv?.node.id ?? project.environments.edges[0]?.node.id;

  if (!environmentId) throw new Error("No environment found in new project");

  return { projectId: project.id, environmentId };
}

// ── Step 2: Create a service from a GitHub repo ──
export async function createServiceFromRepo(
  projectId: string,
  serviceName: string,
  repo: string
): Promise<string> {
  const data = await railwayGQL<{ serviceCreate: { id: string } }>(
    `mutation serviceCreate($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id }
    }`,
    {
      input: {
        projectId,
        name: serviceName,
        source: { repo },
      },
    }
  );
  return data.serviceCreate.id;
}

// ── Step 2b: Reconnect service to repo (forces latest commit) ──
export async function reconnectService(
  serviceId: string,
  repo: string,
  branch: string = "main"
): Promise<void> {
  await railwayGQL(
    `mutation serviceConnect($id: String!, $input: ServiceConnectInput!) {
      serviceConnect(id: $id, input: $input) { id }
    }`,
    {
      id: serviceId,
      input: { repo, branch },
    }
  );
}

// ── Step 3: Set environment variables (bulk) ──
export async function setVariables(
  projectId: string,
  environmentId: string,
  serviceId: string,
  variables: Record<string, string>
): Promise<boolean> {
  await railwayGQL(
    `mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }`,
    {
      input: { projectId, environmentId, serviceId, variables },
    }
  );
  return true;
}

// ── Step 4: Create a Railway domain (*.railway.app) ──
export async function createDomain(
  serviceId: string,
  environmentId: string
): Promise<string> {
  const data = await railwayGQL<{
    serviceDomainCreate: { id: string; domain: string };
  }>(
    `mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) { id domain }
    }`,
    {
      input: { serviceId, environmentId },
    }
  );
  return data.serviceDomainCreate.domain;
}

// ── Step 5: Trigger a deployment ──
export async function deployService(
  serviceId: string,
  environmentId: string
): Promise<string> {
  const data = await railwayGQL<{ serviceInstanceDeployV2: string }>(
    `mutation serviceInstanceDeployV2($serviceId: String!, $environmentId: String!) {
      serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    { serviceId, environmentId }
  );
  return data.serviceInstanceDeployV2; // deployment ID
}

// ── Step 6: Get deployment status ──
export async function getDeploymentStatus(
  deploymentId: string
): Promise<{ status: string; url?: string }> {
  const data = await railwayGQL<{
    deployment: { id: string; status: string; staticUrl?: string };
  }>(
    `query deployment($id: String!) {
      deployment(id: $id) { id status staticUrl }
    }`,
    { id: deploymentId }
  );
  return {
    status: data.deployment.status,
    url: data.deployment.staticUrl,
  };
}

// ── Get latest deployment for a service ──
export async function getLatestDeployment(
  serviceId: string,
  environmentId: string
): Promise<{ id: string; status: string; url?: string; commitHash?: string; createdAt?: string } | null> {
  const data = await railwayGQL<{
    deployments: {
      edges: Array<{
        node: {
          id: string;
          status: string;
          staticUrl?: string;
          meta?: { commitHash?: string };
          createdAt?: string;
        };
      }>;
    };
  }>(
    `query deployments($input: DeploymentListInput!) {
      deployments(input: $input) {
        edges {
          node { id status staticUrl meta createdAt }
        }
      }
    }`,
    {
      input: { serviceId, environmentId },
    }
  );

  const latest = data.deployments.edges[0]?.node;
  if (!latest) return null;

  return {
    id: latest.id,
    status: latest.status,
    url: latest.staticUrl,
    commitHash: latest.meta?.commitHash,
    createdAt: latest.createdAt,
  };
}

// ── Full provisioning pipeline ──
export interface ProvisionInput {
  projectName: string;
  repo: string;
  envVars: Record<string, string>;
}

export interface ProvisionResult {
  projectId: string;
  serviceId: string;
  environmentId: string;
  domain: string;
  deploymentId: string;
}

export async function provisionRailway(
  input: ProvisionInput
): Promise<ProvisionResult> {
  // Merge user env vars with Railway template defaults
  const { mergeWithDefaults } = await import("./railway-defaults");
  const mergedVars = mergeWithDefaults(input.envVars);

  // 1. Create project
  const { projectId, environmentId } = await createProject(input.projectName);

  // 2. Create service from GitHub repo
  const serviceId = await createServiceFromRepo(
    projectId,
    "sunclaw",
    input.repo
  );

  // 2b. Reconnect service to ensure latest commit is used
  // This forces Railway to pick up the latest commit from the repo
  try {
    await reconnectService(serviceId, input.repo, "main");
  } catch (e) {
    // Non-critical: service may already be connected correctly
    console.warn("[Railway] serviceConnect warning:", e);
  }

  // 3. Set environment variables (defaults + user overrides)
  if (Object.keys(mergedVars).length > 0) {
    await setVariables(projectId, environmentId, serviceId, mergedVars);
  }

  // 4. Create domain
  const domain = await createDomain(serviceId, environmentId);

  // 5. Deploy (service auto-deploys from GitHub, but we trigger explicitly)
  const deploymentId = await deployService(serviceId, environmentId);

  return { projectId, serviceId, environmentId, domain, deploymentId };
}

// ── Redeploy an existing service ──
export async function redeployService(
  serviceId: string,
  environmentId: string
): Promise<string> {
  // Trigger a fresh deploy of the existing service
  const deploymentId = await deployService(serviceId, environmentId);
  return deploymentId;
}

// ── Get environment variables for a service ──
export async function getVariables(
  projectId: string,
  environmentId: string,
  serviceId: string
): Promise<Record<string, string>> {
  const data = await railwayGQL<{ variables: Record<string, string> }>(
    `query variables($projectId: String!, $environmentId: String!, $serviceId: String!) {
      variables(
        projectId: $projectId
        environmentId: $environmentId
        serviceId: $serviceId
      )
    }`,
    { projectId, environmentId, serviceId }
  );
  return data.variables ?? {};
}

// ── Get runtime logs for a deployment ──
export async function getDeploymentLogs(
  deploymentId: string,
  limit = 200
): Promise<Array<{ timestamp: string; message: string; severity: string }>> {
  const data = await railwayGQL<{
    deploymentLogs: Array<{ timestamp: string; message: string; severity: string }>;
  }>(
    `query deploymentLogs($deploymentId: String!, $limit: Int) {
      deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
        timestamp
        message
        severity
      }
    }`,
    { deploymentId, limit }
  );
  return data.deploymentLogs ?? [];
}

// ── Get build logs for a deployment ──
export async function getBuildLogs(
  deploymentId: string,
  limit = 200
): Promise<Array<{ timestamp: string; message: string; severity: string }>> {
  const data = await railwayGQL<{
    buildLogs: Array<{ timestamp: string; message: string; severity: string }>;
  }>(
    `query buildLogs($deploymentId: String!, $limit: Int) {
      buildLogs(deploymentId: $deploymentId, limit: $limit) {
        timestamp
        message
        severity
      }
    }`,
    { deploymentId, limit }
  );
  return data.buildLogs ?? [];
}

// ── List existing projects ──
export async function listProjects(): Promise<
  Array<{ id: string; name: string }>
> {
  const data = await railwayGQL<{
    projects: { edges: Array<{ node: { id: string; name: string } }> };
  }>(`{ projects { edges { node { id name } } } }`);
  return data.projects.edges.map((e) => e.node);
}

// ── Delete a Railway project ──
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    await railwayGQL(
      `mutation projectDelete($id: String!) {
        projectDelete(id: $id)
      }`,
      { id: projectId }
    );
    console.log(`[Railway] Deleted project ${projectId}`);
    return true;
  } catch (err: any) {
    console.error(`[Railway] Failed to delete project ${projectId}:`, err.message);
    return false;
  }
}
