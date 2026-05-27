import './styles/globals.css';
import { usePalette } from './hooks/usePalette';
import { ja } from './i18n/ja';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { BookingStrip } from './components/sections/BookingStrip';
import { FlowSection } from './components/sections/FlowSection';
import { VillasSection } from './components/sections/VillasSection';
import { SeasonsSection } from './components/sections/SeasonsSection';
import { PlansSection } from './components/sections/PlansSection';
import { LocationSection } from './components/sections/LocationSection';
import { ClosingCTA } from './components/sections/ClosingCTA';
import { ThemePicker } from './components/dev/ThemePicker';

export default function App() {
  const [P, paletteKey, setPaletteKey] = usePalette();
  const T = ja;
  const lang = 'ja';
  return (
    <div style={{ background: P.bg, color: P.ink, minHeight: '100vh' }}>
      <Header P={P} T={T} lang={lang} setLang={() => {}} />
      <Hero P={P} T={T} showAsama={true} />
      <BookingStrip P={P} T={T} />
      <FlowSection P={P} T={T} />
      <VillasSection P={P} T={T} />
      <SeasonsSection P={P} T={T} />
      <PlansSection P={P} T={T} />
      <LocationSection P={P} T={T} />
      <ClosingCTA P={P} T={T} />
      <Footer P={P} T={T} />
      <ThemePicker P={P} current={paletteKey} onChange={setPaletteKey} />
    </div>
  );
}
