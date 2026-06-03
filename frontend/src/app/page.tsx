import HeroSection from '@/components/foresta/sections/HeroSection';
import FlowSection from '@/components/foresta/sections/FlowSection';
import VillasSection from '@/components/foresta/sections/VillasSection';
import SeasonsSection from '@/components/foresta/sections/SeasonsSection';
import PlansSection from '@/components/foresta/sections/PlansSection';
import LocationSection from '@/components/foresta/sections/LocationSection';
import ClosingCTA from '@/components/foresta/sections/ClosingCTA';
import VideoSection from '@/components/foresta/sections/VideoSection';
import ThemeSwitcher from '@/components/foresta/ThemeSwitcher';
import { fetchHomeData } from '@/lib/homeData';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let data: Awaited<ReturnType<typeof fetchHomeData>> | null = null;
  try {
    const isTest = process.env.TEST_ENV === 'true';
    data = await fetchHomeData(isTest);
  } catch (e) {
    console.error('[page] fetchHomeData failed:', e);
  }

  if (!data) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="mono-label" style={{ color: 'var(--ink-mute)', letterSpacing: '.3em' }}>Loading...</p>
        <ThemeSwitcher />
      </main>
    );
  }

  const enabled = data.sections
    .filter(s => s.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);
  const reservationUrl: string = (data.settings as any)?.reservation_url ?? '';

  return (
    <main>
      {enabled.map(s => {
        switch (s.section_key) {
          case 'hero':
            return <HeroSection key="hero" data={data!.hero} reservationUrl={reservationUrl} />;
          case 'flow':
            return <FlowSection key="flow" data={data!.flow} reservationUrl={reservationUrl} />;
          case 'villas':
            return data!.villas.length ? <VillasSection key="villas" data={data!.villas} /> : null;
          case 'seasons':
            return data!.seasonsMeta.length ? <SeasonsSection key="seasons" data={data!.seasonsMeta} /> : null;
          case 'plans':
            return data!.plans.length ? <PlansSection key="plans" data={data!.plans} reservationUrl={reservationUrl} /> : null;
          case 'videos':
            return (data!.videos as any)?.videos?.length ? <VideoSection key="videos" data={data!.videos as any} /> : null;
          case 'location':
            return <LocationSection key="location" data={data!.location} />;
          case 'cta':
            return <ClosingCTA key="cta" data={data!.cta} />;
          default: return null;
        }
      })}
      <ThemeSwitcher />
    </main>
  );
}
