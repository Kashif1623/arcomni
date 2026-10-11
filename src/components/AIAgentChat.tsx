import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap, Shield, Activity, ChevronRight, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: number
  type?: 'alert' | 'optimization' | 'tx' | 'info'
  badge?: string
}

interface QuickAction {
  label: string
  query: string
  icon: React.ElementType
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Check gas', query: 'What are the current gas costs on Arc?', icon: Zap },
  { label: 'Route analysis', query: 'Analyze the optimal routing path for my next USDC transfer', icon: Activity },
  { label: 'Security scan', query: 'Run a full security scan on my wallet', icon: Shield },
  { label: 'Tx history', query: 'Summarize recent transaction activity', icon: ChevronRight },
]

function buildResponse(input: string): { content: string; type: ChatMessage['type']; badge?: string } {
  const lower = input.toLowerCase()

  if (lower.includes('gas') || lower.includes('cost') || lower.includes('fee')) {
    return {
      content: "Current Arc Testnet base fee is running at ~20 Gwei. Native send path: ~$0.000420 USDC (21k gas). ERC-20 transfer: ~$0.001300 USDC (65k gas). Recommend native path — 3.1x cheaper right now. I've flagged this routing preference in the execution queue.",
      type: 'optimization',
      badge: 'GAS_REPORT',
    }
  }
  if (lower.includes('route') || lower.includes('routing') || lower.includes('path')) {
    return {
      content: "Path analysis complete. Arc Testnet native RPC responded in 41ms. Native send: 41ms latency, 1 block finality (~2.8s). ERC-20 path: 58ms latency, same finality. OPTIMAL: Native path saves 17ms and ~68% on gas. Safe routing lock applied to next 3 transactions.",
      type: 'optimization',
      badge: 'ROUTE_LOCK',
    }
  }
  if (lower.includes('security') || lower.includes('scan') || lower.includes('threat') || lower.includes('risk')) {
    return {
      content: "Security scan initiated. Wallet exposure score: 12/100 (safe). Detected 1 unresolved medium alert: drainer pattern on destination 0x4f2a. Approval surface scan: 2 active allowances to unaudited contracts. Recommend revoking allowance to 0x7e91... Shield status: ACTIVE. No killswitch needed.",
      type: 'alert',
      badge: 'THREAT_SCAN',
    }
  }
  if (lower.includes('transaction') || lower.includes('tx') || lower.includes('history') || lower.includes('recent')) {
    return {
      content: "Recent activity summary: 0 confirmed transactions this session (wallet not yet active on Arc Testnet). Background monitors active: USDC Transfer watcher, block-time tracker, gas price oracle. All systems nominal. Ready to execute when you initiate a transfer.",
      type: 'tx',
      badge: 'TX_SUMMARY',
    }
  }
  if (lower.includes('usdc') || lower.includes('transfer') || lower.includes('send')) {
    return {
      content: "USDC on Arc is the native gas token — one asset, two views. ERC-20 view (6 decimals) for transfers and approvals; native view (18 decimals) for gas deduction. I recommend always using the ERC-20 path for explicit USDC transfers to avoid decimal-scale mismatch. Dual-path tracker is live in the Gas Tracker panel.",
      type: 'info',
      badge: 'USDC_GUIDE',
    }
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return {
      content: "Hello. I'm your Arc Omni autonomous agent — continuously running background optimizations across gas routing, threat detection, and transaction safety. Ask me anything about the Arc network, or use the quick actions below.",
      type: 'info',
    }
  }
  if (lower.includes('arc') || lower.includes('network') || lower.includes('chain')) {
    return {
      content: "Arc is an EVM-compatible network where USDC is the native gas token. No ETH needed — every transaction costs USDC directly. Block time: ~2.8s. CCTP domain: 26. Explorer: explorer.testnet.arc.io. Arc's unique dual-path (native vs ERC-20) is what ArcOmni is built to optimize.",
      type: 'info',
      badge: 'ARC_INFO',
    }
  }

  return {
    content: "I've processed your intent. Running background analysis on Arc Testnet — monitoring gas prices, block times, and security patterns. I'll notify you if any action is recommended. Anything specific you'd like me to focus on?",
    type: 'info',
  }
}

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  GAS_REPORT: { bg: 'rgba(79,195,247,0.1)', color: 'var(--accent)' },
  ROUTE_LOCK: { bg: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)' },
  THREAT_SCAN: { bg: 'rgba(255,77,109,0.1)', color: 'var(--danger)' },
  TX_SUMMARY: { bg: 'rgba(168,85,247,0.1)', color: 'var(--neon-purple)' },
  USDC_GUIDE: { bg: 'rgba(79,195,247,0.1)', color: 'var(--accent)' },
  ARC_INFO: { bg: 'rgba(0,229,255,0.1)', color: 'var(--neon-cyan)' },
}

