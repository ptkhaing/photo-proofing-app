import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { GalleryStoreProvider } from './data/galleryStore.tsx';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GalleryStoreProvider>
        <App />
      </GalleryStoreProvider>
    </BrowserRouter>
  </StrictMode>
);
