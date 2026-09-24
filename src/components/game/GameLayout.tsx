import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SoundToggle from './SoundToggle';
import { get } from '../../lib/storage';

const stations = [
  ['mooncake', '月饼分拣站', '动动手 · 60 秒'],
  ['quiz', '月亮知识局', '动动脑 · 约 2 分钟'],
  ['persona', '月下身份所', '探索自己 · 约 2 分钟'],
  ['wall', '月光留言板', '慢慢逛 · 留一句想念'],
  ['parkour', '玉兔配送中', '动动手 · 三段奔月路'],
];

export default function GameLayout() {
  const location = useLocation();
  const id = location.pathname.slice(1);
  const index = stations.findIndex((station) => station[0] === id);
  const isStation = index >= 0;
  const station = stations[index] || (id === 'certificate'
    ? ['certificate', '月球漫游纪念证', '五站圆满 · 领取你的旅程纪念']
    : ['postcard', '月球明信片', '游园纪念 · 带走一份团圆']);
  const [stamps, setStamps] = useState<string[]>([]);
  const completed = stations.filter((item) => stamps.includes(item[0])).length;
  const allDone = completed === stations.length;

  useEffect(() => {
    const update = () => {
      const value = get<unknown>('stamps', []);
      setStamps(Array.isArray(value) ? value : []);
    };
    update();
    window.addEventListener('moon:stamp', update);
    return () => window.removeEventListener('moon:stamp', update);
  }, []);

  return <div className={`game-layout game-${id}${isStation ? ' game-station' : ''}`}>
    <header className="game-header">
      <div className="game-header-left">
        <Link className="back-pill" to="/?section=pavilions">← <span>探索地图</span></Link>
        {isStation ? <Link className="station-brand" to="/" aria-label="月球来信，返回游园首页">
          <strong>月球来信</strong>
          <span>MOON POST<small>把团圆寄往月亮</small></span>
        </Link> : <div><p>{station[2]}</p><h1>{station[1]}</h1></div>}
      </div>
      <div className="game-header-right">
        <Link to="/?section=passport" className="passport-count">游园护照 <b>{completed}/5</b></Link>
        <SoundToggle />
      </div>
    </header>
    <nav className="station-nav" aria-label="五站游园导航">
      {stations.map((item, stationIndex) => <Link key={item[0]} to={'/' + item[0]} aria-current={id === item[0] ? 'page' : undefined}>
        <i>{stamps.includes(item[0]) ? '✓' : String(stationIndex + 1).padStart(2, '0')}</i>
        <span>{item[1]}</span>
      </Link>)}
    </nav>
    <main className="game-main"><Outlet /></main>
    <footer className="game-footer">
      <Link to="/?section=pavilions">← 返回探索地图</Link>
      <span>MOON POST · 把团圆寄往月亮</span>
      <Link to={id === 'certificate' ? '/postcard' : allDone ? '/certificate' : index >= 0 && index < 4 ? '/' + stations[index + 1][0] : '/postcard'}>
        {id === 'certificate' ? '制作我的中秋明信片' : allDone ? '领取漫游纪念证' : index >= 0 && index < 4 ? '下一站：' + stations[index + 1][1] : '制作我的中秋明信片'} →
      </Link>
    </footer>
  </div>;
}
