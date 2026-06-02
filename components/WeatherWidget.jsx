import { useState, useEffect, useRef } from "react";

const LOCATIONS = {
  cebu:  { lat: 10.3157, lng: 123.8854, name: "세부",  emoji: "🌴", label: "CEBU",  liveUrl: "https://www.youtube.com/embed/oitazgXYjhc?autoplay=1&mute=1", liveLabel: "모알보알 앞바다" },
  bohol: { lat: 9.6496,  lng: 123.8530, name: "보홀",  emoji: "🐟", label: "BOHOL", liveUrl: "https://www.youtube.com/embed/ZS_LhvB7V-w?autoplay=1&mute=1", liveLabel: "알로나 비치 입구" },
  bali:  { lat: -8.6500, lng: 115.2167, name: "발리",  emoji: "🌺", label: "BALI",  liveUrl: "https://www.youtube.com/embed/L1duJDAqbJY?autoplay=1&mute=1",  liveLabel: "발리 라이브" },
};

const WMO = {
  0:["☀️","맑음"], 1:["🌤️","대체로 맑음"], 2:["⛅","약간 흐림"], 3:["☁️","흐림"],
  45:["🌫️","안개"], 48:["🌫️","안개"],
  51:["🌦️","이슬비"], 53:["🌦️","이슬비"], 55:["🌦️","이슬비"],
  61:["🌧️","비"], 63:["🌧️","비"], 65:["🌧️","폭우"],
  80:["🌦️","소나기"], 81:["🌧️","소나기"], 82:["⛈️","강한 소나기"],
  95:["⛈️","뇌우"], 96:["⛈️","우박"], 99:["⛈️","우박"],
};

const DUMMY = {
  cebu: {
    current: { temperature_2m:31, apparent_temperature:36, weathercode:1, relativehumidity_2m:78, windspeed_10m:14 },
    daily: { time:["2025-06-01","2025-06-02","2025-06-03","2025-06-04","2025-06-05"], weathercode:[0,1,2,61,80], temperature_2m_max:[33,32,31,29,30], temperature_2m_min:[26,25,25,24,25], precipitation_probability_max:[5,10,25,70,45] },
  },
  bohol: {
    current: { temperature_2m:30, apparent_temperature:34, weathercode:2, relativehumidity_2m:82, windspeed_10m:11 },
    daily: { time:["2025-06-01","2025-06-02","2025-06-03","2025-06-04","2025-06-05"], weathercode:[1,2,3,80,61], temperature_2m_max:[31,30,30,28,29], temperature_2m_min:[25,25,24,24,24], precipitation_probability_max:[10,20,30,55,60] },
  },
  bali: {
    current: { temperature_2m:29, apparent_temperature:33, weathercode:0, relativehumidity_2m:70, windspeed_10m:18 },
    daily: { time:["2025-06-01","2025-06-02","2025-06-03","2025-06-04","2025-06-05"], weathercode:[0,0,1,2,80], temperature_2m_max:[31,32,31,30,29], temperature_2m_min:[24,24,24,23,23], precipitation_probability_max:[5,5,15,20,50] },
  },
};

const cache = {};
async function fetchWeather(loc) {
  if (cache[loc] && Date.now() - cache[loc].ts < 600000) return cache[loc].data;
  const { lat, lng } = LOCATIONS[loc];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weathercode,relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("err");
  const data = await res.json();
  cache[loc] = { ts: Date.now(), data };
  return data;
}

function getDayLabel(dateStr, index) {
  if (index === 0) return "Today";
  const d = new Date(dateStr + "T12:00:00+09:00");
  return `${d.getMonth()+1}/${d.getDate()}`;
}

const TAB_STYLES = {
  cebu:  { activeBg: "#D45F00", activeBorder: "#D45F00", inactiveBg: "#fff",       inactiveBorder: "#D45F00", activeText: "#fff", inactiveText: "#D45F00" },
  bohol: { activeBg: "#1F7A1F", activeBorder: "#1F7A1F", inactiveBg: "#fff",       inactiveBorder: "#1F7A1F", activeText: "#fff", inactiveText: "#1F7A1F" },
  bali:  { activeBg: "#A07800", activeBorder: "#A07800", inactiveBg: "#fff",       inactiveBorder: "#A07800", activeText: "#fff", inactiveText: "#A07800" },
};

