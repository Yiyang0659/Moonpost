import {trackPage} from './lib/analytics';
import {lazy,Suspense,useEffect,useState} from 'react';
import {Routes,Route,useLocation,Link} from 'react-router-dom';
const LetterPage=lazy(()=>import('./pages/LetterPage'));
const MailboxPage=lazy(()=>import('./pages/MailboxPage'));
const PostcardPage=lazy(()=>import('./pages/PostcardPage'));
const CertificatePage=lazy(()=>import('./pages/CertificatePage'));
import {markVisited,stationIds} from './lib/journey';
import CosmicBackground from './components/scene/CosmicBackground';
import HomePage from './pages/HomePage';
const MooncakePage=lazy(()=>import('./pages/MooncakePage'));
const QuizPage=lazy(()=>import('./pages/QuizPage'));
const PersonaPage=lazy(()=>import('./pages/PersonaPage'));
const WallPage=lazy(()=>import('./pages/WallPage'));
const ParkourPage=lazy(()=>import('./pages/ParkourPage'));
import GameLayout from './components/game/GameLayout';
import SoundToggle from './components/game/SoundToggle';
import {SoundProvider} from './hooks/useSound';
function AppContent(){const location=useLocation();useEffect(()=>trackPage(location.pathname),[location.pathname]);const[message,setMessage]=useState('');useEffect(()=>{if(location.pathname==='/' && location.search.includes('section=')){requestAnimationFrame(()=>document.querySelector(location.search.includes('passport')?'#post-passport':'[data-scene="1"]')?.scrollIntoView({behavior:'instant'}));}else{window.scrollTo(0,0);}},[location.pathname,location.search]);useEffect(()=>{const id=location.pathname.slice(1);const station=stationIds.find(item=>item===id);if(station)markVisited(station)},[location.pathname]);useEffect(()=>{let timer:ReturnType<typeof setTimeout>;const onToast=(e:Event)=>{setMessage((e as CustomEvent<string>).detail);clearTimeout(timer);timer=setTimeout(()=>setMessage(''),3200);};window.addEventListener('moon:toast',onToast);return()=>{clearTimeout(timer);window.removeEventListener('moon:toast',onToast);};},[]);return <><CosmicBackground/>{location.pathname==='/'&&<div className="home-sound"><SoundToggle/></div>}<Suspense fallback={<div className="intro-panel" role="status">正在抵达下一站…</div>}><Routes><Route path="/" element={<HomePage/>}/><Route path="/letter/:id" element={<LetterPage/>}/><Route path="/mailbox/:id/:secret" element={<MailboxPage/>}/><Route element={<GameLayout/>}><Route path="/mooncake" element={<MooncakePage/>}/><Route path="/quiz" element={<QuizPage/>}/><Route path="/persona" element={<PersonaPage/>}/><Route path="/wall" element={<WallPage/>}/><Route path="/postcard" element={<PostcardPage/>}/><Route path="/certificate" element={<CertificatePage/>}/><Route path="/parkour" element={<ParkourPage/>}/></Route><Route path="*" element={<div className="intro-panel"><h1>月亮在下一站等你</h1><Link className="btn" to="/">返回探索地图</Link></div>}/></Routes></Suspense><div className={'toast '+(message?'visible':'')} role="status">{message}</div></>}
export default function App(){return <SoundProvider><AppContent/></SoundProvider>}
