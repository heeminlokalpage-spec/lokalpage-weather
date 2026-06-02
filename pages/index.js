import WeatherWidget from '../components/WeatherWidget';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF8F0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '40px 20px',
      fontFamily: "'Nanum Gothic', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
      }}>
        <p style={{
          fontSize: 13,
          color: '#A07030',
          marginBottom: 12,
          fontWeight: 700,
        }}>
          🌴 LOKALPAGE 날씨 아이콘(버튼) 구현
        </p>
        <WeatherWidget />
      </div>
    </div>
  );
}