function AgentBubble({ msg }: { msg: ChatMessage }) {
  const typeIcon = msg.type === 'alert'
    ? <Shield size={12} style={{ color: 'var(--danger)' }} />
    : msg.type === 'optimization'
    ? <Zap size={12} style={{ color: 'var(--neon-cyan)' }} />
    : msg.type === 'tx'
    ? <Activity size={12} style={{ color: 'var(--neon-purple)' }} />
    : null

  const badgeStyle = msg.badge && BADGE_STYLE[msg.badge]
    ? BADGE_STYLE[msg.badge]
    : { bg: 'rgba(79,195,247,0.08)', color: 'var(--muted)' }

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}
      >
        <Bot size={14} className="text-[var(--neon-cyan)]" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          {typeIcon}
          <span className="text-xs font-medium" style={{ color: 'var(--neon-cyan)' }}>ArcOmni Agent</span>
          {msg.badge && (
            <span
              className="px-1.5 py-0.5 rounded text-xs mono"
              style={{ background: badgeStyle.bg, color: badgeStyle.color }}
            >
              {msg.badge}
            </span>
          )}
          <span className="ml-auto text-xs text-[var(--subtle)] mono">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: msg.type === 'alert'
              ? 'rgba(255,77,109,0.06)'
              : 'rgba(0,229,255,0.05)',
            border: `1px solid ${msg.type === 'alert' ? 'rgba(255,77,109,0.15)' : 'rgba(0,229,255,0.12)'}`,
            color: 'var(--ink-2)',
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 max-w-[80%]">
        <div className="flex items-center justify-end mb-1">
          <span className="text-xs text-[var(--subtle)] mono">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed ml-auto"
          style={{
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.18)',
            color: 'var(--ink)',
          }}
        >
          {msg.content}
        </div>
      </div>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
      >
        <User size={14} style={{ color: 'var(--neon-purple)' }} />
      </div>
    </div>
  )
}

const NOW = new Date().getTime()

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'agent',
    content: 'ArcOmni agent online. Monitoring Arc Testnet — gas prices nominal, shield active, dual-path tracker running. How can I assist you?',
    timestamp: NOW - 5000,
    type: 'info',
  },
  {
    id: 'init-2',
    role: 'agent',
    content: 'Background optimization: Detected native send path is currently 3.1x cheaper than ERC-20 on Arc Testnet. Routing preference updated.',
    timestamp: NOW - 2000,
    type: 'optimization',
    badge: 'ROUTE_LOCK',
  },
]

let _msgCounter = 100

function nextId(prefix: string): string {
  _msgCounter += 1
  return `${prefix}-${_msgCounter}`
}

function nowMs(): number {
  return new Date().getTime()
}

export default function AIAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  // Proactive agent message every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const ts = nowMs()
      const proactiveType: ChatMessage['type'] = Math.random() > 0.5 ? 'optimization' : 'alert'
      const proactiveBadge = Math.random() > 0.5 ? 'GAS_REPORT' : 'THREAT_SCAN'
      const proactive: ChatMessage = {
        id: nextId('pro'),
        role: 'agent',
        content: Math.random() > 0.5
          ? 'Background scan: Gas price stable at ~20 Gwei. Native path remains optimal. No action required.'
          : 'Security monitor: No new threats detected. Wallet exposure score unchanged at 12/100. Shield holding.',
        timestamp: ts,
        type: proactiveType,
        badge: proactiveBadge,
      }
      setMessages((prev) => [...prev, proactive].slice(-40))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return

    const userMsg: ChatMessage = {
      id: nextId('u'),
      role: 'user',
      content: text.trim(),
      timestamp: nowMs(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)

    // Simulate agent thinking delay
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 800))

    const response = buildResponse(text)
    const agentMsg: ChatMessage = {
      id: nextId('a'),
      role: 'agent',
      content: response.content,
      timestamp: nowMs(),
      type: response.type,
      badge: response.badge,
    }
    setMessages((prev) => [...prev, agentMsg])
    setThinking(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <Bot size={18} style={{ color: 'var(--neon-purple)' }} />
          </div>
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 pulse-dot"
            style={{ background: 'var(--neon-green)', borderColor: 'var(--bg)' }}
          />
        </div>
        <div>
          <h2 className="display font-semibold text-[var(--ink)] text-lg">AI Agent</h2>
          <p className="text-xs text-[var(--muted)]">Autonomous Arc optimizer — always running</p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: 'var(--neon-green)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] pulse-dot" />
          Online
        </div>
      </div>

      {/* Chat area */}
      <div className="glass-strong rounded-2xl overflow-hidden flex flex-col" style={{ height: '460px' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {msg.role === 'agent'
                  ? <AgentBubble msg={msg} />
                  : <UserBubble msg={msg} />
                }
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}
              >
                <Bot size={14} className="text-[var(--neon-cyan)]" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}
              >
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <Loader2 size={12} className="animate-spin text-[var(--neon-cyan)]" />
                  <span className="text-xs text-[var(--muted)]">Processing intent...</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick actions */}
        <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-[var(--border)]">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                onClick={() => { void sendMessage(a.query) }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                <Icon size={11} />
                {a.label}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void sendMessage(input)
              }
            }}
            placeholder="Ask the agent anything about Arc..."
            className="flex-1 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none"
          />
          <button
            onClick={() => { void sendMessage(input) }}
            disabled={!input.trim() || thinking}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            {thinking
              ? <Loader2 size={14} style={{ color: 'var(--neon-purple)' }} className="animate-spin" />
              : <Send size={14} style={{ color: 'var(--neon-purple)' }} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
