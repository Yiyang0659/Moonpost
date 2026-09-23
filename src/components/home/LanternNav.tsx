const scenes = ['月满游园', '五大玩法', '万家灯火', '花好月圆'];
export default function LanternNav({active, onSelect}: {active:number;onSelect:(index:number)=>void}) {
 return <nav className="lantern-nav" aria-label="长卷章节">{scenes.map((name,index)=><button key={name} onClick={()=>onSelect(index)} className={active === index?'is-active':''} aria-label={`第${index+1}幕：${name}`} aria-current={active===index?'location':undefined}><span className="lantern-nav-label">{name}</span><span className="lantern-nav-light"/></button>)}</nav>;
}
