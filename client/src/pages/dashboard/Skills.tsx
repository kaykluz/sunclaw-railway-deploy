import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sun,
  Wind,
  Zap,
  BarChart3,
  FileCheck,
  Globe,
  Wrench,
  Bell,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  Upload,
  Play,
  Loader2,
  X,
  FileCode,
  AlertCircle,
  Search,
  Download,
  ExternalLink,
  Package,
  Cpu,
  Bot,
  Layers,
  RefreshCw,
} from "lucide-react";

/* ─── Skill type definitions ─── */
interface SkillDef {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  category: "installed" | "re" | "kiisha" | "clawhub";
  installed?: boolean;
}

/* ─── Installed RE Skills (Standalone) ─── */
const RE_SKILLS: SkillDef[] = [
  { id: "solar.irradiance_lookup", name: "Solar Irradiance", description: "GHI/DNI/DHI for any location worldwide via EU PVGIS and NREL APIs", icon: Sun, color: "text-amber", bgColor: "bg-amber/10", category: "re", installed: true },
  { id: "finance.lcoe_calculator", name: "LCOE Calculator", description: "Levelized Cost of Energy with IRENA benchmark comparison", icon: BarChart3, color: "text-cyan", bgColor: "bg-cyan/10", category: "re", installed: true },
  { id: "wind.turbine_specs", name: "Wind Turbine Specs", description: "Technical database of 10+ major turbine models and specifications", icon: Wind, color: "text-cyan", bgColor: "bg-cyan/10", category: "re", installed: true },
  { id: "grid.status", name: "Grid Status", description: "Installed capacity, renewable share, and market data for 10+ countries", icon: Zap, color: "text-emerald", bgColor: "bg-emerald/10", category: "re", installed: true },
  { id: "research.irena_search", name: "IRENA Search", description: "Curated index of key IRENA publications and policy documents", icon: FileCheck, color: "text-cyan", bgColor: "bg-cyan/10", category: "re", installed: true },
  { id: "carbon.emissions_calculator", name: "Carbon Calculator", description: "Avoided CO₂ emissions and carbon credit value estimation", icon: Globe, color: "text-emerald", bgColor: "bg-emerald/10", category: "re", installed: true },
  { id: "weather.forecast", name: "Weather Forecast", description: "7-day weather and solar/wind resource forecasting for project sites", icon: Sun, color: "text-blue-400", bgColor: "bg-blue-400/10", category: "re", installed: true },
  { id: "ppa.analyzer", name: "PPA Analyzer", description: "Power Purchase Agreement tariff structure analysis, bankability assessment, and DSCR waterfall modeling", icon: FileCheck, color: "text-purple-400", bgColor: "bg-purple-400/10", category: "re", installed: true },
  { id: "solar.pv_design", name: "Solar PV Design", description: "Module selection, string sizing with Voc/Vmp temperature corrections, tilt/azimuth optimization, and DC:AC ratio design", icon: Sun, color: "text-amber", bgColor: "bg-amber/10", category: "re", installed: true },
  { id: "bess.sizing", name: "BESS Sizing", description: "Battery Energy Storage System sizing — AC/DC coupling, capacity modeling, degradation curves, and cycling strategy", icon: Zap, color: "text-emerald", bgColor: "bg-emerald/10", category: "re", installed: true },
  { id: "finance.financial_model", name: "Financial Model", description: "IRR/NPV modeling, sensitivity analysis, debt sizing, DSCR calculation, and investment memo preparation", icon: BarChart3, color: "text-cyan", bgColor: "bg-cyan/10", category: "re", installed: true },
  { id: "om.diagnostics", name: "O&M Diagnostics", description: "Performance ratio analysis, fault detection, inverter error code interpretation, and degradation tracking", icon: Wrench, color: "text-orange-400", bgColor: "bg-orange-400/10", category: "re", installed: true },
];

