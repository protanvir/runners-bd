import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import LandingPage from './pages/LandingPage';
import SocialHub from './pages/SocialHub';
import Events from './pages/Events';
import Forums from './pages/Forums';
import Leaderboard from './pages/Leaderboard';
import Training from './pages/Training';
import GearReviews from './pages/GearReviews';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="social" element={<SocialHub />} />
          <Route path="events" element={<Events />} />
          <Route path="forums" element={<Forums />} />
          <Route path="training" element={<Training />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="gear-reviews" element={<GearReviews />} />
          <Route path="routes" element={<div className="text-center mt-20 text-2xl text-gray-500">Route Database - Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
