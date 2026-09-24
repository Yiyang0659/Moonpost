import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PERSONAS, SCENES } from '../data/content';
import { award, set } from '../lib/storage';
import { recordPersona } from '../lib/journey';
import { startActivity, finishActivity } from '../lib/analytics';
import { JadeRabbit, ChangE } from '../components/scene/Mascots';
import ActivityHero from './ActivityHero';
import './shared-activities.css';

const choiceDescriptions = [
  '给自己一段静静赏月的时间。',
  '带着好奇，走向今夜的热闹。',
  '认真走好脚下的每一步。',
  '留意那些被温柔照亮的小事。',
  '沿着好奇心，去看看远方。',
  '和喜欢的人一起，把夜晚过成回忆。',
];

export default function PersonaPage() {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('playing');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState(0);
  const selected = answers[index];
  const activityStarted = useRef(false);
  const start = () => { startActivity('persona'); activityStarted.current = true; setAnswers([]); setIndex(0); setPhase('playing'); };
  const choose = (choice: number) => {
    if (!activityStarted.current) { startActivity('persona'); activityStarted.current = true; }
    setAnswers(previous => { const next = [...previous]; next[index] = choice; return next; });
  };
  const next = () => {
    if (selected === undefined) return;
    if (index < SCENES.length - 1) { setIndex(value => value + 1); return; }
    const tally = Array(6).fill(0) as number[];
    answers.forEach((option, i) => { tally[SCENES[i][1][option][1]]++; });
    const max = Math.max(...tally);
    const winners = tally.map((n, i) => n === max ? i : -1).filter(i => i >= 0);
    const winner = winners.find(id => id === SCENES[0][1][answers[0]][1]) ?? winners[0];
    const at = new Date().toISOString();
    setResult(winner);
    set('persona-result', { id: winner, answers, date: at });
    recordPersona({ id: winner, answers: [...answers], at });
    award('persona');
    finishActivity('persona', { outcome: 'completed', result_id: winner });
    setPhase('result');
  };
  const persona = PERSONAS[result];

  return <main className={`activity-page persona-page activity-phase-${phase}`}>
    <ActivityHero number="03" english="IDENTITY STATION" title="月下身份所" intro="每个人心里，都住着一轮不一样的月亮。回答几个关于生活的小问题，让月亮告诉你，今夜谁与你心意相通。" verse="借月光，认识自己" kind="persona" />
    {phase === 'ready' ? <section className="activity-panel activity-welcome">
      <div className="activity-panel-heading"><span className="activity-panel-mark" aria-hidden="true">☾</span><div><h2>月下身份测试</h2><p>随心作答 · 不必思考太久</p></div><span className="activity-count">共 <strong>12</strong> 问</span></div>
      <div className="activity-welcome-center"><div className="activity-persona-pair" aria-hidden="true"><ChangE /><JadeRabbit /></div><h3>十二个生活场景，拼出独一无二的你</h3><p>凭直觉选择，每一种答案都属于自己的月光。完成后便能得到月下身份和游园印章。</p><div className="activity-facts"><span>✦ 12 个生活场景</span><span>☾ 没有标准答案</span><span>✧ 约 2 分钟</span></div></div>
      <div className="activity-question-bottom"><span>节日趣味测试，仅供自我探索。</span><button className="activity-primary" onClick={start}>开始测试 <span aria-hidden="true">→</span></button></div>
    </section> : phase === 'playing' ? <section className="activity-panel activity-question persona-question" aria-labelledby="persona-question">
      <div className="activity-panel-heading"><span className="activity-panel-mark" aria-hidden="true">☾</span><div><h2>月下身份测试 <small>MOON IDENTITY TEST</small></h2><p>随心作答 · 不必思考太久</p></div><span className="activity-count">第 <strong>{String(index + 1).padStart(2, '0')}</strong> / 12 问</span></div>
      <div className="activity-progress-track" aria-label={`第 ${index + 1} 问，共 12 问`}><span style={{ width: `${(index + 1) / 12 * 100}%` }} /></div>
      <h3 id="persona-question">{SCENES[index][0]}</h3><p className="activity-question-hint">月亮总在不同的角落，照见不同的心情。选择一个最想去的方向。</p>
      <div className="activity-options activity-scene-options">{SCENES[index][1].map(([option, personaId], i) => <button key={`${index}-${i}`} type="button" onClick={() => choose(i)} aria-pressed={selected === i} className={selected === i ? 'is-selected' : ''}><span className={`activity-scene-art activity-scene-art--${personaId}`} aria-hidden="true"><span>{personaId === 0 ? '☾' : personaId === 1 ? '✦' : personaId === 2 ? '✧' : personaId === 3 ? '❋' : personaId === 4 ? '✶' : '☻'}</span></span><span className="activity-scene-content"><span className="activity-option-letter">{String.fromCharCode(65 + i)}</span><strong>{option}</strong><small>{choiceDescriptions[personaId]}</small></span><i aria-hidden="true">{selected === i ? '✓' : '›'}</i></button>)}</div>
      <div className="activity-question-bottom"><button className="activity-back" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>← 上一问</button><span>✦ 十二个生活场景，拼出独一无二的你</span><button className="activity-primary" disabled={selected === undefined} onClick={next}>{index === 11 ? '揭晓身份' : '下一问'} <span aria-hidden="true">→</span></button></div>
      <p className="activity-fine">答案无对错。返回上一问时，会保留你的选择。</p>
    </section> : <section className="activity-panel activity-result persona-result">
      <p className="activity-eyebrow">03 / IDENTITY STATION · 你的专属月光</p><div className="activity-persona-symbol" aria-hidden="true">{result === 0 ? <ChangE /> : result === 1 ? <JadeRabbit /> : <span>{persona[4]}</span>}</div><p className="activity-result-kicker">今夜，与你相伴的是</p><h2>{persona[0]} <span>· {persona[1]}</span></h2><p className="activity-persona-description">{persona[2]}</p><div className="activity-persona-tip"><span>月亮给你的小纸条</span><p>{persona[3]}</p></div><div className="activity-stamp-notice">✧ 月下身份所游园印章已收集</div><div className="activity-result-actions"><button className="activity-primary" onClick={start}>重新抽一支签 <span aria-hidden="true">↻</span></button><Link className="activity-secondary" to="/?section=pavilions">返回探索地图</Link></div><p className="activity-fine">趣味结果由本次选择生成，仅供娱乐 · 记录保存在当前浏览器</p>
    </section>}
    <div className="activity-scene-note" aria-hidden="true"><span>每一种你<br />都是月光偏爱的模样</span><small>GOOD THINGS<br />REACH FURTHER</small></div>
  </main>;
}
