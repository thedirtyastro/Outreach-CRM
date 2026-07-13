"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Mail,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Rocket,
  Brain,
  Target,
  Activity,
  Layers,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useEffect, useState } from "react";

// Animation variants
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

// Floating icon component
function FloatingIcon({ icon: Icon, className, delay = 0 }: { icon: React.ElementType; className?: string; delay?: number }) {
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] text-white overflow-hidden relative">
      {/* Global background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2563EB]/20 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-[#14B8A6]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[30%] left-1/3 w-[400px] h-[400px] bg-[#2563EB]/10 rounded-full blur-[150px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#111827]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#testimonials" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">Testimonials</a>
            <a href="#faq" className="text-[15px] text-white/60 hover:text-white transition-colors duration-200">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-linear-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[15px] font-medium hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-200 shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[160px] pb-[160px] px-8">
        {/* Floating icons */}
        <FloatingIcon icon={Sparkles} className="top-[20%] left-[8%] hidden lg:flex" delay={0} />
        <FloatingIcon icon={Mail} className="top-[30%] right-[10%] hidden lg:flex" delay={0.5} />
        <FloatingIcon icon={Target} className="top-[60%] left-[5%] hidden lg:flex" delay={1} />
        <FloatingIcon icon={Brain} className="top-[15%] right-[20%] hidden lg:flex" delay={1.5} />
        <FloatingIcon icon={Activity} className="bottom-[20%] right-[8%] hidden lg:flex" delay={2} />
        <FloatingIcon icon={Globe} className="bottom-[30%] left-[15%] hidden lg:flex" delay={0.8} />

        <div className="relative max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-sm text-white/70 mb-8">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <span>AI-Powered Sales Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[56px] sm:text-[64px] lg:text-[72px] font-bold tracking-[-0.03em] leading-[1.05] mb-8">
              AI-Powered CRM
              <br />
              <span className="bg-linear-to-r from-[#2563EB] via-[#14B8A6] to-[#2563EB] bg-clip-text text-transparent">
                Built for Modern
              </span>
              <br />
              Sales Teams
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[18px] sm:text-[20px] text-white/55 max-w-[520px] leading-relaxed mb-10">
              Capture leads from any platform, automate your outreach, and close deals faster with intelligent pipeline management.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl bg-linear-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]"
              >
                Start Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm text-white font-medium text-[16px] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
              >
                Book Demo
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111827] bg-linear-to-br from-white/20 to-white/5" />
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

          {/* Right column — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/3] rounded-[24px] border border-white/[0.08] bg-linear-to-b from-white/[0.04] to-transparent backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
              {/* Mock dashboard content */}
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
                    <div key={i} className="flex-1 rounded-t-sm bg-linear-to-t from-[#2563EB]/60 to-[#14B8A6]/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 p-3 rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
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
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 p-3 rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
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

        {/* Trust logos */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative max-w-[1280px] mx-auto mt-[120px] text-center"
        >
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">
              Features
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Everything you need to
              <br />
              <span className="bg-linear-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">close more deals</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[560px] mx-auto leading-relaxed">
              From lead capture to deal closure — one intelligent platform for your entire sales workflow.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group relative p-8 rounded-[24px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 overflow-hidden"
              >
                {/* Gradient border glow on hover */}
                <div className="absolute inset-0 rounded-[24px] bg-linear-to-br from-[#2563EB]/0 via-[#14B8A6]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/5 group-hover:via-[#14B8A6]/5 group-hover:to-[#2563EB]/5 transition-all duration-500" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-linear-to-br ${FEATURE_GRADIENTS[i]} shadow-lg`}>
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

      {/* Dashboard Showcase */}
      <section className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">
              Dashboard
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Your command center
            </motion.h2>
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
            {/* Main dashboard frame */}
            <div className="relative w-full aspect-[16/9] rounded-[24px] border border-white/[0.08] bg-linear-to-b from-white/[0.03] to-transparent overflow-hidden shadow-2xl shadow-black/50">
              <div className="absolute inset-0 p-8">
                {/* Top bar */}
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

                {/* Stats row */}
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
                {/* Chart area */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-44 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-end p-4 gap-2">
                    {[35, 55, 40, 70, 50, 85, 65, 80, 55, 90, 70, 95, 75, 88, 60].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-linear-to-t from-[#2563EB]/50 to-[#14B8A6]/30" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="h-44 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-white/35 mb-3">Pipeline</p>
                    <div className="space-y-2.5">
                      {["New", "Contacted", "Qualified", "Proposal", "Won"].map((stage, i) => (
                        <div key={stage} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB]" style={{ opacity: 1 - i * 0.15 }} />
                          <span className="text-[10px] text-white/40 flex-1">{stage}</span>
                          <span className="text-[10px] text-white/60">{[245, 180, 92, 48, 31][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent cards */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 rounded-[20px] border border-white/[0.08] bg-[#111827]/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
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
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
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

      {/* Why OutreachCRM - Three column */}
      <section className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">
              Why OutreachCRM
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Built different, by design
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-8"
          >
            {WHY_US.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="group text-center p-8 rounded-[24px] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#2563EB]/20 to-[#14B8A6]/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-[17px] font-semibold mb-3 text-white/90">{item.title}</h3>
                <p className="text-[15px] text-white/45 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative py-[120px] px-8">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">
              Integrations
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Works with your stack
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed mb-16">
              Connect with the tools you already use. No disruption to your workflow.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-wrap items-center justify-center gap-5"
          >
            {INTEGRATIONS.map((name) => (
              <motion.div
                key={name}
                variants={scaleIn}
                className="px-6 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <span className="text-[15px] font-medium text-white/50">{name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-[160px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-6">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Loved by sales teams
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="p-8 rounded-[24px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-white/60 mb-8 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2563EB]/30 to-[#14B8A6]/30 border border-white/[0.08]" />
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

      {/* Pricing */}
      <section id="pricing" className="relative py-[160px] px-8">
        <div className="max-w-[1080px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-medium text-[#2563EB] mb-6">
              Pricing
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-5">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[18px] text-white/50 max-w-[480px] mx-auto leading-relaxed">
              Start free. Scale as you grow. No hidden fees.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-6"
          >
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative p-8 rounded-[24px] border flex flex-col ${
                  plan.popular
                    ? "border-[#2563EB]/40 bg-linear-to-b from-[#2563EB]/10 to-transparent shadow-2xl shadow-[#2563EB]/10"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-[#2563EB] to-[#1D4ED8] text-[12px] font-medium text-white shadow-lg shadow-[#2563EB]/30">
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
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px]">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                      <span className="text-white/60">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`inline-flex items-center justify-center h-12 px-6 rounded-2xl text-[15px] font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-linear-to-r from-[#2563EB] to-[#1D4ED8] text-white hover:from-[#3B82F6] hover:to-[#2563EB] shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:scale-[1.02]"
                      : "border border-white/[0.1] text-white/70 hover:bg-white/[0.05] hover:border-white/[0.15] hover:text-white"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-[160px] px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-xs font-medium text-[#14B8A6] mb-6">
              FAQ
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em]">
              Questions & answers
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="space-y-4"
          >
            {FAQ.map((item) => (
              <motion.div
                key={item.q}
                variants={fadeUp}
                className="p-6 rounded-[20px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
              >
                <h3 className="text-[15px] font-semibold text-white/85 mb-2">{item.q}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-[160px] px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-linear-to-r from-[#2563EB]/15 via-[#14B8A6]/10 to-[#2563EB]/15 rounded-full blur-[150px]" />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative max-w-[640px] mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-bold tracking-[-0.02em] mb-6">
            Ready to close
            <br />
            <span className="bg-linear-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">more deals?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[18px] text-white/50 mb-10 leading-relaxed">
            Join thousands of sales professionals using OutreachCRM to grow revenue faster.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 h-[56px] px-10 rounded-2xl bg-linear-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium text-[16px] hover:from-[#3B82F6] hover:to-[#2563EB] transition-all duration-300 shadow-xl shadow-[#2563EB]/30 hover:shadow-[#2563EB]/50 hover:scale-[1.03]"
            >
              Start Free Today
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.05] py-20 px-8">
        <div className="max-w-[1280px] mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-5">
              <Logo size="md" />
            </div>
            <p className="text-[14px] text-white/40 max-w-[280px] leading-relaxed mb-5">
              The AI-powered CRM built for modern sales teams who close deals faster.
            </p>
            <p className="text-[13px] text-white/30">
              Developed by <span className="text-white/60 font-medium">Sarukhan Muthuraman</span>
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200" aria-label="GitHub">
                <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com/in/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200" aria-label="LinkedIn">
                <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://twitter.com/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200" aria-label="Twitter / X">
                <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-white/80 mb-5">Product</h4>
            <ul className="space-y-3 text-[14px] text-white/40">
              <li><a href="#features" className="hover:text-white/70 transition-colors duration-200">Features</a></li>
              <li><a href="#pricing" className="hover:text-white/70 transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Chrome Extension</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-white/80 mb-5">Company</h4>
            <ul className="space-y-3 text-[14px] text-white/40">
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">About</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Careers</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-white/80 mb-5">Legal</h4>
            <ul className="space-y-3 text-[14px] text-white/40">
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Privacy</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Terms</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors duration-200">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/30">
            © {new Date().getFullYear()} OutreachCRM. All rights reserved.
          </p>
          <p className="text-[12px] text-white/25">
            Made with ❤️ by Sarukhan Muthuraman
          </p>
        </div>
      </footer>
    </div>
  );
}

// Data
const FEATURE_GRADIENTS = [
  "from-[#2563EB] to-[#1D4ED8]",
  "from-[#14B8A6] to-[#2563EB]",
  "from-[#2563EB] to-[#14B8A6]",
  "from-[#1D4ED8] to-[#2563EB]",
  "from-[#14B8A6] to-[#1D4ED8]",
  "from-[#2563EB] to-[#1D4ED8]",
];

const FEATURES = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Capture leads from LinkedIn, Twitter, GitHub, and Instagram in one click with our Chrome extension.",
  },
  {
    icon: Brain,
    title: "AI Automation",
    description: "Let AI score leads, suggest follow-ups, and draft personalized outreach messages automatically.",
  },
  {
    icon: Mail,
    title: "Email Tracking",
    description: "Send, track, and optimize emails directly from the CRM. Know exactly when leads engage.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Pipeline conversion, email metrics, and revenue tracking — all the insights you need.",
  },
  {
    icon: Layers,
    title: "CRM Integrations",
    description: "Connect with Slack, Gmail, Calendar, and 50+ tools. Your workflow stays uninterrupted.",
  },
  {
    icon: Target,
    title: "Sales Pipeline",
    description: "Visual Kanban pipeline with customizable stages. Drag-and-drop deals from lead to close.",
  },
];

const WHY_US = [
  {
    icon: Rocket,
    title: "Lightning Fast",
    description: "Built on modern infrastructure for sub-second load times. No bloat, no lag.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, SOC 2 compliance, and role-based access controls.",
  },
  {
    icon: Zap,
    title: "AI-First Design",
    description: "Every feature is enhanced by AI — from lead scoring to email personalization.",
  },
];

const INTEGRATIONS = [
  "Slack", "Gmail", "Google Calendar", "LinkedIn", "HubSpot",
  "Notion", "Zapier", "Microsoft", "Stripe", "GitHub",
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Head of Sales",
    company: "TechFlow",
    quote: "OutreachCRM replaced three tools for us. The AI-powered lead scoring alone has increased our conversion rate by 40%.",
  },
  {
    name: "Marcus Rivera",
    role: "Founder",
    company: "GrowthLab",
    quote: "The Chrome extension is a game-changer. One click to capture a LinkedIn lead and start the outreach flow. We saved 10 hours a week.",
  },
  {
    name: "Priya Sharma",
    role: "Sales Director",
    company: "ScaleUp",
    quote: "Finally a CRM that understands modern sales. The pipeline view and email tracking are exactly what we needed. Clean, fast, and intelligent.",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals getting started",
    popular: false,
    features: [
      "100 leads",
      "50 emails/month",
      "Basic analytics",
      "Chrome extension",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing sales teams",
    popular: true,
    features: [
      "Unlimited leads",
      "Unlimited emails",
      "AI lead scoring",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    popular: false,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SSO & SAML",
      "SLA guarantee",
      "On-premise option",
    ],
  },
];

const FAQ = [
  {
    q: "Which platforms does the Chrome extension support?",
    a: "LinkedIn, Twitter/X, GitHub, and Instagram. We extract name, bio, company, location, and profile image automatically.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your data is stored with end-to-end encryption. We use session-based auth and never share your data with third parties.",
  },
  {
    q: "Can I use this with my team?",
    a: "Absolutely. Pro and Enterprise plans include team collaboration features with role-based access controls.",
  },
  {
    q: "Do I need a paid plan to use the Chrome extension?",
    a: "No. The Chrome extension works on every plan, including Free. You just need to generate an API key from your settings.",
  },
  {
    q: "How does the AI lead scoring work?",
    a: "Our AI analyzes lead behavior, engagement patterns, and profile data to assign a score from 0-100, helping you prioritize the hottest prospects.",
  },
];
