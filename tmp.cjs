const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const p1 = code.indexOf('{/* Dynamic Video Rendering */}');
const p2 = code.indexOf('{/* File Conversion Download Button */}');

if (p1 === -1 || p2 === -1) {
    console.error("Could not find delimiters!");
    process.exit(1);
}

const replacement = `                            {/* Dynamic Video Rendering */}
                            {msg.videoUrl && (
                              <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-opacity pointer-events-none">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AISA Generated Video</span>
                                  </div>
                                </div>

                                {msg.videoUrl && (msg.videoUrl.includes('pollinations.ai')) ? (
                                  <div className="relative w-full aspect-video bg-[#050505] rounded-xl overflow-hidden group/media">
                                    <img
                                      key={msg.videoUrl}
                                      src={msg.videoUrl}
                                      style={{ opacity: 0 }}
                                      className="w-full h-full object-contain transition-opacity duration-700"
                                      alt="AISA Visual Content"
                                      loading="eager"
                                      onLoad={(e) => {
                                        e.target.style.opacity = 1;
                                        const shimmer = e.target.parentElement.querySelector('.shimmer-overlay');
                                        if (shimmer) shimmer.style.display = 'none';
                                      }}
                                      onError={(e) => {
                                        console.log("Image failed, showing retry UI");
                                        e.target.style.display = 'none';
                                        const retryUI = e.target.parentElement.querySelector('.retry-overlay');
                                        if (retryUI) retryUI.style.display = 'flex';
                                      }}
                                    />
                                    <div className="retry-overlay absolute inset-0 hidden flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all">
                                      <p className="text-white/60 text-[10px] font-bold uppercase mb-2">Failed to load content</p>
                                      <button
                                        onClick={(e) => {
                                          const parent = e.currentTarget.parentElement.parentElement;
                                          const img = parent.querySelector('img');
                                          img.style.display = 'block';
                                          img.style.opacity = 0;
                                          img.src = img.src.split('?')[0] + '?retry=' + Date.now();
                                          e.currentTarget.parentElement.style.display = 'none';
                                        }}
                                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 rounded-lg text-[10px] font-bold uppercase transition-all"
                                      >
                                        Retry Loading
                                      </button>
                                    </div>
                                    <div className="shimmer-overlay absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                  </div>
                                ) : (
                                  <video
                                    src={msg.videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full max-w-full h-auto min-h-[200px] object-contain rounded-xl bg-black/5"
                                  />
                                )}

                                <button
                                  onClick={() => handleDownload(msg.videoUrl, msg.videoUrl.includes('pollinations.ai') ? 'aisa-generated-asset.jpg' : 'aisa-generated-video.mp4')}
                                  className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-100 sm:scale-90 sm:group-hover/generated:scale-100 z-20"
                                  title="Download Video"
                                >
                                  <div className="flex items-center gap-2 px-1">
                                    <Download className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Download</span>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* Dynamic Image Rendering */}
                            {msg.imageUrl && (
                              <div
                                className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm cursor-zoom-in max-w-md"
                                onClick={() => setViewingDoc({ url: msg.imageUrl, type: 'image', name: 'Generated Image' })}
                              >
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AISA Generated Asset</span>
                                  </div>
                                </div>
                                <img
                                  src={msg.imageUrl}
                                  className="w-full h-auto rounded-xl bg-black/5 min-h-[100px]"
                                  alt="AISA Generated"
                                  onError={(e) => {
                                    console.error("Image failed to load:", msg.imageUrl);
                                    e.target.style.display = 'none';
                                    const errDiv = document.createElement('div');
                                    errDiv.className = 'p-10 text-center text-xs text-subtext bg-surface/30 rounded-xl';
                                    errDiv.innerText = 'Image expired or failed to load. Please try regenerating.';
                                    if(e.target.parentElement) e.target.parentElement.appendChild(errDiv);
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(msg.imageUrl, 'aiva-generated.png');
                                  }}
                                  className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-100 sm:scale-90 sm:group-hover/generated:scale-100"
                                  title="Download High-Res"
                                >
                                  <div className="flex items-center gap-2 px-1">
                                    <Download className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Download</span>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* Dynamic Audio Rendering */}
                            {msg.audioUrl && (
                              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 mt-4 shadow-sm backdrop-blur-sm w-full max-w-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-primary/20 rounded-xl">
                                    <Music className="w-5 h-5 text-primary animate-bounce-slow" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-maintext uppercase tracking-widest block leading-none">AISA Generated Music</span>
                                    <span className="text-[10px] text-subtext font-medium">High-Fidelity Audio • AI Hall™</span>
                                  </div>
                                </div>
                                <audio
                                  controls
                                  className="w-full h-10 accent-primary rounded-lg"
                                  src={msg.audioUrl}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleDownload(msg.audioUrl, 'aisa-generated-music.mp3')}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-all uppercase tracking-tighter"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download MP3
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      `;

code = code.substring(0, p1) + replacement + code.substring(p2);
fs.writeFileSync('src/pages/Chat.jsx', code);
console.log('Done replacement!');
