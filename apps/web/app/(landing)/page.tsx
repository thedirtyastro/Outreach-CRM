"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Mail,
  BarChart3,
  Target,
  CalendarCheck,
  Calendar,
  FileText,
  ChevronDown,
  Globe,
  Kanban,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FEATURES = [
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Track contacts with detail views, tags, fuzzy search, multi-filters, bulk actions, and CSV import/export.",
  },
  {
    icon: Kanban,
    title: "Pipeline Board",
    description:
      "Visual Kanban board with drag-and-drop. Move leads through stages from first contact to deal closed.",
  },
  {
    icon: Mail,
    title: "Email Outreach",
    description:
      "Compose and send emails with template variables. Track opens, clicks, and bounces via webhooks.",
  },
  {
    icon: CalendarCheck,
    title: "Follow-ups",
    description:
      "Schedule follow-up tasks with due dates and recurring support. Never miss a touchpoint.",
  },
  {
    icon: Calendar,
    title: "Calendar & Meetings",
    description:
      "Monthly calendar view for meetings and follow-ups. Log calls, video meetings, and in-person sessions.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Pipeline funnel, leads by platform, email engagement metrics, and activity trends over time.",
  },
  {
    icon: FileText,
    title: "Email Templates",
    description:
      "Create reusable templates with variable substitution. Speed up outreach with consistent messaging.",
  },
  {
    icon: Globe,
    title: "Chrome Extension",
    description:
      "One-click lead capture from LinkedIn, Twitter, GitHub, and Instagram profiles directly into your CRM.",
  },
  {
    icon: TrendingUp,
    title: "Client Acquisition",
    description:
      "Track acquisition goals, streaks, and conversion funnels. Forecast growth and log outreach activity.",
  },
];

const FAQ = [
  {
    q: "Who is this for?",
    a: "Freelancers, solopreneurs, and small agencies who do cold outreach on social media and need a simple way to track leads from first contact to deal closure.",
  },
  {
    q: "Which platforms does the Chrome extension support?",
    a: "LinkedIn, Twitter/X, GitHub, and Instagram. It extracts name, bio, company, location, and profile image automatically.",
  },
  {
    q: "How does email tracking work?",
    a: "Emails are sent via Resend. Open and click events are captured through webhooks and displayed in your lead timeline.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use session-based authentication, and your data is stored in a dedicated PostgreSQL database. We never share your data with third parties.",
  },
  {
    q: "Is it free to use?",
    a: "You can sign up and start using the app for free. The Chrome extension works with any account — just generate an API key from settings.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            A simple CRM for
            <br />
            <span className="text-primary">cold outreach</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            Track leads from first contact to deal closure. Capture prospects
            from social platforms, manage your pipeline, send tracked emails, and
            stay on top of follow-ups — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors"
            >
              See features
            </a>
          </div>
        </div>
      </section>

      {/* Platforms supported */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Capture leads from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {["LinkedIn", "Twitter / X", "GitHub", "Instagram"].map((name) => (
              <span
                key={name}
                className="text-sm font-medium text-foreground/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything you need for outreach
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Built for freelancers and small agencies who want a straightforward
              way to manage their sales pipeline.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              How it works
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Capture leads",
                description:
                  "Use the Chrome extension to grab profiles from LinkedIn, Twitter, GitHub, or Instagram with one click. Or add them manually or via CSV.",
              },
              {
                step: "2",
                title: "Manage your pipeline",
                description:
                  "Drag leads through your Kanban board as conversations progress. Filter, tag, and prioritize to stay organized.",
              },
              {
                step: "3",
                title: "Reach out & follow up",
                description:
                  "Send tracked emails using templates. Schedule follow-ups with reminders so nothing falls through the cracks.",
              },
              {
                step: "4",
                title: "Track results",
                description:
                  "See your pipeline funnel, email engagement, platform breakdown, and activity trends in the analytics dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            Questions & answers
          </h2>

          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-card border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-medium pr-4">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Ready to organize your outreach?
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign up for free and start tracking your leads today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Up
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} OutReach CRM. Developed by Sarukhan Muthuraman.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