export default function WeatherWidget() {
  const [open, setOpen]       = useState(false);
  const [loc, setLoc]         = useState("cebu");
  const [weather, setWeather] = useState(DUMMY["cebu"]);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);

  const loadWeather = (l) => {
    setWeather(DUMMY[l]);
    setLoading(true);
    fetchWeather(l)
      .then(d => { setWeather(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (open) loadWeather(loc); }, [open, loc]);

  const handleTab = (l) => { setLoc(l); loadWeather(l); };

  useEffect(() => {
    const fn = (e) => { if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const curIcon = weather ? (WMO[weather.current.weathercode] || ["⛅"])[0] : "⛅";

  const s = {
    font: { fontFamily: "'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif" },
  };

  return (
    <div style={{ ...s.font, position:"relative", display:"inline-block" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');
        .ww-popup::-webkit-scrollbar { width: 4px; }
        .ww-popup::-webkit-scrollbar-thumb { background: #D4A855; border-radius: 4px; }
        @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>

      {/* ── 트리거 버튼 ── */}
      <button onClick={() => setOpen(v => !v)} style={{
        display:"inline-flex", alignItems:"center", gap:5,
        background:"#FFF8F0", border:"2px solid #E8A050", borderRadius:20,
        padding:"5px 13px", cursor:"pointer",
        fontFamily:"'Nanum Gothic', sans-serif", fontSize:14, fontWeight:800, color:"#C46A00",
      }}>
        {curIcon} 날씨
      </button>

      {/* ── 팝업 ── */}
      {open && (
        <div ref={popupRef} className="ww-popup" style={{
          position:"absolute", top:"calc(100% + 10px)", left:0,
          zIndex:999, width:320,
          background:"#FFFDF7", border:"2.5px solid #D4A855",
          borderRadius:18, padding:16,
          boxShadow:"4px 5px 0 #D4A855",
          maxHeight:"88vh", overflowY:"auto",
          fontFamily:"'Nanum Gothic', sans-serif",
        }}>

          {/* ── 탭 ── */}
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {Object.entries(LOCATIONS).map(([key, val]) => {
              const active = loc === key;
              const t = TAB_STYLES[key];
              return (
                <button key={key} onClick={() => handleTab(key)} style={{
                  flex:1, padding:"9px 4px",
                  borderRadius:10,
                  border: `2.5px solid ${t.activeBorder}`,
                  background: active ? t.activeBg : t.inactiveBg,
                  color: active ? t.activeText : t.inactiveText,
                  fontFamily:"'Nanum Gothic', sans-serif",
                  fontSize:14, fontWeight:800,
                  cursor:"pointer", lineHeight:1.3,
                  boxShadow: active ? `0 3px 0 ${t.activeBorder}99` : "none",
                  transform: active ? "translateY(-2px)" : "none",
                  transition:"all 0.12s",
                }}>
                  <div style={{ fontSize:18 }}>{val.emoji}</div>
                  <div>{val.label}</div>
                  <div style={{ fontSize:11, fontWeight:400, opacity: active ? 0.85 : 0.7 }}>{val.name}</div>
                </button>
              );
            })}
          </div>

          {/* ── 날씨 콘텐츠 ── */}
          {(() => {
            const c = weather.current;
            const d = weather.daily;
            const [icon] = WMO[c.weathercode] || ["🌡️","알 수 없음"];
            const { liveUrl, liveLabel } = LOCATIONS[loc];

            // 온도 범위 (5일 전체 기준으로 정규화)
            const allMax = d.temperature_2m_max;
            const allMin = d.temperature_2m_min;
            const globalMin = Math.min(...allMin);
            const globalMax = Math.max(...allMax);
            const range = globalMax - globalMin || 1;

            return (
              <>

                {/* 5일 예보 */}
                <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                  {[0,1,2,3,4].map(i => {
                    const label = getDayLabel(d.time[i], i);
                    const [dIcon] = WMO[d.weathercode[i]] || ["🌡️"];
                    const hi = Math.round(d.temperature_2m_max[i]);
                    const lo = Math.round(d.temperature_2m_min[i]);
                    const rain = d.precipitation_probability_max[i] || 0;

                    // 정규화된 바 위치
                    const loPos  = ((lo - globalMin) / range) * 100;
                    const hiPos  = ((hi - globalMin) / range) * 100;
                    const barW   = Math.max(8, hiPos - loPos);

                    return (
                      <div key={i} style={{
                        display:"grid",
                        gridTemplateColumns:"44px 28px 1fr 46px",
                        alignItems:"center", gap:8,
                        background: i === 0 ? "#FFF4E0" : "#FFFBF0",
                        borderRadius:10,
                        border: i === 0 ? "1.5px solid #E8B060" : "1.5px solid #EDD090",
                        padding:"8px 12px",
                      }}>
                        {/* 날짜 */}
                        <span style={{
                          fontSize: i === 0 ? 13 : 13,
                          fontWeight: i === 0 ? 800 : 700,
                          color: i === 0 ? "#C46A00" : "#6A4200",
                        }}>{label}</span>

                        {/* 아이콘 */}
                        <span style={{ fontSize:18, textAlign:"center" }}>{dIcon}</span>

                        {/* 온도 바 */}
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:"#A07030", minWidth:24, textAlign:"right" }}>{lo}°</span>
                          <div style={{ flex:1, height:6, background:"#E8D8B0", borderRadius:3, position:"relative" }}>
                            <div style={{
                              position:"absolute", top:0, height:"100%",
                              borderRadius:3,
                              background:"linear-gradient(to right, #FFAA30, #FF4010)",
                              left:`${loPos}%`,
                              width:`${barW}%`,
                            }} />
                          </div>
                          <span style={{ fontSize:13, fontWeight:800, color:"#E05000", minWidth:24 }}>{hi}°</span>
                        </div>

                        {/* 강수 */}
                        <span style={{
                          fontSize:12, fontWeight:700, textAlign:"right",
                          color: rain >= 20 ? "#3070C0" : "#C0A870",
                        }}>
                          {rain >= 20 ? `🌧 ${rain}%` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 라이브 */}
                <div style={{ border:"2px solid #333", borderRadius:12, overflow:"hidden", background:"#111" }}>
                  <div style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"8px 12px", background:"#1a1a1a",
                  }}>
                    <span style={{
                      width:9, height:9, borderRadius:"50%",
                      background:"#FF2020",
                      display:"inline-block",
                      animation:"livepulse 1.2s ease-in-out infinite",
                    }} />
                    <span style={{ color:"#fff", fontSize:13, fontWeight:800, letterSpacing:1 }}>LIVE</span>
                    <span style={{ color:"#bbb", fontSize:13, fontWeight:700 }}>{liveLabel}</span>
                  </div>
                  <div style={{ position:"relative", paddingBottom:"56.25%", height:0 }}>
                    <iframe
                      key={loc}
                      src={liveUrl}
                      title={`${LOCATIONS[loc].name} 라이브`}
                      style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
