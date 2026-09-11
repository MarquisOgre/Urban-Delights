import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './checkout-compact.css'
import './checkout-mobile-scroll.css'
import './checkout-footer.css'
import './footer-cleanup.css'

createRoot(document.getElementById("root")!).render(<App />);
