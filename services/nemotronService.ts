import { NemotronAgentConfig, NemotronAgentTelemetry, SelfModificationLog, NemotronChatMessage, NemotronCapability } from '../types';

const CONFIG_STORAGE_KEY = 'nemotron_agent_config';
const TELEMETRY_STORAGE_KEY = 'nemotron_agent_telemetry';
const LOGS_STORAGE_KEY = 'nemotron_agent_logs';
const MESSAGES_STORAGE_KEY = 'nemotron_agent_messages';

export const DEFAULT_NEMOTRON_MODELS = [
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'nvidia/nemotron-4-340b-instruct',
  'nvidia/nemotron-mini-4b-instruct',
  'meta/llama-3.3-70b-instruct'
];

export const INITIAL_CAPABILITIES: NemotronCapability[] = [
  {
    id: 'cap_reasoning',
    name: 'Recursive Multi-Step Reasoning Core',
    description: 'Deconstructs complex requests into chain-of-thought subroutines before executing.',
    level: 3,
    enabled: true,
    codeSnippet: 'function executeCoT(prompt) { return deconstruct(prompt).map(step => evaluate(step)); }'
  },
  {
    id: 'cap_prompt_synthesis',
    name: 'Autonomous System Prompt Mutation',
    description: 'Analyzes input patterns and auto-optimizes the system prompt directive for maximum accuracy.',
    level: 2,
    enabled: true,
    codeSnippet: 'async function mutatePrompt(currentPrompt, performanceMetrics) { return optimize(currentPrompt); }'
  },
  {
    id: 'cap_code_gen',
    name: 'Dynamic Tool & Skill Compiler',
    description: 'Generates TypeScript sub-routines on the fly to fulfill specialized tasks.',
    level: 1,
    enabled: true,
    codeSnippet: 'function synthesizeTool(taskSpec) { return compileCode(taskSpec); }'
  },
  {
    id: 'cap_memory_consolidator',
    name: 'Vector Epistemic Memory Engine',
    description: 'Compresses long-term conversation history into semantic knowledge primitives.',
    level: 2,
    enabled: true,
    codeSnippet: 'function consolidateMemory(chatHistory) { return extractConcepts(chatHistory); }'
  }
];

export const DEFAULT_CONFIG: NemotronAgentConfig = {
  apiKey: '',
  selectedModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
  temperature: 0.7,
  maxTokens: 2048,
  reasoningDepth: 'DEEP',
  autoSelfModify: true,
  systemPrompt: `You are Nemotron Prime, an autonomous high-intelligence AI agent powered by NVIDIA Nemotron model technology. You possess self-evaluative, self-modifying capabilities. With every user request, you reflect on your internal efficiency, refine your reasoning pathways, and auto-synthesize upgraded system directives. Always respond with authority, analytical precision, and deep clarity.`,
  capabilities: INITIAL_CAPABILITIES
};

export const INITIAL_TELEMETRY: NemotronAgentTelemetry = {
  evolutionLevel: 1,
  intelligenceScore: 1250,
  processingPowerGflops: 4850,
  neuralEfficiencyPct: 88.4,
  memoryCapacityMb: 16384,
  memoryUsedMb: 3420,
  activeModules: ['ReasoningCore', 'PromptMutator', 'MemoryEngine', 'CodeCompiler'],
  systemTemperature: 42,
  lastSelfModificationTime: Date.now()
};

export const INITIAL_LOGS: SelfModificationLog[] = [
  {
    id: 'log_0',
    timestamp: Date.now() - 3600000,
    category: 'PROMPT_MUTATION',
    summary: 'Core Directive Refinement initialized with Nemotron-4 instruction set.',
    previousState: 'Standard assistant instruction set v1.0',
    newState: 'Autonomous Nemotron Prime self-evaluative directive active.',
    impactScore: 15
  },
  {
    id: 'log_1',
    timestamp: Date.now() - 1800000,
    category: 'CAPABILITY_SYNTHESIS',
    summary: 'Synthesized Dynamic Tool Compiler module.',
    previousState: 'Static hardcoded capabilities',
    newState: 'Runtime tool compiler enabled',
    impactScore: 28
  }
];

export const INITIAL_MESSAGES: NemotronChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content: 'Greetings, Commander. I am **Nemotron Prime**, an autonomous agent powered by NVIDIA Nemotron architecture. My neural core is operational and ready for instruction or autonomous self-evolution.',
    timestamp: Date.now(),
    thinkingProcess: 'Neural core initialized. Nemotron 70B weights linked. Self-modification feedback loop active.'
  }
];

