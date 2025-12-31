-- Supabase schema for the company website.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'admin',
  created_at timestamp with time zone default now()
);

create table if not exists public.posts (
  id bigserial primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  status text not null default 'draft',
  hero_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone,
  author_id uuid references auth.users(id)
);

create table if not exists public.pages (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  content text,
  hero_title text,
  hero_subtitle text,
  updated_at timestamp with time zone default now()
);

-- Editable site-wide and per-page copy (text-only CMS)
create table if not exists public.site_content (
  id bigserial primary key,
  scope text not null,
  key text not null,
  value text not null,
  updated_at timestamp with time zone default now()
);

create unique index if not exists site_content_scope_key_unique
  on public.site_content(scope, key);

create table if not exists public.contact_messages (
  id bigserial primary key,
  name text,
  email text,
  company text,
  phone text,
  topics text[],
  subject text,
  message text,
  ip_address text,
  download_path text,
  download_filename text,
  hubspot_contact_id text,
  hubspot_synced_at timestamp with time zone,
  hubspot_error text,
  created_at timestamp with time zone default now()
);

create table if not exists public.intro_call_requests (
  id bigserial primary key,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

create index if not exists intro_call_requests_ip_created_at_idx
  on public.intro_call_requests(ip_address, created_at);

alter table public.contact_messages add column if not exists company text;
alter table public.contact_messages add column if not exists phone text;
alter table public.contact_messages add column if not exists topics text[];
alter table public.contact_messages add column if not exists ip_address text;
alter table public.contact_messages add column if not exists download_path text;
alter table public.contact_messages add column if not exists download_filename text;
alter table public.contact_messages add column if not exists hubspot_contact_id text;
alter table public.contact_messages add column if not exists hubspot_synced_at timestamp with time zone;
alter table public.contact_messages add column if not exists hubspot_error text;

-- Track updated_at on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row
execute procedure public.set_updated_at();

alter table public.posts enable row level security;
alter table public.pages enable row level security;
alter table public.site_content enable row level security;
alter table public.contact_messages enable row level security;
alter table public.intro_call_requests enable row level security;
alter table public.profiles enable row level security;

-- Profiles policies
drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Posts policies
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

drop policy if exists "Admins full access to posts" on public.posts;
create policy "Admins full access to posts"
  on public.posts for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  )
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Pages policies
drop policy if exists "Public can read pages" on public.pages;
create policy "Public can read pages"
  on public.pages for select
  using (true);

drop policy if exists "Admins full access to pages" on public.pages;
create policy "Admins full access to pages"
  on public.pages for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  )
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Site content policies
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Admins full access to site content" on public.site_content;
create policy "Admins full access to site content"
  on public.site_content for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  )
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Contact message policies
drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Seed default pages if they do not exist
insert into public.pages (slug, title, hero_title, hero_subtitle, content)
values
  (
    'home',
    'Home',
    'Business Analysis & Systems Engineering',
    'Delivery with measurable outcomes and executive-ready reporting.',
    '<p>Welcome to your new site. Update this content in the admin area or Supabase.</p>'
  ),
  (
    'services',
    'Services',
    'Delivery that connects strategy to execution',
    'Structured consulting, architecture, and product execution.',
    '<p>List your service lines here. Edit the Services page from the admin panel.</p>'
  ),
  (
    'about',
    'About',
    'We align business strategy with reliable delivery',
    'Leaders in analysis, engineering, and program governance.',
    '<p>Tell your story here. Update the About page in the admin area.</p>'
  ),
  (
    'contact',
    'Contact',
    'Ready to talk about your next milestone?',
    'Send us a note and we will respond quickly with next steps.',
    '<p>Add office locations or contact details here.</p>'
  )
on conflict (slug) do nothing;

