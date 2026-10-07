import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityShield } from './utils/securityShield';

// Aktivacija bezbednosnog štita protiv Inspect Elementa i neovlašćenog skidanja
initSecurityShield();

createRoot(document.getElementById('root')!).render(<App />);
