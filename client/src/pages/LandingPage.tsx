/*
  SunClaw Brand Landing Page
  Pixel-perfect React conversion of sunclaw-landing.html
  All CSS from the original preserved via <style> injection
*/

import { useEffect, useState } from "react";
import ConversationalFunnel from "@/components/ConversationalFunnel";
import { SunClawIcon } from "@/components/SunClawLogo";

type HeroState = 'cards' | 'funnel';

// The SVG inline components match the HTML file exactly
function NavLogo() {
  return (
    <svg viewBox="10 4 100 76" fill="none" width="32" height="24">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function HeroLogo() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="120" height="120">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <g className="claw-anim">
        <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="33" cy="11" r="3" fill="#E8664A"/>
        <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      </g>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="30" y1="60" x2="16" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="90" y1="60" x2="104" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="46" y1="78" x2="42" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="60" y1="80" x2="60" y2="96" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="74" y1="78" x2="78" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function CtaLogo() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="72" height="72" style={{ marginBottom: 24 }}>
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function FooterLogo() {
  return (
    <svg viewBox="10 4 100 76" fill="none" width="24" height="18">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
    </svg>
  );
}

const chatBotIcon = (
  <svg viewBox="0 0 120 120" fill="none" width="16" height="16">
    <circle cx="60" cy="54" r="26" fill="#F5A623"/>
    <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
    <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
  </svg>
);

// Feature icons - SunClaw mini-characters
const FeatureIconFinancial = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="32" cy="44" r="18" fill="#F5A623"/>
    <path d="M18 28 C16 22, 12 18, 8 17 C4 16, 3 19, 5 22 C7 25, 10 28, 14 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="8" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M46 28 C48 22, 51 19, 54 19 C57 19, 57 22, 55 24 C53 26, 50 28, 47 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="54" cy="18" r="2.5" fill="#E8664A"/>
    <circle cx="26" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="38" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="27" cy="40" r="1" fill="#FFF"/>
    <circle cx="39" cy="40" r="1" fill="#FFF"/>
    <path d="M27 49 Q32 53 37 49" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <rect className="sc-bar" x="56" y="50" width="7" height="18" rx="2" fill="#E8664A" opacity="0.7" style={{ transformOrigin: "59.5px 68px" }}/>
    <rect className="sc-bar" x="65" y="38" width="7" height="30" rx="2" fill="#F5A623" opacity="0.9" style={{ transformOrigin: "68.5px 68px" }}/>
    <rect className="sc-bar" x="56" y="48" width="7" height="20" rx="2" fill="#E8664A" opacity="0.6" style={{ transformOrigin: "59.5px 68px" }}/>
    <line x1="53" y1="68" x2="76" y2="68" stroke="#E8664A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const FeatureIconTracker = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="44" r="18" fill="#F5A623"/>
    <path d="M26 28 C24 22, 20 18, 16 17 C12 16, 11 19, 13 22 C15 25, 18 28, 22 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M54 28 C56 22, 60 18, 64 17 C68 16, 69 19, 67 22 C65 25, 62 28, 58 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="64" cy="16" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="35" cy="40" r="1" fill="#FFF"/>
    <circle cx="47" cy="40" r="1" fill="#FFF"/>
    <path d="M35 49 Q40 53 45 49" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <rect x="10" y="36" width="16" height="22" rx="3" stroke="#E8664A" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <rect x="14" y="33" width="8" height="5" rx="2" fill="#E8664A" opacity="0.5"/>
    <path className="sc-check" d="M13 43 L15 45 L19 40" stroke="#F5A623" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path className="sc-check" d="M13 50 L15 52 L19 47" stroke="#F5A623" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <line x1="21" y1="42" x2="24" y2="42" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
    <line x1="21" y1="49" x2="24" y2="49" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
  </svg>
);

const FeatureIconDiagnostics = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="36" cy="44" r="18" fill="#F5A623"/>
    <path d="M22 28 C20 22, 16 18, 12 17 C8 16, 7 19, 9 22 C11 25, 14 28, 18 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M50 28 C52 22, 56 18, 60 17 C64 16, 65 19, 63 22 C61 25, 58 28, 54 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="60" cy="16" r="2.5" fill="#E8664A"/>
    <circle cx="30" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="42" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="31" cy="40" r="1" fill="#FFF"/>
    <circle cx="43" cy="40" r="1" fill="#FFF"/>
    <path d="M31 49 Q36 53 41 49" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <g className="sc-magnify">
      <line x1="58" y1="30" x2="68" y2="50" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      <circle cx="70" cy="54" r="6" stroke="#E8664A" strokeWidth="2.5" fill="none" opacity="0.7"/>
      <line x1="73" y1="48" x2="76" y2="45" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    </g>
  </svg>
);

const FeatureIconDocument = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="38" r="18" fill="#F5A623"/>
    <path d="M26 22 C24 16, 20 12, 16 11 C12 10, 11 13, 13 16 C15 19, 18 22, 22 23" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="16" cy="10" r="2.5" fill="#E8664A"/>
    <path d="M54 22 C56 16, 60 12, 64 11 C68 10, 69 13, 67 16 C65 19, 62 22, 58 23" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="64" cy="10" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="36" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="36" r="2.5" fill="#1A1612"/>
    <circle cx="34.5" cy="37" r="1" fill="#FFF"/>
    <circle cx="46.5" cy="37" r="1" fill="#FFF"/>
    <path d="M35 44 Q40 47 45 44" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <rect x="24" y="50" width="32" height="24" rx="3" fill="#1A1612" stroke="#E8664A" strokeWidth="1.5" opacity="0.8"/>
    <line x1="29" y1="57" x2="51" y2="57" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
    <line x1="29" y1="61" x2="47" y2="61" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
    <line x1="29" y1="65" x2="51" y2="65" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
    <line x1="29" y1="69" x2="42" y2="69" stroke="#E8664A" strokeWidth="1" opacity="0.4"/>
    <path d="M48 50 L56 50 L56 58 Z" fill="#E8664A" opacity="0.15"/>
  </svg>
);

const FeatureIconKnowledge = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="48" r="18" fill="#F5A623"/>
    <path d="M26 32 C24 26, 22 21, 20 18 C18 15, 16 17, 17 20 C18 23, 20 27, 23 30" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="20" cy="17" r="2.5" fill="#E8664A"/>
    <path d="M54 32 C56 26, 58 21, 60 18 C62 15, 64 17, 63 20 C62 23, 60 27, 57 30" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="60" cy="17" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="44" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="44" r="2.5" fill="#1A1612"/>
    <circle cx="34.5" cy="43" r="1" fill="#FFF"/>
    <circle cx="46.5" cy="43" r="1" fill="#FFF"/>
    <path d="M35 53 Q40 57 45 53" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <g className="sc-bulb">
      <circle cx="40" cy="10" r="8" stroke="#E8664A" strokeWidth="2" fill="none" opacity="0.7"/>
      <line x1="37" y1="18" x2="37" y2="22" stroke="#E8664A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="43" y1="18" x2="43" y2="22" stroke="#E8664A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="36" y1="22" x2="44" y2="22" stroke="#E8664A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </g>
    <line x1="40" y1="0" x2="40" y2="3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    <line x1="30" y1="6" x2="28" y2="4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    <line x1="50" y1="6" x2="52" y2="4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
  </svg>
);

const FeatureIconCommunication = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="32" cy="44" r="18" fill="#F5A623"/>
    <path d="M18 28 C16 22, 12 18, 8 17 C4 16, 3 19, 5 22 C7 25, 10 28, 14 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="8" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M46 28 C48 22, 52 18, 56 17 C60 16, 61 19, 59 22 C57 25, 54 28, 50 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="56" cy="16" r="2.5" fill="#E8664A"/>
    <circle cx="26" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="38" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="27" cy="40" r="1" fill="#FFF"/>
    <circle cx="39" cy="40" r="1" fill="#FFF"/>
    <ellipse cx="32" cy="51" rx="4" ry="3" fill="#1A1612"/>
    <rect x="52" y="32" width="24" height="18" rx="8" stroke="#E8664A" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M56 50 L52 56 L60 50" stroke="#E8664A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
    <circle className="sc-speech-dot" cx="59" cy="41" r="1.5" fill="#E8664A" opacity="0.5"/>
    <circle className="sc-speech-dot" cx="64" cy="41" r="1.5" fill="#E8664A" opacity="0.5"/>
    <circle className="sc-speech-dot" cx="69" cy="41" r="1.5" fill="#E8664A" opacity="0.5"/>
  </svg>
);

