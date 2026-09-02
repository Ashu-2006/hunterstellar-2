import logo from '../assets/hunterstellar-logo.svg'

const LOGO_RATIO = 61 / 327

export function HunterstellarLogo({
  width = 280,
  className = '',
  suffix = '2.0',
  showSuffix = true,
}) {
  const height = Math.round(width * LOGO_RATIO)

  return (
    <span
      className={`inline-flex items-baseline select-none ${className}`}
      style={{ fontSize: height }}
      suppressHydrationWarning
    >
      <img
        src={logo}
        alt="Hunterstellar 2.0"
        draggable="false"
        width={width}
        height={height}
        className="inline-block shrink-0"
        style={{ display: 'inline-block' }}
      />
      {showSuffix && (
        <span
          className="leading-none"
          style={{
            fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 700,
            color: '#f6f6f6',
            fontStyle: 'italic',
            marginLeft: Math.round(height * 0.28),
            transform: 'translateY(-0.02em)',
          }}
        >
          {suffix}
        </span>
      )}
    </span>
  )
}
