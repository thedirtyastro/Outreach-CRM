import Link from "next/link";
import {
  Zap,
  Globe,
  BarChart3,
  Mail,
  CalendarCheck,
  Users,
  Kanban,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25">
              <Zap className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-semibold text-base tracking-tight">OutReach CRM</span>
          </div>
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
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/50 text-xs font-medium text-muted-foreground mb-8">
            <Globe className="w-3.5 h-3.5" />
            Chrome Extension Available — Capture leads in one click
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Turn Social Profiles
            <br />
            <span className="text-primary">Into Clients</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Capture leads from LinkedIn, X, GitHub, and Instagram in one click.
            Manage outreach, automate follow-ups, and close more deals from a single CRM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-base"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors text-base"
            >
              See Features
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span>Trusted by</span>
            <span className="font-medium text-foreground/80">Freelancers</span>
            <span className="font-medium text-foreground/80">Startups</span>
            <span className="font-medium text-foreground/80">Agencies</span>
            <span className="font-medium text-foreground/80">Sales Teams</span>
            <span className="font-medium text-foreground/80">Consultants</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to close deals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From lead capture to deal closure — one platform for your entire outreach workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border/80 bg-card/50 hover:bg-card hover:border-border transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Get started in minutes, not hours.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border ${plan.popular ? "border-primary bg-primary/5" : "border-border/80 bg-card/50"} flex flex-col`}
              >
                {plan.popular && (
                  <span className="text-xs font-medium text-primary mb-3">Most Popular</span>
                )}
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium transition-colors ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-accent"}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Loved by outreach professionals</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-border/80 bg-card/50">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
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
      <section id="faq" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="p-5 rounded-xl border border-border/80 bg-card/50">
                <h3 className="font-medium text-sm mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to close more deals?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of freelancers and agencies using OutReach CRM to grow their business.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-base"
          >
            Start Free Today
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">OutReach CRM</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The CRM built for freelancers and agencies who do outreach on social media.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Chrome Extension</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} OutReach CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

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
