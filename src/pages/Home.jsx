import HeroHome from '../components/HeroHome'
import TicketsSection from '../components/TicketsSection';
import QuienesSomos from '../components/QuienesSomos';
import ReglasSection from '../components/ReglasSection';

export default function Home() {
  return (
    <div>
      <HeroHome />
      <TicketsSection />
      <QuienesSomos />
      <ReglasSection />
    </div>
  )
}
