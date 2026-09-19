import { Route, Routes } from 'react-router-dom';
import { PhotographerUpload } from './pages/PhotographerUpload';
import { ClientGallery } from './pages/ClientGallery';
import { PhotographerResults } from './pages/PhotographerResults';
import { PasscodeGate } from './components/PasscodeGate';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PasscodeGate>
            <PhotographerUpload />
          </PasscodeGate>
        }
      />
      <Route path="/gallery/:slug" element={<ClientGallery />} />
      <Route path="/results/:slug" element={<PhotographerResults />} />
    </Routes>
  );
}
