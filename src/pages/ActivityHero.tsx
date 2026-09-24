type Props = {
  number: string;
  english: string;
  title: string;
  intro: string;
  verse: string;
  kind: 'quiz' | 'persona';
};

export default function ActivityHero({ number, english, title, intro, verse, kind }: Props) {
  return <header className={`activity-hero activity-hero--${kind}`}>
    <div className="activity-hero-copy">
      <p className="activity-hero-kicker"><span aria-hidden="true">✦</span> {number} / {english}</p>
      <h1>{title}</h1>
      <p className="activity-hero-intro">{intro}</p>
    </div>
    <p className="activity-hero-verse">{verse}<span aria-hidden="true"> ✦</span></p>
    <div className="activity-hero-art" aria-hidden="true"><div className="activity-hero-window" /><img src="/images/moon/seated-rabbit.png" alt="" /></div>
  </header>;
}