const FeatureIconMultilingual = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="44" r="18" fill="#F5A623"/>
    <path d="M26 28 C24 22, 20 18, 16 17 C12 16, 11 19, 13 22 C15 25, 18 28, 22 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M54 28 C56 22, 60 18, 64 17 C68 16, 69 19, 67 22 C65 25, 62 28, 58 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="64" cy="16" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="41" r="2.5" fill="#1A1612"/>
    <circle cx="35" cy="40" r="1" fill="#FFF"/>
    <circle cx="47" cy="40" r="1" fill="#FFF"/>
    <path d="M35 49 Q40 53 45 49" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <g className="sc-lang-tag">
      <rect x="2" y="36" width="18" height="14" rx="6" stroke="#E8664A" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <text x="7" y="46" fontFamily="DM Sans" fontSize="8" fill="#E8664A" opacity="0.6">Fr</text>
    </g>
    <g className="sc-lang-tag">
      <rect x="60" y="32" width="18" height="14" rx="6" stroke="#E8664A" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <text x="64" y="42" fontFamily="DM Sans" fontSize="8" fill="#E8664A" opacity="0.6">Yo</text>
    </g>
    <g className="sc-lang-tag">
      <rect x="30" y="4" width="20" height="14" rx="6" stroke="#F5A623" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <text x="36" y="14" fontFamily="DM Sans" fontSize="8" fill="#F5A623" opacity="0.5">En</text>
    </g>
  </svg>
);

const FeatureIconEV = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="46" r="18" fill="#F5A623"/>
    <path d="M26 30 C24 24, 21 19, 18 17 C15 15, 13 18, 15 21 C17 24, 20 27, 23 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="18" cy="16" r="2.5" fill="#E8664A"/>
    <path d="M54 30 C56 24, 59 19, 62 17 C65 15, 67 18, 65 21 C63 24, 60 27, 57 29" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="62" cy="16" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="43" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="43" r="2.5" fill="#1A1612"/>
    <circle cx="35" cy="42" r="1" fill="#FFF"/>
    <circle cx="47" cy="42" r="1" fill="#FFF"/>
    <path d="M35 51 Q40 55 45 51" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path className="sc-bolt" d="M44 4 L36 20 L44 20 L34 38 L48 16 L40 16 Z" fill="#E8664A" opacity="0.75"/>
    <circle cx="30" cy="8" r="1.5" fill="#F5A623" opacity="0.4"/>
    <circle cx="52" cy="12" r="1" fill="#F5A623" opacity="0.3"/>
  </svg>
);

const FeatureIconData = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="32" cy="40" r="18" fill="#F5A623"/>
    <path d="M18 24 C16 18, 12 14, 8 13 C4 12, 3 15, 5 18 C7 21, 10 24, 14 25" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="8" cy="12" r="2.5" fill="#E8664A"/>
    <path d="M46 24 C48 18, 52 14, 56 13 C60 12, 61 15, 59 18 C57 21, 54 24, 50 25" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="56" cy="12" r="2.5" fill="#E8664A"/>
    <circle cx="26" cy="37" r="2.5" fill="#1A1612"/>
    <circle cx="38" cy="37" r="2.5" fill="#1A1612"/>
    <circle cx="27" cy="36" r="1" fill="#FFF"/>
    <circle cx="39" cy="36" r="1" fill="#FFF"/>
    <path d="M27 45 Q32 49 37 45" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path className="sc-chart-line" d="M50 68 L56 58 L62 62 L68 48 L74 36 L78 28" stroke="#E8664A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" style={{ strokeDasharray: 50, strokeDashoffset: 0 }}/>
    <path d="M76 24 L78 28 L74 30" stroke="#E8664A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    <line x1="48" y1="68" x2="80" y2="68" stroke="#E8664A" strokeWidth="1" opacity="0.2"/>
    <line x1="48" y1="68" x2="48" y2="24" stroke="#E8664A" strokeWidth="1" opacity="0.2"/>
  </svg>
);

const FeatureIconCommunity = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="26" cy="46" r="14" fill="#F5A623"/>
    <path d="M16 30 C14 25, 11 22, 8 21 C5 20, 4 23, 6 25 C8 27, 10 29, 13 30" stroke="#E8664A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="8" cy="20" r="2" fill="#E8664A"/>
    <path d="M36 30 C37 25, 39 23, 40 24" stroke="#E8664A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="21" cy="43" r="2" fill="#1A1612"/>
    <circle cx="31" cy="43" r="2" fill="#1A1612"/>
    <circle cx="22" cy="42" r="0.8" fill="#FFF"/>
    <circle cx="32" cy="42" r="0.8" fill="#FFF"/>
    <path d="M22 50 Q26 53 30 50" stroke="#1A1612" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="56" cy="46" r="14" fill="#F5A623"/>
    <path d="M66 30 C68 25, 71 22, 74 21 C77 20, 78 23, 76 25 C74 27, 72 29, 69 30" stroke="#E8664A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="74" cy="20" r="2" fill="#E8664A"/>
    <path d="M46 30 C45 25, 43 23, 42 24" stroke="#E8664A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="51" cy="43" r="2" fill="#1A1612"/>
    <circle cx="61" cy="43" r="2" fill="#1A1612"/>
    <circle cx="51.5" cy="42" r="0.8" fill="#FFF"/>
    <circle cx="61.5" cy="42" r="0.8" fill="#FFF"/>
    <path d="M52 50 Q56 53 60 50" stroke="#1A1612" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle className="sc-connection-dot" cx="41" cy="38" r="2" fill="#E8664A" opacity="0.5"/>
    <circle className="sc-connection-dot" cx="41" cy="32" r="1.2" fill="#F5A623" opacity="0.4"/>
    <circle className="sc-connection-dot" cx="38" cy="35" r="1" fill="#E8664A" opacity="0.3"/>
    <circle className="sc-connection-dot" cx="44" cy="35" r="1" fill="#E8664A" opacity="0.3"/>
  </svg>
);

