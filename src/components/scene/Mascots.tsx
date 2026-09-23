import { useId } from 'react';

export function JadeRabbit({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={className} viewBox="0 0 220 250" fill="none" aria-hidden="true">
    <defs><radialGradient id={`${id}fur`} cx=".35" cy=".25" r=".8"><stop stopColor="#fffbea"/><stop offset="1" stopColor="#d9bba0"/></radialGradient></defs>
    <ellipse cx="113" cy="230" rx="72" ry="12" fill="#120d18" opacity=".35"/>
    <path d="M70 102C45 75 38 13 62 10c26-3 35 61 34 87M119 100c-5-45 16-97 36-87 24 11 5 65-12 91" fill={`url(#${id}fur)`} stroke="#b79578" strokeWidth="2"/>
    <path d="M69 83C57 53 53 25 62 24c11-1 23 44 22 58M133 81c3-24 12-53 19-52 10 3-1 38-9 54" stroke="#efafa5" strokeWidth="10" strokeLinecap="round"/>
    <ellipse cx="112" cy="182" rx="59" ry="51" fill={`url(#${id}fur)`}/><circle cx="170" cy="195" r="17" fill="#f5e4cd"/>
    <ellipse cx="108" cy="118" rx="65" ry="55" fill={`url(#${id}fur)`}/>
    <ellipse cx="75" cy="125" rx="14" ry="7" fill="#e8a2a0" opacity=".6"/><ellipse cx="139" cy="125" rx="14" ry="7" fill="#e8a2a0" opacity=".6"/>
    <ellipse cx="82" cy="113" rx="5" ry="8" fill="#51322d"/><ellipse cx="133" cy="113" rx="5" ry="8" fill="#51322d"/><circle cx="83" cy="110" r="1.8" fill="white"/><circle cx="134" cy="110" r="1.8" fill="white"/>
    <path d="m102 126 6 5 6-5M108 131c-2 10-10 7-12 3m12-3c2 10 10 7 12 3" stroke="#ad6859" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M61 152q48 31 94-1l-4 19q-42 23-82 0Z" fill="#b73927"/><path d="m126 170 20 1-1 37-15-8-11 6Z" fill="#cb4932"/><path d="M70 226q7-20 30-7l8 14H66M114 231l8-16q27-5 34 15" fill="#f8e8cd"/>
    <ellipse cx="110" cy="185" rx="28" ry="26" fill="#d88b30" stroke="#f2be61" strokeWidth="4"/><circle cx="110" cy="185" r="17" stroke="#9f5525" strokeWidth="1.5"/><path d="m110 172 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" stroke="#fbe5a6"/>
    <ellipse cx="73" cy="183" rx="11" ry="18" transform="rotate(-30 73 183)" fill="#f9eacf"/><ellipse cx="147" cy="183" rx="11" ry="18" transform="rotate(30 147 183)" fill="#f9eacf"/>
  </svg>;
}

export function ChangE({ className = '' }: { className?: string }) {
 return <svg className={className} viewBox="0 0 220 280" fill="none" aria-hidden="true"><path d="M59 237C-10 216 13 159 49 176s-20 41 33 57M149 222c63-4 55-68 31-69s-3 46-37 54" stroke="#e5aa57" strokeWidth="13"/><path d="M89 121 51 241q60 30 119-2l-38-116Z" fill="#f6e7c8" stroke="#c89864" strokeWidth="2"/><path d="m100 137-24 91q36 13 65-1l-21-89" fill="#d14a35"/><path d="M83 132q-38 18-47 64l37 7 24-55M131 131q30 22 42 62l-31 13-28-61" fill="#f5dfbb" stroke="#c89864" strokeWidth="2"/><path d="M76 73q-7-44 31-43c42-3 49 32 28 57Z" fill="#332120"/><circle cx="110" cy="30" r="18" fill="#332120"/><path d="M96 17 91 5l18 8 19-8-5 19" fill="#dca952"/><ellipse cx="108" cy="88" rx="30" ry="37" fill="#f4cfb2"/><path d="M78 78q23 1 29-25 9 25 33 23" fill="#332120"/><path d="M88 87q6-4 11 0m16 0q6-4 11 0" stroke="#5a332b" strokeWidth="2"/><path d="M102 105q7 5 13-1" stroke="#b6483c" strokeWidth="3"/><path d="m90 123 18 16 21-16-9 33h-22Z" fill="#dba55f"/><circle cx="107" cy="135" r="4" fill="#a13729"/><path d="M87 253q-45-19-64 4c-7 19 29 21 50 13 21 18 45 11 61 2 44 12 61-1 50-13-10-13-37-10-53-5" fill="#e8cca2" stroke="#c89864" strokeWidth="2"/></svg>;
}