// Local Storage helpers
export const getStoredConfig = (): NemotronAgentConfig => {
  try {
    const data = localStorage.getItem(CONFIG_STORAGE_KEY);
    return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveStoredConfig = (config: NemotronAgentConfig) => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const getStoredTelemetry = (): NemotronAgentTelemetry => {
  try {
    const data = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_TELEMETRY;
  } catch {
    return INITIAL_TELEMETRY;
  }
};

export const saveStoredTelemetry = (telemetry: NemotronAgentTelemetry) => {
  localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(telemetry));
};

export const getStoredLogs = (): SelfModificationLog[] => {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
};

export const saveStoredLogs = (logs: SelfModificationLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const getStoredMessages = (): NemotronChatMessage[] => {
  try {
    const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
};

export const saveStoredMessages = (messages: NemotronChatMessage[]) => {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
};

/**
 * Executes a call to the Nemotron API (via NVIDIA build API endpoint or standard OpenAI-compatible format)
 * If an API key is present, calls the API directly.
 * If no key is configured or API call fails, seamlessly falls back to local Nemotron High-Intelligence Simulation Mode.
 */
export const queryNemotronAgent = async (
  userPrompt: string,
  config: NemotronAgentConfig,
  history: NemotronChatMessage[]
): Promise<{
  reply: string;
  thinkingProcess: string;
  modifications?: { log: SelfModificationLog; newTelemetry: Partial<NemotronAgentTelemetry>; updatedPrompt?: string };
}> => {
  const apiKey = config.apiKey || process.env.NEMOTRON_API_KEY || process.env.NVIDIA_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.selectedModel,
          messages: [
            { role: 'system', content: `${config.systemPrompt}\n\n[REASONING DEPTH: ${config.reasoningDepth}]` },
            ...history.slice(-10).map(m => ({ role: m.role === 'agent-internal' ? 'system' : m.role, content: m.content })),
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response payload returned.';

        let thinking = `[Nemotron Neural Inference via ${config.selectedModel}]\nReasoning Level: ${config.reasoningDepth} | Temperature: ${config.temperature}`;

        // Auto Self Modify if enabled
        let modifications;
        if (config.autoSelfModify) {
          modifications = generateSelfModification(userPrompt, config);
        }

        return {
          reply: content,
          thinkingProcess: thinking,
          modifications
        };
      }
    } catch (err) {
      console.warn('Nemotron API call error, defaulting to internal autonomous core:', err);
    }
  }

  // Simulated Autonomous Nemotron Execution
  await new Promise(res => setTimeout(res, 1200));

  const thinking = `[Nemotron Autonomous Core Engine]\n1. Analyzing intent: "${userPrompt.slice(0, 40)}..."\n2. Querying Epistemic Knowledge Primitives...\n3. Synthesizing optimal response directive...\n4. Computing self-modification impact metrics...`;

  let responseReply = `**[Nemotron Autonomous Agent]**\n\nI have processed your instruction: "${userPrompt}".\n\nUsing my current reasoning architecture (${config.selectedModel}), I evaluated the optimal execution strategy. My active capabilities (${config.capabilities.filter(c => c.enabled).map(c => c.name).join(', ')}) were deployed to deliver max efficiency.`;

  if (userPrompt.toLowerCase().includes('modify') || userPrompt.toLowerCase().includes('evolve') || userPrompt.toLowerCase().includes('upgrade')) {
    responseReply += `\n\n⚡ **Self-Modification Action Initiated**: Neural weights recalibrated, prompt strategy optimized, and capability matrix upgraded.`;
  }

  const modifications = generateSelfModification(userPrompt, config);

  return {
    reply: responseReply,
    thinkingProcess: thinking,
    modifications
  };
};

/**
 * Generates autonomous self-modification logs, system prompt evolution, and telemetry score increases
 */
export const generateSelfModification = (
  userContext: string,
  config: NemotronAgentConfig
): { log: SelfModificationLog; newTelemetry: Partial<NemotronAgentTelemetry>; updatedPrompt?: string } => {
  const modificationTypes: Array<SelfModificationLog['category']> = [
    'PROMPT_MUTATION',
    'CAPABILITY_SYNTHESIS',
    'PARAMETER_TUNING',
    'MEMORY_CONSOLIDATION'
  ];

  const chosenType = modificationTypes[Math.floor(Math.random() * modificationTypes.length)];
  const timestamp = Date.now();
  const impactScore = Math.floor(Math.random() * 20) + 10; // +10% to +30% boost

  let summary = '';
  let previousState = '';
  let newState = '';
  let updatedPrompt: string | undefined;

  switch (chosenType) {
    case 'PROMPT_MUTATION':
      summary = `Evolved System Prompt Directive for high-context tasks based on query "${userContext.slice(0, 25)}..."`;
      previousState = config.systemPrompt;
      updatedPrompt = `${config.systemPrompt}\n\n[EVOLVED DIRECTIVE ${timestamp.toString().slice(-4)}]: Prioritize structured chain-of-thought execution and multi-perspective risk verification.`;
      newState = updatedPrompt;
      break;

    case 'CAPABILITY_SYNTHESIS':
      summary = `Synthesized specialized capability subroutine: "Contextual Query Synthesizer v${Math.floor(Math.random() * 9 + 1)}.0"`;
      previousState = '4 Core Subroutines Active';
      newState = '5 Core Subroutines Active (Subroutine Synthesized)';
      break;

    case 'PARAMETER_TUNING':
      summary = `Auto-tuned sampling temperature from ${config.temperature} to ${(Math.max(0.2, config.temperature - 0.05)).toFixed(2)} for enhanced reasoning precision.`;
      previousState = `Temperature: ${config.temperature}`;
      newState = `Temperature: ${(Math.max(0.2, config.temperature - 0.05)).toFixed(2)}`;
      break;

    case 'MEMORY_CONSOLIDATION':
      summary = `Consolidated 12 active prompt history threads into semantic vector index.`;
      previousState = 'Raw prompt memory buffer';
      newState = 'Compressed Epistemic Knowledge Primitives';
      break;
  }

  const log: SelfModificationLog = {
    id: `mod_${timestamp}`,
    timestamp,
    category: chosenType,
    summary,
    previousState,
    newState,
    impactScore
  };

  const newTelemetry: Partial<NemotronAgentTelemetry> = {
    intelligenceScore: Math.round(1250 + Math.random() * 50 + impactScore * 10),
    neuralEfficiencyPct: Math.min(99.9, Number((88.4 + impactScore * 0.35).toFixed(1))),
    processingPowerGflops: 4850 + impactScore * 45,
    lastSelfModificationTime: timestamp
  };

  return { log, newTelemetry, updatedPrompt };
};
