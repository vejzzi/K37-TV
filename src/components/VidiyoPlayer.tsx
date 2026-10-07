import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize, RotateCcw, Volume2, VolumeX, Volume1 } from 'lucide-react';
import Hls from 'hls.js';

interface VidiyoPlayerProps {
  embedUrl?: string;
  showTitle?: string;
  showSubtitle?: string;
  timeString?: string;
  className?: string;
}

const HLS_PROXY_BASE = '/api/v1/streams';
// Zaštićena maskirana putanja — stvarni interni token je skriven na našem serveru
const HLS_MASTER_PLAYLIST = '/api/v1/live/k37.m3u8';

// Custom Hls.js loader that routes all segment and playlist requests through local proxy
class ProxyLoader extends Hls.DefaultConfig.loader {
  load(context: any, config: any, callbacks: any) {
    if (context.url && context.url.includes('playout.vidiyo.com/api/v1/streams')) {
      context.url = context.url.replace('https://playout.vidiyo.com/api/v1/streams', HLS_PROXY_BASE);
    }
    super.load(context, config, callbacks);
  }
}

export const VidiyoPlayer: React.FC<VidiyoPlayerProps> = ({
  showTitle,
  showSubtitle,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setReloadCount] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [soundTooltip, setSoundTooltip] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Global Context Menu & Fullscreen Listeners
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    // Hard block any right-click / context menu on player elements
    const handleContextMenu = (e: MouseEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Initialize Native HLS Video Stream (NO external iframe, NO "Watch on Vidiyo" link)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: Hls | null = null;

    const startPlayback = () => {
      video.volume = volume / 100;
      video.muted = isMuted;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts unmuted autoplay, start muted and allow 1-click unmute
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    };

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        loader: ProxyLoader as any,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hlsInstance;
      hlsInstance.loadSource(HLS_MASTER_PLAYLIST);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        startPlayback();
      });

      // Resilient Auto-Recovery without switching to external iframe
      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Network recovery attempt
              hlsInstance?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Media recovery attempt
              hlsInstance?.recoverMediaError();
              break;
            default:
              // Reconnect after brief pause
              setTimeout(() => {
                if (hlsInstance) {
                  hlsInstance.loadSource(HLS_MASTER_PLAYLIST);
                  hlsInstance.attachMedia(video);
                }
              }, 1500);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_MASTER_PLAYLIST;
      video.addEventListener('loadedmetadata', startPlayback);
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Synchronize native video volume state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVolumeEvent = () => {
      setIsMuted(video.muted || video.volume === 0);
      setVolume(Math.round(video.volume * 100));
    };

    video.addEventListener('volumechange', handleVolumeEvent);
    return () => video.removeEventListener('volumechange', handleVolumeEvent);
  }, []);

  // Audio Controls Handler (Direct hardware audio control)
  const handleToggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const video = videoRef.current;
    if (video) {
      video.muted = nextMuted;
      if (!nextMuted && video.volume === 0) {
        video.volume = 0.85;
        setVolume(85);
      }
      if (!nextMuted) {
        setSoundTooltip(true);
        setTimeout(() => setSoundTooltip(false), 2500);
      }
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);

    const video = videoRef.current;
    if (video) {
      video.volume = newVol / 100;
      if (newVol > 0) {
        video.muted = false;
        setIsMuted(false);
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    }
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleReload = () => {
    if (videoRef.current && hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.startLoad();
      videoRef.current.play().catch(() => {});
    }
    setReloadCount(prev => prev + 1);
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  // Click on video toggles mute or resumes audio
  const handleVideoClick = () => {
    if (isMuted) {
      handleToggleMute();
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setControlsVisible(true)}
      onMouseLeave={() => setControlsVisible(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      data-tv-player-container="true"
      className={`relative bg-black rounded-xl overflow-hidden select-none flex items-center justify-center group ${
        isFullscreen && !controlsVisible ? 'cursor-none' : ''
      } ${className}`}
    >
      {/* 
        16:9 Broadcast Picture Container:
        Always maintains correct aspect ratio and centers video signal.
      */}
      <div 
        data-tv-video-screen="true"
        className="relative w-full h-full max-w-full max-h-full aspect-video flex items-center justify-center m-auto overflow-hidden bg-black"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        
        {/* 
          100% CLEAN NATIVE VIDEO ELEMENT:
          - No iframe
          - No "Watch on Vidiyo" link or overlay
          - No redirection to external site
          - Hardware audio controls connected directly to soundcard
        */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          onClick={handleVideoClick}
          onDoubleClick={toggleFullscreen}
          className="w-full h-full object-contain bg-black cursor-pointer"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        />

        {/* 
          OFFICIAL TV LOGO WATERMARK OVERLAY (D.O.G. - Digital On-screen Graphic)
          - Transparent PNG badge watermark over video playout
          - pointer-events-none ensures zero interference with clicks, pause, volume, fullscreen
          - Positioned 6.5% from top and right (nudged further down and left) with 70% opacity
        */}
        <div 
          className={`absolute top-[6.5%] right-[6.5%] z-25 pointer-events-none select-none transition-all duration-300 ${
            isFullscreen 
              ? 'w-28 sm:w-36 md:w-44 lg:w-48' 
              : 'w-20 sm:w-26 md:w-32 lg:w-36'
          }`}
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.75))'
          }}
        >
          <img
            id="tv-logo-overlay"
            src="/k37_gradient_logo_badge.png"
            alt="Televizija K37"
            className="w-full h-auto object-contain rounded-md border border-white/10 shadow-xl block opacity-70"
            style={{ opacity: 0.7 }}
          />
        </div>

        {/* 
          PROMINENT SOUND COMMAND (Top-Left Highlight):
          Clear, visible button to easily turn on audio.
        */}
        {(!isFullscreen || controlsVisible) && (
          <div className="absolute top-3 left-3 z-30 pointer-events-auto transition-opacity duration-200">
            <button
              onClick={handleToggleMute}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-xs shadow-2xl transition-all duration-200 cursor-pointer transform active:scale-95 border ${
                isMuted
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/60 border-red-400'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 backdrop-blur-md'
              }`}
              title={isMuted ? 'Zvuk je utišan - Kliknite da uključite zvuk' : 'Zvuk je uključen'}
              aria-label={isMuted ? 'Uključi zvuk' : 'Isključi zvuk'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span className="font-black uppercase tracking-wider">UKLJUČI ZVUK</span>
                </>
              ) : (
                <>
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 50 ? (
                    <Volume1 className="w-4 h-4 text-slate-200" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-bold text-slate-100">Ton: {volume}%</span>
                </>
              )}
            </button>

            {/* Helpful Sound Activated Tooltip */}
            {soundTooltip && (
              <div className="absolute top-11 left-0 bg-slate-950/95 text-white text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95">
                Zvuk je aktiviran!
              </div>
            )}
          </div>
        )}

        {/* Lower-Third Show Title Banner (Hidden in fullscreen) */}
        {!isFullscreen && showTitle && (
          <div className={`absolute bottom-16 left-[3%] z-30 pointer-events-none max-w-lg transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 sm:opacity-85'
          }`}>
            <div className="bg-[#0a0d14]/90 border-l-4 border-red-600 px-3.5 py-2 rounded-r-lg backdrop-blur-md shadow-2xl">
              <span className="text-white font-bold text-xs sm:text-sm block truncate drop-shadow-sm">
                {showTitle}
              </span>
              {showSubtitle && (
                <span className="text-slate-300 text-[11px] sm:text-xs block truncate mt-0.5">
                  {showSubtitle}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 
          BOTTOM CONTROLS BAR:
          Volume slider, reload and fullscreen toggle.
        */}
        <div className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 sm:p-4 flex items-center justify-between text-white transition-opacity duration-300 pointer-events-none ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Left: Volume Slider */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
              <button
                onClick={handleToggleMute}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Uključi zvuk' : 'Utišaj'}
                aria-label={isMuted ? 'Uključi zvuk' : 'Utišaj'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4 text-slate-200" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                title={`Podesi jačinu tona: ${isMuted ? 0 : volume}%`}
                aria-label="Podešavanje jačine tona"
              />
              <span className="text-[11px] font-mono font-bold text-slate-200 w-8 text-right">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>
          </div>

          {/* Right: Broadcast Utility Actions */}
          <div className="flex items-center gap-2 pointer-events-auto ml-auto">
            {/* Reload Signal button */}
            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer shadow-md"
              title="Osveži TV signal uživo"
              aria-label="Osveži TV signal uživo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer shadow-md"
              title={isFullscreen ? 'Izađi iz punog ekrana' : 'Puni ekran (Fullscreen)'}
              aria-label={isFullscreen ? 'Izađi iz punog ekrana' : 'Puni ekran (Fullscreen)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
