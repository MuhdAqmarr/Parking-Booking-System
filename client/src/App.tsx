import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Reserve from './pages/Reserve';
import Ticket from './pages/Ticket';
import Fines from './pages/Fines';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import CheckReservation from './pages/CheckReservation';
import VisitorInfo from './pages/VisitorInfo';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="reserve" element={<Reserve />} />
          <Route path="check-reservation" element={<CheckReservation />} />
          <Route path="ticket/:proofCode" element={<Ticket />} />
          <Route path="fines" element={<Fines />} />
          <Route path="visitor-info" element={<VisitorInfo />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
