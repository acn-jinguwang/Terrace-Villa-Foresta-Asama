import HeroSection from '@/components/foresta/sections/HeroSection';
import FlowSection from '@/components/foresta/sections/FlowSection';
import VillasSection from '@/components/foresta/sections/VillasSection';
import SeasonsSection from '@/components/foresta/sections/SeasonsSection';
import PlansSection from '@/components/foresta/sections/PlansSection';
import LocationSection from '@/components/foresta/sections/LocationSection';
import ClosingCTA from '@/components/foresta/sections/ClosingCTA';
import ThemeSwitcher from '@/components/foresta/ThemeSwitcher';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const PORT = process.env.PORT || '3000';

async function getHomeData() {
  try {
    const testMode = process.env.TEST_ENV === 'true' ? 'true' : 'false';
    const url = `http://localhost:${PORT}${BASE}/api/home/all`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'x-test-mode': testMode },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const data = await getHomeData();

  if (!data) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="mono-label">Loading...</p>
        <ThemeSwitcher />
      </main>
    );
  }

  const sections: { section_key: string; display_order: number; is_enabled: boolean }[] = data.sections ?? [];
  const enabled = sections.filter((s: any) => s.is_enabled).sort((a: any, b: any) => a.display_order - b.display_order);
  const reservationUrl: string = data.settings?.reservation_url ?? '';

  return (
    <main>
      {enabled.map((s: any) => {
        switch (s.section_key) {
          case 'hero':
            return data.hero ? <HeroSection key="hero" data={data.hero} reservationUrl={reservationUrl} /> : null;
          case 'flow':
            return data.flow ? <FlowSection key="flow" data={data.flow} reservationUrl={reservationUrl} /> : null;
          case 'villas':
            return data.villas?.length ? <VillasSection key="villas" data={data.villas} /> : null;
          case 'seasons':
            return data.seasonsMeta?.length ? <SeasonsSection key="seasons" data={data.seasonsMeta} /> : null;
          case 'plans':
            return data.plans?.length ? <PlansSection key="plans" data={data.plans} reservationUrl={reservationUrl} /> : null;
          case 'location':
            return data.location ? <LocationSection key="location" data={data.location} /> : null;
          case 'cta':
            return data.cta ? <ClosingCTA key="cta" data={data.cta} /> : null;
          default: return null;
        }
      })}
      <ThemeSwitcher />
    </main>
  );
}