const FeatureIconSecurity = () => (
  <svg viewBox="0 0 80 80" fill="none" width="56" height="56">
    <circle cx="40" cy="40" r="18" fill="#F5A623"/>
    <path d="M26 24 C24 18, 20 14, 16 13 C12 12, 11 15, 13 18 C15 21, 18 24, 22 25" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="16" cy="12" r="2.5" fill="#E8664A"/>
    <path d="M54 24 C56 18, 60 14, 64 13 C68 12, 69 15, 67 18 C65 21, 62 24, 58 25" stroke="#E8664A" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="64" cy="12" r="2.5" fill="#E8664A"/>
    <circle cx="34" cy="35" r="2.5" fill="#1A1612"/>
    <circle cx="46" cy="35" r="2.5" fill="#1A1612"/>
    <circle cx="35" cy="34" r="1" fill="#FFF"/>
    <circle cx="47" cy="34" r="1" fill="#FFF"/>
    <path d="M40 42 L26 48 L26 58 C26 68, 40 76, 40 76 C40 76, 54 68, 54 58 L54 48 Z" fill="#1A1612" stroke="#E8664A" strokeWidth="1.5" opacity="0.85"/>
    <path className="sc-shield-check" d="M34 58 L38 63 L48 52" stroke="#F5A623" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Feature icons map
const featureIcons: Record<string, React.FC> = {
  "Financial Modeling": FeatureIconFinancial,
  "Project Development Tracker": FeatureIconTracker,
  "Field Diagnostics": FeatureIconDiagnostics,
  "Document Engine": FeatureIconDocument,
  "Knowledge Hub": FeatureIconKnowledge,
  "Communication & Productivity": FeatureIconCommunication,
  "Multilingual Support": FeatureIconMultilingual,
  "EV & Emerging Tech": FeatureIconEV,
  "Data & Analytics": FeatureIconData,
  "Community & Network Effects": FeatureIconCommunity,
  "Security, Privacy & Trust": FeatureIconSecurity,
};

// All CSS from the original HTML, scoped under .sc-landing
const landingCSS = `
.sc-landing {
  --sun-gold: #F5A623;
  --lobster-coral: #E8664A;
  --deep-earth: #1A1612;
  --soft-cream: #FFF8F0;
  --charcoal: #2C2824;
  --text-primary: #F0EAE0;
  --text-secondary: #9E958B;
  --text-muted: #6B635B;
  font-family: 'DM Sans', sans-serif;
  background: var(--deep-earth);
  color: var(--text-primary);
  line-height: 1.7;
  overflow-x: hidden;
  min-height: 100vh;
}
.sc-landing * { margin: 0; padding: 0; box-sizing: border-box; }

/* NAV */
.sc-landing .sc-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 20px 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(26,22,18,0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(245,166,35,0.06);
}
.sc-landing .nav-logo { display: flex; align-items: center; gap: 6px; text-decoration: none; }
.sc-landing .nav-logo svg { margin: -4px 0; }
.sc-landing .nav-wordmark { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; }
.sc-landing .nav-wordmark .s { color: var(--sun-gold); }
.sc-landing .nav-wordmark .c { color: var(--lobster-coral); }
.sc-landing .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
.sc-landing .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.3s; }
.sc-landing .nav-links a:hover { color: var(--sun-gold); }
.sc-landing .nav-cta { padding: 10px 24px; border-radius: 100px; background: var(--sun-gold); color: var(--deep-earth) !important; font-weight: 700 !important; font-size: 13px !important; transition: all 0.3s !important; }
.sc-landing .nav-cta:hover { background: #FFB840 !important; transform: translateY(-1px); }

/* HERO */
.sc-landing .hero {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 120px 40px 80px; position: relative; overflow: hidden;
}
.sc-landing .hero.funnel-active {
  min-height: auto;
  justify-content: flex-start;
  padding-bottom: 64px;
}
.sc-landing .hero::before {
  content: ''; position: absolute; top: -200px; right: -200px; width: 900px; height: 900px;
  background: radial-gradient(circle, rgba(245,166,35,0.1) 0%, rgba(232,102,74,0.04) 40%, transparent 70%);
  border-radius: 50%; animation: heroGlow 10s ease-in-out infinite;
}
.sc-landing .hero::after {
  content: ''; position: absolute; bottom: -200px; left: -200px; width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(232,102,74,0.06) 0%, transparent 70%);
  border-radius: 50%; animation: heroGlow 10s ease-in-out infinite 5s;
}
@keyframes heroGlow { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
@keyframes clawWave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
.sc-landing .hero-logo { position: relative; z-index: 2; margin-bottom: 24px; opacity: 0; animation: fadeUp 0.8s ease forwards 0.2s; }
.sc-landing .hero-logo .claw-anim { animation: clawWave 3s ease-in-out infinite; transform-origin: 60px 26px; }
.sc-landing .hero h1 {
  font-family: 'Outfit', sans-serif; font-size: clamp(40px, 6vw, 72px); font-weight: 800;
  text-align: center; line-height: 1.1; max-width: 960px; position: relative; z-index: 2;
  margin-bottom: 20px;
  opacity: 0; animation: fadeUp 0.8s ease forwards 0.4s;
}
.sc-landing .hero h1 .gold { color: var(--sun-gold); }
.sc-landing .hero h1 .coral { color: var(--lobster-coral); }
.sc-landing .hero-sub {
  font-size: 18px; color: var(--text-secondary); text-align: center; max-width: 620px;
  position: relative; z-index: 2; opacity: 0; animation: fadeUp 0.8s ease forwards 0.6s;
}
.sc-landing .hero-ctas {
  display: flex; gap: 16px; margin-top: 40px; position: relative; z-index: 2;
  opacity: 0; animation: fadeUp 0.8s ease forwards 0.8s;
}
.sc-landing .btn-primary {
  padding: 16px 36px; border-radius: 100px; background: var(--sun-gold); color: var(--deep-earth);
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 16px; text-decoration: none;
  transition: all 0.3s; border: none; cursor: pointer;
}
.sc-landing .btn-primary:hover { background: #FFB840; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(245,166,35,0.3); }
.sc-landing .btn-secondary {
  padding: 16px 36px; border-radius: 100px; background: transparent; color: var(--text-primary);
  font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 16px; text-decoration: none;
  border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s; cursor: pointer;
}
.sc-landing .btn-secondary:hover { border-color: var(--sun-gold); color: var(--sun-gold); }
.sc-landing .hero-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px;
  background: rgba(232,102,74,0.1); border: 1px solid rgba(232,102,74,0.2);
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; color: var(--lobster-coral);
  margin-bottom: 24px; position: relative; z-index: 2; opacity: 0; animation: fadeUp 0.8s ease forwards 0.1s;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* DEVELOPER STRIP - Coral accent, rectangular */
.sc-landing .dev-strip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(232,102,74,0.06);
  border: 1px solid rgba(232,102,74,0.15);
  border-left: 3px solid #E8664A;
  text-decoration: none;
  transition: all 0.3s;
  margin-top: 48px;
  margin-bottom: 32px;
  position: relative;
  z-index: 2;
  opacity: 0;
  animation: fadeUp 0.8s ease forwards 0.7s;
}

.sc-landing .dev-strip:hover {
  border-color: rgba(232,102,74,0.3);
  background: rgba(232,102,74,0.1);
  transform: translateY(-1px);
}

.sc-landing .dev-strip-icon {
  font-size: 16px;
}

.sc-landing .dev-strip-text {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: var(--lobster-coral);
  letter-spacing: 0.5px;
}

.sc-landing .dev-strip:hover .dev-strip-text {
  color: var(--text-primary);
}

.sc-landing .dev-strip-arrow {
  color: #E8664A;
  font-size: 14px;
  transition: transform 0.3s;
}

.sc-landing .dev-strip:hover .dev-strip-arrow {
  transform: translateX(3px);
}

/* SOCIAL PROOF */
.sc-landing .social-proof {
  padding: 40px; display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap;
  border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sc-landing .proof-item { text-align: center; }
.sc-landing .proof-number { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: var(--sun-gold); }
.sc-landing .proof-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.sc-landing .proof-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); }

/* SECTIONS */
.sc-landing .section-eyebrow { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--sun-gold); margin-bottom: 16px; }
.sc-landing .section-heading { font-family: 'Outfit', sans-serif; font-size: clamp(28px, 4vw, 42px); font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
.sc-landing .section-sub { font-size: 16px; color: var(--text-secondary); max-width: 600px; margin-bottom: 56px; }

/* HOW IT WORKS */
.sc-landing .how-section { padding: 120px 40px; max-width: 1280px; margin: 0 auto; }
.sc-landing .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.sc-landing .step-card {
  padding: 36px 28px; border-radius: 20px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s; position: relative; overflow: hidden;
}
.sc-landing .step-card:hover { border-color: rgba(245,166,35,0.2); background: rgba(255,255,255,0.04); transform: translateY(-4px); }
.sc-landing .step-number { font-family: 'Outfit', sans-serif; font-size: 56px; font-weight: 800; color: rgba(245,166,35,0.08); position: absolute; top: 12px; right: 20px; line-height: 1; }
.sc-landing .step-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(245,166,35,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 22px; }
.sc-landing .step-card h3 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.sc-landing .step-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

/* FEATURES */
.sc-landing .features-section { padding: 120px 40px; max-width: 1280px; margin: 0 auto; }
.sc-landing .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.sc-landing .feature-card {
  padding: 28px; border-radius: 20px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s;
}
.sc-landing .feature-card:hover { border-color: rgba(245,166,35,0.15); transform: translateY(-2px); }
.sc-landing .feature-card.highlight {
  grid-column: span 3; background: linear-gradient(135deg, rgba(245,166,35,0.06), rgba(232,102,74,0.04));
  border-color: rgba(245,166,35,0.15); display: flex; gap: 48px; align-items: center;
}

/* FEATURE ICON WITH ANIMATION */
.sc-landing .feature-icon-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
}

.sc-landing .feature-icon-wrap::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.sc-landing .feature-card:hover .feature-icon-wrap::before {
  opacity: 1;
}

.sc-landing .feature-icon {
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.sc-landing .feature-card:hover .feature-icon {
  animation: scFeatureBounce 0.4s ease forwards;
}

@keyframes scFeatureBounce {
  0% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
  70% { transform: translateY(-2px); }
  100% { transform: translateY(-3px); }
}

.sc-landing .feature-card h3 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.sc-landing .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
.sc-landing .feature-tag { display: inline-block; padding: 4px 12px; border-radius: 100px; background: rgba(245,166,35,0.1); font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--sun-gold); margin-bottom: 12px; }

/* Per-feature ambient animations */
.sc-landing .feature-card[data-feature="financial"] .sc-bar { animation: scBarGrow 2s ease-in-out infinite; }
@keyframes scBarGrow { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.08); } }

.sc-landing .feature-card[data-feature="tracker"]:hover .sc-check { animation: scCheckPop 0.4s ease forwards; }
@keyframes scCheckPop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }

.sc-landing .feature-card[data-feature="diagnostics"]:hover .sc-magnify { animation: scMagnifyPulse 0.8s ease infinite; }
@keyframes scMagnifyPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.sc-landing .feature-card[data-feature="document"]:hover .sc-doc-line { animation: scDocLineSlide 0.6s ease forwards; }
@keyframes scDocLineSlide { 0% { opacity: 0.4; } 100% { opacity: 0.8; } }

.sc-landing .feature-card[data-feature="knowledge"]:hover .sc-bulb { animation: scBulbGlow 0.8s ease infinite; }
@keyframes scBulbGlow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.sc-landing .feature-card[data-feature="communication"]:hover .sc-speech-dot { animation: scSpeechDotPulse 0.5s ease infinite; }
@keyframes scSpeechDotPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.sc-landing .feature-card[data-feature="multilingual"]:hover .sc-lang-tag { animation: scLangTagFloat 1s ease infinite; }
@keyframes scLangTagFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

.sc-landing .feature-card[data-feature="ev"]:hover .sc-bolt { animation: scBoltFlash 0.6s ease infinite; }
@keyframes scBoltFlash { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }

.sc-landing .feature-card[data-feature="data"]:hover .sc-chart-line { animation: scChartDraw 1s ease forwards; }
@keyframes scChartDraw { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }

.sc-landing .feature-card[data-feature="community"]:hover .sc-connection-dot { animation: scConnectionPulse 0.8s ease infinite; }
@keyframes scConnectionPulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } }

.sc-landing .feature-card[data-feature="security"]:hover .sc-shield-check { animation: scShieldGlow 0.6s ease forwards; }
@keyframes scShieldGlow { 0% { opacity: 1; } 100% { opacity: 1; filter: drop-shadow(0 0 4px rgba(245,166,35,0.6)); } }

/* CHAT PREVIEW */
.sc-landing .chat-preview { max-width: 420px; flex-shrink: 0; }
.sc-landing .chat-bubble { padding: 14px 18px; border-radius: 18px; font-size: 14px; line-height: 1.6; margin-bottom: 12px; max-width: 320px; }
.sc-landing .chat-user { background: rgba(245,166,35,0.15); color: var(--text-primary); margin-left: auto; border-bottom-right-radius: 6px; }
.sc-landing .chat-bot { background: rgba(255,255,255,0.06); color: var(--text-secondary); border-bottom-left-radius: 6px; }
.sc-landing .chat-bot-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: var(--sun-gold); }

/* MARKETPLACE */
.sc-landing .marketplace-section { padding: 120px 40px; background: linear-gradient(180deg, transparent, rgba(245,166,35,0.03), transparent); }
.sc-landing .marketplace-inner { max-width: 1280px; margin: 0 auto; }
.sc-landing .market-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
.sc-landing .market-card { padding: 32px 24px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: all 0.3s; }
.sc-landing .market-card:hover { border-color: rgba(245,166,35,0.2); transform: translateY(-3px); }
.sc-landing .market-icon { font-size: 36px; margin-bottom: 16px; }
.sc-landing .market-card h4 { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.sc-landing .market-card p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

/* CTA SECTION */
.sc-landing .cta-section { padding: 120px 40px; text-align: center; position: relative; overflow: hidden; }
.sc-landing .cta-section::before {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 600px; height: 600px; background: radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%); border-radius: 50%;
}
.sc-landing .cta-content { position: relative; z-index: 2; }
.sc-landing .cta-content h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
.sc-landing .cta-content p { font-size: 18px; color: var(--text-secondary); max-width: 560px; margin: 0 auto 40px; }

/* FOOTER */
.sc-landing .sc-footer {
  padding: 60px 40px; border-top: 1px solid rgba(255,255,255,0.04); max-width: 1280px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;
}
.sc-landing .footer-left { display: flex; align-items: center; gap: 10px; }
.sc-landing .footer-wordmark { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 18px; }
.sc-landing .footer-copy { font-size: 13px; color: var(--text-muted); margin-left: 16px; }
.sc-landing .footer-links { display: flex; gap: 24px; list-style: none; }
.sc-landing .footer-links a { color: var(--text-muted); text-decoration: none; font-size: 13px; transition: color 0.3s; }
.sc-landing .footer-links a:hover { color: var(--sun-gold); }
.sc-landing .footer-lobster { font-size: 12px; color: var(--text-muted); font-family: 'Space Mono', monospace; opacity: 0.5; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .sc-landing .sc-nav { padding: 16px 20px; }
  .sc-landing .nav-links { display: none; }
  .sc-landing .hero { padding: 100px 24px 60px; }
  .sc-landing .hero-ctas { flex-direction: column; width: 100%; max-width: 320px; }
  .sc-landing .btn-primary, .sc-landing .btn-secondary { text-align: center; }
  .sc-landing .steps-grid { grid-template-columns: 1fr; }
  .sc-landing .features-grid { grid-template-columns: 1fr; }
  .sc-landing .feature-card.highlight { grid-column: span 1; flex-direction: column; }
  .sc-landing .market-cards { grid-template-columns: 1fr; }
  .sc-landing .audience-section div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  .sc-landing section > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  .sc-landing .how-section, .sc-landing .features-section, .sc-landing .marketplace-section, .sc-landing .cta-section { padding: 80px 24px; }
  .sc-landing .social-proof { gap: 24px; }
  .sc-landing .proof-divider { display: none; }
  .sc-landing .dev-strip { padding: 10px 16px; }
  .sc-landing .dev-strip-text { font-size: 11px; }
}

/* CONVERSATIONAL FUNNEL */
.sc-landing .sc-funnel {
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.sc-landing .sc-funnel-bot-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0;
  animation: scFunnelFadeUp 0.35s ease forwards;
}

.sc-landing .sc-funnel-bot-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.sc-landing .sc-funnel-bot-bubble {
  background: rgba(255,255,255,0.06);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 520px;
}

/* Celebratory completion bubble */
.sc-landing .sc-funnel-complete-bubble {
  background: linear-gradient(135deg, rgba(245,166,35,0.12), rgba(232,102,74,0.08));
  border: 1px solid rgba(245,166,35,0.2);
  color: var(--text-primary);
}

.sc-landing .sc-funnel-user-row {
  display: flex;
  justify-content: flex-end;
}

.sc-landing .sc-funnel-user-row.entering {
  animation: scFunnelUserSlide 0.3s ease forwards;
}

@keyframes scFunnelUserSlide {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.sc-landing .sc-funnel-user-bubble {
  background: rgba(245,166,35,0.15);
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  max-width: 440px;
}

/* Typing indicator */
.sc-landing .sc-funnel-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 18px;
  background: rgba(255,255,255,0.06);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
}

.sc-landing .sc-funnel-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: scTypingBounce 1.4s ease-in-out infinite;
}

.sc-landing .sc-funnel-typing-dot:nth-child(1) { animation-delay: 0s; }
.sc-landing .sc-funnel-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.sc-landing .sc-funnel-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes scTypingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Step enter animation */
.sc-landing .sc-funnel-step-enter {
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-choices,
.sc-landing .sc-funnel-choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-left: 36px;
}

.sc-landing .sc-funnel-choice {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  opacity: 0;
  animation: scFunnelFadeUp 0.35s ease forwards;
}

/* Staggered entrance animation */
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(1) { animation-delay: 100ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(2) { animation-delay: 180ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(3) { animation-delay: 260ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(4) { animation-delay: 340ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(5) { animation-delay: 420ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(6) { animation-delay: 500ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(7) { animation-delay: 580ms; }
.sc-landing .sc-funnel-choices-grid .sc-funnel-choice:nth-child(8) { animation-delay: 660ms; }

.sc-landing .sc-funnel-choice:hover {
  border-color: rgba(245,166,35,0.3);
  background: rgba(245,166,35,0.04);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15),
              0 0 0 1px rgba(245,166,35,0.08),
              inset 0 1px 0 rgba(245,166,35,0.06);
}

.sc-landing .sc-funnel-choice:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s;
}

.sc-landing .sc-funnel-choice.selected {
  border-color: var(--sun-gold);
  background: rgba(245,166,35,0.15);
  transform: scale(0.98);
}

.sc-landing .sc-funnel-choice-icon {
  font-size: 22px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sc-landing .sc-funnel-choice:hover .sc-funnel-choice-icon {
  animation: scChoiceIconBounce 0.4s ease;
}

@keyframes scChoiceIconBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1.05); }
}

.sc-landing .sc-funnel-choice-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.sc-landing .sc-funnel-choice-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

/* Region picker */
.sc-landing .sc-funnel-regions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-left: 36px;
}

.sc-landing .sc-funnel-region {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  opacity: 0;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-region:hover {
  border-color: rgba(245,166,35,0.2);
  background: rgba(255,255,255,0.04);
  transform: translateY(-2px);
}

.sc-landing .sc-funnel-region.selected {
  border-color: var(--sun-gold);
  background: rgba(245,166,35,0.15);
  transform: scale(0.98);
}

.sc-landing .sc-funnel-region-icon {
  font-size: 16px;
}

.sc-landing .sc-funnel-region-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-primary);
}

.sc-landing .sc-funnel-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 36px;
  max-width: 400px;
}

.sc-landing .sc-funnel-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  opacity: 0;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-input:nth-child(1) { animation-delay: 0ms; }
.sc-landing .sc-funnel-input:nth-child(2) { animation-delay: 50ms; }
.sc-landing .sc-funnel-input:nth-child(3) { animation-delay: 100ms; }
.sc-landing .sc-funnel-input:nth-child(4) { animation-delay: 150ms; }

.sc-landing .sc-funnel-input::placeholder {
  color: var(--text-muted);
}

.sc-landing .sc-funnel-input:focus {
  border-color: rgba(245,166,35,0.5);
  box-shadow: 0 0 0 3px rgba(245,166,35,0.1);
}

.sc-landing .sc-funnel-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 100px;
  background: var(--sun-gold);
  color: var(--deep-earth);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  opacity: 0;
  animation: scFunnelFadeUp 0.3s ease forwards 200ms;
}

.sc-landing .sc-funnel-submit:hover {
  background: #FFB840;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(245,166,35,0.3);
}

.sc-landing .sc-funnel-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  animation: scDisabledPulse 2s ease-in-out infinite;
}

@keyframes scDisabledPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.4; }
}

/* Telegram CTA */
.sc-landing .sc-funnel-telegram-cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-radius: 100px;
  background: linear-gradient(135deg, var(--sun-gold), #FFB840);
  color: var(--deep-earth);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(245,166,35,0.3);
}

.sc-landing .sc-funnel-telegram-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(245,166,35,0.4);
}

.sc-landing .sc-funnel-telegram-arrow {
  font-size: 18px;
  transition: transform 0.3s;
}

.sc-landing .sc-funnel-telegram-cta:hover .sc-funnel-telegram-arrow {
  transform: translateX(4px);
}

.sc-landing .sc-funnel-cta-row {
  margin-left: 36px;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-note {
  margin-left: 36px;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

.sc-landing .sc-funnel-link {
  color: var(--sun-gold);
  text-decoration: none;
  transition: color 0.3s;
}

.sc-landing .sc-funnel-link:hover {
  color: #FFB840;
}

@keyframes scFunnelFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .sc-landing .sc-funnel { max-width: 100%; }
  .sc-landing .sc-funnel-choices,
  .sc-landing .sc-funnel-choices-grid { margin-left: 0; grid-template-columns: 1fr; }
  .sc-landing .sc-funnel-regions { margin-left: 0; grid-template-columns: 1fr; }
  .sc-landing .sc-funnel-form { margin-left: 0; max-width: 100%; }
  .sc-landing .sc-funnel-cta-row { margin-left: 0; }
  .sc-landing .sc-funnel-note { margin-left: 0; }
  .sc-landing .sc-funnel-bot-bubble { max-width: 300px; }
  .sc-landing .sc-funnel-user-bubble { max-width: 280px; }
  .sc-landing .sc-funnel-telegram-cta { width: 100%; justify-content: center; }
}

/* TWO-CARD HERO SYSTEM */
.sc-landing .hero-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 880px;
  width: 100%;
  margin: 56px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
  opacity: 0;
  animation: fadeUp 0.8s ease forwards 0.8s;
}

.sc-landing .hero-product-card {
  padding: 40px 36px;
  border-radius: 24px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
  transition: all 0.35s ease;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  min-height: 320px;
  text-align: left;
}

/* Talk to SunClaw — Gold Warmth */
.sc-landing .hero-card-talk {
  background: rgba(245,166,35,0.03);
  border: 1px solid rgba(245,166,35,0.1);
}

.sc-landing .hero-card-talk:hover {
  border-color: rgba(245,166,35,0.3);
  background: rgba(245,166,35,0.06);
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(245,166,35,0.1), 0 0 0 1px rgba(245,166,35,0.15);
}

/* Deploy Your Own Agent — Coral Tech */
.sc-landing .hero-card-deploy {
  background: rgba(232,102,74,0.03);
  border: 1px solid rgba(232,102,74,0.1);
}

.sc-landing .hero-card-deploy:hover {
  border-color: rgba(232,102,74,0.3);
  background: rgba(232,102,74,0.06);
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(232,102,74,0.1), 0 0 0 1px rgba(232,102,74,0.15);
}

/* Icon Wrap */
.sc-landing .hero-card-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.sc-landing .hero-card-icon-talk {
  background: rgba(245,166,35,0.1);
  border: 1px solid rgba(245,166,35,0.15);
}

.sc-landing .hero-card-icon-deploy {
  background: rgba(232,102,74,0.1);
  border: 1px solid rgba(232,102,74,0.15);
}

/* Title */
.sc-landing .hero-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.sc-landing .hero-card-talk .hero-card-title {
  color: #F5A623;
}

.sc-landing .hero-card-deploy .hero-card-title {
  color: #E8664A;
}

/* Description */
.sc-landing .hero-card-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
  flex: 1;
}

/* Audiences / Tiers */
.sc-landing .hero-card-audiences,
.sc-landing .hero-card-tiers {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.sc-landing .hero-card-tier-dot {
  color: rgba(255,255,255,0.15);
  margin: 0 2px;
}

/* CTA */
.sc-landing .hero-card-cta {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #F5A623;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  transition: gap 0.3s;
}

.sc-landing .hero-card-cta-deploy {
  color: #E8664A;
}

.sc-landing .hero-card-arrow {
  transition: transform 0.3s;
}

.sc-landing .hero-product-card:hover .hero-card-arrow {
  transform: translateX(4px);
}

/* Hero state transitions */
.sc-landing .hero-section-wrapper {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.sc-landing .hero-cards-container,
.sc-landing .hero-funnel-container {
  width: 100%;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sc-landing .hero-cards-container.hidden {
  opacity: 0;
  transform: scale(0.98);
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.sc-landing .hero-funnel-container.hidden {
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* Funnel back button (inside funnel) */
.sc-landing .sc-funnel-back {
  background: none;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 100px;
  color: var(--text-muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 16px;
  margin-bottom: 24px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sc-landing .sc-funnel-back:hover {
  color: var(--text-secondary);
  border-color: rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.03);
}

@media (max-width: 768px) {
  .sc-landing .hero-cards {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 40px;
    padding: 0 16px;
  }
  .sc-landing .hero-product-card {
    padding: 32px 28px;
    min-height: auto;
  }
}

/* THEME TOGGLE */
.sc-landing .theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  margin-left: 12px;
}

.sc-landing .theme-toggle:hover {
  border-color: rgba(245,166,35,0.3);
  background: rgba(245,166,35,0.06);
  transform: rotate(15deg);
}

/* LIGHT MODE OVERRIDES */
[data-theme="light"] .sc-landing {
  --bg-primary: #FFF8F0;
  --text-primary: #1A1612;
  --text-secondary: #5A534B;
  --text-muted: #8B8279;
  --sun-gold: #D48C1A;
  --lobster-coral: #D15A3E;
  background: #FFF8F0;
  color: #1A1612;
}

[data-theme="light"] .sc-landing .sc-nav {
  background: rgba(255,248,240,0.85);
  border-bottom-color: rgba(26,22,18,0.06);
}

[data-theme="light"] .sc-landing .nav-links a {
  color: #5A534B;
}

[data-theme="light"] .sc-landing .nav-links a:hover {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .nav-cta {
  background: #D48C1A;
}

[data-theme="light"] .sc-landing .theme-toggle {
  border-color: rgba(26,22,18,0.1);
  background: rgba(26,22,18,0.04);
}

[data-theme="light"] .sc-landing .theme-toggle:hover {
  border-color: rgba(26,22,18,0.2);
  background: rgba(26,22,18,0.08);
}

[data-theme="light"] .sc-landing .hero h1 {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .hero h1 .gold {
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .hero h1 .coral {
  color: #D15A3E;
}

[data-theme="light"] .sc-landing .hero-sub {
  color: #5A534B;
}

[data-theme="light"] .sc-landing .hero-badge {
  background: rgba(212,140,26,0.1);
  border-color: rgba(212,140,26,0.2);
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .hero-product-card {
  background: #FFFFFF;
  border-color: rgba(26,22,18,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

[data-theme="light"] .sc-landing .hero-card-talk {
  background: rgba(245,166,35,0.05);
  border-color: rgba(245,166,35,0.15);
}

[data-theme="light"] .sc-landing .hero-card-deploy {
  background: rgba(232,102,74,0.05);
  border-color: rgba(232,102,74,0.15);
}

[data-theme="light"] .sc-landing .hero-product-card:hover {
  box-shadow: 0 16px 48px rgba(0,0,0,0.08);
}

[data-theme="light"] .sc-landing .hero-card-title {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .hero-card-talk .hero-card-title {
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .hero-card-deploy .hero-card-title {
  color: #D15A3E;
}

[data-theme="light"] .sc-landing .hero-card-desc {
  color: #5A534B;
}

[data-theme="light"] .sc-landing .hero-card-audiences,
[data-theme="light"] .sc-landing .hero-card-tiers {
  color: #8B8279;
}

[data-theme="light"] .sc-landing .hero-card-cta {
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .hero-card-cta-deploy {
  color: #D15A3E;
}

[data-theme="light"] .sc-landing .social-proof {
  border-color: rgba(26,22,18,0.06);
}

[data-theme="light"] .sc-landing .proof-number {
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .proof-label {
  color: #8B8279;
}

[data-theme="light"] .sc-landing .section-eyebrow {
  color: #D48C1A;
}

[data-theme="light"] .sc-landing .section-heading {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .section-sub {
  color: #5A534B;
}

[data-theme="light"] .sc-landing .step-card,
[data-theme="light"] .sc-landing .feature-card,
[data-theme="light"] .sc-landing .market-card {
  background: #FFFFFF;
  border-color: rgba(26,22,18,0.06);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

[data-theme="light"] .sc-landing .step-card:hover,
[data-theme="light"] .sc-landing .feature-card:hover,
[data-theme="light"] .sc-landing .market-card:hover {
  border-color: rgba(212,140,26,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

[data-theme="light"] .sc-landing .step-card h3,
[data-theme="light"] .sc-landing .feature-card h3,
[data-theme="light"] .sc-landing .market-card h4 {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .step-card p,
[data-theme="light"] .sc-landing .feature-card p,
[data-theme="light"] .sc-landing .market-card p {
  color: #5A534B;
}

[data-theme="light"] .sc-landing .sc-funnel-bot-bubble {
  background: rgba(26,22,18,0.04);
  color: #5A534B;
}

[data-theme="light"] .sc-landing .sc-funnel-user-bubble {
  background: rgba(245,166,35,0.12);
  color: #1A1612;
}

[data-theme="light"] .sc-landing .sc-funnel-choice {
  background: #FFFFFF;
  border-color: rgba(26,22,18,0.08);
}

[data-theme="light"] .sc-landing .sc-funnel-choice:hover {
  background: rgba(245,166,35,0.04);
  border-color: rgba(212,140,26,0.3);
}

[data-theme="light"] .sc-landing .sc-funnel-choice-label {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .sc-funnel-choice-desc {
  color: #8B8279;
}

[data-theme="light"] .sc-landing .sc-funnel-input {
  background: #FFFFFF;
  border-color: rgba(26,22,18,0.12);
  color: #1A1612;
}

[data-theme="light"] .sc-landing .sc-funnel-input::placeholder {
  color: #8B8279;
}

[data-theme="light"] .sc-landing .sc-funnel-input:focus {
  border-color: rgba(212,140,26,0.5);
  box-shadow: 0 0 0 3px rgba(212,140,26,0.1);
}

[data-theme="light"] .sc-landing .sc-funnel-submit {
  background: #D48C1A;
}

[data-theme="light"] .sc-landing .sc-funnel-submit:hover {
  background: #C07F17;
}

[data-theme="light"] .sc-landing .sc-funnel-back {
  border-color: rgba(26,22,18,0.08);
  color: #8B8279;
}

[data-theme="light"] .sc-landing .sc-funnel-back:hover {
  border-color: rgba(26,22,18,0.15);
  color: #5A534B;
  background: rgba(26,22,18,0.03);
}

[data-theme="light"] .sc-landing .sc-funnel-region {
  background: #FFFFFF;
  border-color: rgba(26,22,18,0.08);
}

[data-theme="light"] .sc-landing .sc-funnel-region:hover {
  background: rgba(245,166,35,0.04);
  border-color: rgba(212,140,26,0.3);
}

[data-theme="light"] .sc-landing .sc-funnel-region-label {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .btn-primary {
  background: #D48C1A;
}

[data-theme="light"] .sc-landing .btn-primary:hover {
  background: #C07F17;
}

[data-theme="light"] .sc-landing .cta-section h2 {
  color: #1A1612;
}

[data-theme="light"] .sc-landing .cta-section p {
  color: #5A534B;
}

/* Footer stays dark in both modes */
[data-theme="light"] .sc-landing .sc-footer {
  background: #1A1612;
}

/* Smooth theme transition */
.sc-landing,
.sc-landing .sc-nav,
.sc-landing .hero,
.sc-landing .hero-product-card,
.sc-landing .feature-card,
.sc-landing .step-card,
.sc-landing .market-card,
.sc-landing .sc-funnel-choice,
.sc-landing .sc-funnel-input,
.sc-landing .sc-funnel-bot-bubble {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}
`;

export default function LandingPage() {
  const [heroState, setHeroState] = useState<HeroState>('cards');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sc-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sc-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Inject scoped CSS
    const style = document.createElement("style");
    style.textContent = landingCSS;
    style.setAttribute("data-landing", "true");
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash;
    if (hash === "#talk") {
      // Auto-show funnel when navigating to #talk
      setHeroState('funnel');
      setTimeout(() => {
        document.getElementById("talk")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (hash === "#marketplace" || hash === "#deploy" || hash === "#features") {
      setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  // Handle nav CTA click - scroll to hero and show funnel
  const handleTalkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setHeroState('funnel');
    window.history.pushState(null, '', '#talk');
    setTimeout(() => {
      document.getElementById("talk")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Handle back to cards
  const handleBackToCards = () => {
    setHeroState('cards');
    window.history.pushState(null, '', '/');
  };

  const features = [
    { title: "Financial Modeling", desc: "LCOE, IRR, NPV, payback period. Run sensitivity analyses through conversation. Compare financing structures (lease vs PPA vs direct purchase). Generate investor-ready projections." },
    { title: "Project Development Tracker", desc: "From land acquisition to commissioning. Country-specific checklists, progress tracking, dependency flags, and proactive nudges on next steps." },
    { title: "Field Diagnostics", desc: "Send a photo of a fault, wiring issue, or error code. SunClaw identifies the problem and walks technicians through the fix, step by step. Safety guidance included." },
    { title: "Document Engine", desc: "Generate proposals, RFQ documents, due diligence packages, and impact reports. Upload PDFs and SunClaw extracts and structures the data." },
    { title: "Knowledge Hub", desc: "Personalized industry feed, active grant and tender listings, market intelligence, and a best practices library tailored to your role and region." },
    { title: "Communication & Productivity", desc: "Meeting transcription, email drafting, reminders, calendar integration. The daily productivity layer that keeps you coming back." },
    { title: "Multilingual Support", desc: "Auto language detection, code-switching between languages mid-conversation, cross-party translation for multi-stakeholder deals, and cultural context awareness." },
    { title: "EV & Emerging Tech", desc: "EV charging infrastructure advisory, green hydrogen, advanced energy storage, and mini-grid/microgrid design. Forward-looking from day one." },
    { title: "Data & Analytics", desc: "Every conversation generates data. Aggregated and anonymized, it becomes market intelligence no one else has. Analytics products for subscribers." },
    { title: "Community & Network Effects", desc: "Peer networking, mentorship matching, virtual events, and user-generated content. The platform gets more valuable with every new user." },
    { title: "Security, Privacy & Trust", desc: "Per-user data isolation, GDPR compliance, verification systems, fraud prevention, and ethical AI practices. Trust is the currency of a marketplace." },
  ];

  return (
    <div className="sc-landing">
      {/* NAV */}
      <nav className="sc-nav">
        <a href="/" className="nav-logo">
          <NavLogo />
          <span className="nav-wordmark"><span className="s">Sun</span><span className="c">Claw</span></span>
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#marketplace">Marketplace</a></li>
          <li><a href="/agent">For Developers</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="#talk" className="nav-cta" onClick={handleTalkClick}>Talk to SunClaw</a></li>
          <li>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle light mode"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                  <circle cx="10" cy="10" r="4" fill="#F5A623"/>
                  <line x1="10" y1="2" x2="10" y2="4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="10" y1="16" x2="10" y2="18" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="2" y1="10" x2="4" y2="10" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="16" y1="10" x2="18" y2="10" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14.4" y1="14.4" x2="15.8" y2="15.8" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="4.2" y1="15.8" x2="5.6" y2="14.4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14.4" y1="5.6" x2="15.8" y2="4.2" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                  <path d="M17 11.5A7.5 7.5 0 018.5 3c0-.8.1-1.6.4-2.3A8 8 0 1017 11.5z" fill="#1A1612" stroke="#1A1612" strokeWidth="1"/>
                </svg>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className={`hero ${heroState === 'funnel' ? 'funnel-active' : ''}`}>
        <div className="hero-badge">🦞 Born in the reef. Built for the sun.</div>
        <div className="hero-logo"><HeroLogo /></div>
        <h1>The <span className="gold">energy conversation</span> the world's been waiting for.</h1>
        <p className="hero-sub">SunClaw is your AI-powered advisor for renewable energy. Whether you're developing a project or providing the services to build one, SunClaw matches you to the right people through conversation.</p>

        <div id="talk" className="hero-section-wrapper" style={{ marginTop: heroState === 'funnel' ? '32px' : '0' }}>
          {/* Two-card hero view */}
          <div className={`hero-cards-container ${heroState === 'funnel' ? 'hidden' : ''}`}>
            <div className="hero-cards">
              <button
                type="button"
                className="hero-product-card hero-card-talk"
                onClick={handleTalkClick}
              >
                <div className="hero-card-icon-wrap hero-card-icon-talk">
                  <SunClawIcon size={48} />
                </div>
                <h3 className="hero-card-title">Talk to SunClaw</h3>
                <p className="hero-card-desc">
                  Your AI advisor for renewable energy. Get matched to the right
                  people, find services, explore opportunities — all through conversation.
                </p>
                <div className="hero-card-audiences">
                  Developers · Investors · Installers · Job seekers · Everyone in RE
                </div>
                <span className="hero-card-cta">
                  Start talking <span className="hero-card-arrow">→</span>
                </span>
              </button>

              <a href="/agent" className="hero-product-card hero-card-deploy">
                <div className="hero-card-icon-wrap hero-card-icon-deploy">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <path d="M16 18l6-6-6-6" stroke="#E8664A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6l-6 6 6 6" stroke="#E8664A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="hero-card-title">Deploy Your Own Agent</h3>
                <p className="hero-card-desc">
                  A standalone OpenClaw instance pre-loaded with 11 renewable energy
                  skills. Your infrastructure, your data, your bot.
                </p>
                <div className="hero-card-tiers">
                  <span>Free</span>
                  <span className="hero-card-tier-dot">·</span>
                  <span>Pro $29/mo</span>
                  <span className="hero-card-tier-dot">·</span>
                  <span>Enterprise $99/mo</span>
                </div>
                <span className="hero-card-cta hero-card-cta-deploy">
                  Set up now <span className="hero-card-arrow">→</span>
                </span>
              </a>
            </div>
          </div>

          {/* Funnel view */}
          <div className={`hero-funnel-container ${heroState === 'cards' ? 'hidden' : ''}`}>
            <ConversationalFunnel onBack={handleBackToCards} />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="social-proof">
        <div className="proof-item"><div className="proof-number">91+</div><div className="proof-label">Features</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">18</div><div className="proof-label">Categories</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">15+</div><div className="proof-label">Channels</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">15+</div><div className="proof-label">Languages</div></div>
      </div>

      {/* WHO IT'S FOR */}
      <section className="audience-section" style={{ padding: "100px 40px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-eyebrow">Who It's For</div>
        <h2 className="section-heading">Two sides. One conversation.</h2>
        <p className="section-sub">SunClaw is a two-sided marketplace. Both sides build profiles through conversation, and both sides get matched.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 40 }}>
          <div style={{ padding: 36, borderRadius: 20, background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.15)" }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>☀️</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#F5A623" }}>Looking for services</h3>
            <p style={{ fontSize: 14, color: "#9E958B", lineHeight: 1.7, marginBottom: 16 }}>Project developers, asset owners, C&I clients, utilities, governments, and anyone building or financing a renewable energy project.</p>
            <p style={{ fontSize: 13, color: "#6B635B", lineHeight: 1.7, fontStyle: "italic" }}>"Find me an EPC in Lagos." "Model this PPA." "Who's financing mini-grids right now?"</p>
          </div>
          <div style={{ padding: 36, borderRadius: 20, background: "rgba(232,102,74,0.05)", border: "1px solid rgba(232,102,74,0.15)" }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>🔧</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#E8664A" }}>Offering services</h3>
            <p style={{ fontSize: 14, color: "#9E958B", lineHeight: 1.7, marginBottom: 16 }}>Installers, EPC contractors, financiers, DFIs, consultants, equipment suppliers, recruiters, and independent engineers.</p>
            <p style={{ fontSize: 13, color: "#6B635B", lineHeight: 1.7, fontStyle: "italic" }}>"Send me solar leads in West Africa." "Match me with projects that need biomass expertise." "I have surplus panels to move."</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-eyebrow">How It Works</div>
        <h2 className="section-heading">Three steps. No forms. No dashboards.</h2>
        <p className="section-sub">SunClaw builds your profile through natural conversation, then connects you to exactly what you need.</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">💬</div>
            <h3>Start a Conversation</h3>
            <p>Message SunClaw on Telegram, WhatsApp, Signal, Discord, Slack, Teams, Google Chat, iMessage, Matrix, or WebChat. Tell it what you're building or what you offer. No sign-up forms. Just talk.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🧠</div>
            <h3>SunClaw Learns</h3>
            <p>Every conversation builds a structured profile. Whether you're a developer describing a project or an installer listing your capabilities, SunClaw captures it naturally as you talk.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🤝</div>
            <h3>Both Sides Get Matched</h3>
            <p>SunClaw anonymously matches supply to demand. Developers find installers. Installers find leads. Financiers find deal flow. Both parties consent before any introduction is made.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-eyebrow">Platform Features</div>
        <h2 className="section-heading">91 features. 18 categories. One conversation.</h2>
        <p className="section-sub">From feasibility to financing, from hiring to hardware. SunClaw covers the full lifecycle of renewable energy projects.</p>
        <div className="features-grid">
          <div className="feature-card highlight">
            <div style={{ flex: 1 }}>
              <div className="feature-tag">Live Chat Preview</div>
              <h3>Conversational-First Design</h3>
              <p>No dashboards to learn. No forms to fill. SunClaw meets you where you already are. Just message it and start talking about your energy project. It handles the structure, you provide the context.</p>
            </div>
            <div className="chat-preview">
              <div className="chat-bubble chat-user">I'm looking at a 5MW solar farm in Kaduna State. What do I need to get started?</div>
              <div className="chat-bubble chat-bot">
                <div className="chat-bot-header">{chatBotIcon} SunClaw</div>
                Great location. Strong irradiance at 5.4 kWh/m²/day. For a 5MW solar farm, you'll need generation licensing, land (roughly 4-5 hectares), and an ESIA. I've built a development checklist for you. Want me to walk through each stage?
              </div>
              <div className="chat-bubble chat-user">Yes, and can you find me EPC contractors in the region?</div>
            </div>
          </div>

          {features.map((f, i) => {
            const IconComponent = featureIcons[f.title];
            // Map feature titles to data-feature attributes
            const dataFeatureMap: Record<string, string> = {
              "Financial Modeling": "financial",
              "Project Development Tracker": "tracker",
              "Field Diagnostics": "diagnostics",
              "Document Engine": "document",
              "Knowledge Hub": "knowledge",
              "Communication & Productivity": "communication",
              "Multilingual Support": "multilingual",
              "EV & Emerging Tech": "ev",
              "Data & Analytics": "data",
              "Community & Network Effects": "community",
              "Security, Privacy & Trust": "security",
            };
            const dataFeature = dataFeatureMap[f.title] || "";
            return (
              <div className="feature-card" key={i} data-feature={dataFeature}>
                <div className="feature-icon-wrap">
                  <div className="feature-icon">
                    {IconComponent ? <IconComponent /> : null}
                  </div>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="marketplace-section" id="marketplace">
        <div className="marketplace-inner">
          <div className="section-eyebrow">The Marketplace</div>
          <h2 className="section-heading">Every conversation powers something.</h2>
          <p className="section-sub">SunClaw is a multi-sided marketplace where every chat builds a profile, and every profile becomes a node in a matching network.</p>
          <div className="market-cards">
            {[
              { icon: "💰", title: "Project-to-Finance", desc: "Developers find capital. Investors find deal flow. Anonymous matching, consent-based introductions." },
              { icon: "🔨", title: "Developer-to-Installer", desc: "Developers find verified installers. Installers receive qualified leads by region and specialization." },
              { icon: "👷", title: "Developer-to-EPC", desc: "Projects find contractors. EPCs, engineers, and consultants find new mandates." },
              { icon: "🌱", title: "Carbon Credits", desc: "Project owners assess eligibility and estimate volumes. Buyers find verified carbon credit supply." },
              { icon: "👥", title: "Talent Matching", desc: "Job seekers build profiles through conversation. Employers search by skills, not keywords." },
              { icon: "⚡", title: "Equipment Market", desc: "Buyers find panels, inverters, and batteries. Distributors and OEMs reach verified demand." },
              { icon: "🏗️", title: "Startup-to-Funder", desc: "RE startups find VCs, grants, and accelerators. Funders find vetted early-stage pipeline." },
              { icon: "🗺️", title: "Land-to-Developer", desc: "Landowners list suitable parcels. Developers find sites for utility-scale and mini-grid projects." },
              { icon: "🛡️", title: "Insurance Marketplace", desc: "Projects find brokers and underwriters. Insurers access a pipeline of RE risk they can price." },
            ].map((m, i) => (
              <div className="market-card" key={i}>
                <div className="market-icon">{m.icon}</div>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOY YOUR OWN */}
      <section id="deploy" style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div className="section-eyebrow">For Developers</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 700, color: "#FFF8F0", lineHeight: 1.2, marginBottom: 16 }}>Want your own<br/>standalone agent?</h2>
              <p style={{ fontSize: 16, color: "#9E958B", lineHeight: 1.7, marginBottom: 24 }}>
                SunClaw is also the easiest way to deploy OpenClaw for renewable energy. Get a personal AI agent pre-loaded with 11 RE skills, running on your own infrastructure or ours. No ecosystem, no marketplace, just your own bot on your own terms.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Free tier: guided self-setup, BYO keys + infrastructure",
                  "Pro ($29/mo): managed hosting, up to 3 bots, live logs",
                  "Enterprise ($99/mo): dedicated infra, managed keys, KIISHA integration",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#F5A623", fontSize: 14 }}>✓</span>
                    <span style={{ color: "#C4B9AB", fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/agent/setup" className="btn-primary" style={{ display: "inline-block" }}>Launch Setup Wizard</a>
            </div>
            <div style={{ padding: 32, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#6B635B", lineHeight: 2 }}>
              <span style={{ color: "#F5A623" }}>$</span> <span style={{ color: "#C4B9AB" }}>npx sunclaw setup</span><br/><br/>
              <span style={{ color: "#6B635B" }}>  ☞ Configuring OpenClaw Gateway...</span><br/>
              <span style={{ color: "#6B635B" }}>  ☞ Loading 11 RE skills...</span><br/>
              {["Solar Irradiance", "LCOE Calculator", "PV Design", "BESS Sizing", "Financial Model", "PPA Analyzer", "O&M Diagnostics", "Wind Turbine Specs", "Grid Status", "IRENA Search", "Carbon Calculator"].map((skill, i) => (
                <span key={i}><span style={{ color: "#6B635B" }}>  ☞ {skill} ✓</span><br/></span>
              ))}
              <br/>
              <span style={{ color: "#F5A623" }}>✓</span> <span style={{ color: "#C4B9AB" }}>SunClaw ready. Connect your first channel.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <CtaLogo />
          <h2>Clean energy starts<br/>with a <span style={{ color: "var(--sun-gold)" }}>message</span>.</h2>
          <p>Whether you're building projects or providing the services to build them, join the waitlist for the conversational operating system for renewable energy.</p>
          <a href="#talk" className="btn-primary" style={{ display: "inline-block" }} onClick={handleTalkClick}>Start the conversation</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sc-footer">
        <div className="footer-left">
          <FooterLogo />
          <span className="footer-wordmark"><span style={{ color: "var(--sun-gold)" }}>Sun</span><span style={{ color: "var(--lobster-coral)" }}>Claw</span></span>
          <span className="footer-copy">&copy; 2026 KIISHA Ltd. All rights reserved.</span>
        </div>
        <ul className="footer-links">
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="mailto:hello@sunclaw.ai">Contact</a></li>
        </ul>
        <span className="footer-lobster">🦞 the lobster way</span>
      </footer>
    </div>
  );
}
