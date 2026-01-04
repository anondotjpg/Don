'use client';

export function Actions95() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 18,
        right: 12,
        width: 220,
        background: '#c0c0c0',
        fontFamily: 'VT323, monospace',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderRight: '2px solid #404040',
        borderBottom: '2px solid #404040',
        zIndex: 9999,
      }}
    >
        {/* Title bar */}
        <div
            style={{
                background: 'linear-gradient(90deg, #000080, #1084d0)',
                color: '#fff',
                padding: '4px 6px',
                fontSize: 16,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
            }}
        >
            Actions
        </div>


      {/* Content */}
      <div
        style={{
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Swap button */}
        <Win95Button>
          SWAP
        </Win95Button>

        {/* Kick button (forced black icon) */}
        <Win95Button>
          <img
            src="/kick.png"
            alt="Kick"
            style={{
              height: 18,
              imageRendering: 'pixelated',
              filter: 'brightness(0) saturate(100%)',
              opacity: 0.85,
            }}
          />
        </Win95Button>
      </div>
    </div>
  );
}

function Win95Button({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        disabled
        style={{
          width: '100%',
          padding: '6px 0',
          background: '#e0e0e0',
          color: '#262626',
          fontFamily: 'VT323, monospace',
          fontSize: 16,
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,

          /* Sunken disabled Win95 look */
          borderTop: '2px solid #808080',
          borderLeft: '2px solid #808080',
          borderRight: '2px solid #fff',
          borderBottom: '2px solid #fff',
        }}
      >
        {children}
      </button>

      {/* SOON badge */}
      <span
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          background: '#ffff80',
          color: '#000',
          fontSize: 12,
          padding: '1px 4px',
          borderTop: '1px solid #fff',
          borderLeft: '1px solid #fff',
          borderRight: '1px solid #404040',
          borderBottom: '1px solid #404040',
        }}
      >
        SOON
      </span>
    </div>
  );
}
