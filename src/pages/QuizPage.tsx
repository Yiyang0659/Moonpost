import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QUESTIONS } from '../data/content';
import { award, get, set } from '../lib/storage';
import { recordQuiz } from '../lib/journey';
import ActivityHero from './ActivityHero';
import './shared-activities.css';

const makeRound = () => {
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 8);
};

export default function QuizPage() {
  const [round, setRound] = useState(makeRound);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('playing');
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [best, setBest] = useState(() => get<number>('quiz-best', 0));
  const selectedAnswers = useRef<number[]>([]);
  const question = round[index];

  const start = () => {
    selectedAnswers.current = [];
    setRound(makeRound());
    setIndex(0);
    setChosen(null);
    setCorrect(0);
    setPhase('playing');
  };
  const answer = (option: number) => {
    if (chosen !== null) return;
    selectedAnswers.current[index] = option;
    setChosen(option);
    if (option === question[2]) setCorrect(value => value + 1);
  };
  const next = () => {
    if (chosen === null) return;
    if (index < round.length - 1) {
      setIndex(value => value + 1);
      setChosen(null);
      return;
    }
    const at = new Date().toISOString();
    const record = Math.max(best, correct);
    setBest(record);
    set('quiz-best', record);
    set('quiz-result', { correct, total: 8, date: at });
    recordQuiz({ correct, total: 8, answers: round.map((item, i) => ({ question: item[0], selected: selectedAnswers.current[i], correct: item[2] })), at });
    award('quiz');
    setPhase('result');
  };

  return <main className={`activity-page quiz-page activity-phase-${phase}`}>
    <ActivityHero number="02" english="KNOWLEDGE STATION" title="月亮知识局" intro="从一行诗、一缕桂香，到月亮的小秘密。八道趣味小题，邀你与中秋多一分熟悉。" verse="知月而行，山河皆浪漫" kind="quiz" />
    {phase === 'ready' ? <section className="activity-panel activity-welcome">
      <div className="activity-panel-heading"><span className="activity-panel-mark" aria-hidden="true">▤</span><div><h2>中秋知识小笺</h2><p>每一个问题，都是靠近月亮的一步。</p></div><span className="activity-count">共 <strong>08</strong> 题</span></div>
      <div className="activity-welcome-center"><div className="activity-seal" aria-hidden="true">知</div><h3>今夜，来和月亮聊聊</h3><p>八道随机小题，每题揭晓一段小知识。答完便能收集「月亮知识局」游园印章。</p><div className="activity-facts"><span>✦ 八道随机题</span><span>☾ 不限作答时间</span><span>✧ 每题附小解</span></div></div>
      <div className="activity-question-bottom"><span>月光准备好了，随时可以开始。</span><button className="activity-primary" onClick={start}>开始答题 <span aria-hidden="true">→</span></button></div>
    </section> : phase === 'playing' ? <section className="activity-panel activity-question" aria-labelledby="quiz-question">
      <div className="activity-panel-heading"><span className="activity-panel-mark" aria-hidden="true">▤</span><div><h2>中秋知识小笺</h2><p>每一个问题，都是靠近月亮的一步。</p></div><span className="activity-count">第 <strong>{String(index + 1).padStart(2, '0')}</strong> / 08 题</span></div>
      <div className="activity-progress-track" aria-label={`第 ${index + 1} 题，共 8 题`}><span style={{ width: `${(index + (chosen !== null ? 1 : 0)) / 8 * 100}%` }} />{round.map((_, i) => <i key={i} className={i <= index ? 'is-active' : ''} />)}</div>
      <p className="activity-eyebrow">✦ 已答对 {correct} 题</p>
      <h3 id="quiz-question">{question[0]}</h3>
      <div className="activity-options">{question[1].map((option, i) => <button key={`${index}-${i}`} type="button" onClick={() => answer(i)} disabled={chosen !== null} aria-pressed={chosen === i} className={`${chosen !== null && i === question[2] ? 'is-correct' : ''} ${chosen === i && i !== question[2] ? 'is-wrong' : ''}`}><span className="activity-option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span><i aria-hidden="true">{chosen !== null && i === question[2] ? '✓' : chosen === i ? '×' : '☾'}</i></button>)}</div>
      {chosen !== null && <div className={`activity-explanation ${chosen === question[2] ? 'is-correct' : 'is-wrong'}`} role="status"><strong>{chosen === question[2] ? '答对了，月光为你点亮！' : '再记住一个中秋小知识。'}</strong><p>{question[3]}</p></div>}
      <div className="activity-question-bottom"><span>✦ {chosen === null ? '选一个答案，听听月亮的解释。' : '读懂一段来历，也是游园的收获。'}</span><button className="activity-primary" disabled={chosen === null} onClick={next}>{index === 7 ? '查看我的成绩' : '下一题'} <span aria-hidden="true">→</span></button></div>
    </section> : <section className="activity-panel activity-result">
      <p className="activity-eyebrow">02 / KNOWLEDGE STATION · 旅程记录</p><div className="activity-seal" aria-hidden="true">{correct >= 6 ? '魁' : '知'}</div>
      <h2>{correct >= 7 ? '满腹月光，才气盈袖' : correct >= 4 ? '提灯问月，亦有所得' : '月下新知，已入行囊'}</h2>
      <div className="activity-score"><strong>{correct}</strong><span>/ 8 题</span></div><p className="activity-lead">{correct >= 6 ? '诗词、传说与月亮的秘密，你都记在心里。' : '不必题题满分，今夜又与中秋熟悉了一些。'}</p>
      <div className="activity-stamp-notice">✧ 月亮知识局游园印章已收集</div><div className="activity-result-actions"><button className="activity-primary" onClick={start}>再抽一笺 <span aria-hidden="true">↻</span></button><Link className="activity-secondary" to="/?section=pavilions">返回探索地图</Link></div><p className="activity-fine">成绩与游园印记保存在当前浏览器。</p>
    </section>}
    <div className="activity-scene-note" aria-hidden="true"><span>月光所照之处<br />皆是知识的浪漫</span><small>TO A<br />BRIGHTER MOON</small></div>
  </main>;
}
