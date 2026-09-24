import {useEffect,useRef} from 'react';
import {mountParkour} from '../lib/parkourEngine.js';
import {get,set,award,toast} from '../lib/storage';
import {recordParkour} from '../lib/journey';
import './parkour.css';
export default function ParkourPage(){const host=useRef<HTMLDivElement>(null);useEffect(()=>{if(host.current)return mountParkour(host.current,{get,set,award,toast,recordParkour});},[]);return <div className="parkour-page" ref={host}/>;}
