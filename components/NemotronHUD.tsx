import React, { useState, useEffect, useRef } from 'react';
import {
  getStoredConfig, saveStoredConfig,
  getStoredTelemetry, saveStoredTelemetry,
  getStoredLogs, saveStoredLogs,
  getStoredMessages, saveStoredMessages,
  queryNemotronAgent, generateSelfModification,
  DEFAULT_NEMOTRON_MODELS
} from '../services/nemotronService';
import { NemotronAgentConfig, NemotronAgentTelemetry, SelfModificationLog, NemotronChatMessage } from '../types';
import { Icons } from './ui/Icons';
import ReactMarkdown from 'react-markdown';

export const NemotronHUD: React.FC = () => {
  const [config, setConfig] = useState<NemotronAgentConfig>(getStoredConfig);
  const [telemetry, setTelemetry] = useState<NemotronAgentTelemetry>(getStoredTelemetry);
  const [logs, setLogs] = useState<SelfModificationLog[]>(getStoredLogs);
  const [messages, setMessages] = useState<NemotronChatMessage[]>(getStoredMessages);

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelfModifying, setIsSelfModifying] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'SYSTEM_PROMPT' | 'CAPABILITIES' | 'MOD_LOGS'>('CONSOLE');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist state when changed
  useEffect(() => { saveStoredConfig(config); }, [config]);
  useEffect(() => { saveStoredTelemetry(telemetry); }, [telemetry]);
  useEffect(() => { saveStoredLogs(logs); }, [logs]);
  useEffect(() => { saveStoredMessages(messages); }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userMsgText = inputMessage;
    setInputMessage('');

    const userMsg: NemotronChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMsgText,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const response = await queryNemotronAgent(userMsgText, config, newMessages);

      const assistantMsg: NemotronChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        thinkingProcess: response.thinkingProcess
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Apply self modifications if triggered
      if (response.modifications) {
        const { log, newTelemetry, updatedPrompt } = response.modifications;
        setLogs(prev => [log, ...prev]);
        setTelemetry(prev => ({
          ...prev,
          ...newTelemetry,
          intelligenceScore: prev.intelligenceScore + (newTelemetry.intelligenceScore ? 12 : 5),
          evolutionLevel: Math.min(10, Math.floor((prev.intelligenceScore + 50) / 1000) + 1)
        }));

        if (updatedPrompt) {
          setConfig(prev => ({ ...prev, systemPrompt: updatedPrompt }));
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: '⚠️ **Core Neural Exception**: Failed to complete inference query.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerManualSelfModification = async () => {
    setIsSelfModifying(true);
    await new Promise(res => setTimeout(res, 1000));

    const { log, newTelemetry, updatedPrompt } = generateSelfModification('Manual Core Calibration', config);

    setLogs(prev => [log, ...prev]);
    setTelemetry(prev => ({
      ...prev,
      ...newTelemetry,
      intelligenceScore: prev.intelligenceScore + 25,
      evolutionLevel: Math.min(10, Math.floor((prev.intelligenceScore + 100) / 1000) + 1)
    }));

    if (updatedPrompt) {
      setConfig(prev => ({ ...prev, systemPrompt: updatedPrompt }));
    }

    setMessages(prev => [
      ...prev,
      {
        id: `msg_mod_${Date.now()}`,
        role: 'agent-internal',
        content: `⚡ **SYSTEM SELF-EVOLUTION TRIGGERED**: ${log.summary}\n\n- **Impact Score**: +${log.impactScore} Intelligence Points\n- **Category**: \`${log.category}\``,
        timestamp: Date.now()
      }
    ]);

    setIsSelfModifying(false);
  };

  const toggleCapability = (id: string) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.map(cap =>
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      )
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">

      {/* Sci-Fi HUD Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Background Glowing Grid Elements */}
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                NEMOTRON CORE ONLINE
              </span>
              <span className="text-xs text-slate-400 font-mono">MODEL: {config.selectedModel.split('/')[1] || config.selectedModel}</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent flex items-center gap-3 tracking-wide">
              <Icons.Bot className="w-8 h-8 text-cyan-400" />
              NEMOTRON PRIME HUD
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Autonomous Self-Modifying Intelligence Core powered by NVIDIA Nemotron API Key
            </p>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={triggerManualSelfModification}
              disabled={isSelfModifying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 border border-cyan-400/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Icons.Sparkles className={`w-4 h-4 ${isSelfModifying ? 'animate-spin text-yellow-300' : 'text-cyan-200'}`} />
              {isSelfModifying ? 'Evolving Core...' : 'Trigger Self-Evolution'}
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Icons.Key className="w-4 h-4 text-yellow-400" />
              API Key & Settings
            </button>
          </div>
        </div>

        {/* Telemetry Gauge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Icons.Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Evolution Level</div>
              <div className="text-xl font-bold font-mono text-cyan-300">STAGE {telemetry.evolutionLevel}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <Icons.Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">IQ Rating Score</div>
              <div className="text-xl font-bold font-mono text-purple-300">{telemetry.intelligenceScore} IQ</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Icons.Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Neural Efficiency</div>
              <div className="text-xl font-bold font-mono text-emerald-300">{telemetry.neuralEfficiencyPct}%</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Icons.Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Compute Capacity</div>
              <div className="text-xl font-bold font-mono text-amber-300">{telemetry.processingPowerGflops} GFLOPS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('CONSOLE')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t border-x ${
            activeTab === 'CONSOLE'
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 border-b-slate-800'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Icons.Terminal className="w-4 h-4" />
          Interactive Command Center
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM_PROMPT')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t border-x ${
            activeTab === 'SYSTEM_PROMPT'
              ? 'bg-slate-800 text-purple-400 border-purple-500/40 border-b-slate-800'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Icons.Code className="w-4 h-4" />
          Evolving System Prompt
        </button>

        <button
          onClick={() => setActiveTab('CAPABILITIES')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t border-x ${
            activeTab === 'CAPABILITIES'
              ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 border-b-slate-800'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Icons.Layers className="w-4 h-4" />
          Active Capability Matrix ({config.capabilities.filter(c => c.enabled).length})
        </button>

        <button
          onClick={() => setActiveTab('MOD_LOGS')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t border-x ${
            activeTab === 'MOD_LOGS'
              ? 'bg-slate-800 text-amber-400 border-amber-500/40 border-b-slate-800'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Icons.History className="w-4 h-4" />
          Self-Modification Audit Log ({logs.length})
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'CONSOLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Feed */}
          <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col h-[550px] shadow-2xl">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'agent-internal' ? (
                    <div className="w-full bg-cyan-950/40 border border-cyan-500/30 p-3.5 rounded-xl font-mono text-xs text-cyan-200 space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Icons.Sparkles className="w-3.5 h-3.5" />
                        SYSTEM EVENT / MUTATION LOG
                      </div>
                      <div className="prose prose-invert prose-xs">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none'
                    }`}>
                      {msg.thinkingProcess && (
                        <div className="mb-2 p-2 bg-slate-950/60 rounded-lg text-[10px] font-mono text-cyan-300 border border-cyan-500/20 whitespace-pre-line">
                          {msg.thinkingProcess}
                        </div>
                      )}
                      <div className="prose prose-invert prose-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div className="text-[10px] opacity-40 mt-1 text-right font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex items-center gap-3 text-cyan-400 text-xs font-mono">
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Nemotron Neural Synthesis in progress...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Instruct Nemotron Agent or ask it to self-modify..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <Icons.Zap className="w-4 h-4" />
                Execute
              </button>
            </form>
          </div>

          {/* Right Info Telemetry Subpanel */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Icons.Sliders className="w-4 h-4" />
                Core Execution Config
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Active Model</label>
                  <select
                    value={config.selectedModel}
                    onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono text-xs outline-none"
                  >
                    {DEFAULT_NEMOTRON_MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Reasoning Depth</span>
                    <span className="text-purple-400 font-mono">{config.reasoningDepth}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['FAST', 'DEEP', 'RECURSIVE'] as const).map(depth => (
                      <button
                        key={depth}
                        type="button"
                        onClick={() => setConfig({ ...config, reasoningDepth: depth })}
                        className={`py-1.5 text-[10px] font-bold rounded-md font-mono transition-all ${
                          config.reasoningDepth === depth
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Temperature</span>
                    <span className="text-emerald-400 font-mono">{config.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-medium">Auto Self-Modification</span>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, autoSelfModify: !config.autoSelfModify })}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                      config.autoSelfModify ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {config.autoSelfModify ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Self-Modification Summary Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Icons.Sparkles className="w-4 h-4" />
                Latest Mutation Event
              </h3>
              {logs.length > 0 ? (
                <div className="text-xs space-y-1.5 font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-300 font-bold">{logs[0].category}</div>
                  <div className="text-slate-400">{logs[0].summary}</div>
                  <div className="text-emerald-400 text-[10px] pt-1">Impact Score: +{logs[0].impactScore} Intelligence Points</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No modification events logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Prompt View */}
      {activeTab === 'SYSTEM_PROMPT' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <Icons.Code className="w-5 h-5 text-purple-400" />
                Dynamic Self-Evolving System Prompt
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                This prompt automatically mutates and incorporates directives learned during agent interaction.
              </p>
            </div>
            <button
              onClick={() => {
                saveStoredConfig(config);
                alert('System Prompt updated and stored in neural memory.');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Icons.Shield className="w-4 h-4" />
              Save Manual Prompt Patch
            </button>
          </div>

          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-purple-200 focus:outline-none focus:border-purple-500"
          />
        </div>
      )}

      {/* Capability Matrix View */}
      {activeTab === 'CAPABILITIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.capabilities.map((cap) => (
            <div key={cap.id} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                    <Icons.Wand2 className="w-4 h-4" />
                    {cap.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Capability Level: Tier {cap.level}</span>
                </div>
                <button
                  onClick={() => toggleCapability(cap.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all ${
                    cap.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {cap.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <p className="text-slate-300 text-xs">{cap.description}</p>

              {cap.codeSnippet && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <code>{cap.codeSnippet}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modification Logs View */}
      {activeTab === 'MOD_LOGS' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <Icons.History className="w-5 h-5 text-amber-400" />
            Neural Core Mutation & Adaptation History
          </h3>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4 font-mono text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      {log.category}
                    </span>
                    <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-200 font-bold">{log.summary}</div>
                  <div className="text-slate-400 text-[11px]">New State: {log.newState.slice(0, 100)}...</div>
                </div>

                <div className="flex items-center">
                  <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg text-xs">
                    +{log.impactScore} Intelligence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Icons.Key className="text-yellow-400 w-5 h-5" />
                NVIDIA Nemotron API Settings
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">NVIDIA / Nemotron API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="nvapi-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Optional. If left blank, Nemotron Agent will run in full autonomous high-intelligence simulation mode.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Default Model Architecture</label>
                <select
                  value={config.selectedModel}
                  onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono outline-none"
                >
                  {DEFAULT_NEMOTRON_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
