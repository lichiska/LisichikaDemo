import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Landing from './pages/Landing';
import EditorPage from './pages/Editor';
import AIHub from './pages/AIHub';

const App = () => (
  <TooltipProvider>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ai" element={<AIHub />} />
        <Route path="/ai/chat/*" element={<Index />} />
        <Route path="/ai/editor" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;