import { Link } from 'react-router-dom';
import './passport-section.css';

const passportStops = [
  { id: 'mooncake', number: '01', short: '月饼', name: '月饼分拣站', icon: 'cake' },
  { id: 'quiz', number: '02', short: '知识', name: '月亮知识局', icon: 'book' },
  { id: 'persona', number: '03', short: '身份', name: '月下身份所', icon: 'moon' },
  { id: 'wall', number: '04', short: '月信', name: '月光留言板', icon: 'letter' },
  { id: 'parkour', number: '05', short: '玉兔', name: '玉兔配送中', icon: 'rabbit' },
] as const;

function StampIcon({ kind }: { kind: typeof passportStops[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'cake') return <svg viewBox="0 0 64 64" aria-hidden="true" {...common}><path d="M8 25 32 15l24 10v27L32 61 8 52Z"/><path d="M8 25v27M56 25v27M20 20v36M32 15v46M44 20v36M9 33l23 9 23-9M12 27l20 8 20-8"/><path d="m24 25 8-4 8 4-8 4Z"/></svg>;
  if (kind === 'book') return <svg viewBox="0 0 64 64" aria-hidden="true" {...common}><path d="M32 16c-8-6-17-7-26-5v37c10-2 18 0 26 6 8-6 16-8 26-6V11c-9-2-18-1-26 5Zm0 0v38M12 19c6 0 11 1 16 4m-16 5c6 0 11 1 16 4m-16 5c6 0 11 1 16 4m24-22c-6 0-11 1-16 4m16 5c-6 0-11 1-16 4m16 5c-6 0-11 1-16 4"/></svg>;
  if (kind === 'moon') return <svg viewBox="0 0 64 64" aria-hidden="true" {...common}><path d="M42 8A26 26 0 1 0 56 45 25 25 0 0 1 42 8Z"/><path d="m50 12 1.5 4.5L56 18l-4.5 1.5L50 24l-1.5-4.5L44 18l4.5-1.5Z"/></svg>;
  if (kind === 'letter') return <svg viewBox="0 0 64 64" aria-hidden="true" {...common}><rect x="6" y="15" width="52" height="35" rx="2"/><path d="m7 18 25 19 25-19M7 48l19-16m31 16L38 32"/></svg>;
  return <svg viewBox="0 0 64 64" aria-hidden="true" {...common}><path d="M16 35c-5-7-4-16 4-21 2-1 4-1 6 0l5 14c7-3 17 0 21 8 3 7 0 14-6 18H22c-8 0-13-5-13-11 0-4 3-7 7-8Z"/><path d="M31 28c-1-7 0-18 5-21 3-1 7 3 8 6l-4 18m-19 23 3-10m19 10-3-10M8 39c-2 0-4-2-4-4m43 2h4"/><circle cx="45" cy="35" r="1" fill="currentColor" stroke="none"/></svg>;
}

export default function PassportSection({ stamps }: { stamps: string[] }) {
  const next = passportStops.find(stop => !stamps.includes(stop.id));
  const destination = next ? `/${next.id}` : '/certificate';
  const destinationName = next?.name ?? '月球漫游纪念证';
  return <section id="post-passport" className="post-passport post-passport-feature" aria-labelledby="post-passport-title">
    <div className="post-passport-inner">
      <div className="post-passport-copy">
        <p className="post-eyebrow">02 / YOUR LUNAR PASSPORT</p>
        <h2 id="post-passport-title">来过月球，<br/>记得盖个章。</h2>
        <p>{next ? '你已经走过的路，月亮都记得。完成五个站点，收集一整份中秋快乐。' : '五个站点全部抵达！领取记录成绩、经历与祝福的月球漫游纪念证。'}</p>
        <Link className="post-action post-passport-main-action" to={destination}>{next ? `下一站：${destinationName}` : '领取月球漫游纪念证'}<span aria-hidden="true">⟶</span></Link>
        <div className="post-passport-copy-note" aria-hidden="true"><i/>SOME JOURNEYS<br/>STAY WITH YOU FOREVER.</div>
      </div>
      <div className="post-passport-card">
        <div className="post-passport-head">
          <div className="post-passport-title"><strong>月球漫游护照</strong><small>LUNAR TRAVEL PASSPORT</small></div>
          <div className="post-passport-progress" aria-label={`已收集 ${stamps.length} 枚，共 5 枚邮戳`}><span className="post-passport-progress-moon" aria-hidden="true"/><b>{stamps.length}<i>/ 5</i></b><small>JOURNEY PROGRESS</small></div>
          <span className="post-passport-motto">FIVE STAMPS<br/>A BRIGHTER YOU.</span>
        </div>
        <div className="post-stamps" aria-label="五枚月球邮戳，可左右滑动查看">
          {passportStops.map(stop => {
            const done = stamps.includes(stop.id);
            return <Link key={stop.id} to={`/${stop.id}`} className={`post-passport-stamp${done ? ' is-done' : ''}`} aria-label={`${stop.name}，${done ? '已盖章' : '待抵达'}`}>
              <span className="post-passport-stamp-number">{stop.number}</span>
              <StampIcon kind={stop.icon}/>
              <strong>{stop.short}</strong><i aria-hidden="true"/>
              <small>{done ? '✓ 已盖章' : '待抵达'}</small>
            </Link>;
          })}
        </div>
        <p className="post-passport-scroll-hint">左右滑动查看全部邮戳 →</p>
        <div className="post-passport-next">
          <div className="post-passport-next-image" aria-hidden="true"/>
          <div className="post-passport-next-copy"><small>{next?'下一站推荐':'旅程终点'}</small><strong>{destinationName}</strong><span>{next ? '前往领取你的下一枚印章。' : '五枚印章齐全，带走专属纪念。'}</span></div>
          <Link to={destination} className="post-passport-next-link" aria-label={`${next ? '继续旅程，前往' : '制作'}${destinationName}`}><span>继续旅程<small>前往下一站</small></span><b aria-hidden="true">→</b></Link>
        </div>
      </div>
    </div>
  </section>;
}
