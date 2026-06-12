// The main page component that assembles the home page layout for the Gaming Arcade
import Header from '@/components/home/Header';
import Card from '@/components/home/Card';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <Card />
      <Footer />
    </div>
  );
}