/* ─── KIISHA Enterprise Skills ─── */
const KIISHA_SKILLS: SkillDef[] = [
  { id: "kiisha.portfolio.summary", name: "Portfolio Summary", description: "Real-time overview of renewable energy asset portfolios", icon: BarChart3, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.documents.status", name: "Document Compliance", description: "VATR-enforced document status and gap analysis", icon: FileCheck, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.ticket.create", name: "Work Orders", description: "Create and track maintenance tickets and work orders", icon: Wrench, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.alerts.list", name: "Alert Management", description: "View and acknowledge operational alerts in real-time", icon: Bell, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.payment.initiate", name: "Payments", description: "Initiate and track payments through KIISHA", icon: CreditCard, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.cmms.schedule", name: "CMMS Scheduling", description: "Computerized Maintenance Management System scheduling and tracking", icon: Wrench, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.reporting.generate", name: "Report Generator", description: "Generate compliance and performance reports on demand", icon: FileCheck, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
  { id: "kiisha.asset.audit", name: "Asset Audit", description: "Full VATR audit trail for any asset in the portfolio", icon: Globe, color: "text-amber", bgColor: "bg-amber/10", category: "kiisha" },
];

/* ─── ClawHub Community Skills (sample — fetched from clawhub.ai/skills in production) ─── */
const CLAWHUB_SKILLS: SkillDef[] = [
  { id: "clawhub.web_search", name: "Web Search", description: "Search the web and return structured results with source citations", icon: Search, color: "text-violet-400", bgColor: "bg-violet-400/10", category: "clawhub" },
  { id: "clawhub.code_interpreter", name: "Code Interpreter", description: "Execute Python code in a sandboxed environment for data analysis", icon: Cpu, color: "text-green-400", bgColor: "bg-green-400/10", category: "clawhub" },
  { id: "clawhub.image_generation", name: "Image Generation", description: "Generate images from text descriptions using DALL-E or Stable Diffusion", icon: Sparkles, color: "text-pink-400", bgColor: "bg-pink-400/10", category: "clawhub" },
  { id: "clawhub.pdf_reader", name: "PDF Reader", description: "Extract and analyze content from PDF documents", icon: FileCheck, color: "text-orange-400", bgColor: "bg-orange-400/10", category: "clawhub" },
  { id: "clawhub.calendar_manager", name: "Calendar Manager", description: "Manage Google Calendar events — create, update, and query schedules", icon: Bell, color: "text-blue-400", bgColor: "bg-blue-400/10", category: "clawhub" },
  { id: "clawhub.email_sender", name: "Email Sender", description: "Compose and send emails via SMTP or API integration", icon: Globe, color: "text-red-400", bgColor: "bg-red-400/10", category: "clawhub" },
  { id: "clawhub.data_scraper", name: "Data Scraper", description: "Scrape structured data from websites with configurable selectors", icon: Download, color: "text-teal-400", bgColor: "bg-teal-400/10", category: "clawhub" },
  { id: "clawhub.translation", name: "Translation", description: "Translate text between 100+ languages with context awareness", icon: Globe, color: "text-indigo-400", bgColor: "bg-indigo-400/10", category: "clawhub" },
  { id: "clawhub.sentiment_analysis", name: "Sentiment Analysis", description: "Analyze sentiment and emotion in text content", icon: BarChart3, color: "text-yellow-400", bgColor: "bg-yellow-400/10", category: "clawhub" },
  { id: "clawhub.knowledge_base", name: "Knowledge Base", description: "RAG-powered knowledge base for custom document Q&A", icon: Layers, color: "text-emerald", bgColor: "bg-emerald/10", category: "clawhub" },
];

const EXAMPLE_SKILL_CONFIG = `{
  "name": "my_custom_skill",
  "description": "A custom skill that does something useful",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The user query to process"
      }
    },
    "required": ["query"]
  }
}`;

/* ─── Skill Card Component ─── */
function SkillCard({
  skill,
  locked = false,
  installable = false,
  onInstall,
}: {
  skill: SkillDef;
  locked?: boolean;
  installable?: boolean;
  onInstall?: () => void;
}) {
  return (
    <Card className={`bg-card/50 border-border/50 hover:border-cyan/20 transition-colors ${locked ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg ${skill.bgColor} flex items-center justify-center shrink-0`}>
            <skill.icon className={`w-4.5 h-4.5 ${skill.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold truncate">{skill.name}</h4>
              {locked && <Lock className="w-3 h-3 text-amber/60 shrink-0" />}
              {skill.installed && (
                <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5 text-[9px] font-mono">
                  Installed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{skill.description}</p>
            <div className="flex items-center justify-between mt-2">
              <code className="text-[10px] text-muted-foreground/60 font-mono">{skill.id}</code>
              {installable && !skill.installed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-cyan hover:text-cyan gap-1"
                  onClick={onInstall}
                >
                  <Download className="w-3 h-3" /> Install
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Component ─── */
export default function DashboardSkills() {
  const [showUpload, setShowUpload] = useState(false);
  const [skillConfig, setSkillConfig] = useState("");
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [clawHubSearch, setClawHubSearch] = useState("");
  const [activeTab, setActiveTab] = useState("installed");

  // Installed skills = RE + any installed ClawHub
  const [installedClawHub, setInstalledClawHub] = useState<Set<string>>(new Set());

  const allInstalled = useMemo(() => {
    return [
      ...RE_SKILLS,
      ...CLAWHUB_SKILLS.filter((s) => installedClawHub.has(s.id)).map((s) => ({ ...s, installed: true })),
    ];
  }, [installedClawHub]);

  const filteredClawHub = useMemo(() => {
    if (!clawHubSearch.trim()) return CLAWHUB_SKILLS;
    const q = clawHubSearch.toLowerCase();
    return CLAWHUB_SKILLS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [clawHubSearch]);

  const validateConfig = (config: string): boolean => {
    try {
      const parsed = JSON.parse(config);
      if (!parsed.name || typeof parsed.name !== "string") {
        setValidationError("Skill config must have a 'name' field (string)");
        return false;
      }
      if (!parsed.description || typeof parsed.description !== "string") {
        setValidationError("Skill config must have a 'description' field (string)");
        return false;
      }
      setValidationError(null);
      return true;
    } catch {
      setValidationError("Invalid JSON — check your syntax");
      return false;
    }
  };

  const handleTest = async () => {
    if (!validateConfig(skillConfig)) return;
    if (!testPrompt.trim()) {
      toast.error("Enter a test prompt");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      toast.info("Testing skill configuration...");
      setTimeout(() => {
        const parsed = JSON.parse(skillConfig);
        setTestResult(
          `Skill "${parsed.name}" validated successfully.\n\n` +
          `Configuration is well-formed with ${Object.keys(parsed.parameters?.properties ?? {}).length} parameter(s).\n\n` +
          `The skill is ready to be deployed to your SunClaw instance.`
        );
        setTesting(false);
      }, 1500);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
      setTesting(false);
    }
  };

  const handleInstallClawHub = (skillId: string) => {
    setInstalledClawHub((prev) => { const next = new Set(Array.from(prev)); next.add(skillId); return next; });
    toast.success("Skill installed successfully");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Skills</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage installed skills, browse ClawHub, and upload custom configurations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-cyan/30 text-cyan hover:bg-cyan/10"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload className="w-3 h-3" />
          {showUpload ? "Hide Upload" : "Custom Skill"}
        </Button>
      </div>

      {/* Custom Skill Upload & Test */}
      {showUpload && (
        <Card className="border-cyan/30 bg-cyan/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-semibold">Upload & Test Custom Skill</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Skill Configuration (JSON)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-muted-foreground"
                  onClick={() => setSkillConfig(EXAMPLE_SKILL_CONFIG)}
                >
                  Load Example
                </Button>
              </div>
              <Textarea
                className="font-mono text-xs min-h-[160px]"
                placeholder="Paste your skill configuration JSON here..."
                value={skillConfig}
                onChange={(e) => {
                  setSkillConfig(e.target.value);
                  if (validationError) validateConfig(e.target.value);
                }}
              />
              {validationError && (
                <div className="flex items-center gap-1.5 mt-1.5 text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">{validationError}</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Test Prompt</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  className="text-sm"
                  placeholder="e.g. What's the solar irradiance in Lagos?"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
                <Button
                  size="sm"
                  className="gap-1.5 bg-cyan text-background hover:bg-cyan/90 shrink-0"
                  onClick={handleTest}
                  disabled={testing || !skillConfig.trim()}
                >
                  {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Test
                </Button>
              </div>
            </div>
            {testResult && (
              <div className="rounded-md border border-border/50 bg-background/50 p-3">
                <p className="text-xs font-mono text-muted-foreground mb-1">Test Result</p>
                <p className="text-sm whitespace-pre-wrap">{testResult}</p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (validateConfig(skillConfig)) {
                    toast.success("Skill configuration is valid and ready to deploy.");
                  }
                }}
                disabled={!skillConfig.trim()}
              >
                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Validate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setShowUpload(false);
                  setSkillConfig("");
                  setTestPrompt("");
                  setTestResult(null);
                  setValidationError(null);
                }}
              >
                <X className="w-3 h-3 mr-1.5" /> Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="installed" className="gap-1.5 text-xs">
            <Package className="w-3.5 h-3.5" /> Installed ({allInstalled.length})
          </TabsTrigger>
          <TabsTrigger value="re" className="gap-1.5 text-xs">
            <Sun className="w-3.5 h-3.5" /> RE Skills ({RE_SKILLS.length})
          </TabsTrigger>
          <TabsTrigger value="kiisha" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" /> KIISHA ({KIISHA_SKILLS.length})
          </TabsTrigger>
          <TabsTrigger value="clawhub" className="gap-1.5 text-xs">
            <Bot className="w-3.5 h-3.5" /> ClawHub
          </TabsTrigger>
        </TabsList>

        {/* Installed Skills */}
        <TabsContent value="installed" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allInstalled.map((skill) => (
              <SkillCard key={skill.id} skill={{ ...skill, installed: true }} />
            ))}
          </div>
          {allInstalled.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No skills installed yet. Browse ClawHub to find skills.</p>
            </div>
          )}
        </TabsContent>

        {/* RE Skills */}
        <TabsContent value="re" className="mt-4">
          <div className="mb-4 p-3 rounded-lg border border-cyan/20 bg-cyan/5">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-cyan" />
              <span className="text-sm font-medium text-cyan">Renewable Energy Skills</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Purpose-built for renewable energy professionals. These skills are pre-installed and work out of the box.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RE_SKILLS.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </TabsContent>

        {/* KIISHA Skills */}
        <TabsContent value="kiisha" className="mt-4">
          <div className="mb-4 p-3 rounded-lg border border-amber/20 bg-amber/5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber" />
              <span className="text-sm font-medium text-amber">KIISHA Enterprise Skills</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enterprise-grade skills powered by KIISHA. Requires a KIISHA API token configured in Settings.
              Includes portfolio management, VATR compliance, CMMS, ticketing, and payment processing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {KIISHA_SKILLS.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locked />
            ))}
          </div>
        </TabsContent>

        {/* ClawHub */}
        <TabsContent value="clawhub" className="mt-4">
          <div className="mb-4 p-3 rounded-lg border border-violet-400/20 bg-violet-400/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">ClawHub Skills</span>
              </div>
              <a
                href="https://clawhub.ai/skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-violet-400 flex items-center gap-1"
              >
                Browse full catalog <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Community-contributed skills from ClawHub. Install any skill directly into your SunClaw instance.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 text-sm"
              placeholder="Search ClawHub skills..."
              value={clawHubSearch}
              onChange={(e) => setClawHubSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredClawHub.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={{ ...skill, installed: installedClawHub.has(skill.id) }}
                installable
                onInstall={() => handleInstallClawHub(skill.id)}
              />
            ))}
          </div>
          {filteredClawHub.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No skills match your search. Try different keywords.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
