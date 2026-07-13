"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Star,
  Rocket,
  Brain,
  Mail,
  BarChart3,
  Layers,
  Target,
  Shield,
  Zap,
  Users,
  Activity,
  Globe,
  ChevronDown,
  Check,
  Cpu,
  Network,
  Bot,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function NeuralNetwork() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Neural network connections */}
        {[
          { x1: "10%", y1: "20%", x2: "30%", y2: "40%" },
          { x1: "30%", y1: "40%", x2: "50%", y2: "25%" },
          { x1: "50%", y1: "25%", x2: "70%", y2: "45%" },
          { x1: "70%", y1: "45%", x2: "90%", y2: "30%" },
          { x1: "20%", y1: "60%", x2: "40%", y2: "75%" },
          { x1: "40%", y1: "75%", x2: "65%", y2: "65%" },
          { x1: "65%", y1: "65%", x2: "85%", y2: "80%" },
          { x1: "15%", y1: "85%", x2: "35%", y2: "70%" },
          { x1: "55%", y1: "80%", x2: "75%", y2: "60%" },
          { x1: "80%", y1: "20%", x2: "60%", y2: "35%" },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="#2563EB"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
            transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
        {/* Neural network nodes */}
        {[
          { cx: "10%", cy: "20%" }, { cx: "30%", cy: "40%" }, { cx: "50%", cy: "25%" },
          { cx: "70%", cy: "45%" }, { cx: "90%", cy: "30%" }, { cx: "20%", cy: "60%" },
          { cx: "40%", cy: "75%" }, { cx: "65%", cy: "65%" }, { cx: "85%", cy: "80%" },
          { cx: "15%", cy: "85%" }, { cx: "80%", cy: "20%" }, { cx: "55%", cy: "80%" },
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx} cy={node.cy} r="3"
            fill="url(#nodeGlow)"
            animate={{ opacity: [0.3, 1, 0.3], r: [2, 4, 2] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
}

function AIParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#2563EB]/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`teal-${i}`}
          className="absolute w-0.5 h-0.5 rounded-full bg-[#14B8A6]/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-10, -80],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: i * 0.5 + 1,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function FloatingIcon({ icon: Icon, className, delay = 0 }: { icon: React.ElementType; className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm flex items-center justify-center shadow-lg shadow-[#2563EB]/5">
        <Icon className="w-4.5 h-4.5 text-white/30" />
      </div>
    </motion.div>
  );
}

function DataStream({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute ${className} w-px`}
      style={{ height: "120px" }}
    >
      <motion.div
        className="w-full h-8 bg-gradient-to-b from-transparent via-[#2563EB]/40 to-transparent rounded-full"
        animate={{ y: [-32, 120] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

const GRADIENT_COLORS = [
  "from-[#2563EB] to-[#1D4ED8]",
  "from-[#14B8A6] to-[#2563EB]",
  "from-[#2563EB] to-[#14B8A6]",
  "from-[#1D4ED8] to-[#2563EB]",
  "from-[#14B8A6] to-[#1D4ED8]",
  "from-[#2563EB] to-[#1D4ED8]",
];

const FEATURES = [
  { icon: Users, title: "Lead Management", description: "Capture leads from LinkedIn, Twitter, GitHub, and Instagram in one click with our Chrome extension." },
  { icon: Brain, title: "AI Automation", description: "Let AI score leads, suggest follow-ups, and draft personalized outreach messages automatically." },
  { icon: Mail, title: "Email Tracking", description: "Send, track, and optimize emails directly from the CRM. Know exactly when leads engage." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Pipeline conversion, email metrics, and revenue tracking — all the insights you need." },
  { icon: Layers, title: "CRM Integrations", description: "Connect with Slack, Gmail, Calendar, and 50+ tools. Your workflow stays uninterrupted." },
  { icon: Target, title: "Sales Pipeline", description: "Visual Kanban pipeline with customizable stages. Drag-and-drop deals from lead to close." },
];

const WHY_US = [
  { icon: Rocket, title: "Lightning Fast", description: "Built on modern infrastructure for sub-second load times. No bloat, no lag." },
  { icon: Shield, title: "Enterprise Security", description: "End-to-end encryption, SOC 2 compliance, and role-based access controls." },
  { icon: Zap, title: "AI-First Design", description: "Every feature is enhanced by AI — from lead scoring to email personalization." },
];

const INTEGRATIONS = ["Slack", "Gmail", "Google Calendar", "LinkedIn", "HubSpot", "Notion", "Zapier", "Microsoft", "Stripe", "GitHub"];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Head of Sales", company: "TechFlow", quote: "OutreachCRM replaced three tools for us. The AI-powered lead scoring alone has increased our conversion rate by 40%." },
  { name: "Marcus Rivera", role: "Founder", company: "GrowthLab", quote: "The Chrome extension is a game-changer. One click to capture a LinkedIn lead and start the outreach flow. We saved 10 hours a week." },
  { name: "Priya Sharma", role: "Sales Director", company: "ScaleUp", quote: "Finally a CRM that understands modern sales. The pipeline view and email tracking are exactly what we needed. Clean, fast, and intelligent." },
];

const PRICING = [
  { name: "Starter", price: "Free", period: "", description: "For individuals getting started", popular: false, features: ["100 leads", "50 emails/month", "Basic analytics", "Chrome extension", "Email support"] },
  { name: "Pro", price: "$29", period: "/month", description: "For growing sales teams", popular: true, features: ["Unlimited leads", "Unlimited emails", "AI lead scoring", "Advanced analytics", "Team collaboration", "Priority support", "API access"] },
  { name: "Enterprise", price: "Custom", period: "", description: "For large organizations", popular: false, features: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "SSO & SAML", "SLA guarantee", "On-premise option"] },
];

const FAQ = [
  { q: "Which platforms does the Chrome extension support?", a: "LinkedIn, Twitter/X, GitHub, and Instagram. We extract name, bio, company, location, and profile image automatically." },
  { q: "Is my data private and secure?", a: "Yes. Your data is stored with end-to-end encryption. We use session-based auth and never share your data with third parties." },
  { q: "Can I use this with my team?", a: "Absolutely. Pro and Enterprise plans include team collaboration features with role-based access controls." },
  { q: "Do I need a paid plan to use the Chrome extension?", a: "No. The Chrome extension works on every plan, including Free. You just need to generate an API key from your settings." },
  { q: "How does the AI lead scoring work?", a: "Our AI analyzes lead behavior, engagement patterns, and profile data to assign a score from 0-100, helping you prioritize the hottest prospects." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-hidden relative">
      {/* AI Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#2563EB]/15 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-[#14B8A6]/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-[20%] left-1/3 w-[500px] h-[500px] bg-[#1D4ED8]/10 rounded-full blur-[160px]" />
        <div className="absolute top-[50%] right-[10%] w-[400px] h-[400px] bg-[#2563EB]/5 rounded-full blur-[120px] animate-pulse" />

        {/* Circuit board grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzNywgOTksIDIzNSwgMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-80" />
        
        {/* Radial spotlight from center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-gradient-to-b from-[#2563EB]/[0.03] to-transparent" />
      </div>

      <NeuralNetwork />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0A0F1E]/80 backdrop-blur-2xl border-b border-[#2563EB]/10 shadow-lg shadow-[#2563EB]/5" : "bg-transparent"}`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#testimonials" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Testimonials</a>
            <a href="#faq" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">FAQ</a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-200 hidden sm:block">Sign In</Link>
            <Link href="/signup" className="group relative inline-flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[14px] sm:text-[15px] font-medium hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-200 shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02] overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Get Started
            </Link>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-[#0A0F1E]/95 backdrop-blur-2xl border-b border-[#2563EB]/10 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] text-white/60 hover:text-white py-2 transition-colors">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] text-white/60 hover:text-white py-2 transition-colors">Pricing</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] text-white/60 hover:text-white py-2 transition-colors">Testimonials</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] text-white/60 hover:text-white py-2 transition-colors">FAQ</a>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] text-white/70 hover:text-white py-2 transition-colors sm:hidden">Sign In</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[120px] sm:pt-[140px] lg:pt-[160px] pb-[80px] sm:pb-[120px] lg:pb-[160px] px-4 sm:px-8">
        <AIParticles />
        <DataStream className="top-[10%] left-[12%] hidden lg:block" />
        <DataStream className="top-[30%] right-[15%] hidden lg:block" />
        <DataStream className="bottom-[20%] left-[25%] hidden lg:block" />

        <FloatingIcon icon={Cpu} className="top-[20%] left-[8%] hidden lg:flex" delay={0} />
        <FloatingIcon icon={Network} className="top-[30%] right-[10%] hidden lg:flex" delay={0.5} />
        <FloatingIcon icon={Bot} className="top-[60%] left-[5%] hidden lg:flex" delay={1} />
        <FloatingIcon icon={Brain} className="top-[15%] right-[20%] hidden lg:flex" delay={1.5} />
        <FloatingIcon icon={Activity} className="bottom-[20%] right-[8%] hidden lg:flex" delay={2} />
        <FloatingIcon icon={Sparkles} className="bottom-[30%] left-[15%] hidden lg:flex" delay={0.8} />

        <div className="relative max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/[0.05] backdrop-blur-sm text-sm text-white/70 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              </motion.div>
              <span>Powered by Advanced AI Models</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14B8A6]" />
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[72px] font-bold tracking-[-0.03em] leading-[1.05] mb-6 sm:mb-8">
              <span className="relative">
                AI-Powered CRM
                <motion.span
                  className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/20 to-[#14B8A6]/20 blur-2xl rounded-lg -z-10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#2563EB] via-[#14B8A6] to-[#2563EB] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_3s_linear_infinite]">Built for Modern</span><br />
              Sales Teams
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[16px] sm:text-[18px] md:text-[20px] text-white/55 max-w-[520px] leading-relaxed mb-8 sm:mb-10">
              Capture leads from any platform, automate your outreach with AI intelligence, and close deals faster with predictive pipeline management.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link href="/signup" className="group relative inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2.5">
                  Start Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <a href="#features" className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/[0.05] backdrop-blur-sm text-white font-medium text-[16px] hover:bg-[#2563EB]/[0.1] hover:border-[#2563EB]/30 transition-all duration-300">
                <Bot className="w-4 h-4 text-[#14B8A6]" />
                See AI in Action
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0F1E] bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/20" />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-white/50">50K+ users</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Mockup - AI Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/3] rounded-[24px] border border-[#2563EB]/15 bg-gradient-to-b from-[#2563EB]/[0.04] to-[#0A0F1E]/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-[#2563EB]/10">
              {/* Scanning line effect */}
              <motion.div
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/50 to-transparent"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <div className="ml-4 h-6 w-48 rounded-lg bg-[#2563EB]/[0.08] border border-[#2563EB]/10" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["Revenue", "Leads", "AI Score"].map((label, idx) => (
                    <motion.div
                      key={label}
                      className="p-3 rounded-xl bg-[#2563EB]/[0.04] border border-[#2563EB]/10"
                      animate={{ borderColor: ["rgba(37,99,235,0.1)", "rgba(37,99,235,0.25)", "rgba(37,99,235,0.1)"] }}
                      transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                    >
                      <p className="text-[10px] text-white/40 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-white/80">
                        {label === "Revenue" ? "$48.2K" : label === "Leads" ? "1,247" : "94.2%"}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="h-32 rounded-xl bg-[#2563EB]/[0.02] border border-[#2563EB]/8 mb-4 flex items-end p-3 gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-[#2563EB]/60 to-[#14B8A6]/40"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 + 0.5 }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-8 rounded-lg bg-[#2563EB]/[0.03] border border-[#2563EB]/8"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating AI card top-right */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 p-3 rounded-2xl border border-[#14B8A6]/20 bg-[#0A0F1E]/90 backdrop-blur-xl shadow-xl shadow-[#14B8A6]/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">AI Prediction</p>
                  <p className="text-xs font-semibold text-[#14B8A6]">92% close rate</p>
                </div>
              </div>
            </motion.div>

            {/* Floating pipeline card bottom-left */}
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 p-3 rounded-2xl border border-[#2563EB]/20 bg-[#0A0F1E]/90 backdrop-blur-xl shadow-xl shadow-[#2563EB]/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Processing</p>
                  <p className="text-xs font-semibold text-white/90">128 leads/sec</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social proof */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative max-w-[1280px] mx-auto mt-[60px] sm:mt-[90px] lg:mt-[120px] text-center">
          <p className="text-sm text-white/35 mb-8 tracking-wide uppercase">Trusted by AI-forward teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Google", "Microsoft", "Slack", "Notion", "GitHub"].map((name) => (
              <span key={name} className="text-[18px] font-semibold text-white/15 tracking-tight hover:text-white/30 transition-colors duration-300">{name}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* AI Capabilities Banner */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-8 border-y border-[#2563EB]/10">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "99.2%", label: "AI Accuracy", icon: Brain },
              { value: "<50ms", label: "Response Time", icon: Zap },
              { value: "10M+", label: "Leads Processed", icon: Activity },
              { value: "24/7", label: "AI Always On", icon: Cpu },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2563EB]/20 group-hover:border-[#2563EB]/30 transition-all duration-300">
                  <stat.icon className="w-4.5 h-4.5 text-[#2563EB]" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">
              <Brain className="w-3 h-3" />
              AI Features
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Intelligent tools to<br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">close more deals</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[560px] mx-auto leading-relaxed">
              From lead capture to deal closure — one AI-powered platform for your entire sales workflow.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} className="group relative p-8 rounded-[24px] border border-[#2563EB]/[0.08] bg-[#2563EB]/[0.02] hover:bg-[#2563EB]/[0.05] hover:border-[#2563EB]/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#2563EB]/0 to-[#14B8A6]/0 group-hover:from-[#2563EB]/[0.06] group-hover:to-[#14B8A6]/[0.03] transition-all duration-500" />
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#2563EB]/10 to-transparent rounded-bl-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${GRADIENT_COLORS[i]} shadow-lg shadow-[#2563EB]/20`}>
                    <feature.icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <h3 className="text-[17px] font-semibold mb-3 text-white/90">{feature.title}</h3>
                  <p className="text-[15px] text-white/45 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">
              <Cpu className="w-3 h-3" />
              AI Command Center
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Your intelligent dashboard</motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[560px] mx-auto leading-relaxed">
              AI-powered insights at a glance. Revenue predictions, lead scoring, and next-best-action suggestions.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative w-full aspect-[16/9] rounded-[24px] border border-[#2563EB]/15 bg-gradient-to-b from-[#2563EB]/[0.03] to-[#0A0F1E]/80 overflow-hidden shadow-2xl shadow-[#2563EB]/10">
              {/* Scanning line */}
              <motion.div
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#14B8A6]/40 to-transparent"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="h-7 w-64 rounded-lg bg-[#2563EB]/[0.06] border border-[#2563EB]/10" />
                  <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-lg bg-[#2563EB]/[0.06] border border-[#2563EB]/10" />
                    <div className="h-7 w-7 rounded-lg bg-[#2563EB]/30 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white/60" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Revenue", value: "$148.2K", change: "+12.5%", ai: "Predicted" },
                    { label: "Active Leads", value: "2,847", change: "+8.2%", ai: "Scored" },
                    { label: "Emails Sent", value: "12.4K", change: "+15.3%", ai: "Optimized" },
                    { label: "Conversion", value: "24.8%", change: "+3.1%", ai: "AI-driven" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-[#2563EB]/[0.03] border border-[#2563EB]/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-white/35">{stat.label}</p>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20">{stat.ai}</span>
                      </div>
                      <p className="text-base font-bold text-white/80">{stat.value}</p>
                      <p className="text-[10px] text-[#14B8A6]">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-44 rounded-xl bg-[#2563EB]/[0.02] border border-[#2563EB]/8 flex items-end p-4 gap-2">
                    {[35, 55, 40, 70, 50, 85, 65, 80, 55, 90, 70, 95, 75, 88, 60].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-[#2563EB]/50 to-[#14B8A6]/30"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  <div className="h-44 rounded-xl bg-[#2563EB]/[0.02] border border-[#2563EB]/8 p-4">
                    <p className="text-[10px] text-white/35 mb-3">AI Pipeline</p>
                    <div className="space-y-2.5">
                      {["New", "Contacted", "Qualified", "Proposal", "Won"].map((stage, i) => (
                        <div key={stage} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB]" style={{ opacity: 1 - 0.15 * i }} />
                          <span className="text-[10px] text-white/40 flex-1">{stage}</span>
                          <span className="text-[10px] text-white/60">{[245, 180, 92, 48, 31][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 rounded-[20px] border border-[#14B8A6]/20 bg-[#0A0F1E]/95 backdrop-blur-xl shadow-2xl shadow-[#14B8A6]/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40">AI Suggestion</p>
                  <p className="text-[13px] font-medium text-white/85">Follow up with 12 leads</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 p-4 rounded-[20px] border border-[#2563EB]/20 bg-[#0A0F1E]/95 backdrop-blur-xl shadow-2xl shadow-[#2563EB]/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40">Smart Draft</p>
                  <p className="text-[13px] font-medium text-white/85">3 emails generated</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">
              <Zap className="w-3 h-3" />
              Why OutreachCRM
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Built different, by design</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-3 gap-8">
            {WHY_US.map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="group text-center p-8 rounded-[24px] border border-[#2563EB]/[0.08] bg-[#2563EB]/[0.02] hover:bg-[#2563EB]/[0.05] hover:border-[#2563EB]/20 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#14B8A6]/20 border border-[#2563EB]/15 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#2563EB]/20 transition-all duration-500">
                  <item.icon className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-[17px] font-semibold mb-3 text-white/90">{item.title}</h3>
                <p className="text-[15px] text-white/45 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative py-[60px] sm:py-[90px] lg:py-[120px] px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">
              <Network className="w-3 h-3" />
              Integrations
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Connects with your stack</motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed mb-16">
              AI-powered connectors that sync intelligently with the tools you use.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="flex flex-wrap items-center justify-center gap-5">
            {INTEGRATIONS.map((name) => (
              <motion.div key={name} variants={scaleIn} className="group px-6 py-4 rounded-2xl border border-[#2563EB]/[0.08] bg-[#2563EB]/[0.02] hover:bg-[#2563EB]/[0.06] hover:border-[#2563EB]/20 transition-all duration-300">
                <span className="text-[15px] font-medium text-white/50 group-hover:text-white/70 transition-colors">{name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-6">Testimonials</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Loved by sales teams</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="p-5 sm:p-8 rounded-[24px] border border-[#2563EB]/[0.08] bg-[#2563EB]/[0.02] hover:bg-[#2563EB]/[0.04] transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-white/60 mb-8 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/30 border border-[#2563EB]/15" />
                  <div>
                    <p className="text-[14px] font-medium text-white/80">{t.name}</p>
                    <p className="text-[13px] text-white/40">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[1080px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">Pricing</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Simple, transparent pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed">
              Start free. Scale as you grow. No hidden fees.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative p-5 sm:p-8 rounded-[24px] border flex flex-col ${
                  plan.popular
                    ? "border-[#2563EB]/40 bg-gradient-to-b from-[#2563EB]/10 to-[#2563EB]/[0.02] shadow-2xl shadow-[#2563EB]/10"
                    : "border-[#2563EB]/[0.08] bg-[#2563EB]/[0.02]"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-[12px] font-medium text-white shadow-lg shadow-[#2563EB]/30">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[18px] font-semibold text-white/90 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-[40px] font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-[15px] text-white/40">{plan.period}</span>}
                </div>
                <p className="text-[14px] text-white/40 mb-8">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-[14px] text-white/60">
                      <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`inline-flex items-center justify-center h-11 rounded-xl font-medium text-[14px] transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]"
                      : "border border-[#2563EB]/15 bg-[#2563EB]/[0.04] text-white/80 hover:bg-[#2563EB]/[0.08] hover:border-[#2563EB]/25"
                  }`}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">FAQ</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Frequently asked questions</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="border border-[#2563EB]/[0.08] rounded-2xl overflow-hidden hover:border-[#2563EB]/15 transition-colors duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[15px] font-medium text-white/80">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[14px] text-white/50 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-[80px] sm:py-[120px] lg:py-[160px] px-4 sm:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-[800px] mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/[0.05] text-sm text-white/60 mb-8">
              <Brain className="w-4 h-4 text-[#2563EB]" />
              <span>AI is ready for you</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[32px] sm:text-[40px] md:text-[56px] font-bold tracking-[-0.03em] mb-6">
              Ready to close more deals<br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">with AI?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed mb-10">
              Join 50,000+ sales professionals using AI-powered OutReach CRM to grow their pipeline.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="group relative inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2.5">
                  Start Free Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl border border-[#2563EB]/15 bg-[#2563EB]/[0.04] backdrop-blur-sm text-white font-medium text-[16px] hover:bg-[#2563EB]/[0.08] hover:border-[#2563EB]/25 transition-all duration-300">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#2563EB]/10 py-12 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <p className="text-[13px] text-white/30">© {new Date().getFullYear()} OutReach CRM. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
