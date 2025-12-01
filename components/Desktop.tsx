
import React, { useState, useRef } from 'react';
import { CpuState, Program, ThemeColors, VirtualFile, ThemeName } from '../types';
import { Terminal, Folder, Settings, Play, Search, Monitor, Code, Music, Image as ImageIcon, Disc, Globe, ArrowLeft, ArrowRight, RotateCcw, Home, X } from 'lucide-react';
import { BRANDING } from '../constants';

interface DesktopProps {
  theme: ThemeColors;
  setThemeName: (name: any) => void;
  runProgram: (prog: Program) => void;
  cpu: CpuState;
  files: VirtualFile[];
  onInteract: (action: string) => void; // New prop for backend connection
}

export const Desktop: React.FC<DesktopProps> = ({ theme, setThemeName, runProgram, cpu, files, onInteract }) => {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<VirtualFile | null>(null);

  // --- BROWSER ENGINE STATE ---
  const [browserUrl, setBrowserUrl] = useState('https://www.bing.com');
  const [iframeSrc, setIframeSrc] = useState('https://www.bing.com');
  const [history, setHistory] = useState<string[]>(['https://www.bing.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // File System Navigation State
  const [currentDir, setCurrentDir] = useState<VirtualFile[]>(files);
  const [path, setPath] = useState<string[]>(['/']);

  const handleOpen = (file: VirtualFile) => {
    onInteract(`READ_FILE: ${file.name}`); // Simulate disk read
    if (file.type === 'dir') {
      setCurrentDir(file.children || []);
      setPath([...path, file.name]);
    } else {
      setCurrentFile(file);
      if (file.name.endsWith('.mp3')) {
          setActiveWindow('MEDIA_PLAYER');
          onInteract(`ALLOC_AUDIO_BUFFER`);
      }
      else if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
          setActiveWindow('IMAGE_VIEWER');
          onInteract(`ALLOC_VIDEO_RAM`);
      }
      else {
          setActiveWindow('NOTEPAD');
          onInteract(`LOAD_TEXT_EDITOR`);
      }
    }
  };

  const goBack = () => {
    onInteract('NAVIGATE_UP');
    setCurrentDir(files);
    setPath(['/']);
  };

  const openWindow = (id: string, syscall: string) => {
      onInteract(syscall);
      setActiveWindow(id);
      if(id === 'FILES') {
          setCurrentDir(files); 
          setPath(['/']);
      }
  };

  // --- BROWSER LOGIC ---

  const processUrl = (input: string): string => {
    let url = input;
    const lower = url.toLowerCase();

    // 1. YouTube / Video Intent
    const isUrl = url.includes('.') && !url.includes(' ');
    if (!isUrl && (lower.includes('youtube') || lower.includes('video') || lower.includes('watch'))) {
        let query = url.replace(/youtube.com|youtube|watch|video|on/gi, ' ').trim();
        if (query.length < 2) query = "lofi hip hop radio"; 
        return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`;
    }

    // 2. Search Query (No TLD) -> Bing Search
    if (!isUrl && !url.startsWith('http') && !url.includes('localhost')) {
        return `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    }

    // 3. Protocol Fixer
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    // 4. YouTube Embed Fixer
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        if (url.includes('watch?v=')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        } else if (!url.includes('embed')) {
            return 'https://www.youtube.com/embed?listType=search&list=technology+lofi&autoplay=1'; 
        }
    }

    // 5. Google Embed Hack (Force igu=1 to allow iframing)
    if (url.includes('google.com') && !url.includes('igu=1')) {
         return url.includes('?') ? url + '&igu=1' : url + '?igu=1';
    }

    return url;
  };

  const handleNavigate = (overrideUrl?: string) => {
    const rawUrl = overrideUrl || browserUrl;
    const processedUrl = processUrl(rawUrl);

    if (processedUrl !== iframeSrc) {
        // Update History
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(processedUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setIframeSrc(processedUrl);
        setBrowserUrl(processedUrl); // Show processed URL in bar
        setIsLoading(true);
        onInteract(`NET_REQ: GET ${processedUrl}`);
    }
  };

  const browserBack = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const url = history[newIndex];
          setHistoryIndex(newIndex);
          setIframeSrc(url);
          setBrowserUrl(url);
          onInteract('NAVIGATE_BACK');
      }
  };

  const browserForward = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const url = history[newIndex];
          setHistoryIndex(newIndex);
          setIframeSrc(url);
          setBrowserUrl(url);
          onInteract('NAVIGATE_FWD');
      }
  };

  const browserReload = () => {
      setIsLoading(true);
      const current = iframeRef.current;
      if (current) current.src = iframeSrc;
      onInteract('RELOAD_PAGE');
  };

  const Window = ({ title, children, onClose, wClass = "w-3/4 max-w-2xl h-3/4" }: any) => (
    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${wClass} bg-gray-900/95 border border-${theme.primary} shadow-${theme.glow} rounded-lg flex flex-col overflow-hidden animate-fade-in z-30`}>
      <div className={`bg-gray-800/80 p-2 flex justify-between items-center border-b border-gray-700`}>
        <span className={`text-${theme.text} font-bold flex items-center gap-2 text-sm uppercase tracking-wider`}>
          <div className={`w-3 h-3 rounded-full bg-${theme.primary} shadow-[0_0_10px_currentColor]`}></div>
          {title}
        </span>
        <button onClick={() => { onInteract(`CLOSE_WINDOW: ${title}`); onClose(); }} className="text-gray-500 hover:text-red-400 font-bold px-2 transition-colors">✕</button>
      </div>
      <div className="flex-1 p-0 overflow-auto text-sm text-gray-300 relative flex flex-col">
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col select-none">
      {/* Wallpaper */}
      <div className={`absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-${theme.secondary} z-0 transition-colors duration-1000`}>
        {wallpaper ? (
          <img src={wallpaper} alt="Wallpaper" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full opacity-50" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        )}
      </div>
      
      {/* Wallpaper overlay for theme tint */}
      <div className={`absolute inset-0 bg-${theme.bg}/40 z-0 pointer-events-none`}></div>

      {/* Desktop Icons */}
      <div className="relative z-10 p-6 grid grid-cols-1 gap-8 w-24">
        
        <button onClick={() => openWindow('PROGRAMS', 'EXEC_PROG_MAN')} className="group flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-xl bg-gray-800/60 border border-${theme.primary} flex items-center justify-center group-hover:bg-${theme.primary}/20 group-hover:scale-105 transition-all shadow-lg`}>
            <Code className={`text-${theme.accent} w-8 h-8`} />
          </div>
          <span className="text-xs font-semibold text-shadow-sm text-white bg-black/50 px-2 rounded">Programs</span>
        </button>

        <button onClick={() => openWindow('FILES', 'MOUNT_DRIVE_C')} className="group flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-xl bg-gray-800/60 border border-${theme.primary} flex items-center justify-center group-hover:bg-${theme.primary}/20 group-hover:scale-105 transition-all shadow-lg`}>
            <Folder className={`text-${theme.accent} w-8 h-8`} />
          </div>
          <span className="text-xs font-semibold text-shadow-sm text-white bg-black/50 px-2 rounded">My PC</span>
        </button>

        <button onClick={() => openWindow('BROWSER', 'INIT_NET_STACK')} className="group flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-xl bg-gray-800/60 border border-${theme.primary} flex items-center justify-center group-hover:bg-${theme.primary}/20 group-hover:scale-105 transition-all shadow-lg`}>
            <Globe className={`text-${theme.accent} w-8 h-8`} />
          </div>
          <span className="text-xs font-semibold text-shadow-sm text-white bg-black/50 px-2 rounded">Internet</span>
        </button>

        <button onClick={() => openWindow('ABOUT', 'SYS_INFO_REQ')} className="group flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-xl bg-gray-800/60 border border-${theme.primary} flex items-center justify-center group-hover:bg-${theme.primary}/20 group-hover:scale-105 transition-all shadow-lg`}>
            <Monitor className={`text-${theme.accent} w-8 h-8`} />
          </div>
          <span className="text-xs font-semibold text-shadow-sm text-white bg-black/50 px-2 rounded">System</span>
        </button>

      </div>

      {/* --- WINDOWS --- */}

      {/* Programs Window */}
      {activeWindow === 'PROGRAMS' && (
        <Window title="Program Execution Manager" onClose={() => setActiveWindow(null)}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-4">
              <div className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-700/80 cursor-pointer border border-gray-600 transition-all hover:border-green-400 group"
                   onClick={() => { onInteract('LOAD_BIN_ADD'); runProgram({name: 'Addition', description: '', instructions: []} as any); setActiveWindow(null); }}>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Play size={24} className="text-green-400"/>
                  </div>
                  <h3 className="font-bold text-white text-lg">Addition</h3>
                  <p className="text-xs text-gray-400 mt-2">Registers & ALU Math Simulation</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-700/80 cursor-pointer border border-gray-600 transition-all hover:border-yellow-400 group"
                   onClick={() => { onInteract('LOAD_BIN_SEARCH'); runProgram({name: 'Search', description: '', instructions: []} as any); setActiveWindow(null); }}>
                   <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search size={24} className="text-yellow-400"/>
                   </div>
                  <h3 className="font-bold text-white text-lg">Memory Scan</h3>
                  <p className="text-xs text-gray-400 mt-2">Find value '99' in RAM blocks.</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-700/80 cursor-pointer border border-gray-600 transition-all hover:border-purple-400 group"
                   onClick={() => { onInteract('LOAD_BIN_SORT'); runProgram({name: 'Sorting', description: '', instructions: []} as any); setActiveWindow(null); }}>
                   <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Code size={24} className="text-purple-400"/>
                   </div>
                  <h3 className="font-bold text-white text-lg">Data Sort</h3>
                  <p className="text-xs text-gray-400 mt-2">Visual Bubble Sort Algorithm.</p>
              </div>
           </div>
        </Window>
      )}

      {/* File Explorer */}
      {activeWindow === 'FILES' && (
        <Window title={`Explorer - ${path.join('/')}`} onClose={() => setActiveWindow(null)}>
           <div className="p-2 bg-gray-800 border-b border-gray-700 mb-2 text-xs text-gray-500 flex gap-2 sticky top-0">
             <button onClick={goBack} className="hover:text-white px-2 py-1 bg-gray-700/50 rounded flex items-center gap-1"><ArrowLeft size={10}/> Up</button>
             <div className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 flex items-center">{path.join('/')}</div>
           </div>
           <div className="grid grid-cols-4 gap-4 p-4">
             {currentDir.map((f, i) => (
               <div key={i} onDoubleClick={() => handleOpen(f)} className="flex flex-col items-center gap-2 p-4 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group">
                 {f.type === 'dir' ? (
                   <Folder size={40} className="text-yellow-500 group-hover:scale-110 transition-transform"/>
                 ) : f.name.endsWith('.mp3') ? (
                   <Music size={40} className="text-pink-500 group-hover:scale-110 transition-transform"/>
                 ) : f.name.endsWith('.jpg') ? (
                   <ImageIcon size={40} className="text-blue-400 group-hover:scale-110 transition-transform"/>
                 ) : (
                   <Terminal size={40} className="text-gray-400 group-hover:scale-110 transition-transform"/>
                 )}
                 <span className="text-xs text-center break-all">{f.name}</span>
               </div>
             ))}
           </div>
        </Window>
      )}

      {/* Web Browser */}
      {activeWindow === 'BROWSER' && (
        <Window title="Iffi Explorer" onClose={() => setActiveWindow(null)} wClass="w-full h-full max-w-5xl max-h-[85%]">
            <div className="flex flex-col h-full bg-gray-200">
               {/* Nav Bar */}
               <div className="flex flex-col gap-1 bg-gray-100 p-2 border-b border-gray-300 shadow-sm">
                   <div className="flex gap-2 items-center">
                      <button onClick={browserBack} disabled={historyIndex === 0} className="text-gray-600 hover:text-black disabled:opacity-30"><ArrowLeft size={18}/></button>
                      <button onClick={browserForward} disabled={historyIndex === history.length - 1} className="text-gray-600 hover:text-black disabled:opacity-30"><ArrowRight size={18}/></button>
                      <button onClick={browserReload} className="text-gray-600 hover:text-black"><RotateCcw size={16}/></button>
                      <button onClick={() => handleNavigate('https://www.bing.com')} className="text-gray-600 hover:text-black"><Home size={16}/></button>
                      
                      <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={browserUrl} 
                            onChange={(e) => setBrowserUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                            className={`w-full bg-white text-gray-800 text-xs p-2 rounded-full border border-gray-300 focus:border-blue-500 focus:outline-none shadow-inner`} 
                            placeholder="Type URL or search..."
                        />
                      </div>
                      <button onClick={() => handleNavigate()} className={`text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow`}>GO</button>
                   </div>
                   
                   {/* Bookmarks Bar */}
                   <div className="flex gap-4 px-2 pt-1 border-t border-gray-200 mt-1">
                      <button onClick={() => handleNavigate('https://www.bing.com')} className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-black"><Globe size={10}/> Bing</button>
                      <button onClick={() => handleNavigate('https://en.wikipedia.org')} className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-black"><Globe size={10}/> Wikipedia</button>
                      <button onClick={() => handleNavigate('https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&rel=0&modestbranding=1')} className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-black"><Music size={10}/> Lofi Music</button>
                      <button onClick={() => handleNavigate('https://www.shadcn.com')} className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-black"><Code size={10}/> Docs</button>
                   </div>
               </div>
               
               {/* Browser Content */}
               <div className="flex-1 bg-white relative">
                   {/* Loading Bar */}
                   {isLoading && (
                       <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-20">
                           <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite]"></div>
                       </div>
                   )}

                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                       <div className="flex flex-col items-center">
                           <Globe size={64} className="mb-4 opacity-20"/>
                           <span className="text-sm">Iffi Secure Browser</span>
                           <span className="text-xs opacity-60 mt-1">Sandboxed Environment</span>
                       </div>
                   </div>
                   
                   <iframe 
                     ref={iframeRef}
                     src={iframeSrc} 
                     title="Browser" 
                     className="w-full h-full relative z-10"
                     // CRITICAL: Sandbox prevents frame busting (redirecting the simulator)
                     sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation allow-modals"
                     referrerPolicy="no-referrer"
                     allowFullScreen
                     onLoad={() => setIsLoading(false)}
                   />
               </div>
               <div className="bg-gray-100 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between px-2 py-0.5">
                   <span>TLS 1.3 Encrypted</span>
                   <span>Restricted Mode: Active</span>
               </div>
            </div>
        </Window>
      )}

      {/* Image Viewer */}
      {activeWindow === 'IMAGE_VIEWER' && currentFile && (
        <Window title={currentFile.name} onClose={() => setActiveWindow(null)} wClass="w-auto h-auto max-w-[90%] max-h-[90%]">
          <div className="flex flex-col items-center gap-4 p-4">
             <img src={currentFile.contentUrl || 'https://via.placeholder.com/400'} alt="View" className="max-h-[60vh] rounded border border-gray-700" />
             <div className="flex gap-4">
               <button 
                 onClick={() => { onInteract('SET_WALLPAPER'); setWallpaper(currentFile.contentUrl || null); }}
                 className={`bg-${theme.primary} hover:bg-${theme.secondary} text-black font-bold py-2 px-4 rounded text-xs transition-colors`}
               >
                 Set as Wallpaper
               </button>
               <span className="text-gray-500 text-xs self-center">Dimensions: 1920x1080 (Simulated)</span>
             </div>
          </div>
        </Window>
      )}

      {/* Media Player */}
      {activeWindow === 'MEDIA_PLAYER' && currentFile && (
        <Window title="Iffi Media Player" onClose={() => setActiveWindow(null)} wClass="w-96 h-auto">
          <div className="flex flex-col items-center gap-6 py-6 p-4">
             <div className="w-32 h-32 bg-gray-800 rounded-full border-4 border-gray-700 flex items-center justify-center animate-spin-slow shadow-lg">
                <Disc size={64} className={`text-${theme.primary}`} />
             </div>
             <div className="text-center">
               <h3 className="font-bold text-white">{currentFile.name}</h3>
               <p className="text-xs text-gray-500">Artist: Unknown</p>
             </div>
             <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full w-1/3 bg-${theme.primary} animate-pulse`}></div>
             </div>
             <div className="flex gap-6 text-white">
                <button onClick={() => onInteract('MEDIA_SEEK')} className="hover:text-cyan-400">⏮</button>
                <button onClick={() => onInteract('MEDIA_PAUSE')} className="hover:text-cyan-400 text-2xl">⏸</button>
                <button onClick={() => onInteract('MEDIA_SKIP')} className="hover:text-cyan-400">⏭</button>
             </div>
          </div>
        </Window>
      )}

      {/* Notepad */}
      {activeWindow === 'NOTEPAD' && currentFile && (
        <Window title={currentFile.name} onClose={() => setActiveWindow(null)}>
          <textarea 
            className="w-full h-full bg-gray-950 text-green-400 font-mono p-4 text-sm resize-none focus:outline-none"
            defaultValue={currentFile.content}
            readOnly
          />
        </Window>
      )}

      {/* About Window */}
      {activeWindow === 'ABOUT' && (
        <Window title="System Information" onClose={() => setActiveWindow(null)}>
           <div className="text-center space-y-6 p-8">
             <div className="mb-4">
                <h1 className="text-3xl font-bold text-white tracking-widest">{BRANDING.company}</h1>
                <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">Virtual Systems</p>
             </div>
             
             <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" alt="Dev" className="w-full h-full object-cover opacity-80" />
                </div>
                <p className="text-gray-300">Developed By <span className={`text-${theme.primary} font-bold`}>{BRANDING.developer}</span></p>
             </div>

             <div className="text-xs text-gray-500 bg-black/40 p-6 rounded-lg border border-gray-800 mx-auto max-w-sm text-left space-y-2">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                   <span>Role</span>
                   <span className="text-gray-300">{BRANDING.role}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                   <span>Contact</span>
                   <span className="text-gray-300">{BRANDING.phone}</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span>Web</span>
                   <a href={BRANDING.website} target="_blank" className="text-blue-400 hover:underline">iffi.dev</a>
                </div>
             </div>
             <div className="text-[10px] text-gray-600">
                Inspiration: {BRANDING.inspiration} | Mentor: {BRANDING.teacher}
             </div>
           </div>
        </Window>
      )}

      {/* Taskbar */}
      <div className={`mt-auto h-12 bg-black/90 border-t border-${theme.primary} flex items-center px-4 justify-between backdrop-blur-md z-40 shadow-2xl`}>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => { onInteract('TOGGLE_START_MENU'); setActiveWindow(activeWindow ? null : 'PROGRAMS'); }}
             className={`flex items-center gap-2 px-3 py-1 rounded hover:bg-${theme.primary}/20 transition-colors`}>
            <div className={`w-4 h-4 rounded-sm bg-${theme.primary} animate-pulse`}></div>
            <span className={`font-bold text-${theme.primary} tracking-widest text-sm`}>START</span>
          </button>
          
          <div className="h-6 w-[1px] bg-gray-700 mx-2"></div>
          
          <div className="hidden md:flex gap-4 text-xs font-mono text-gray-400">
             <span>CPU: {Math.round(cpu.cycleCount % 100)}%</span>
             <span>MEM: {Math.floor(128 + Math.random() * 64)}MB</span>
             <span className="text-yellow-600">TEMP: {cpu.temperature.toFixed(0)}°C</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Theme Switcher */}
          <div className="flex gap-2 bg-gray-800/50 p-1 rounded-full border border-gray-700">
             {(['neon-cyan', 'cyber-purple', 'fire-orange', 'matrix-green', 'royal-gold'] as ThemeName[]).map((t) => (
                <button 
                  key={t} 
                  onClick={() => { onInteract(`THEME_SWITCH_${t.toUpperCase()}`); setThemeName(t); }}
                  title={t}
                  className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${t === 'neon-cyan' ? 'bg-cyan-500' : t === 'cyber-purple' ? 'bg-purple-500' : t === 'fire-orange' ? 'bg-orange-500' : t === 'matrix-green' ? 'bg-green-500' : 'bg-yellow-500'}`}
                />
             ))}
          </div>
          <span className="text-xs text-gray-400 font-mono">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </div>
  );
};
