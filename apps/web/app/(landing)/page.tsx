import Link from "next/link";
import {
  Globe,
  BarChart3,
  Mail,
  CalendarCheck,
  Users,
  Kanban,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
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
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-600/25"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-60 -right-40 w-[400px] h-[400px] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-8">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Chrome Extension Available — Capture leads in one click</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Turn Social Profiles
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Into Clients
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Capture leads from LinkedIn, X, GitHub, and Instagram in one click.
            Manage outreach, automate follow-ups, and close more deals from a single CRM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all text-base shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-foreground font-medium hover:bg-white/10 hover:border-white/20 transition-all text-base"
            >
              See Features
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="text-sm text-muted-foreground">Trusted by</span>
            {["Freelancers", "Startups", "Agencies", "Sales Teams", "Recruiters", "Consultants"].map((badge) => (
              <span key={badge} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-foreground/80">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to close deals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From lead capture to deal closure — one platform for your entire outreach workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent hover:from-white/10 hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${FEATURE_COLORS[i]} shadow-lg`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Get started in minutes</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to transform your outreach.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-5 text-white font-bold text-lg shadow-xl shadow-purple-600/20">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400 mb-4">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border flex flex-col ${plan.popular ? "border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-purple-500/5 shadow-xl shadow-blue-500/10" : "border-white/5 bg-white/[0.02]"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-medium text-white shadow-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium transition-all ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/25" : "border border-white/10 hover:bg-white/5"}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-t from-blue-600/10 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-medium text-yellow-400 mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Loved by outreach professionals</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-24 px-6">
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400 mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                <h3 className="font-medium text-sm mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to close more deals?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of freelancers and agencies using OutReach CRM to grow their business.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-13 px-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all text-base shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02]"
          >
            Start Free Today
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The CRM built for freelancers and agencies who do outreach on social media.
            </p>
            <p className="text-xs text-muted-foreground">
              Developed by <span className="text-foreground font-medium">Sarukhan Muthuraman</span>
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a href="https://github.com/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="GitHub">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com/in/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://twitter.com/sarukhanm" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Twitter / X">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Chrome Extension</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OutReach CRM. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ by Sarukhan Muthuraman
          </p>
        </div>
      </footer>
    </div>
  );
}

const FEATURE_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-indigo-500 to-blue-500",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
];

const FEATURES = [
  {
    icon: Globe,
    title: "One-Click Lead Capture",
    description: "Save leads from LinkedIn, Twitter, GitHub, and Instagram with our Chrome extension — no copy-pasting.",
  },
  {
    icon: Kanban,
    title: "Smart Pipeline",
    description: "Drag-and-drop Kanban board with 15 customizable statuses to track every deal from first contact to close.",
  },
  {
    icon: Mail,
    title: "Email Outreach",
    description: "Compose, send, and track emails directly from the CRM. Know when leads open and click your messages.",
  },
  {
    icon: CalendarCheck,
    title: "Follow-up Automation",
    description: "Never miss a follow-up. Schedule recurring reminders and let the system keep you accountable.",
  },
  {
    icon: Users,
    title: "Calendar & Meetings",
    description: "Track calls, video meetings, and in-person meetings. View everything in a unified calendar.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Pipeline conversion, email engagement, platform breakdown — all the metrics you need to optimize.",
  },
];

const STEPS = [
  {
    title: "Install the Extension",
    description: "Add our Chrome extension and connect it to your CRM with your API key.",
  },
  {
    title: "Capture Leads",
    description: "Visit any LinkedIn, Twitter, GitHub, or Instagram profile and save it in one click.",
  },
  {
    title: "Manage & Outreach",
    description: "Organize your pipeline, send emails, schedule follow-ups, and close deals.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "For individuals getting started",
    popular: false,
    features: ["100 leads", "50 emails/month", "Basic analytics", "Chrome extension"],
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    description: "For active freelancers",
    popular: false,
    features: ["Unlimited leads", "500 emails/month", "Email templates", "Follow-up automation", "Priority support"],
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For agencies & consultants",
    popular: true,
    features: ["Everything in Starter", "Unlimited emails", "Advanced analytics", "Team features", "API access", "Custom integrations"],
  },
  {
    name: "Business",
    price: "Custom",
    period: "",
    description: "For teams & organizations",
    popular: false,
    features: ["Everything in Pro", "Dedicated support", "Custom onboarding", "SLA guarantee", "SSO & SAML"],
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul M.",
    role: "Freelance Developer",
    quote: "I was managing leads in spreadsheets. OutReach CRM replaced that mess with a clean pipeline and the Chrome extension saves me hours every week.",
  },
  {
    name: "Priya S.",
    role: "Agency Founder",
    quote: "The email tracking alone is worth it. Knowing who opened my proposals changed how I do follow-ups completely.",
  },
  {
    name: "Alex K.",
    role: "Sales Consultant",
    quote: "Finally a CRM that understands social selling. One click to save a LinkedIn profile and start the outreach flow — brilliant.",
  },
];

const FAQ = [
  {
    q: "Which platforms does the Chrome extension support?",
    a: "LinkedIn, Twitter/X, GitHub, and Instagram. We extract name, bio, company, location, and profile image automatically.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your data is stored in a dedicated PostgreSQL database. We use encrypted connections, session-based auth, and never share your data with third parties.",
  },
  {
    q: "Can I use this with my team?",
    a: "Team features are on our roadmap. Currently, each account is individual. Multi-user workspaces with role-based access are coming soon.",
  },
  {
    q: "Do I need a paid plan to use the Chrome extension?",
    a: "No. The Chrome extension works on every plan, including Free. You just need to generate an API key from your settings.",
  },
  {
    q: "Can I import my existing leads?",
    a: "Absolutely. You can import leads via CSV with automatic column mapping. Export is also supported.",
  },
  {
    q: "Is there an API available?",
    a: "Yes. Every feature is accessible via our REST API using your personal API key. Perfect for custom integrations and automation.",
  },
];
