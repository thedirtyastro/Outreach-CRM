"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

function FloatingIcon({ icon: Icon, className, delay = 0 }: { icon: React.ElementType; className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-white/30" />
      </div>
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2563EB]/20 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-[#14B8A6]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[30%] left-1/3 w-[400px] h-[400px] bg-[#2563EB]/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#111827]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-[1280px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#testimonials" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Testimonials</a>
            <a href="#faq" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-200">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[15px] font-medium hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-200 shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[160px] pb-[160px] px-8">
        <FloatingIcon icon={Sparkles} className="top-[20%] left-[8%] hidden lg:flex" delay={0} />
        <FloatingIcon icon={Mail} className="top-[30%] right-[10%] hidden lg:flex" delay={0.5} />
        <FloatingIcon icon={Target} className="top-[60%] left-[5%] hidden lg:flex" delay={1} />
        <FloatingIcon icon={Brain} className="top-[15%] right-[20%] hidden lg:flex" delay={1.5} />
        <FloatingIcon icon={Activity} className="bottom-[20%] right-[8%] hidden lg:flex" delay={2} />
        <FloatingIcon icon={Globe} className="bottom-[30%] left-[15%] hidden lg:flex" delay={0.8} />

        <div className="relative max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-sm text-white/70 mb-8">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <span>AI-Powered Sales Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[56px] sm:text-[64px] lg:text-[72px] font-bold tracking-[-0.03em] leading-[1.05] mb-8">
              AI-Powered CRM<br />
              <span className="bg-gradient-to-r from-[#2563EB] via-[#14B8A6] to-[#2563EB] bg-clip-text text-transparent">Built for Modern</span><br />
              Sales Teams
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[18px] sm:text-[20px] text-white/55 max-w-[520px] leading-relaxed mb-10">
              Capture leads from any platform, automate your outreach, and close deals faster with intelligent pipeline management.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link href="/signup" className="group inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]">
                Start Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm text-white font-medium text-[16px] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300">
                Book Demo
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111827] bg-gradient-to-br from-white/20 to-white/5" />
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

          {/* Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/3] rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
              <div className="absolute inset-0 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <div className="ml-4 h-6 w-48 rounded-lg bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["Revenue", "Leads", "Conversion"].map((label) => (
                    <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] text-white/40 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-white/80">
                        {label === "Revenue" ? "$48.2K" : label === "Leads" ? "1,247" : "24.8%"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4 flex items-end p-3 gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#2563EB]/60 to-[#14B8A6]/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 p-3 rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">AI Score</p>
                  <p className="text-xs font-semibold text-white/90">92/100</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 p-3 rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Pipeline</p>
                  <p className="text-xs font-semibold text-white/90">$128K</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social proof */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative max-w-[1280px] mx-auto mt-[120px] text-center">
          <p className="text-sm text-white/35 mb-8 tracking-wide uppercase">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Google", "Microsoft", "Slack", "Notion", "GitHub"].map((name) => (
              <span key={name} className="text-[18px] font-semibold text-white/20 tracking-tight">{name}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">Features</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">close more deals</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[560px] mx-auto leading-relaxed">
              From lead capture to deal closure — one intelligent platform for your entire sales workflow.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} className="group relative p-8 rounded-[24px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#2563EB]/0 via-[#14B8A6]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/5 group-hover:via-[#14B8A6]/5 group-hover:to-[#2563EB]/5 transition-all duration-500" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${GRADIENT_COLORS[i]} shadow-lg`}>
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
      <section className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">Dashboard</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Your command center</motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[560px] mx-auto leading-relaxed">
              Everything visible at a glance. Revenue, pipeline, activities, and AI insights — all in one view.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative w-full aspect-[16/9] rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden shadow-2xl shadow-black/50">
              <div className="absolute inset-0 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="h-7 w-64 rounded-lg bg-white/[0.04]" />
                  <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-lg bg-white/[0.04]" />
                    <div className="h-7 w-7 rounded-lg bg-[#2563EB]/30" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Revenue", value: "$148.2K", change: "+12.5%" },
                    { label: "Active Leads", value: "2,847", change: "+8.2%" },
                    { label: "Emails Sent", value: "12.4K", change: "+15.3%" },
                    { label: "Conversion", value: "24.8%", change: "+3.1%" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-[10px] text-white/35 mb-1">{stat.label}</p>
                      <p className="text-base font-bold text-white/80">{stat.value}</p>
                      <p className="text-[10px] text-[#14B8A6]">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-44 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-end p-4 gap-2">
                    {[35, 55, 40, 70, 50, 85, 65, 80, 55, 90, 70, 95, 75, 88, 60].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#2563EB]/50 to-[#14B8A6]/30" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="h-44 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-white/35 mb-3">Pipeline</p>
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
              className="absolute -top-6 -right-6 p-4 rounded-[20px] border border-white/[0.08] bg-[#111827]/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
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
              className="absolute -bottom-6 -left-6 p-4 rounded-[20px] border border-white/[0.08] bg-[#111827]/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40">Email Campaign</p>
                  <p className="text-[13px] font-medium text-white/85">68% open rate today</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">Why OutreachCRM</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Built different, by design</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-3 gap-8">
            {WHY_US.map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="group text-center p-8 rounded-[24px] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#14B8A6]/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
      <section className="relative py-[120px] px-8">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">Integrations</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Works with your stack</motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed mb-16">
              Connect with the tools you already use. No disruption to your workflow.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="flex flex-wrap items-center justify-center gap-5">
            {INTEGRATIONS.map((name) => (
              <motion.div key={name} variants={scaleIn} className="px-6 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
                <span className="text-[15px] font-medium text-white/50">{name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-6">Testimonials</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Loved by sales teams</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="p-8 rounded-[24px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-white/60 mb-8 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/30 border border-white/[0.08]" />
                  <div>
                    <p className="text-[14px] font-semibold text-white/85">{t.name}</p>
                    <p className="text-[13px] text-white/40">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-[160px] px-8">
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
                className={`relative p-8 rounded-[24px] border flex flex-col ${
                  plan.popular
                    ? "border-[#2563EB]/40 bg-gradient-to-b from-[#2563EB]/10 to-transparent shadow-2xl shadow-[#2563EB]/10"
                    : "border-white/[0.06] bg-white/[0.02]"
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
                      : "border border-white/[0.1] bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:border-white/[0.15]"
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
      <section id="faq" className="relative py-[160px] px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">FAQ</motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">Frequently asked questions</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="border border-white/[0.06] rounded-2xl overflow-hidden">
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
      <section className="relative py-[160px] px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[56px] font-bold tracking-[-0.03em] mb-6">
              Ready to close more deals?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed mb-10">
              Join 50,000+ sales professionals using OutReach CRM to grow their pipeline.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="group inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]">
                Start Free Today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm text-white font-medium text-[16px] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] py-12 px-8">
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