-- Seed default site content (text-only fields).
insert into public.site_content (scope, key, value)
values
  -- Global: header + footer
  ('global', 'header.logoAlt', $$Company Logo$$),
  ('global', 'header.taglineLine1', $$Business Analysis and Systems Engineering$$),
  ('global', 'header.taglineLine2', $$Done Right$$),
  ('global', 'header.nav.home', $$Home$$),
  ('global', 'header.nav.services', $$Services$$),
  ('global', 'header.nav.articles', $$Articles$$),
  ('global', 'header.nav.about', $$About$$),
  ('global', 'header.nav.contact', $$Contact Us$$),
  ('global', 'header.navCtaLabel', $$Schedule a Consultation$$),
  ('global', 'header.mobile.openLabel', $$Menu$$),
  ('global', 'header.mobile.closeLabel', $$Close$$),

  ('global', 'footer.sdvLogoAlt', $$Service-Disabled Veteran-Owned Small Business (SDVOSB)$$),
  ('global', 'footer.sdvLabel', $$SDVOSB$$),
  ('global', 'footer.companyName', $$Campbell Consulting Services of Tallahassee LLC (CCST)$$),
  ('global', 'footer.line1', $$Service-Disabled Veteran-Owned Small Business (SDVOSB) • Founded 2019$$),
  ('global', 'footer.line2', $$Supporting Florida DOEA, NYS ITS, and commercial organizations$$),
  ('global', 'footer.line3', $$Experienced in HIPAA, CMMC, and state-level compliance environment$$),
  ('global', 'footer.copyrightSuffix', $$Campbell Consulting Services of Tallahassee LLC. All rights reserved.$$),

  -- Home page
  ('home', 'hero.imageAlt', $$Campbell Consulting homepage hero$$),
  ('home', 'hero.pill', $$Campbell Consulting Services of Tallahassee (CCST)$$),
  ('home', 'hero.tagline', $$Clarity for Decisions. Structure for Delivery. Innovation for the Future.$$),
  (
    'home',
    'hero.description',
    $$CCST is a Service-Disabled Veteran-Owned Small Business (SDVOSB) specializing in Strategic Decision Support, SLED Contracting Services, and Intelligent Software Development. We help leaders and organizations move from uncertainty to clarity, from complexity to structure, and from ideas to measurable outcomes.$$
  ),
  ('home', 'hero.primaryCtaLabel', $$Explore Our Services$$),
  ('home', 'hero.secondaryCtaLabel', $$Contact Us$$),

  ('home', 'whatWeDo.eyebrow', $$What We Do$$),
  ('home', 'whatWeDo.heading', $$Three service lines$$),
  (
    'home',
    'whatWeDo.description',
    $$Strategic clarity, contracting delivery, and practical software to turn ideas into measurable outcomes.$$
  ),
  ('home', 'whatWeDo.learnMoreLabel', $$Learn more$$),
  ('home', 'whatWeDo.cards.strategic.title', $$Strategic Decision Support$$),
  (
    'home',
    'whatWeDo.cards.strategic.hook',
    $$Clarity for leaders. Alignment for teams. Execution for the organization.$$
  ),
  (
    'home',
    'whatWeDo.cards.strategic.description',
    $$We support executives and founders with structured analysis, strategic advisory, training, and decision frameworks that accelerate progress and reduce risk.$$
  ),
  ('home', 'whatWeDo.cards.sled.title', $$SLED Contracting Services$$),
  (
    'home',
    'whatWeDo.cards.sled.hook',
    $$Trusted delivery for State, Local, Education, and Federal partners.$$
  ),
  (
    'home',
    'whatWeDo.cards.sled.description',
    $$We provide Business Analysis, Systems Engineering, modernization support, and SDLC expertise to public-sector clients and prime contractors seeking reliable, structured execution.$$
  ),
  ('home', 'whatWeDo.cards.software.title', $$Software Development & Intelligent Systems$$),
  (
    'home',
    'whatWeDo.cards.software.hook',
    $$Practical, scalable software built to solve real problems.$$
  ),
  (
    'home',
    'whatWeDo.cards.software.description',
    $$From AI agents to intelligent automation tools like VidSense, we create solutions that increase efficiency, reduce manual burden, and support better decision-making.$$
  ),

  ('home', 'whyChoose.eyebrow', $$Why Organizations Choose CCST$$),
  ('home', 'whyChoose.heading', $$A disciplined approach grounded in Systems Thinking.$$),
  (
    'home',
    'whyChoose.description',
    $$We bring structure, clarity, and full lifecycle expertise to every engagement - ensuring that technology initiatives align with organizational goals and deliver measurable results.$$
  ),
  ('home', 'whyChoose.preface', $$Our clients rely on us for:$$),
  (
    'home',
    'whyChoose.bullets',
    $$Clear problem definition and structured decision support
High-quality requirements and documentation
End-to-end SDLC guidance for Agile and traditional environments
Reliable modernization planning and execution
Practical guidance rooted in real-world experience$$
  ),

  ('home', 'readyCta.title', $$Ready to strengthen your next initiative?$$),
  (
    'home',
    'readyCta.description',
    $$Whether you need strategic clarity, government contracting support, or intelligent automation tools, CCST is here to help.$$
  ),
  ('home', 'readyCta.primaryCtaLabel', $$Contact Us$$),
  ('home', 'readyCta.secondaryCtaLabel', $$Explore Our Services$$),

  ('home', 'howWeWork.eyebrow', $$How We Work$$),
  ('home', 'howWeWork.heading', $$Simple 4-step process$$),
  ('home', 'howWeWork.stepLabel', $$Step$$),
  (
    'home',
    'howWeWork.intro',
    $$A modern homepage should show the path - it reduces uncertainty and increases conversions.$$
  ),
  ('home', 'howWeWork.steps.1.title', $$Initial Consultation$$),
  ('home', 'howWeWork.steps.1.text', $$We discuss your objectives, challenges, and desired outcomes.$$),
  ('home', 'howWeWork.steps.2.title', $$Assessment & Clarity$$),
  ('home', 'howWeWork.steps.2.text', $$We analyze your environment, identify gaps, and provide structured insight.$$),
  ('home', 'howWeWork.steps.3.title', $$Roadmap & Recommendations$$),
  ('home', 'howWeWork.steps.3.text', $$You receive a clear, actionable plan aligned with your goals.$$),
  ('home', 'howWeWork.steps.4.title', $$Execution & Support$$),
  ('home', 'howWeWork.steps.4.text', $$We partner with your team to deliver measurable, predictable results.$$),
  ('home', 'howWeWork.bottomPrimaryCtaLabel', $$Schedule a Consultation$$),
  ('home', 'howWeWork.bottomSecondaryCtaLabel', $$View All Insights$$),

  -- Services page (beyond the DB-driven hero/content HTML)
  ('services', 'page.eyebrow', $$Services$$),
  ('services', 'serviceCard.whatIncludedHeading', $$What is included$$),
  ('services', 'serviceCard.idealForHeading', $$Ideal for$$),
  ('services', 'serviceCard.pastPerformanceHeading', $$Representative past performance$$),
  ('services', 'serviceCard.secondaryCtaLabel', $$Talk to an expert$$),

  ('services', 'sections.strategic.title', $$Strategic Decision Support$$),
  (
    'services',
    'sections.strategic.hook',
    $$Clarity for leaders. Alignment for teams. Execution for the organization.$$
  ),
  (
    'services',
    'sections.strategic.description',
    $$Executive-level insight without the overhead of a traditional consulting firm. We frame decisions, interpret complex information, and move initiatives from concept to execution.$$
  ),
  (
    'services',
    'sections.strategic.bullets',
    $$Fractional BASE Advisory (Business Analysis, Architecture, Systems Engineering)
Executive Decision Support and Strategic Clarity Sessions
AI Prompt Engineering Training (team or department-level)
DocuSign and digital workflow optimization classes
Process modernization mapping
Technology evaluation and buy-vs-build analysis
Organizational alignment workshops (Vision -> Strategy -> Execution)
Executive document reviews (business cases, proposals, roadmaps)$$
  ),
  (
    'services',
    'sections.strategic.idealFor',
    $$Leaders who need clarity, alignment, and execution support without hiring full-time executives or large consulting firms.$$
  ),
  ('services', 'sections.strategic.ctaLabel', $$Download the Strategic Decision Clarity Pack$$),

  ('services', 'sections.sled.title', $$SLED Contracting Services$$),
  (
    'services',
    'sections.sled.hook',
    $$Trusted delivery for State, Local, Education, and Federal partners.$$
  ),
  (
    'services',
    'sections.sled.description',
    $$SDVOSB specializing in BA/SE, modernization, data, and cybersecurity in government environments. Proven methods for requirements, data, modernization strategy, and contract execution.$$
  ),
  (
    'services',
    'sections.sled.bullets',
    $$Business analysis and requirements engineering
Application modernization (Legacy -> Cloud)
Data strategy, governance, and migration support
Cybersecurity and blue-team advisory
Project management and PMO support
Independent verification and validation (IV&V)
Stakeholder engagement and facilitation
RFP/RFI technical writing and proposal support$$
  ),
  (
    'services',
    'sections.sled.pastPerformance',
    $$Florida Department of Elder Affairs: application modernization (D365/Power Platform, Azure transition)
NY State ITS: business analysis and data management support
Multiple modernization, compliance, and process alignment engagements$$
  ),
  ('services', 'sections.sled.idealFor', $$Agencies and prime contractors needing a reliable SDVOSB partner for disciplined delivery.$$),
  ('services', 'sections.sled.ctaLabel', $$Download the SLED Solutions Brief$$),

  ('services', 'sections.software.title', $$Software Development and Intelligent Systems$$),
  (
    'services',
    'sections.software.hook',
    $$Practical, scalable software built to solve real problems.$$
  ),
  (
    'services',
    'sections.software.description',
    $$Modern AI-enabled tools to streamline operations, automate workflows, and deliver actionable insights. Purpose-built solutions with low overhead and high value.$$
  ),
  (
    'services',
    'sections.software.bullets',
    $$VidSense: automated video renaming and metadata extraction
ImageSense: intelligent image organization and metadata structuring
AI agent development for recruiting, marketing, research, and operations
Project Liberty: R&D into distributed and ethical AI frameworks
Custom software solutions built with BA/SE methodologies$$
  ),
  ('services', 'sections.software.idealFor', $$Organizations wanting AI tools, workflow automation, or early access to emerging tech.$$),
  ('services', 'sections.software.ctaLabel', $$Download the Automation Preview Pack$$),

  ('services', 'bottom.title', $$Need to move from idea to execution?$$),
  (
    'services',
    'bottom.description',
    $$Start with a consultation and leave with a clear, actionable plan.$$
  ),
  ('services', 'bottom.primaryCtaLabel', $$Schedule a Consultation$$),
  ('services', 'bottom.secondaryCtaLabel', $$View Insights$$),

  -- About page
  ('about', 'page.eyebrow', $$About Campbell Consulting Services of Tallahassee (CCST)$$),
  ('about', 'page.heroTitle', $$Strategic Insight. Systems Thinking. Practical Innovation.$$),
  (
    'about',
    'page.overview',
    $$Campbell Consulting Services of Tallahassee LLC (CCST) is a Service-Disabled Veteran-Owned Small Business (SDVOSB) specializing in Business Analysis, Systems Engineering, IT Strategy, and modern digital transformation. Founded in 2019 and headquartered in Tallahassee, Florida, CCST supports government agencies, commercial organizations, and technology teams seeking clarity, structure, and dependable execution across their most important initiatives.

We combine full life cycle systems thinking with practical, real-world consulting to help organizations modernize operations, align technology investments with strategic goals, and deliver lasting outcomes. Our capabilities span IT strategy development, requirements engineering, stakeholder engagement, agile delivery, cybersecurity support, data initiatives, and full SDLC project execution. Whether guiding a modernization effort, supporting a state or federal program, or building intelligent software solutions, CCST brings disciplined processes and a client-centered approach to every engagement.

As a trusted partner in both the public and private sectors, we pride ourselves on measurable results, transparency, and sustained impact. Our work is grounded in rigorous analysis, well-defined processes, and a deep understanding of regulatory and operational environments-including HIPAA, CMMC, and state-level compliance requirements.$$
  ),
  ('about', 'mission.heading', $$Our Mission$$),
  (
    'about',
    'mission.text',
    $$To bring clarity, structure, and disciplined execution to every initiative we support-transforming complexity into actionable insight and enabling strong, sustainable outcomes for our clients.$$
  ),
  ('about', 'differentiators.heading', $$Our Differentiators$$),
  (
    'about',
    'differentiators.intro',
    $$CCST's strength comes from our commitment to structured execution and systems thinking:$$
  ),
  (
    'about',
    'differentiators.list',
    $$Full-Lifecycle Systems Thinking that ensures initiatives are grounded in clarity, alignment, and traceability.
Expert Requirements Engineering and process definition that reduce ambiguity and accelerate delivery.
Strategic IT Guidance that helps leaders make informed decisions and reduce operational risk.
Reliable Change Management & Configuration Support that minimizes downtime and improves long-term stability.$$
  ),
  (
    'about',
    'differentiators.outro',
    $$Across every service line-Strategic Decision Support, SLED Contracting, and Software Development-our mission remains the same: to help organizations transform complexity into actionable insight and position themselves for long-term success.$$
  ),
  ('about', 'leadership.heading', $$Leadership$$),
  ('about', 'leadership.name', $$Daniel Campbell$$),
  ('about', 'leadership.title', $$Founder & Principal Business Analyst / Systems Engineer$$),
  (
    'about',
    'leadership.summary',
    $$Service-Disabled Veteran, 14 years Army/National Guard
10+ years supporting government and commercial IT initiatives
Focused on clarity, structure, and mission-driven client outcomes$$
  ),
  ('about', 'nextStep.heading', $$Next Step$$),
  (
    'about',
    'nextStep.text',
    $$Learn more about how CCST supports organizations with Strategic Decision Support, SLED Contracting Services, and Software Development.$$
  ),
  ('about', 'nextStep.ctaLabel', $$Explore Our Services$$),

  -- Contact page
  ('contact', 'page.eyebrow', $$Contact$$),
  ('contact', 'page.introTitle', $$Start the Conversation$$),
  (
    'contact',
    'page.introSubtitle',
    $$Exploring a new initiative or looking for a trusted partner? Reach out and we will follow up quickly.$$
  ),
  ('contact', 'contactInfo.heading', $$Contact Information$$),
  ('contact', 'contactInfo.emailLabel', $$Email$$),
  ('contact', 'contactInfo.phoneLabel', $$Phone$$),
  ('contact', 'contactInfo.businessLabel', $$Business$$),
  ('contact', 'contactInfo.locationLabel', $$Location$$),
  ('contact', 'contactInfo.email', $$dan@consultcampbell.com$$),
  ('contact', 'contactInfo.phone', $$850-273-6646$$),
  ('contact', 'contactInfo.business', $$Campbell Consulting Services of Tallahassee LLC$$),
  ('contact', 'contactInfo.location', $$Tallahassee, Florida$$),
  ('contact', 'contactInfo.scheduleLabel', $$Book a Strategic Intro Call$$),
  ('contact', 'reasons.heading', $$Why organizations contact CCST$$),
  (
    'contact',
    'reasons.list',
    $$Service-Disabled Veteran-Owned Small Business (SDVOSB)
Proven experience supporting state and federal agencies
Clear, structured consulting grounded in systems thinking$$
  ),
  ('contact', 'topics', $$Strategic Decision Support
SLED Contracting
Software Development
General Inquiry$$),
  ('contact', 'form.heading', $$Send us a message$$),
  ('contact', 'form.labels.name', $$Name$$),
  ('contact', 'form.labels.email', $$Email$$),
  ('contact', 'form.labels.company', $$Company$$),
  ('contact', 'form.labels.phone', $$Phone (optional)$$),
  ('contact', 'form.labels.topic', $$Topic / Service of Interest$$),
  ('contact', 'form.labels.message', $$Message$$),
  ('contact', 'form.submitLabel', $$Submit$$),
  ('contact', 'form.sendingLabel', $$Sending...$$),
  ('contact', 'form.status.success', $$Thank you! We will get back to you soon.$$),
  (
    'contact',
    'form.status.successNoEmail',
    $$Thank you! Your message was received, but email delivery is not set up yet.$$
  ),
  ('contact', 'form.status.error', $$Something went wrong. Please try again.$$),
  ('contact', 'form.privacyNote', $$Your information is confidential and used only to respond.$$),
  ('contact', 'scheduler.modalTitle', $$Book a Strategic Intro Call$$),
  ('contact', 'scheduler.closeLabel', $$Close scheduler$$),

  -- Articles page
  ('articles', 'page.eyebrow', $$Articles$$),
  ('articles', 'hero.title', $$Insights and Articles$$),
  (
    'articles',
    'hero.subtitle',
    $$Practical guidance, frameworks, and perspectives to support better decisions.$$
  ),
  ('articles', 'hero.optInText', $$Join our insights list for occasional updates and tools.$$),
  ('articles', 'hero.secondaryCtaLabel', $$View Our Services$$),
  ('articles', 'list.loading', $$Loading articles...$$),
  ('articles', 'list.empty', $$No published posts yet. Create one in the admin area.$$),
  ('articles', 'sidebar.recentHeading', $$Recent Posts$$),
  ('articles', 'sidebar.noPostsYet', $$No posts yet.$$),
  ('articles', 'sidebar.archivesHeading', $$Archives$$),
  ('articles', 'sidebar.noArchivesYet', $$No archives yet.$$),

  -- Article detail page
  ('article_detail', 'loading', $$Loading article...$$),
  ('article_detail', 'errorPrefix', $$Failed to load article:$$),
  ('article_detail', 'breadcrumbs.home', $$Home$$),
  ('article_detail', 'breadcrumbs.articles', $$Articles$$),
  ('article_detail', 'publishedPrefix', $$Published$$),
  ('article_detail', 'shareButtonLabel', $$Share this article$$),
  ('article_detail', 'sidebar.recentHeading', $$Recent Posts$$),
  ('article_detail', 'sidebar.noPostsYet', $$No posts yet.$$),
  ('article_detail', 'sidebar.archivesHeading', $$Archives$$),
  ('article_detail', 'sidebar.noArchivesYet', $$No archives yet.$$)
on conflict (scope, key) do nothing;
