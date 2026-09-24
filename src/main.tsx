import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App';
import './index.css';
import './theme-post.css';
import './game-visual-refresh.css';
createRoot(document.getElementById('root')!).render(<HashRouter><App/></HashRouter>);
