import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import {
  Zap,
  ArrowRight,
  ShoppingCart,
  Users,
  BarChart3,
  Shield,
  CreditCard,
  TrendingUp,
  ChevronRight,
  Star,
  Package,
  Clock,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const tick = () => {
            start += step;
            if (start >= end) {
              el.textContent = end.toLocaleString();
              return;
            }
            el.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  Stat counter component                                             */
/* ------------------------------------------------------------------ */
function StatCounter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useCountUp(value);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
        <span ref={ref}>0</span>
        {suffix}
      </p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                       */
/* ------------------------------------------------------------------ */
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = 'primary',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: 'primary' | 'accent' | 'info' | 'success';
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
  };
  const glows = {
    primary: 'group-hover:shadow-primary/10',
    accent: 'group-hover:shadow-accent/10',
    info: 'group-hover:shadow-info/10',
    success: 'group-hover:shadow-success/10',
  };

  return (
    <div
      className={cn(
        'group relative bg-bg-card-light dark:bg-bg-secondary rounded-2xl border border-border-light dark:border-border-dark p-6 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:-translate-y-1',
        glows[accent],
        'hover:shadow-xl',
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border mb-4', colors[accent])}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier badge for the pricing-like tier section                       */
/* ------------------------------------------------------------------ */
function TierShowcase({
  tier,
  color,
  discount,
  perks,
  featured = false,
}: {
  tier: string;
  color: string;
  discount: string;
  perks: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1',
        featured
          ? 'bg-gradient-to-b from-primary/5 to-transparent border-primary/40 shadow-lg shadow-primary/5 scale-[1.02]'
          : 'bg-bg-card-light dark:bg-bg-secondary border-border-light dark:border-border-dark hover:border-primary/20',
      )}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">
          Popular
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{tier}</h4>
      </div>
      <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
        {discount}
        <span className="text-sm font-normal text-text-secondary ml-1">discount</span>
      </p>
      <ul className="space-y-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-sm text-text-secondary">
            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
            {perk}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const { isDark, toggle } = useThemeStore();

  // Ensure dark class is in sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-primary overflow-x-hidden">
      {/* ============================================================ */}
      {/*  NAVBAR                                                      */}
      {/* ============================================================ */}
      <nav className="fixed top-0 inset-x-0 z-50 glass bg-bg-light/80 dark:bg-bg-primary/80 border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Smart<span className="text-primary">Shop</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
              How It Works
            </a>
            <a href="#tiers" className="text-sm text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
              Tiers
            </a>
            <a href="#stats" className="text-sm text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
              Stats
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-card-light dark:hover:bg-bg-tertiary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-info/3 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            B2B Commerce — Reinvented
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark max-w-4xl mx-auto leading-[1.1]">
            Commerce at the
            <span className="relative mx-3">
              <span className="relative z-10 text-primary">speed</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/15 rounded-sm -z-0" />
            </span>
            of thought
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            SmartShop by <span className="font-semibold text-accent">MicroTech Maroc</span> — the B2B platform that
            automates orders, tracks payments, and rewards your best clients with intelligent tier-based pricing.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-text-primary-light dark:text-text-primary-dark bg-bg-card-light dark:bg-bg-secondary border border-border-light dark:border-border-dark hover:border-primary/30 transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Hero visual — abstract dashboard mockup */}
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-secondary shadow-2xl dark:shadow-none overflow-hidden">
              {/* Fake title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-tertiary">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-bg-card-light dark:bg-bg-secondary text-xs text-text-muted font-mono">
                    smartshop.microtech.ma/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard skeleton */}
              <div className="p-6 md:p-8 space-y-6">
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenue', value: '1,234,500 DH', color: 'text-primary' },
                    { label: 'Orders', value: '847', color: 'text-accent' },
                    { label: 'Clients', value: '128', color: 'text-info' },
                    { label: 'Products', value: '356', color: 'text-success' },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-xl bg-bg-light dark:bg-bg-tertiary border border-border-light dark:border-border-dark p-4"
                    >
                      <p className="text-xs text-text-muted uppercase tracking-wide">{kpi.label}</p>
                      <p className={cn('text-xl font-bold mt-1', kpi.color)}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder row */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-xl bg-bg-light dark:bg-bg-tertiary border border-border-light dark:border-border-dark p-4 h-48 flex items-end gap-1.5 overflow-hidden">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-primary/80"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                      />
                    ))}
                  </div>
                  <div className="rounded-xl bg-bg-light dark:bg-bg-tertiary border border-border-light dark:border-border-dark p-4 h-48 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-[10px] border-primary/70 border-t-accent/70 border-l-info/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind the card */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Everything you need to run B2B operations
            </h2>
            <p className="mt-4 text-text-secondary">
              From order management to payment tracking — SmartShop handles the complexity so you can focus on growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={ShoppingCart}
              title="Smart Order Management"
              description="Create orders with automatic price calculation, TVA handling, and promo code support. Confirm or cancel with a single click."
              accent="primary"
            />
            <FeatureCard
              icon={Users}
              title="Client Tier System"
              description="Clients automatically progress through Basic, Silver, Gold, and Platinum tiers — unlocking exclusive discounts as they grow."
              accent="accent"
            />
            <FeatureCard
              icon={CreditCard}
              title="Multi-Method Payments"
              description="Accept cash, cheques, and wire transfers. Track encashment status in real-time with full audit trails."
              accent="info"
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-Time Analytics"
              description="Interactive dashboards with revenue trends, top clients, order distribution, and stock alerts — all at a glance."
              accent="success"
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Admins manage everything. Clients see only their orders and tier progress. Session-based auth keeps it secure."
              accent="primary"
            />
            <FeatureCard
              icon={Package}
              title="Inventory Control"
              description="Track stock in real time. Low-stock badges warn you instantly. Automatic validation prevents overselling."
              accent="accent"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 md:py-28 bg-bg-card-light dark:bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Three steps to streamlined commerce
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/30 via-accent/30 to-info/30" />

            {[
              {
                step: '01',
                icon: Users,
                title: 'Register & classify clients',
                desc: 'Add your B2B clients — the system automatically assigns tiers based on their purchase history.',
                color: 'primary' as const,
              },
              {
                step: '02',
                icon: ShoppingCart,
                title: 'Create & confirm orders',
                desc: 'Build orders with live pricing, tier discounts, promo codes, and TVA applied automatically.',
                color: 'accent' as const,
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Track & grow revenue',
                desc: 'Monitor payments, analyze trends, and watch clients climb tiers — boosting retention and revenue.',
                color: 'info' as const,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div
                  className={cn(
                    'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6 border',
                    item.color === 'primary' && 'bg-primary/10 border-primary/20',
                    item.color === 'accent' && 'bg-accent/10 border-accent/20',
                    item.color === 'info' && 'bg-info/10 border-info/20',
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-8 h-8',
                      item.color === 'primary' && 'text-primary',
                      item.color === 'accent' && 'text-accent',
                      item.color === 'info' && 'text-info',
                    )}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-text-muted tracking-widest">STEP {item.step}</span>
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TIER SYSTEM                                                 */}
      {/* ============================================================ */}
      <section id="tiers" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Client Tiers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Reward loyalty automatically
            </h2>
            <p className="mt-4 text-text-secondary">
              Clients unlock better pricing as they purchase more. No manual configuration needed — the system handles
              tier progression in real time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TierShowcase
              tier="Basic"
              color="#A3A3A3"
              discount="0%"
              perks={['Standard pricing', 'Order tracking', 'Payment history']}
            />
            <TierShowcase
              tier="Silver"
              color="#C0C0C0"
              discount="5%"
              perks={['3+ orders or 1,000 DH', 'Priority support', 'Min. subtotal: 500 DH']}
            />
            <TierShowcase
              tier="Gold"
              color="#D4A017"
              discount="10%"
              perks={['10+ orders or 5,000 DH', 'Extended payment terms', 'Min. subtotal: 800 DH']}
              featured
            />
            <TierShowcase
              tier="Platinum"
              color="#9B5DE5"
              discount="15%"
              perks={['20+ orders or 15,000 DH', 'Dedicated account manager', 'Min. subtotal: 1,200 DH']}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS / SOCIAL PROOF                                        */}
      {/* ============================================================ */}
      <section id="stats" className="py-20 md:py-28 bg-bg-card-light dark:bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">By The Numbers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Trusted by businesses across Morocco
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCounter value={500} suffix="+" label="Active Clients" />
            <StatCounter value={12000} suffix="+" label="Orders Processed" />
            <StatCounter value={98} suffix="%" label="Payment Success" />
            <StatCounter value={24} suffix="/7" label="Platform Uptime" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">What Clients Say</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Built for real businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'SmartShop transformed how we manage our wholesale orders. The tier system keeps our clients coming back.',
                name: 'Ahmed Benali',
                role: 'CEO, TechPro Solutions',
              },
              {
                quote: 'Tracking payments across multiple methods was a nightmare before SmartShop. Now everything is in one place.',
                name: 'Sara El Mansouri',
                role: 'CFO, Digital Wave',
              },
              {
                quote: 'The automatic discount tiers are genius. Our clients love seeing their progress toward the next level.',
                name: 'Karim Tazi',
                role: 'Director, Atlas Electronics',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-bg-card-light dark:bg-bg-secondary rounded-2xl border border-border-light dark:border-border-dark p-6 hover:border-primary/20 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-primary" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(244,162,97,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(155,93,229,0.15),transparent_60%)]" />

            <div className="relative px-8 py-16 md:py-20 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
                <Clock className="w-3 h-3" />
                Get started in under 5 minutes
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
                Ready to modernize your B2B commerce?
              </h2>
              <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
                Join hundreds of Moroccan businesses already using SmartShop to automate orders, track payments, and grow revenue.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-primary bg-white hover:bg-white/90 shadow-xl transition-all"
                >
                  Sign In Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="border-t border-border-light dark:border-border-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                  Smart<span className="text-primary">Shop</span>
                </span>
              </div>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                The B2B commercial management platform by MicroTech Maroc. Streamline your orders, payments, and client
                relationships.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-text-secondary hover:text-primary transition-colors">Features</a></li>
                <li><a href="#tiers" className="text-sm text-text-secondary hover:text-primary transition-colors">Client Tiers</a></li>
                <li><a href="#how-it-works" className="text-sm text-text-secondary hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-text-secondary">MicroTech Maroc</span></li>
                <li><span className="text-sm text-text-secondary">Casablanca, Morocco</span></li>
                <li><span className="text-sm text-text-secondary">contact@microtech.ma</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">© 2026 MicroTech Maroc. All rights reserved.</p>
            <p className="text-xs text-text-muted">
              Crafted with <span className="text-primary">&#9829;</span> in Morocco
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
