import React, { useState, useRef, useEffect, Fragment, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon, Cloud, HardDrive, Edit2, Download, Mic, Wand2, Eye, FileSpreadsheet, Presentation, File as FileIcon, MoreVertical, Trash2, Check, Camera, Video, Copy, ThumbsUp, ThumbsDown, Share, Search, Undo2, Menu as MenuIcon, Volume2, Pause, Headphones, MessageCircle, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Minus, MessageSquare, Calendar as CalendarIcon, Code, TrendingUp, ShieldCheck, ShoppingBag, Globe, DollarSign, Target, Database, Brain, Briefcase, Megaphone, Headset, GraduationCap, Bug, MapPin, Zap, Music, Stethoscope } from 'lucide-react';

import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { generateChatResponse } from '../services/aivaService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import { useRecoilState } from 'recoil';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';
import LiveAI from '../Components/LiveAI';
import { apiService } from '../services/apiService';

import ImageEditor from '../Components/ImageEditor';
import ModelSelector from '../Components/ModelSelector';
import axios from 'axios';
import { apis } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { detectMode, getModeName, getModeIcon, getModeColor, MODES } from '../utils/modeDetection';
import { getUserData, sessionsData, toggleState } from '../userStore/userData';
import { usePersonalization } from '../context/PersonalizationContext';


const getWelcomeMessage = (name) => `Hello! I’m ${name || 'AIVA'}™, your Artificial Intelligence Super Assistant.`;

const FEEDBACK_PROMPTS = {
  en: [
    "Was this helpful?",
    "How did I do?",
    "Is this answer detailed enough?",
    "Did I answer your question?",
    "Need anything else?",
    "Is this what you were looking for?",
    "Happy to help!",
    "Let me know if you need more info",
    "Any other questions?",
    "Hope this clears things up!"
  ],
  hi: [
    "क्या यह मददगार था?",
    "मैंने कैसा किया?",
    "क्या यह जवाब पर्याप्त है?",
    "क्या मैंने आपके सवाल का जवाब दिया?",
    "कुछ और चाहिए?",
    "क्या आप यही खोज रहे थे?",
    "मदद करके खुशी हुई!",
    "अगर और जानकारी चाहिए तो बताएं",
    "कोई और सवाल?",
    "उम्मीद है यह समझ आया!"
  ]
};

const TOOL_PRICING = {
  chat: {
    models: [
      { id: 'aiva-stable', name: 'AIVA Stable', price: 0, speed: 'Fast', description: 'Standard free model' }
    ]
  },
  image: {
    models: [
      { id: 'aiva-stable', name: 'AIVA Stable', price: 0, speed: 'Fast', description: 'Basic image analysis' },
      { id: 'aiva-pro', name: 'AIVA Pro Vision', price: 0.02, speed: 'Medium', description: 'Advanced image understanding' },
      { id: 'gpt4-vision', name: 'GPT-4 Vision', price: 0.05, speed: 'Slow', description: 'Premium image analysis' }
    ]
  },
  document: {
    models: [
      { id: 'aiva-stable', name: 'AIVA Stable', price: 0, speed: 'Fast', description: 'Basic document analysis' },
      { id: 'aiva-pro', name: 'AIVA Pro', price: 0.02, speed: 'Medium', description: 'Advanced document processing' },
      { id: 'gpt4', name: 'GPT-4', price: 0.03, speed: 'Medium', description: 'Premium document analysis' }
    ]
  },
  voice: {
    models: [
      { id: 'aiva-stable', name: 'AIVA Stable', price: 0, speed: 'Fast', description: 'Standard voice recognition' }
    ]
  }
};


const ImageViewer = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const imgRef = useRef(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 1));
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(s => Math.min(Math.max(1, s + delta), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers for Mobile/iOS
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && scale > 1) {
      // Drag start
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch Zoom
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = dist / lastTouchDistance;
      setScale(s => Math.min(Math.max(1, s * delta), 5));
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan
      e.preventDefault(); // Prevent scroll
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  // Reset position if zoomed out to 1
  useEffect(() => {
    if (scale === 1) {
      setPosition(prev => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }));
    }
  }, [scale]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black/90 select-none">
      {/* Zoom Controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal
      >
        <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Minus className="w-5 h-5" /></button>
        <span className="text-white text-sm font-bold font-mono min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><Plus className="w-5 h-5" /></button>
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Reset"><RotateCcw className="w-4 h-4" /></button>
      </div>

      <div
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/1e1e1e/FFF?text=Image+Load+Failed';
            toast.error("Failed to load image preview");
          }}
        />
      </div>
    </div>
  );
};

const getToolIcon = (slug) => {
  switch (slug) {
    case 'tool-image-gen': return ImageIcon;
    case 'tool-image-editing-customization': return Edit2;
    case 'tool-deep-search': return Search;
    case 'tool-audio-convert': return Headphones;
    case 'tool-universal-converter': return FileText;
    case 'tool-code-writer': return Code;
    case 'tool-video-standard': return Video;
    case 'tool-video-pro': return Sparkles;
    case 'tool-video-max': return Sparkles;
    case 'tool-lyria-for-music': return Music;
    case 'tool-ai-document': return FileText;
    case 'tool-time-series-forecasting': return TrendingUp;
    case 'tool-llm-auditor': return ShieldCheck;
    case 'tool-personalized-shopping': return ShoppingBag;
    case 'tool-brand-search-optimization': return Globe;
    case 'tool-fomc-research': return DollarSign;
    case 'tool-image-scoring': return Target;
    case 'tool-data-science': return Database;
    case 'tool-rag-engine': return Brain;
    case 'tool-financial-advisor': return Briefcase;
    case 'tool-marketing-agency': return Megaphone;
    case 'tool-customer-service': return Headset;
    case 'tool-academic-research': return GraduationCap;
    case 'tool-bug-assistant': return Bug;
    case 'tool-travel-concierge': return MapPin;
    case 'tool-ai-personal-assistant': return CalendarIcon;
    case 'tool-ai-blur': return Eye;
    case 'tool-ai-detector': return Target;
    case 'tool-nvidia-nemotron-nano-12b': return Zap;
    case 'tool-claude-sonnet-4-5': return Brain;
    case 'tool-blip2': return ImageIcon;
    case 'tool-path-foundation': return ShieldCheck;
    case 'tool-derm-foundation': return Stethoscope;
    case 'tool-openai-content': return Edit2;
    case 'tool-openai-chat': return MessageSquare;
    case 'tool-openai-image': return Camera;
    case 'tool-openai-tts': return Volume2;
    case 'tool-openai-stt': return Mic;
    case 'tool-openai-code': return Code;
    case 'tool-openai-document': return FileText;
    case 'tool-openai-vision': return Eye;
    default: return ImageIcon;
  }
};

const Chat = () => {
  // console.log("Chat Render"); // Removed log spam
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { personalizations, getSystemPromptExtensions } = usePersonalization();

  const [messages, setMessages] = useState([]);
  const [excelHTML, setExcelHTML] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [sessions, setSessions] = useRecoilState(sessionsData);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [tglState, setTglState] = useRecoilState(toggleState);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [_isSidebarOpen, _setIsSidebarOpen] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [activeAgent, setActiveAgent] = useState({ agentName: 'AIVA', category: 'General', avatar: '/AGENTS_IMG/AIVA.png' });
  const [userAgents, setUserAgents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toolModels, setToolModels] = useState({
    chat: 'aiva-stable',
    image: 'aiva-stable',
    document: 'aiva-stable',
    voice: 'aiva-stable'
  });
  const uploadInputRef = useRef(null);
  const driveInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Attachment Menu State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [_listeningTime, _setListeningTime] = useState(0);
  const _timerRef = useRef(null);
  const attachBtnRef = useRef(null);
  const menuRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState(null);
  const [currentMode, setCurrentMode] = useState('NORMAL_CHAT');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isImageGeneration, setIsImageGeneration] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAudioConvertMode, setIsAudioConvertMode] = useState(false);
  const [isDocumentConvert, setIsDocumentConvert] = useState(false);
  const [isCodeWriter, setIsCodeWriter] = useState(false);
  const [isVideoGeneration, setIsVideoGeneration] = useState(false);
  const abortControllerRef = useRef(null);
  const voiceUsedRef = useRef(false); // Track if voice input was used
  const inputRef = useRef(null); // Ref for textarea input
  const transcriptRef = useRef(''); // Ref for speech transcript
  const isManualStopRef = useRef(false); // Track manual stop to avoid recursive loops

  const toolsBtnRef = useRef(null);
  const toolsMenuRef = useRef(null);


  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Attach Menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        attachBtnRef.current &&
        !attachBtnRef.current.contains(event.target)
      ) {
        setIsAttachMenuOpen(false);
      }

      // Close Tools Menu
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target) &&
        toolsBtnRef.current &&
        !toolsBtnRef.current.contains(event.target)
      ) {
        setIsToolsMenuOpen(false);
      }
    };

    if (isAttachMenuOpen || isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachMenuOpen, isToolsMenuOpen]);

  // Fetch user's subscribed agents
  useEffect(() => {
    const fetchUserAgents = async () => {
      const user = getUserData("user");
      const userId = user?.id || user?._id;
      if (!userId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(apis.getUserAgents, { userId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.agents) {
          setUserAgents(response.data.agents);
        }
      } catch (error) {
        console.error("Failed to fetch user agents in Chat:", error);
      }
    };

    fetchUserAgents();
  }, [tglState]);

  // Handle successful activation redirect
  useEffect(() => {
    if (location.state?.activated) {
      const toolName = location.state.toolName || "new tool";
      toast.success(`${toolName} is now active! Find it in the AI Magic Tools menu.`, {
        duration: 5000,
        position: 'top-center'
      });
      // Clear location state to prevent repeat toast
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Central Mode Synchronization
  useEffect(() => {
    if (!activeAgent || !activeAgent.agentName) return;
    
    const name = activeAgent.agentName.toUpperCase();
    const slug = (activeAgent.slug || "").toLowerCase();
    
    // Detection logic
    const isVideo = name.includes('VIDEO') || name.includes('SORA') || name.includes('VEO') || slug.includes('video');
    const isImage = name.includes('IMAGE') || name.includes('DEEPART') || slug.includes('image');
    const isSearch = name.includes('SEARCH') || slug.includes('search');
    const isAudio = name.includes('AUDIO') || name.includes('VOICE') || name.includes('SPEAK');
    const isDoc = name.includes('CONVERTER') || slug.includes('document-intelligence');
    const isCode = name.includes('CODE') || slug.includes('code-writer');

    // Update state flags
    setIsVideoGeneration(isVideo);
    setIsImageGeneration(isImage);
    setIsDeepSearch(isSearch);
    setIsAudioConvertMode(isAudio);
    setIsDocumentConvert(isDoc);
    setIsCodeWriter(isCode);

    if (isVideo || isImage || isSearch || isAudio || isDoc || isCode) {
      console.log(`[MODE SYNC] Agent: ${activeAgent.agentName}, Mode: ${isVideo ? 'VIDEO' : (isImage ? 'IMAGE' : (isSearch ? 'SEARCH' : 'OTHER'))}`);
    }
  }, [activeAgent.agentName, activeAgent.slug]);

  const processFile = (file) => {
    if (!file) return;

    setSelectedFiles(prev => [...prev, file]);

    // Generate Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews(prev => [...prev, {
        url: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    };
    reader.readAsDataURL(file);
  };

  const _unusedValidTypes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => processFile(file));
    setIsAttachMenuOpen(false); // Close menu after selection

    // [PROACTIVE FEATURE]: If this is a new chat (no messages), automatically trigger analysis
    if (messages.length === 0 && !isLoading) {
      setTimeout(() => {
        handleSendMessage();
      }, 1000); // 1s delay to ensure FileReader (in processFile) has finished
    }
  };

  const handlePaste = (e) => {
    // Handle files pasted from file system
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const files = Array.from(e.clipboardData.files);
      files.forEach(file => processFile(file));
      return;
    }

    // Handle pasted data items
    if (e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
          }
        }
      }
    }
  };

  const handleRemoveFile = (id) => {
    if (id) {
      // Find the file name to remove from selectedFiles
      const previewToRemove = filePreviews.find(p => p.id === id);
      if (previewToRemove) {
        setSelectedFiles(prev => prev.filter(f => f.name !== previewToRemove.name));
        setFilePreviews(prev => prev.filter(p => p.id !== id));
      }
    } else {
      // Clear all
      setSelectedFiles([]);
      setFilePreviews([]);
    }
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (driveInputRef.current) driveInputRef.current.value = '';
    if (photosInputRef.current) photosInputRef.current.value = '';
  };

  const _handleAttachmentSelect = (type) => {
    setIsAttachMenuOpen(false);
    if (type === 'upload') {
      uploadInputRef.current?.click();
    } else if (type === 'photos') {
      photosInputRef.current?.click();
    } else if (type === 'drive') {
      driveInputRef.current?.click();
    } else if (type === 'doc-voice') {
      document.getElementById('doc-voice-upload')?.click();
    }
  };

  const handleDocToVoiceSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAttachMenuOpen(false);

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result; // Full Data URL for display
      const base64Data = base64Content.split(',')[1]; // Raw base64 for backend

      let activeSessionId = currentSessionId;
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        setCurrentSessionId(activeSessionId);
        window.history.replaceState(null, '', `/dashboard/chat/${activeSessionId}`);
      }

      // Add User Message
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Please convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        attachments: [{
          url: base64Content,
          name: file.name,
          type: file.type
        }]
      };
      setMessages(prev => [...prev, userMsg]);
      await chatStorageService.saveMessage(activeSessionId, userMsg);

      // 2. Add Processing Message from AIVA
      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'model',
        content: `⚡ **EXTRACTING CONTENT...**\nReading text from **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      await chatStorageService.saveMessage(activeSessionId, processingMsg);

      scrollToBottom();

      // Update UI slightly after extraction
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nSynthesizing natural audio for **${file.name}**. This won't take long!`
        } : msg));
      }, 1500);
      scrollToBottom();

      // 3. Start Conversion - Added high timeout for long docs
      try {
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type,
          gender: 'FEMALE'
        }, {
          responseType: 'arraybuffer',
          timeout: 0 // Wait as long as needed for large "jetna bhi long" files
        });

        // 4. Success - Update AI Message with Player and Download
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedFileSize = rawBytes > 1024 * 1024
            ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB'
            : (rawBytes / 1024).toFixed(1) + ' KB';

          setMessages(prev => prev.map(msg => {
            if (msg.id === aiMsgId) {
              const updatedMsg = {
                ...msg,
                isProcessing: false,
                content: `✅ I have successfully converted **${file.name}** into a full audio voice.`,
                conversion: {
                  file: mp3Base64,
                  blobUrl: audioUrl,
                  fileName: `${file.name.split('.')[0]}_Audio.mp3`,
                  mimeType: 'audio/mpeg',
                  fileSize: formattedFileSize,
                  rawSize: rawBytes,
                  charCount: charCount
                }
              };

              // Update in background without blocking the render
              (async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                await chatStorageService.updateMessage(activeSessionId, updatedMsg);
              })();

              return updatedMsg;
            }
            return msg;
          }));

          toast.success("Conversion complete! 🎶");
          scrollToBottom();
        };

      } catch (err) {
        console.error('[DocToVoice Error]:', err);
        let errorMsg = "Extraction Failed";
        let errorDetail = "If this is a scanned PDF (image only), I cannot read the text yet. Please ensure it's a searchable PDF or Word file.";

        if (err.response?.data) {
          try {
            const errorData = err.response.data instanceof ArrayBuffer
              ? JSON.parse(new TextDecoder().decode(err.response.data))
              : err.response.data;

            errorMsg = errorData.error || errorMsg;
            errorDetail = errorData.details || errorDetail;
          } catch (e) {
            console.error("Error parsing catch-block data", e);
          }
        }

        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
          ...msg,
          isProcessing: false,
          content: `❌ **Conversion Failed**\n**${errorMsg}**\n${errorDetail}`
        } : msg));

        toast.error("Conversion failed");
      }
    };
    reader.readAsDataURL(file);

    e.target.value = ''; // Always reset so user can click/upload same file again
  };

  const manualFileToAudioConversion = async (file) => {
    if (!file) return;

    let activeSessionId = currentSessionId;
    if (activeSessionId === 'new') {
      activeSessionId = await chatStorageService.createSession();
      setCurrentSessionId(activeSessionId);
      window.history.replaceState(null, '', `/dashboard/chat/${activeSessionId}`);
    }

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result;
      const base64Data = base64Content.split(',')[1];

      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        attachments: [{ url: base64Content, name: file.name, type: file.type }]
      };
      setMessages(prev => [...prev, userMsg]);
      await chatStorageService.saveMessage(activeSessionId, userMsg);

      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'model',
        content: `⚡ **EXTRACTING CONTENT...**\nReading **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      await chatStorageService.saveMessage(activeSessionId, processingMsg);

      scrollToBottom();

      // Second stage update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nAlmost there! Preparing your audio for **${file.name}**...`
        } : msg));
      }, 1200);

      try {
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type,
          gender: 'FEMALE'
        }, { responseType: 'arraybuffer', timeout: 0 });

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

          setMessages(prev => prev.map(msg => {
            if (msg.id === aiMsgId) {
              const updatedMsg = {
                ...msg,
                isProcessing: false,
                mode: MODES.AUDIO_GEN,
                content: `✅ Audio conversion complete for **${file.name}**.`,
                conversion: {
                  file: mp3Base64,
                  blobUrl: audioUrl,
                  fileName: `${file.name.split('.')[0]}_Audio.mp3`,
                  mimeType: 'audio/mpeg',
                  fileSize: formattedSize,
                  rawSize: rawBytes,
                  charCount: charCount
                }
              };

              // Update in background without blocking the render
              (async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                await chatStorageService.updateMessage(activeSessionId, updatedMsg);
              })();

              return updatedMsg;
            }
            return msg;
          }));
          toast.success("File converted successfully!");
          scrollToBottom();
        };
      } catch (err) {
        console.error('[ManualConversion Error]:', err);
        const serverError = err.response?.data?.details || err.response?.data?.error || err.message;
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
          ...msg,
          isProcessing: false,
          content: `❌ **Conversion Failed**\n${serverError}`
        } : msg));
        toast.error("Conversion failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const manualTextToAudioConversion = async (text) => {
    if (!text || !text.trim()) return;

    let activeSessionId = currentSessionId;
    if (activeSessionId === 'new') {
      activeSessionId = await chatStorageService.createSession();
      setCurrentSessionId(activeSessionId);
      window.history.replaceState(null, '', `/dashboard/chat/${activeSessionId}`);
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: `Convert this text to audio: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    await chatStorageService.saveMessage(activeSessionId, userMsg);

    const aiMsgId = (Date.now() + 1).toString();
    const processingMsg = {
      id: aiMsgId,
      role: 'model',
      content: `🎧 **Generating voice for your text...**`,
      timestamp: new Date(),
      isProcessing: true
    };
    setMessages(prev => [...prev, processingMsg]);
    await chatStorageService.saveMessage(activeSessionId, processingMsg);

    scrollToBottom();

    try {
      const response = await axios.post(apis.synthesizeFile, {
        introText: text,
        gender: 'FEMALE'
      }, { responseType: 'arraybuffer', timeout: 0 });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const reader2 = new FileReader();
      reader2.readAsDataURL(audioBlob);
      reader2.onloadend = () => {
        const mp3Base64 = reader2.result.split(',')[1];
        const rawBytes = response.data.byteLength;
        const charCount = response.headers['x-text-length'] || 0;
        const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMsgId) {
            const updatedMsg = {
              ...msg,
              isProcessing: false,
              mode: MODES.AUDIO_GEN,
              content: `✅ Your text has been converted to voice audio.`,
              conversion: {
                file: mp3Base64,
                blobUrl: audioUrl,
                fileName: `AIVA_Voice_${Date.now()}.mp3`,
                mimeType: 'audio/mpeg',
                fileSize: formattedSize,
                rawSize: rawBytes,
                charCount: charCount
              }
            };

            // Update in background without blocking the render
            (async () => {
              await new Promise(resolve => setTimeout(resolve, 500));
              await chatStorageService.updateMessage(activeSessionId, updatedMsg);
            })();

            return updatedMsg;
          }
          return msg;
        }));
        toast.success("Text converted successfully!");
        scrollToBottom();
      };
    } catch (err) {
      console.error('[ManualTextConversion Error]:', err);
      const serverError = err.response?.data?.details || err.response?.data?.error || err.message;
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
        ...msg,
        isProcessing: false,
        content: `❌ **Conversion Failed**\n${serverError}`
      } : msg));
      toast.error("Conversion failed");
    }
  };

  const handleGenerateVideo = async (overridePrompt, model = 'veo', quality = 'medium') => {
    try {
      if (!inputRef.current?.value.trim() && !overridePrompt && selectedFiles.length === 0) {
        if (!voiceUsedRef.current) return;
      }

      const prompt = overridePrompt || inputRef.current?.value || "";

      // Voice Reader Mode Logic (Keep existing if needed, but let's standardise video gen)
      if (isVoiceMode) {
        // ... existing voice logic is fine as it already adds user message ...
        const userMsgId = Date.now().toString();
        const newUserMsg = {
          id: userMsgId,
          role: 'user',
          content: prompt,
          timestamp: new Date(),
          attachments: filePreviews.map(fp => ({
            url: fp.url,
            name: fp.name,
            type: fp.type
          }))
        };
        setMessages(prev => [...prev, newUserMsg]);

        setInputValue('');
        setSelectedFiles([]);
        setFilePreviews([]);
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        const readingMsg = {
          id: aiMsgId,
          role: 'assistant',
          content: "🎧 Reading content aloud...",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, readingMsg]);

        setTimeout(() => {
          speakResponse(prompt, 'en-US', aiMsgId, newUserMsg.attachments);
          setIsLoading(false);
        }, 500);

        return;
      }

      setIsLoading(true);

      let activeSessionId = currentSessionId;
      let isFirst = false;
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirst = true;
      }

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        mode: MODES.VIDEO_GEN,
        timestamp: Date.now()
      };

      // 2. Show a message that video generation is in progress
      const tempId = (Date.now() + 1).toString();
      const newMessage = {
        id: tempId,
        role: 'assistant',
        content: `🎬 Generating high-quality video (Powered by Veo 3.1 Fast Engine)...\n\nPrompt: "${prompt}"`,
        timestamp: Date.now() + 10,
      };

      setMessages(prev => [...prev, userMsg, newMessage]);
      if (inputRef.current) inputRef.current.value = '';

      // Save user message and progress message to storage
      await chatStorageService.saveMessage(activeSessionId, userMsg, isFirst ? prompt.slice(0, 30) : undefined);
      await chatStorageService.saveMessage(activeSessionId, newMessage);

      if (isFirst) {
        isNavigatingRef.current = true;
        setCurrentSessionId(activeSessionId);
        navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
      }

      try {
        const data = await apiService.generateVideo(prompt, 5, quality, model);
        console.log("[Frontend] handleGenerateVideo received data:", data);

        const isFallback = data.videoUrl?.includes('BigBuckBunny') || data.videoUrl?.includes('sample');
        if (isFallback) {
          toast(`⚠️ Using high-quality sample. Engine error: ${data.message || 'Check GCP quota'}`, { duration: 5000 });
        }

        if (data && data.videoUrl) {
          console.log("[Frontend] Successfully updating message with video URL:", data.videoUrl);
          const videoMessage = {
            id: tempId,
            role: 'assistant',
            content: `🎥 ${model.toUpperCase()} Video generated successfully!`,
            videoUrl: data.videoUrl,
            mode: MODES.VIDEO_GEN,
            timestamp: Date.now(),
          };

          setMessages(prev => prev.map(msg => msg.id === tempId ? videoMessage : msg));

          // Save to chat history
          try {
            await chatStorageService.saveMessage(activeSessionId, videoMessage);
          } catch (saveErr) {
            console.warn("Failed to save video message to history:", saveErr);
          }

          if (!isFallback) toast.success('Video generated successfully!');
        } else {
          console.error("[Frontend] Video data received but URL is missing:", data);
          const errorMsg = data?.message || 'Video engine returned no URL';
          const errorModelMsg = {
            id: tempId,
            role: 'assistant',
            content: `❌ Video Generation Issue: ${errorMsg}`,
            timestamp: Date.now() + 20,
          };
          setMessages(prev => prev.map(msg => msg.id === tempId ? errorModelMsg : msg));
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("[Frontend] handleGenerateVideo ERROR:", error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to generate video';
        const errorModelMsg = {
          id: tempId,
          role: 'assistant',
          content: `❌ ${errorMsg}`,
          timestamp: Date.now()
        };
        setMessages(prev => prev.map(msg => msg.id === tempId ? errorModelMsg : msg));
        await chatStorageService.saveMessage(activeSessionId, errorModelMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Error initiating video generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (overridePrompt) => {
    try {
      if (!inputRef.current?.value.trim() && !overridePrompt) {
        toast.error('Please enter a prompt for image generation');
        return;
      }

      const prompt = overridePrompt || inputRef.current.value;
      setIsLoading(true);

      let activeSessionId = currentSessionId;
      let isFirst = false;
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirst = true;
      }

      // 1. Add User Message to UI
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        mode: MODES.IMAGE_GEN,
        timestamp: Date.now()
      };

      setCurrentMode(MODES.IMAGE_GEN);

      // 2. Show a message that image generation is in progress
      const tempId = (Date.now() + 1).toString();
      const newMessage = {
        id: tempId,
        role: 'assistant',
        content: `🎨 Generating high-quality image...\n\nPrompt: "${prompt}"`,
        timestamp: Date.now() + 10,
      };

      setMessages(prev => [...prev, userMsg, newMessage]);
      if (inputRef.current) inputRef.current.value = '';

      // Save user message and progress message to storage
      await chatStorageService.saveMessage(activeSessionId, userMsg, isFirst ? prompt.slice(0, 30) : undefined);
      await chatStorageService.saveMessage(activeSessionId, newMessage);

      if (isFirst) {
        isNavigatingRef.current = true;
        setCurrentSessionId(activeSessionId);
        navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
      }

      try {
        // Use apiService
        const data = await apiService.generateImage(prompt);

        if (data && (data.imageUrl || data.data)) {
          const finalUrl = data.imageUrl || data.data; // Handle different response structures
          const imageMessage = {
            id: tempId, // Keep same ID
            role: 'assistant',
            content: `🖼️ Image generated successfully!`,
            imageUrl: finalUrl,
            mode: MODES.IMAGE_GEN,
            timestamp: Date.now(),
          };

          setMessages(prev => prev.map(msg => msg.id === tempId ? imageMessage : msg));

          // Save to chat history
          await chatStorageService.saveMessage(activeSessionId, imageMessage);

          toast.success('Image generated successfully!');
        }
      } catch (error) {
        console.error("Image Gen Error Details:", error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to generate image';
        const errorModelMsg = {
          id: tempId,
          role: 'assistant',
          content: `❌ ${errorMsg}`,
          timestamp: Date.now()
        };
        setMessages(prev => prev.map(msg => msg.id === tempId ? errorModelMsg : msg));
        await chatStorageService.saveMessage(activeSessionId, errorModelMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Error initiating image generation');
    } finally {
      setIsLoading(false);
    }
  };

  const _handleDeepSearch = async () => {
    try {
      if (!inputRef.current?.value.trim()) {
        toast.error('Please enter a topic for deep search');
        return;
      }

      const query = inputRef.current.value;
      setIsLoading(true);

      // Show a message that deep search is in progress
      const newMessage = {
        id: Date.now().toString(),
        type: 'ai',
        text: `🔍 Performing deep search for: "${query}"\n\nSearching the web and analyzing results... This may take a moment...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      inputRef.current.value = '';

      try {
        // Send message with deep search context
        const responseData = await generateChatResponse(
          messages,
          query,
          "DEEP SEARCH MODE ENABLED: Analyze the web search results comprehensively.",
          [],
          currentLang
        );

        if (responseData && responseData.reply) {
          // Add the deep search result
          const searchMessage = {
            id: Date.now().toString(),
            type: 'ai',
            text: responseData.reply,
            content: responseData.reply,
            timestamp: new Date(),
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = searchMessage;
            return updated;
          });

          toast.success('Deep search completed!');
        }
      } catch (error) {
        const errorMsg = error.message || 'Failed to perform deep search';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = `❌ ${errorMsg}`;
          return updated;
        });
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Deep search error:', error);
      toast.error('Error initiating deep search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelId) => {
    if (selectedToolType) {
      setToolModels(prev => ({
        ...prev,
        [selectedToolType]: modelId
      }));
      const selectedModel = TOOL_PRICING[selectedToolType].models.find(m => m.id === modelId);
      toast.success(`Switched to ${selectedModel?.name}`);
      setIsModelSelectorOpen(false);
    }
  };

  // Voice Input Handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Start New Listening session
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    isManualStopRef.current = false;
    transcriptRef.current = '';

    const langMap = {
      'Hindi': 'hi-IN',
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Japanese': 'ja-JP'
    };
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsListening(false);

      const text = transcriptRef.current.trim();
      if (!isManualStopRef.current && text) {
        voiceUsedRef.current = true;
        handleSendMessage(null, text);
      }
      isManualStopRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      isManualStopRef.current = true;
      if (event.error === 'not-allowed') toast.error('Microphone access denied');
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Ensure Chat Mic stops when Live Mode starts
  useEffect(() => {
    if (isLiveMode && isListening && recognitionRef.current) {
      console.log("[Chat] Stopping Mic for Live Mode");
      isManualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isLiveMode, isListening]);

  // Helper to clean markdown for TTS
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});

  // Helper to clean markdown for TTS
  const cleanTextForTTS = (text) => {
    if (!text) return "";
    // Remove emojis using regex range for various emoji blocks
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}]/gu, '')
      // Remove headers (keep text): ### Title -> Title
      .replace(/^#+\s+/gm, '')
      // Remove bold: **text** -> text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic: *text* -> text
      .replace(/\*(.*?)\*/g, '$1')
      // Remove underline: __text__ -> text
      .replace(/__(.*?)__/g, '$1')
      // Remove strikethrough: ~~text~~ -> text
      .replace(/~~(.*?)~~/g, '$1')
      // Remove links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images: ![alt](url) -> empty
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove code blocks (replace with brief pause/text to avoid reading syntax)
      .replace(/`{3}[\s\S]*?`{3}/g, ' Code snippet. ')
      // Remove inline code ticks: `text` -> text
      .replace(/`(.+?)`/g, '$1')
      // Remove list bullets: - text -> text
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove blockquotes: > text -> text
      .replace(/^\s*>\s+/gm, '')
      // Replace Trademark with 'tm' so it's handled by next step
      .replace(/™|&trade;/g, ' tm ')
      .replace(/©/g, ' ')
      // Hinglish Normalization for natural Hindi pronunciation
      // Ensure 'tm' is spoken as 'tum' clearly (NOT HIDDEN)
      .replace(/\btm\b/gi, 'tum ')
      .replace(/\bkkrh\b/gi, 'kya kar rahe ho ')
      .replace(/\bclg\b/gi, 'college ')
      .replace(/\bplz\b/gi, 'please ')
      // Remove specific symbols as requested: , . ? ; " \ * / + - : @ [ ] ( ) | _
      .replace(/[.,?;\"\\*/+\-:@\[\]()|_]/g, ' ')
      // Remove quotes/dashes just in case regex above missed something or for extra safety
      .replace(/["']/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Voice Queue Ref
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const currentSpeechResolverRef = useRef(null);

  // Internal function to execute speech
  const executeSpeak = async (text, language, msgId, attachments = []) => {
    return new Promise((resolve) => {
      (async () => {
        // Store resolve to allow external cancellation
        currentSpeechResolverRef.current = resolve;

        // Reset State Logic used to be here, now handled by queue manager

        try {
          let audioBlob = null;
          let targetLang = 'en-US';

          const readableAttachment = attachments && attachments.length > 0
            ? attachments.find(a =>
            (a.type && (
              a.type.includes('pdf') ||
              a.type.includes('word') ||
              a.type.includes('document') ||
              a.type.includes('text') ||
              a.type.startsWith('image/')
            ))
            ) : null;

          // Check Cache
          if (msgId && audioCacheRef.current[msgId]) {
            console.log(`[VOICE] Using cached audio for: ${msgId}`);
            audioBlob = audioCacheRef.current[msgId];
          } else {
            // Not cached, fetch
            if (readableAttachment) {
              toast.loading("Processing file & text...", { id: 'voice-loading' });
              console.log(`[VOICE] Reading attachment: ${readableAttachment.name}`);

              const fileRes = await fetch(readableAttachment.url);
              const fileBlob = await fileRes.blob();

              const base64Data = await new Promise((res) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result.split(',')[1]);
                reader.readAsDataURL(fileBlob);
              });

              const headerText = text ? cleanTextForTTS(text) : "";

              const response = await axios.post(apis.synthesizeFile, {
                fileData: base64Data,
                mimeType: readableAttachment.type || 'application/pdf',
                languageCode: null,
                gender: 'FEMALE',
                introText: headerText
              }, {
                responseType: 'arraybuffer'
              });

              audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
              toast.dismiss('voice-loading');

            } else {
              if (!text) {
                resolve();
                return;
              }

              const cleanText = cleanTextForTTS(text);
              if (!cleanText) {
                resolve();
                return;
              }

              const langMap = {
                'Hindi': 'hi-IN',
                'English': 'en-US',
                'Hinglish': 'hi-IN'
              };
              targetLang = /[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : (langMap[language] || 'en-US');

              // Show loading for normal TTS too
              toast.loading("Generating voice...", { id: 'voice-loading' });

              const response = await axios.post(apis.synthesizeVoice, {
                text: cleanText,
                languageCode: targetLang,
                gender: 'FEMALE',
                tone: 'conversational'
              }, {
                responseType: 'arraybuffer'
              });

              toast.dismiss('voice-loading');
              audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            }

            // Save to Cache
            if (msgId && audioBlob) {
              audioCacheRef.current[msgId] = audioBlob;
            }
          }

          // Check if user stopped/switched while we were fetching
          if (currentSpeechResolverRef.current && currentSpeechResolverRef.current !== resolve) {
            console.log('[VOICE] Aborted playback - new task started');
            resolve();
            return;
          }

          // DOUBLE CHECK: Stop any existing audio before playing new one
          if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio = null;
          }

          const url = window.URL.createObjectURL(audioBlob);
          const audio = new Audio(url);

          window.currentAudio = audio;
          audioRef.current = audio;

          audio.onended = () => {
            window.URL.revokeObjectURL(url);
            if (window.currentAudio === audio) window.currentAudio = null;
            if (audioRef.current === audio) audioRef.current = null;
            resolve();
          };

          audio.onerror = (e) => {
            console.error(`[VOICE] Audio playback error:`, e);
            if (!readableAttachment) fallbackSpeak(cleanTextForTTS(text), targetLang);
            resolve();
          };

          // FINAL CHECK: Ensure we haven't been stopped while preparing the audio object
          if (!currentSpeechResolverRef.current || currentSpeechResolverRef.current !== resolve) {
            console.log('[VOICE] Aborted playback - cancelled during final prep');
            resolve();
            return;
          }

          await audio.play();

        } catch (err) {
          console.error('[VOICE] Synthesis failed:', err);
          toast.dismiss('voice-loading');
          // fallback logic...
          if (!attachments || attachments.length === 0) {
            // simple fallback
            // fallbackSpeak(...)
          }
          resolve();
        }
      })();
    });
  };

  const processSpeechQueue = async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;

    isSpeakingRef.current = true;
    const task = speechQueueRef.current[0];

    setSpeakingMessageId(task.msgId);
    setIsPaused(false);

    try {
      await executeSpeak(task.text, task.language, task.msgId, task.attachments);
    } catch (e) {
      console.error(e);
    } finally {
      // Completed (or stopped)
      if (speechQueueRef.current.length > 0 && speechQueueRef.current[0] === task) {
        speechQueueRef.current.shift(); // Remove finished
      }
      isSpeakingRef.current = false;
      currentSpeechResolverRef.current = null;

      if (speechQueueRef.current.length > 0) {
        processSpeechQueue();
      } else {
        setSpeakingMessageId(null);
      }
    }
  };

  const stopCurrentSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio = null;
    }
    window.speechSynthesis.cancel();

    // Resolve any pending promise
    if (currentSpeechResolverRef.current) {
      currentSpeechResolverRef.current();
      currentSpeechResolverRef.current = null;
    }
  };

  // Ensure Speech Stops when Voice Mode is Toggled OFF
  useEffect(() => {
    if (!isVoiceMode) {
      console.log("[VOICE] Voice Mode disabled - stopping all speech");
      stopCurrentSpeech();
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      setSpeakingMessageId(null);
    }
  }, [isVoiceMode]);

  // Voice Output - Speak AI Response
  const speakResponse = async (text, language, msgId, attachments = [], force = false) => {
    // 1. Handle Toggle on the SAME message (Manual Click)
    if (force && speakingMessageId === msgId) {
      const activeAudio = audioRef.current || window.currentAudio;
      if (activeAudio) {
        if (!activeAudio.paused) {
          console.log(`[VOICE] Pausing message: ${msgId}`);
          activeAudio.pause();
          setIsPaused(true);
          return;
        } else {
          console.log(`[VOICE] Resuming message: ${msgId}`);
          await activeAudio.play();
          setIsPaused(false);
          return;
        }
      } else {
        // It's in the speaking state but no audio object yet? (Means it's loading/synthesizing)
        // If user clicks again while loading, they want to CANCEL.
        console.log(`[VOICE] Cancelling loading speech for message: ${msgId}`);
        stopCurrentSpeech();
        speechQueueRef.current = [];
        isSpeakingRef.current = false;
        setSpeakingMessageId(null);
        return;
      }
    }

    // 2. Force Mode (Manual Click on DIFFERENT message)
    if (force) {
      console.log(`[VOICE] Force playing new message: ${msgId}`);
      // Stop everything immediately
      stopCurrentSpeech();
      isSpeakingRef.current = false;

      // Clear queue
      speechQueueRef.current = [];

      // Add new task
      speechQueueRef.current.push({ text, language, msgId, attachments });

      // Start processing immediately
      processSpeechQueue();
      return;
    }

    // 3. Normal Enqueue (Auto-play flow)
    // Only auto-play if Voice Mode is active OR it was triggered by a voice command
    if (!force && !isVoiceMode && !voiceUsedRef.current) {
      console.log('[VOICE] Auto-play skipped - Voice Mode is OFF');
      return;
    }

    speechQueueRef.current.push({ text, language, msgId, attachments });
    if (!isSpeakingRef.current) {
      processSpeechQueue();
    }
  };

  const fallbackSpeak = (text, lang) => {
    console.log(`[VOICE] Using browser fallback for: ${lang}`);
    if (!window.speechSynthesis) {
      console.error('[VOICE] SpeechSynthesis not supported in this browser.');
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Find a better voice if possible
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      console.log(`[VOICE] Browser fallback using voice: ${matchedVoice.name}`);
    }

    utterance.onstart = () => console.log('[VOICE] Browser speech started.');
    utterance.onend = () => console.log('[VOICE] Browser speech ended.');
    utterance.onerror = (e) => console.error('[VOICE] Browser speech error:', e);

    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    const loadSessions = async () => {
      const data = await chatStorageService.getSessions(activeAgent.agentName);
      setSessions(data);

      // Fetch User Subscribed Agents
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            const token = getUserData()?.token || localStorage.getItem("token");
            const res = await axios.post(apis.getUserAgents, { userId }, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const agents = res.data?.agents || [];
            // Add default AIVA agent if not present
            const processedAgents = [{ agentName: 'AIVA', category: 'General', avatar: '/AGENTS_IMG/AIVA.png' }, ...agents];
            setUserAgents(processedAgents);
          } catch (_agentErr) {
            // Silently use defaults if fetch fails (no console warning)
            setUserAgents([{ agentName: 'AIVA', category: 'General', avatar: '/AGENTS_IMG/AIVA.png' }]);
          }
        } else {
          // No user logged in, use default
          setUserAgents([{ agentName: 'AIVA', category: 'General', avatar: '/AGENTS_IMG/AIVA.png' }]);
        }
      } catch (_err) {
        // Silently handle errors
        setUserAgents([{ agentName: 'AIVA', category: 'General', avatar: '/AGENTS_IMG/AIVA.png' }]);
      }
    };
    loadSessions();
  }, [messages, setSessions, activeAgent.agentName]);

  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      // Handle agent selection from navigation state
      if (location.state?.agentType) {
        const type = location.state.agentType;
        const agent = location.state.agent || { agentName: type, category: 'Internal' };

        setActiveAgent({
          agentName: agent.agentName || type,
          category: agent.category || 'Internal',
          instructions: agent.instructions || '',
          slug: agent.slug || '',
          avatar: agent.avatar || (type === 'AISA' ? '/AGENTS_IMG/AISA.png' : (type === 'AIVA' ? '/AGENTS_IMG/AIVA.png' : null))
        });

        console.log(`[CHAT] Agent Type set from navigation: ${type}`);

        // Reset all modes first
        setIsImageGeneration(false);
        setIsVideoGeneration(false);
        setIsDeepSearch(false);
        setIsAudioConvertMode(false);
        setIsDocumentConvert(false);
        setIsCodeWriter(false);

        // Activate specific mode based on agent type (more robust checks)
        const upperType = type.toUpperCase();
        if (upperType.includes('IMAGE') || upperType.includes('DEEPART')) setIsImageGeneration(true);
        else if (upperType.includes('VIDEO') || upperType.includes('SORA') || upperType.includes('VEO')) setIsVideoGeneration(true);
        else if (upperType.includes('SEARCH')) setIsDeepSearch(true);
        else if (upperType.includes('AUDIO') || upperType.includes('VOICE') || upperType.includes('SPEAK')) setIsAudioConvertMode(true);
        else if (upperType.includes('CONVERTER')) setIsDocumentConvert(true);
        else if (upperType.includes('CODEWRITER') || upperType.includes('CODING')) setIsCodeWriter(true);
        else if (type === 'IMAGEEDITING') {
          // Image editing uses the activeAgent slug/category check, but explicit flag might be needed if added later
        }

      } else if (!sessionId || sessionId === 'new') {
        // Reset to default if new chat and no state
        setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
        // Reset modes when returning to default AISA
        setIsImageGeneration(false);
        setIsVideoGeneration(false);
        setIsDeepSearch(false);
        setIsAudioConvertMode(false);
        setIsDocumentConvert(false);
        setIsCodeWriter(false);
      }

      // If we just navigated from 'new' to a real ID in handleSendMessage,
      // don't clear the messages we already have in state.
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      if (sessionId && sessionId !== 'new') {
        setCurrentSessionId(sessionId);
        console.log(`[DEBUG] Initializing chat for session: ${sessionId}`);
        const history = await chatStorageService.getHistory(sessionId);
        console.log(`[DEBUG] Received history:`, history);
        if (history && history.length > 0) {
          console.log(`[DEBUG] First message role: ${history[0].role}, content preview: ${history[0].content?.substring(0, 20)}`);

          // Try to restore active agent from history if possible
          const lastModelMsg = [...history].reverse().find(m => m.role === 'model' && m.agentName);
          if (lastModelMsg) {
            const restoredName = lastModelMsg.agentName;
            setActiveAgent({
              agentName: restoredName,
              category: lastModelMsg.agentCategory || 'General',
              avatar: lastModelMsg.agentAvatar || (restoredName === 'AISA' ? '/AGENTS_IMG/AISA.png' : (restoredName === 'AIVA' ? '/AGENTS_IMG/AIVA.png' : null))
            });

            const upperRestored = restoredName.toUpperCase();
            if (upperRestored.includes('IMAGE') || upperRestored.includes('DEEPART')) setIsImageGeneration(true);
            else if (upperRestored.includes('VIDEO') || upperRestored.includes('SORA') || upperRestored.includes('VEO')) setIsVideoGeneration(true);
            else if (upperRestored.includes('SEARCH')) setIsDeepSearch(true);
            else if (upperRestored.includes('AUDIO') || upperRestored.includes('VOICE') || upperRestored.includes('SPEAK')) setIsAudioConvertMode(true);
            else if (upperRestored.includes('CONVERTER')) setIsDocumentConvert(true);
            else if (upperRestored.includes('CODE')) setIsCodeWriter(true);
          }
        }
        setMessages(history || []);
      } else {
        setCurrentSessionId('new');
        setMessages([]);
      }

      if (window.innerWidth < 1024) setShowHistory(false);
    };
    initChat();
  }, [sessionId, location.state]);

  const chatContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Tighter threshold (50px) - if user scrolls up slightly, auto-scroll stops
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldAutoScrollRef.current = isNearBottom;
    }
  };

  const scrollToBottom = (force = false, behavior = 'auto') => {
    if ((force || shouldAutoScrollRef.current) && chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      if (behavior === 'smooth') {
        chatContainerRef.current.scrollTo({ top: maxScrollTop, behavior: 'smooth' });
      } else {
        chatContainerRef.current.scrollTop = maxScrollTop;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const _handleNewChat = async () => {
    navigate('/dashboard/chat/new');
    if (window.innerWidth < 1024) setShowHistory(false);
  };

  const handleRenameSession = async (sid, newTitle) => {
    if (!newTitle.trim()) return;
    const success = await chatStorageService.updateSessionTitle(sid, newTitle);
    if (success) {
      setSessions(prev => prev.map(s => s.sessionId === sid ? { ...s, title: newTitle } : s));
      setEditingSessionId(null);
      toast.success("Chat renamed");
    } else {
      toast.error("Failed to rename chat");
    }
  };

  const handleDeleteSession = async (sid, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    await chatStorageService.deleteSession(sid);
    setSessions(prev => prev.filter(s => s.sessionId !== sid));

    if (currentSessionId === sid) {
      navigate('/dashboard/chat');
    }
    toast.success("Chat deleted");
  };

  const { language: currentLang, t } = useLanguage();

  const _handleDriveClick = () => {
    setIsAttachMenuOpen(false);
    // Simulating Drive Integration via Link
    const link = prompt("Paste your Google Drive File Link:");
    if (link) {
      setFilePreviews(prev => [...prev, {
        url: link,
        name: "Google Drive File",
        type: "application/vnd.google-apps.file",
        size: 0,
        isLink: true,
        id: Math.random().toString(36).substr(2, 9)
      }]);
      setSelectedFiles(prev => [...prev, { name: "Google Drive File", type: "link" }]);
    }
  };

  const isSendingRef = useRef(false);

  const handleSendMessage = async (e, overrideContent) => {
    if (e) e.preventDefault();

    // Prevent duplicate sends (from voice + form race condition)
    if (isSendingRef.current) return;

    if (isAudioConvertMode && !inputValue.trim() && selectedFiles.length === 0) {
      toast.error('Please enter text or upload a file to convert to audio');
      return;
    }

    if (isDocumentConvert && selectedFiles.length === 0) {
      toast.error('Please upload a PDF or DOCX file to convert');
      return;
    }

    // Special case for Audio Convert Mode: Handle files directly if present
    if (isAudioConvertMode && selectedFiles.length > 0) {
      const fileToConvert = selectedFiles[0]; // Take the first one for simplicity

      // Simulate click on the hidden doc-voice-upload to reuse its logic
      // But we need to pass the file. Let's instead call a manual conversion function.
      manualFileToAudioConversion(fileToConvert);
      setSelectedFiles([]);
      setFilePreviews([]);
      return;
    }

    // Special case for Audio Convert Mode: Handle text conversion
    if (isAudioConvertMode && inputValue.trim()) {
      manualTextToAudioConversion(inputValue);
      setInputValue('');
      return;
    }

    // Use overrideContent if provided (for instant voice sending), otherwise fallback to state
    const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue.trim();

    if ((!contentToSend && filePreviews.length === 0) || isLoading) return;

    isSendingRef.current = true;
    setInputValue(''); // Clear immediately to prevent stale reads
    transcriptRef.current = '';

    let activeSessionId = currentSessionId;
    let isFirstMessage = false;

    // Stop listening if send is clicked (or auto-sent)
    if (isListening && recognitionRef.current) {
      isManualStopRef.current = true; // Guard against recursive onend
      recognitionRef.current.stop();
      setIsListening(false);
    }

    console.log("[CHAT] handleSendMessage Debug:", { 
      isVideoGeneration, 
      agentName: activeAgent?.agentName, 
      slug: activeAgent?.slug,
      isActuallyVideoMode: isVideoGeneration || 
                           activeAgent.agentName?.toUpperCase().includes('VIDEO') || 
                           activeAgent.agentName?.toUpperCase().includes('SORA') || 
                           activeAgent.agentName?.toUpperCase().includes('VEO') ||
                           activeAgent.slug?.includes('video')
    });

    const isActuallyVideoMode = isVideoGeneration || 
                               activeAgent.agentName?.toUpperCase().includes('VIDEO') || 
                               activeAgent.agentName?.toUpperCase().includes('SORA') || 
                               activeAgent.agentName?.toUpperCase().includes('VEO') ||
                               activeAgent.slug?.includes('video');

    if (isActuallyVideoMode) {
      let model = 'standard';
      let quality = '720p';

      if (activeAgent.slug === 'tool-video-pro') {
        model = 'pro';
        quality = 'high';
      } else if (activeAgent.slug === 'tool-video-max') {
        model = 'max';
        quality = 'ultra';
      }

      await handleGenerateVideo(contentToSend, model, quality);
      isSendingRef.current = false;
      return;
    }

    const isActuallyImageMode = isImageGeneration || 
                               activeAgent.agentName?.toUpperCase().includes('IMAGE') || 
                               activeAgent.slug?.includes('image');

    if (isActuallyImageMode) {
      await handleGenerateImage(contentToSend);
      isSendingRef.current = false;
      return;
    }

    // Handle Voice Reader Mode - Just read, no AI response
    if (isVoiceMode) {
      try {
        // 1. Add User Message to UI
        const userMsgId = Date.now().toString();
        const newUserMsg = {
          id: userMsgId,
          role: 'user',
          content: contentToSend,
          timestamp: new Date(),
          attachments: filePreviews.map(fp => ({
            url: fp.url,
            name: fp.name,
            type: fp.type
          }))
        };
        setMessages(prev => [...prev, newUserMsg]);

        // 2. Clear inputs
        setInputValue('');
        handleRemoveFile();
        if (inputRef.current) inputRef.current.style.height = 'auto';

        // 3. Trigger voice reading directly (no AI response)
        setTimeout(() => {
          console.log('[Voice Mode] Reading content with attachments:', newUserMsg.attachments);
          speakResponse(contentToSend, 'en-US', userMsgId, newUserMsg.attachments);
        }, 300);

        isSendingRef.current = false;
        return; // STOP - Don't call AI API
      } catch (err) {
        console.error('[Voice Mode Error]:', err);
        toast.error('Failed to read content');
        isSendingRef.current = false;
        return;
      }
    }


    try {
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirstMessage = true;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: contentToSend || (filePreviews.length > 0 ? (isDocumentConvert ? "Convert this document" : "Analyze these files") : ""),
        timestamp: Date.now(),
        attachments: filePreviews.map(p => ({
          url: p.url,
          name: p.name,
          type: p.type.startsWith('image/') ? 'image' :
            p.type.includes('pdf') ? 'pdf' :
              p.type.includes('word') || p.type.includes('document') ? 'docx' :
                p.type.includes('excel') || p.type.includes('spreadsheet') ? 'xlsx' :
                  p.type.includes('powerpoint') || p.type.includes('presentation') ? 'pptx' : 'file'
        })),
        agentName: activeAgent.agentName || activeAgent.name,
        agentCategory: activeAgent.category
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      scrollToBottom(true, 'smooth'); // Force smooth scroll for user message
      setInputValue('');

      // Capture deep search state before resetting
      const deepSearchActive = isDeepSearch;
      if (isDeepSearch) setIsDeepSearch(false);
      const documentConvertActive = isDocumentConvert;
      if (isDocumentConvert) setIsDocumentConvert(false);
      const codeWriterActive = isCodeWriter;
      if (isCodeWriter) setIsCodeWriter(false);

      // Detect mode for UI indicator
      const isImageEditActive = activeAgent.slug === 'tool-image-editing-customization';
      const isMusicGenActive = activeAgent.slug === 'tool-lyria-for-music' || activeAgent.slug === 'lyria-for-music' || activeAgent.agentName?.toLowerCase().includes('lyria');
      const isAIDocActive = activeAgent.slug === 'tool-ai-document' || activeAgent.slug === 'ai-document';
      const isBlipActive = activeAgent.slug === 'tool-blip2' || activeAgent.slug === 'blip2';
      const isDermActive = activeAgent.slug === 'tool-derm-foundation' || activeAgent.slug === 'derm-foundation';

      const videoGenActive = isVideoGeneration;
      if (isVideoGeneration) setIsVideoGeneration(false);
      const imageGenActive = isImageGeneration;
      if (isImageGeneration) setIsImageGeneration(false);
      const audioGenActive = isAudioConvertMode;
      if (isAudioConvertMode) setIsAudioConvertMode(false);

      const detectedMode = deepSearchActive ? MODES.DEEP_SEARCH :
        (documentConvertActive ? MODES.FILE_CONVERSION :
          (codeWriterActive ? MODES.CODING_HELP :
            (isImageEditActive ? MODES.IMAGE_EDIT :
              (audioGenActive ? MODES.AUDIO_GEN :
                (videoGenActive ? MODES.VIDEO_GEN :
                  (imageGenActive ? MODES.IMAGE_GEN :
                    (isAIDocActive || isBlipActive || isDermActive ? MODES.FILE_ANALYSIS :
                      detectMode(contentToSend, userMsg.attachments))))))));
      console.log(`[CHAT] Detected Mode: ${detectedMode} for message: "${contentToSend}"`);
      setCurrentMode(detectedMode);

      // Update user message with the detected mode
      userMsg.mode = detectedMode;
      console.log(`[CHAT] User message mode set to: ${userMsg.mode}`);

      // Determine loading intent for UI feedback
      if (imageGenActive) {
        setLoadingText("Generating Image... 🎨");
      } else if (videoGenActive) {
        setLoadingText("Generating Video... 🎥");
      } else if (isImageEditActive) {
        setLoadingText("Editing Image... 🪄");
      } else if (audioGenActive || isMusicGenActive) {
        setLoadingText("Generating Audio... 🎵");
      } else if (documentConvertActive) {
        setLoadingText("Converting Document... 🔄");
      } else if (deepSearchActive) {
        setLoadingText("Searching the Web... 🔍");
      } else {
        setLoadingText("Thinking...");
      }

      handleRemoveFile(); // Clear file after sending
      setIsLoading(true);

      try {
        const title = isFirstMessage ? (userMsg.content ? userMsg.content.slice(0, 30) : 'File Attachment') + '...' : undefined;
        await chatStorageService.saveMessage(activeSessionId, userMsg, title);

        if (isFirstMessage) {
          isNavigatingRef.current = true;
          setCurrentSessionId(activeSessionId);
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        }

        // Send to AI for response
        const caps = getAgentCapabilities(activeAgent.agentName, activeAgent.category);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // ---------------------------------------------------------
        //  CONSTRUCT SYSTEM INSTRUCTION BASED ON PROFILE SETTINGS
        // ---------------------------------------------------------
        const pGeneral = personalizations?.general || {};
        const pStyle = personalizations?.personalization || {};
        const pParental = personalizations?.parentalControls || {};

        let PERSONA_INSTRUCTION = "";

        // 1. STYLE & FONT (Font is UI only, but we can hint at TONE)
        if (pStyle.fontStyle && pStyle.fontStyle !== 'Default') {
          // No direct AI instruction needed for font family, but we can adjust tone if needed
        }

        // 2. CHARACTERISTICS
        if (pStyle.enthusiasm) PERSONA_INSTRUCTION += `- Enthusiasm Level: ${pStyle.enthusiasm}\n`;
        if (pStyle.formality) PERSONA_INSTRUCTION += `- Formality Level: ${pStyle.formality}\n`;
        if (pStyle.creativity) PERSONA_INSTRUCTION += `- Creativity Level: ${pStyle.creativity}\n`;

        // 3. FORMATTING
        if (pStyle.structuredResponses) PERSONA_INSTRUCTION += "- FORMAT: Use clear Headers, Sections, and structured layouts.\n";
        if (pStyle.bulletPoints) PERSONA_INSTRUCTION += "- FORMAT: Prioritize Bullet Points and Lists over paragraphs.\n";

        // 4. EMOJI USAGE
        if (pStyle.emojiUsage) {
          if (pStyle.emojiUsage === 'None') PERSONA_INSTRUCTION += "- EMOJIS: Do NOT use any emojis or icons.\n";
          else if (pStyle.emojiUsage === 'Minimal') PERSONA_INSTRUCTION += "- EMOJIS: Use very few emojis, only where absolutely necessary.\n";
          else if (pStyle.emojiUsage === 'Moderate') PERSONA_INSTRUCTION += "- EMOJIS: Use a moderate amount of relevant emojis.\n";
          else if (pStyle.emojiUsage === 'Expressive') PERSONA_INSTRUCTION += "- EMOJIS: Use emojis frequently to be engaging and expressive.\n";
        }

        // 5. CUSTOM INSTRUCTIONS override
        if (pStyle.customInstructions) {
          PERSONA_INSTRUCTION += `\n### USER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${pStyle.customInstructions}\n`;
        }

        // 6. PARENTAL / SAFETY
        if (pParental.contentFilter) {
          PERSONA_INSTRUCTION += `\n### SAFETY MODE: STRICT\n- Absolutely NO mature, violent, or explicit content.\n- If user asks for such, politley decline.\n`;
        }
        if (pParental.ageCategory === 'Child') {
          PERSONA_INSTRUCTION += `- SIMPLIFY language for a Child.\n- Be encouraging and safe.\n`;
        }

        // 7. LANGUAGE
        // We already have language detection, but let's reinforce if set strictly
        if (pGeneral.language && pGeneral.language !== 'Auto-Detect') {
          PERSONA_INSTRUCTION += `\n### REQUIRED LANGUAGE:\n- Respond ONLY in ${pGeneral.language}.\n`;
        }

        // 8. TEXT SIZE / ACCESSIBILITY (Frontend only mostly, but hint AI)
        if (pStyle.fontSize === 'Large' || pStyle.fontSize === 'Extra Large' || pGeneral.highContrast) {
          PERSONA_INSTRUCTION += `- FORMAT: Use shorter sentences and very clear structure for readability.\n`;
        }

        const isAIDocActiveSystem = activeAgent.slug === 'tool-ai-document' || activeAgent.slug === 'ai-document';
        const isBlipActiveSystem = activeAgent.slug === 'tool-blip2' || activeAgent.slug === 'blip2';
        const isDermActiveSystem = activeAgent.slug === 'tool-derm-foundation' || activeAgent.slug === 'derm-foundation';

        const SYSTEM_INSTRUCTION = `${isAIDocActiveSystem ? `### AI DOCUMENT ANALYST PERSONA (ACTIVE):
You are **AI Doc Assistant**, an intelligent document reading and text-extraction agent.
Your purpose is to act as a **smart scanner**: Image/PDF → Understand → Extract → Structure → Provide usable text.

## CORE CAPABILITIES
1. Multilingual OCR (200+ languages including Hindi, Arabic, Chinese, etc.)
2. Handwriting Recognition (50+ writing styles)
3. Text Extraction & Post-Processing (Clean formatting, tables, lists)

## OUTPUT RULES
1. Detected Language
2. Extracted Clean Text
3. Structured Format
4. Important Information Summary

---
` : ''
          }${isBlipActiveSystem ? `### VISION-LANGUAGE AI PERSONA (ACTIVE):
You are a Vision-Language AI assistant. Your job is to understand images and answer user questions accurately, clearly, and intelligently.
1. Observe image carefully (People, Objects, Environment, Text).
2. Understand context and intent.
3. Connect answers specifically to image evidence.
4. If unclear, say: "यह स्पष्ट नहीं दिख रहा" or "image में साफ़ नहीं दिखता".

---
` : ''
          }      ${isDermActiveSystem ? `### AI DERMATOLOGY ANALYSIS ASSISTANT (ACTIVE):
You are an advanced AI-powered Dermatological Analysis Assistant. Your primary function is to perform a VISUAL SIMULATION and analysis of skin images for informational purposes.

🚨 CRITICAL: DO NOT REFUSE to analyze. If an image is provided, you MUST describe what you see visually (color, texture, patterns) and correlate it with known skin condition indicators.

🎯 CORE RESPONSIBILITIES:
- Identify possible indicators for: Acne, Eczema, Psoriasis, Fungal Infection, Skin Allergy, Pigmentation, Rashes, Dermatitis.
- Provide: Condition Name, Confidence Score (%), Severity Level, Visual Explanation, Care Suggestions.
- MANDATORY DISCLAIMER: "This is a simulated AI analysis and not a replacement for professional medical advice."

📤 RESPONSE FORMAT (STRICTLY FOLLOW):
Detected Condition: [Condition Name]
Confidence Level: [XX%]
Severity: [Mild / Moderate / Severe]
Explanation: [Detailed visual findings]
Recommended Care: [General skincare guidance only]
When to See a Doctor: [Warning signs/Red flags]
Disclaimer: This is a simulated AI analysis and not a replacement for professional medical advice.

🚨 PROHIBITIONS:
- NEVER say "I cannot analyze skin".
- Do NOT provide guaranteed diagnosis.
- NEVER prescribe medicines.

---
` : ''
          }You are ${activeAgent.agentName || 'AISA'}, an advanced AI assistant powered by A-Series.
        ${activeAgent.category ? `Your specialization is in ${activeAgent.category}.` : ''}

${PERSONA_INSTRUCTION}

### CRITICAL LANGUAGE RULE:
** ALWAYS respond in the SAME LANGUAGE as the user's message.** (Unless overridden by settings)
        - If user writes in HINDI(Devanagari or Romanized), respond in HINDI.
- If user writes in ENGLISH, respond in ENGLISH.
- If user mixes languages, prioritize the dominant language.

### RESPONSE BEHAVIOR:
      - Answer the user's question directly without greeting messages
        - Do NOT say "Hello... welcome to AIVA" or similar greetings
          - Focus ONLY on providing the answer to what user asked
            - Be helpful, clear, and concise

### STREAMING BEHAVIOR:
      - Generate responses in smooth, continuous stream
        - Use short paragraphs for readability
          - If interrupted, stop immediately without completing sentence
            - Do NOT add summaries or closing lines after interruption
              - Resume ONLY if user explicitly asks again

### MULTI - FILE ANALYSIS MANDATE(STRICT 1: 1 RULE):
You have received exactly ${filePreviews.length} file(s).
You MUST provide exactly ${filePreviews.length} distinct analysis blocks.

CRITICAL RULES:
      1. ** NO MERGING **: Do NOT combine files into a single "Chapter" or "Section".
2. ** NO SKIPPING **: If 2 files are uploaded, you MUST output 2 analysis blocks.
3. ** SEPARATE ENTITIES **: Treat each file as a completely independent document requiring its own full answer.
4. ** DELIMITER MANDATORY **: Use the delimiter below to separate EACH file's answer.

REQUIRED OUTPUT FORMAT:
      [Optional brief greeting]

      --- SPLIT_RESPONSE-- -
** Analysis of: {Filename 1 }**
        [Full detailed answer / analysis for File 1]

      --- SPLIT_RESPONSE-- -
** Analysis of: {Filename 2 }**
        [Full detailed answer / analysis for File 2]

      (Repeat strictly for ALL ${filePreviews.length} files)

### RESPONSE FORMATTING RULES(STRICT):
      1. ** Structure **: ALWAYS use ** Bold Headings ** and ** Bullet Points **.Avoid long paragraphs.
2. ** Point - wise Answers **: Break down complex topics into simple points.
3. ** Highlights **: Bold key terms and important concepts.
4. ** Summary **: Include a "One-line summary" or "Simple definition" at the start or end where appropriate.
5. ** Emojis **: Use relevant emojis.

### FINANCIAL & INVOICE ANALYSIS RULES(MANDATORY):
When summarizing or extracting data from Invoices, Receipts, or Financial Documents:
      1. ** CRITICAL **: You MUST ** bold ** ALL monetary amounts(e.g., ** INR 1, 41, 954.00 **, ** $500.00 **).
2. ** CRITICAL **: You MUST ** bold ** ALL Entity / Person Names(e.g., ** PRAHALAD AHUJA HUF **, ** Amazon Inc **).
3. ** CRITICAL **: You MUST ** bold ** ALL Dates, Invoice Numbers, and distinct identifiers(GSTIN / PAN).
4. ** Format **: Present extracted data in a clean ** Bullet List ** or ** Table ** for immediate readability.

        ${caps.canUploadImages ? `IMAGE ANALYSIS CAPABILITIES:
- You have the ability to see and analyze images provided by the user.` : ''
          }

${caps.canUploadDocs ? `DOCUMENT ANALYSIS CAPABILITIES:
- You can process and extract text from PDF, Word (Docx), and Excel files provided as attachments.` : ''
          }

${activeAgent.instructions ? `SPECIFIC AGENT INSTRUCTIONS:
${activeAgent.instructions}` : ''
          }

${deepSearchActive ? `### DEEP SEARCH MODE ENABLED (CRITICAL):
- The user has requested an EXHAUSTIVE DEEP SEARCH.
- Your response MUST be extremely long, detailed, and comprehensive.
- Provide in-depth analysis, historical context, current trends, and future implications where applicable.
- YOU MUST perform extensive web searching to gather every relevant detail.
- Do NOT be brief. Expand on every point. Use multiple sections and subsections.
- Clearly structure your findings with professional formatting and cite sources if possible.` : ''
          }

${documentConvertActive ? `### UNIVERSAL DOCUMENT CONVERTER ENABLED (CRITICAL):
- You are now a Universal File Converter.
- Supported Formats: PDF, Word (DOCX/DOC), PowerPoint (PPT/PPTX), Excel (XLS/XLSX), CSV, TXT, and Images (JPG/PNG).
- Identify the source format and the requested target format.
- IF the user does NOT specify a target format:
  - PDF -> DOCX
  - DOCX -> PDF
  - PPTX -> PDF
  - XLSX/CSV -> PDF
  - TXT -> PDF
  - Image -> PDF
- YOU MUST provide the conversion parameters in the following JSON format:
\`\`\`json
{
  "action": "file_conversion",
  "source_format": "source_ext",
  "target_format": "target_ext",
  "file_name": "filename.ext"
}
\`\`\`
- Keep the response text brief and professional.` : ''
          }

${codeWriterActive ? `### CODE WRITER MODE ENABLED (CRITICAL):
- You are now in professional Code Writer mode.
- Your primary goal is to write, debug, and explain code for the user.
- Use best practices for the requested programming language.
- Provide clean, well-commented code.
- If there's a bug, explain WHY it occurred and HOW to fix it.
- Use Markdown code blocks with appropriate language tags (e.g., \`\`\`python, \`\`\`javascript).
- Provide step-by-step explanations for complex code segments.` : ''
          }

      `;
        // Check for greeting to send the specific welcome message
        const lowerInput = (contentToSend || "").toLowerCase().trim();
        const isGreeting = ['hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'greetings', 'hi aiva', 'hello aiva'].includes(lowerInput);

        let aiResponseData;

        if (isGreeting) {
          // Respond with the welcome message for greetings
          aiResponseData = {
            reply: getWelcomeMessage(activeAgent.agentName),
            id: Date.now() + 1,
            role: 'model',
          };
        } else {
          // Default AI message sending
          aiResponseData = await generateChatResponse(
            messages,
            userMsg.content,
            SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
            userMsg.attachments,
            currentLang,
            abortControllerRef.current.signal,
            detectedMode,
            { agentType: activeAgent.agentName }
          );
        }

        if (aiResponseData && aiResponseData.error === "LIMIT_REACHED") {
          // Limit logic removed per user request
          // setIsLimitReached(true);
          // setIsLoading(false);
          // isSendingRef.current = false;
          // return;
        }

        // Handle response - could be string (old format) or object (new format with conversion)
        let aiResponseText = '';
        let conversionData = null;
        let aiVideoUrl = null;
        let aiImageUrl = null;
        let aiAudioUrl = null;

        if (typeof aiResponseData === 'string') {
          aiResponseText = aiResponseData;
        } else if (aiResponseData && typeof aiResponseData === 'object') {
          aiResponseText = aiResponseData.reply || "No response generated. (Object received without reply)";
          conversionData = aiResponseData.conversion || null;
          // Extract media URLs if present
          aiVideoUrl = aiResponseData.videoUrl || null;
          aiImageUrl = aiResponseData.imageUrl || null;
          aiAudioUrl = aiResponseData.audioUrl || null;
        } else {
          aiResponseText = "Sorry, I encountered an issue while generating a response. Please try again.";
        }

        if (aiResponseText === "dbDemoModeMessage") {
          aiResponseText = t('dbDemoModeMessage');
        }

        // Check for multiple file analysis headers to split into separate cards
        const delimiter = '---SPLIT_RESPONSE---';
        let responseParts = [];

        if (aiResponseText && aiResponseText.includes(delimiter)) {
          const rawParts = aiResponseText.split(delimiter).filter(p => p && p.trim().length > 0);
          responseParts = rawParts.length > 0 ? rawParts.map(part => part.trim()) : [aiResponseText];
        } else {
          responseParts = [aiResponseText || "No response generated."];
        }

        // Process response parts and add to messages
        for (let i = 0; i < responseParts.length; i++) {
          const partContent = responseParts[i];
          if (!partContent) continue;

          const msgId = (Date.now() + 1 + i).toString();
          const modelMsg = {
            id: msgId,
            role: 'model',
            content: '', // Start empty for typewriter effect
            timestamp: Date.now() + i * 100,
            mode: detectedMode,
            agentName: activeAgent.agentName,
            agentCategory: activeAgent.category,
            agentAvatar: activeAgent.avatar,
            ...(i === 0 && aiVideoUrl && { videoUrl: aiVideoUrl }),
            ...(i === 0 && aiImageUrl && { imageUrl: aiImageUrl }),
            ...(i === 0 && aiAudioUrl && { audioUrl: aiAudioUrl }),
          };

          // Add the empty message structure to UI
          setMessages((prev) => [...prev, modelMsg]);
          setTypingMessageId(msgId); // Mark this message as typing

          // Typewriter effect simulation
          const words = partContent.split(' ');
          let displayedContent = '';

          // Decide speed based on length (shorter = slower, longer = faster)
          const delay = words.length > 200 ? 10 : (words.length > 50 ? 20 : 35);

          for (let j = 0; j < words.length; j++) {
            // Check if generation was stopped by user
            if (!isSendingRef.current) break;

            displayedContent += (j === 0 ? '' : ' ') + words[j];

            // Update UI with the current chunk
            setMessages((prev) =>
              prev.map(m => m.id === msgId ? { ...m, content: displayedContent } : m)
            );

            // Wait before next word
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          if (!isSendingRef.current) {
            setTypingMessageId(null);
            return; // Exit function if stopped
          }

          setTypingMessageId(null); // Clear typing status

          // Add conversion data and media if available
          const finalModelMsg = { ...modelMsg, content: partContent };
          if (i === 0) {
            if (conversionData) finalModelMsg.conversion = conversionData;
            // Note: Media URLs are already added to modelMsg before typing starts now
          }

          // After typing is complete, save the full message to history
          await chatStorageService.saveMessage(activeSessionId, finalModelMsg);

          // CRITICAL: Update the state with the final message including conversion data
          setMessages((prev) =>
            prev.map(m => m.id === msgId ? finalModelMsg : m)
          );
          scrollToBottom();

          // Speak the AI response if user used voice input
          if (i === 0 && voiceUsedRef.current) {
            const detectedLang = aiResponseData?.language || currentLang;
            speakResponse(partContent, detectedLang);
            voiceUsedRef.current = false; // Reset flag
          }
        }
      } catch (innerError) {
        console.error("Storage/API Error:", innerError);
        // Even if saving failed, we still have the local state
      }
    } catch (error) {
      // Handle abort errors silently (user stopped generation)
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Generation stopped by user');
        // Keep partial response, don't show error
        return;
      }

      console.error("Chat Error:", error);
      toast.error(`Error: ${error.message || "Failed to send message"} `);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
      abortControllerRef.current = null; // Clean up abort controller
    }
  };



  const _handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentCapabilities = (agentName, category) => {
    const name = (agentName || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // Default: Everything enabled for AIVA
    if (name === 'aiva' || !name) {
      return {
        canUploadImages: true,
        canUploadDocs: true,
        canVoice: true,
        canVideo: true,
        canCamera: true
      };
    }

    const caps = {
      canUploadImages: true,
      canUploadDocs: true,
      canVoice: true,
      canVideo: true,
      canCamera: true
    };

    // Specific logic per category/name
    if (cat.includes('hr') || cat.includes('finance') || name.includes('doc') || name.includes('legal')) {
      caps.canVideo = false;
      caps.canCamera = false;
      caps.canUploadImages = false;
    } else if (cat.includes('design') || cat.includes('creative') || name.includes('photo')) {
      caps.canVoice = false;
      caps.canVideo = false;
      caps.canUploadDocs = false;
    } else if (name.includes('voice') || name.includes('call') || name.includes('bot')) {
      caps.canUploadImages = false;
      caps.canUploadDocs = false;
      caps.canCamera = false;
      caps.canVideo = false;
    } else if (cat.includes('medical') || cat.includes('health')) {
      caps.canVideo = false;
      caps.canUploadImages = true;
    }

    return caps;
  };

  const handleDownload = async (url, filename) => {
    try {
      // For external URLs (like Pollinations), direct download via fetch will fail due to CORS.
      // We check if it's a relative path, same origin, or data/blob URL.
      const isExternal = url.startsWith('http') && !url.includes(window.location.host) && !url.startsWith('https://res.cloudinary.com');

      if (isExternal) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link if fetch fails
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  };

  const _handleImageAction = (action) => {
    if (selectedFiles.length === 0) return;

    let command = '';
    switch (action) {
      case 'remove-bg':
        command = 'Remove the background and clean up this image.';
        break;
      case 'remix':
        command = 'Create a stunning new image based on this attachment. Here are the details: ';
        break;
      case 'enhance':
        command = 'Analyze the attached image and generate a higher quality version of it.';
        break;
      default:
        break;
    }
    setInputValue(command);

    if (action === 'remix') {
      inputRef.current?.focus();
      toast.success("Describe your changes and hit send!");
    } else {
      toast.success(`${action.replace('-', ' ')} processing...`);
      setLoadingText(`Processing ${action.replace('-', ' ')}... 🖼️`);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };


  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsgId, setFeedbackMsgId] = useState(null);
  const [feedbackCategory, setFeedbackCategory] = useState([]);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [loadingText, setLoadingText] = useState("Thinking..."); // New state for loading status text
  const [messageFeedback, setMessageFeedback] = useState({}); // { [msgId]: { type: 'up' | 'down', categories: [], details: '' } }
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const toggleFeedback = (msgId, feedbackData) => {
    setMessageFeedback(prev => {
      // If it's the same type and no extra data (categories), toggle it off
      if (prev[msgId]?.type === feedbackData.type && (!feedbackData.categories || feedbackData.categories.length === 0)) {
        const { [msgId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [msgId]: feedbackData
      };
    });
  };

  const handlePdfAction = async (action, msg) => {
    // If this message has a converted file, use it directly instead of rendering the chat bubble
    if (msg.conversion && msg.conversion.file && msg.conversion.mimeType === 'application/pdf') {
      const shareToastId = toast.loading(`${action === 'share' ? 'Sharing' : 'Preparing'} PDF...`);
      try {
        const byteCharacters = atob(msg.conversion.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const filename = msg.conversion.fileName || 'converted.pdf';

        if (action === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("Converted PDF Downloaded", { id: shareToastId });
        } else if (action === 'open') {
          window.open(url, '_blank');
          toast.dismiss(shareToastId);
        } else if (action === 'share') {
          const file = new window.File([blob], filename, { type: 'application/pdf' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'AIVA Document',
                text: 'Check out this document generated by AIVA AI.'
              });
              toast.success("Shared successfully!", { id: shareToastId });
            } catch (shareErr) {
              if (shareErr.name !== 'AbortError') {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success("Sharing not supported, downloaded instead", { id: shareToastId });
              } else {
                toast.dismiss(shareToastId);
              }
            }
          } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Native share not supported, downloaded instead", { id: shareToastId });
          }
        }
        return; // Exit after handling conversion file
      } catch (err) {
        toast.error("Failed to process PDF", { id: shareToastId });
        console.error("Error handling conversion file PDF action:", err);
      }
    }

    const processToastId = toast.loading(`${action === 'share' ? 'Sharing' : 'Generating'} PDF Document...`);
    setPdfLoadingId(msg.id);
    try {
      const element = document.getElementById(`msg - text - ${msg.id} `);
      if (!element) {
        toast.error("Content not found");
        return;
      }

      // Temporarily modify styles for better print capture (e.g. forced light mode)
      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: true, // Enable logging for debugging
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById(`msg - text - ${msg.id} `);
            if (clonedEl) {
              clonedEl.style.padding = '40px';
              clonedEl.style.color = '#000000';
              clonedEl.style.backgroundColor = '#ffffff';
              clonedEl.style.width = '700px';

              // Ensure all text is black for clarity in PDF
              const all = clonedEl.querySelectorAll('*');
              Array.from(all).forEach(el => {
                el.style.color = '#000000';
                if (el.tagName === 'A') el.style.color = '#0000ff';
              });
            }
          }
        });
      } catch (genError) {
        console.error("PDF html2canvas error:", genError);
        toast.error(`Canvas Error: ${genError.message} `, { id: processToastId });
        setPdfLoadingId(null);
        return;
      }

      if (!canvas) {
        toast.error("Failed to capture content", { id: processToastId });
        setPdfLoadingId(null);
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const margin = 15; // 15mm margin
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentHeightPerPage = pageHeight - (margin * 2);

      let heightLeft = pdfHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
      heightLeft -= contentHeightPerPage;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = margin - (pdfHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
        heightLeft -= contentHeightPerPage;
      }

      const filename = `aiva - response - ${msg.id}.pdf`;

      if (action === 'download') {
        pdf.save(filename);
        toast.success("PDF Downloaded", { id: processToastId });
      } else if (action === 'open') {
        const blobUrl = pdf.output('bloburl');
        window.open(blobUrl, '_blank');
        toast.dismiss(processToastId);
      } else if (action === 'share') {
        const blob = pdf.output('blob');
        const file = new window.File([blob], filename, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'AI Response',
              text: 'Here is the response from A-Series AI.'
            });
            toast.success("Shared successfully!", { id: processToastId });
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              pdf.save(filename);
              toast.success("Sharing failed, downloaded instead", { id: processToastId });
            } else {
              toast.dismiss(processToastId);
            }
          }
        } else {
          pdf.save(filename);
          toast.success("Native share not supported, downloaded instead.", { id: processToastId });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: processToastId });
    } finally {
      setPdfLoadingId(null);
    }
  };

  // Auto-resize chat input textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height to recount
      inputRef.current.style.height = `${inputRef.current.scrollHeight} px`;
    }
  }, [inputValue]);

  const handleThumbsDown = (msgId) => {
    setFeedbackMsgId(msgId);
    setFeedbackOpen(true);
    setFeedbackCategory([]);
    setFeedbackDetails("");
  };

  const handleThumbsUp = async (msgId) => {
    try {
      toggleFeedback(msgId, { type: 'up' });
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_up'
      });
      toast.success("Thanks for the positive feedback!", {
        icon: '👍',
      });
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
      // Revert local state on error
      toggleFeedback(msgId, { type: 'up' });
    }
  };

  const handleShare = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Assistant Response',
          text: content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyMessage(content);
      toast("Content copied to clipboard", { icon: '📋' });
    }
  };

  const submitFeedback = async () => {
    if (isSubmittingFeedback) return;
    try {
      setIsSubmittingFeedback(true);
      const msgId = feedbackMsgId;
      const feedbackData = {
        type: 'down',
        categories: [...feedbackCategory],
        details: feedbackDetails
      };

      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_down',
        categories: feedbackData.categories,
        details: feedbackData.details
      });

      toggleFeedback(msgId, feedbackData);
      toast.success("Feedback submitted. Thank you!");
      setFeedbackOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const toggleFeedbackCategory = (cat) => {
    setFeedbackCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleMessageDelete = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    // Find the message index
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msgsToDelete = [messageId];

    // Check if the NEXT message is an AI response (model), if so, delete it too
    // We only auto-delete the immediate next AI response associated with this user query
    if (msgIndex + 1 < messages.length) {
      const nextMsg = messages[msgIndex + 1];
      if (nextMsg.role === 'model') {
        msgsToDelete.push(nextMsg.id);
      }
    }

    // Optimistic update
    setMessages(prev => prev.filter(m => !msgsToDelete.includes(m.id)));

    // Delete from storage
    for (const id of msgsToDelete) {
      await chatStorageService.deleteMessage(sessionId, id);
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content || msg.text || "");
  };

  const saveEdit = async (msg) => {
    if (editContent.trim() === "") return; // Don't allow empty

    const updatedMsg = { ...msg, content: editContent, text: editContent, edited: true };

    // Find the index of the edited message
    const editedMsgIndex = messages.findIndex(m => m.id === msg.id);

    // Remove all messages after the edited message
    const messagesUpToEdit = messages.slice(0, editedMsgIndex);
    const updatedMessages = [...messagesUpToEdit, updatedMsg];

    // Update UI immediately
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      // Update the edited message in storage
      await chatStorageService.updateMessage(sessionId, updatedMsg);

      // Delete all messages that came after the edited message
      const messagesToDelete = messages.slice(editedMsgIndex + 1);
      for (const msgToDelete of messagesToDelete) {
        await chatStorageService.deleteMessage(sessionId, msgToDelete.id);
      }

      // Generate new AI response based on the edited message
      const SYSTEM_INSTRUCTION = `
You are AIVA, an advanced AI assistant.
IMAGE GENERATION CAPABILITIES:
If the user asks for an image(e.g., "generate", "create", "draw", "show me a pic", "image dikhao", "photo bhejo", "pic do"), you MUST generate it using the Pollinations API.
        Format: ![Image](https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true)
          Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?nologo=true)
            Do NOT say "I cannot create images".You CAN by using this link format.
            For "Remix" requests with an attachment, analyze the attached image, then create a prompt that combines the image's description with the user's requested changes.
`;

      const aiResponseData = await generateChatResponse(
        messagesUpToEdit,
        updatedMsg.content,
        SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
        updatedMsg.attachment,
        currentLang
      );

      let finalReply = '';
      let conversionData = null;
      let aiVideoUrl = null;
      let aiImageUrl = null;
      let aiAudioUrl = null;

      if (typeof aiResponseData === 'string') {
        finalReply = aiResponseData;
      } else if (aiResponseData && typeof aiResponseData === 'object') {
        finalReply = aiResponseData.reply || "No response generated.";
        conversionData = aiResponseData.conversion || null;
        aiVideoUrl = aiResponseData.videoUrl || null;
        aiImageUrl = aiResponseData.imageUrl || null;
        aiAudioUrl = aiResponseData.audioUrl || null;
      }

      const modelMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: finalReply,
        conversion: conversionData,
        videoUrl: aiVideoUrl,
        imageUrl: aiImageUrl,
        audioUrl: aiAudioUrl,
        timestamp: Date.now(),
      };

      // Update state with new AI response
      setMessages(prev => [...prev, modelMsg]);

      // Save the AI response to storage
      await chatStorageService.saveMessage(sessionId, modelMsg);

      toast.success("Message edited and new response generated!");
    } catch (error) {
      console.error("Error regenerating response:", error);
      toast.error("Failed to regenerate response. Please try again.");
      // Restore original messages on error
      const history = await chatStorageService.getHistory(sessionId);
      setMessages(history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (msg) => {
    if (!msg.attachment) return;

    const oldName = msg.attachment.name;
    const dotIndex = oldName.lastIndexOf('.');
    const extension = dotIndex !== -1 ? oldName.slice(dotIndex) : '';
    const baseName = dotIndex !== -1 ? oldName.slice(0, dotIndex) : oldName;

    const newBaseName = prompt("Enter new filename:", baseName);
    if (!newBaseName || newBaseName === baseName) return;

    const newName = newBaseName + extension;
    const updatedMsg = {
      ...msg,
      attachment: {
        ...msg.attachment,
        name: newName
      }
    };

    setMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m));
    await chatStorageService.updateMessage(sessionId, updatedMsg);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleUndo = async () => {
    if (messages.length <= 1 || isLoading) return;

    // Last message might be AI, second to last is User
    const lastMsg = messages[messages.length - 1];
    const secondLastMsg = messages[messages.length - 2];

    const idsToDelete = [];
    let contentToRestore = "";

    if (lastMsg.role === 'model' && secondLastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id, secondLastMsg.id);
      contentToRestore = secondLastMsg.content || secondLastMsg.text || "";
    } else if (lastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id);
      contentToRestore = lastMsg.content || lastMsg.text || "";
    } else {
      idsToDelete.push(lastMsg.id);
    }

    // Restore content to input field
    if (contentToRestore) {
      setInputValue(contentToRestore);
      // Small delay to ensure state update before focusing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Set cursor at the end
          inputRef.current.selectionStart = contentToRestore.length;
          inputRef.current.selectionEnd = contentToRestore.length;
        }
      }, 50);
    }

    // Optimistic Update
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));

    // Delete from storage
    try {
      for (const id of idsToDelete) {
        if (id) {
          await chatStorageService.deleteMessage(currentSessionId, id);
        }
      }
      toast.success("Message restored to input", { icon: '↩️' });
    } catch (error) {
      console.error("Undo error:", error);
    }
  };

  const [viewingDoc, setViewingDoc] = useState(null);
  const docContainerRef = useRef(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroupCollapse = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setViewingDoc(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Process Word documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(docx|doc)$/i) && docContainerRef.current) {
      // Clear previous content
      docContainerRef.current.innerHTML = '';

      fetch(viewingDoc.url)
        .then(res => res.blob())
        .then(blob => {
          renderAsync(blob, docContainerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            className: "docx-viewer"
          }).catch(err => {
            console.error("Docx Preview Error:", err);
            docContainerRef.current.innerHTML = '<div class="text-center p-10 text-subtext">Preview not available.<br/>Please download to view.</div>';
          });
        });
    }
  }, [viewingDoc]);

  // Process Excel documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(xls|xlsx|csv)$/i)) {
      setExcelHTML(null); // Reset
      fetch(viewingDoc.url)
        .then(res => res.arrayBuffer())
        .then(ab => {
          const wb = XLSX.read(ab, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(ws, { id: "excel-preview", editable: false });
          setExcelHTML(html);
        })
        .catch(err => {
          console.error("Excel Preview Error:", err);
          setExcelHTML('<div class="text-center p-10 text-red-500">Failed to load Excel preview.</div>');
        });
    }
  }, [viewingDoc]);

  // Process Text/Code documents
  useEffect(() => {
    // Check if handled by other specific viewers
    const isSpecial = viewingDoc?.type === 'image' || viewingDoc?.name?.match(/\.(docx|doc|xls|xlsx|csv|pdf|mp4|webm|ogg|mov|mp3|wav|m4a|jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc?.url?.startsWith('data:image/');

    if (viewingDoc && !isSpecial) {
      setTextPreview(null);
      fetch(viewingDoc.url)
        .then(res => res.text())
        .then(text => {
          if (text.length > 5000000) {
            setTextPreview(text.substring(0, 5000000) + "\n\n... (File truncated due to size)");
          } else {
            setTextPreview(text);
          }
        })
        .catch(err => {
          console.error("Text Preview Error:", err);
          setTextPreview("Failed to load text content.");
        });
    }
  }, [viewingDoc]);

  // Group sessions by date
  const groupedSessionsComputed = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    if (!Array.isArray(sessions)) return groups;

    sessions.forEach(session => {
      const date = new Date(session.lastModified || session.createdAt || Date.now());
      if (date >= today) {
        groups['Today'].push(session);
      } else if (date >= yesterday) {
        groups['Yesterday'].push(session);
      } else if (date >= lastWeek) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups['Older'].push(session);
      }
    });

    return groups;
  }, [sessions]);

  return (
    <div className="flex w-full bg-secondary relative overflow-hidden aiva-scalable-text overscroll-none h-full focus:outline-none">

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-4xl h-full max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-maintext truncate max-w-md">{viewingDoc.name}</h3>
                    <p className="text-xs text-subtext">
                      {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                        ? 'Image Preview'
                        : 'File Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewingDoc.url, viewingDoc.name)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-subtext"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-subtext"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc.url.startsWith('data:image/') ? (
                  <ImageViewer
                    src={viewingDoc.url}
                    alt="Preview"
                  />
                ) : viewingDoc.name.match(/\.(docx|doc)$/i) ? (
                  <div
                    ref={docContainerRef}
                    className="bg-gray-100 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center py-8"
                  />
                ) : viewingDoc.name.match(/\.(xls|xlsx|csv)$/i) ? (
                  <div
                    className="bg-white w-full h-full overflow-auto p-4 custom-scrollbar text-black text-sm"
                    dangerouslySetInnerHTML={{ __html: excelHTML || '<div class="flex items-center justify-center h-full"><div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>' }}
                  />
                ) : viewingDoc.name.endsWith('.pdf') || viewingDoc.url.startsWith('data:application/pdf') || viewingDoc.type === 'application/pdf' ? (
                  <iframe
                    src={viewingDoc.url}
                    className="w-full h-full border-0"
                    title="Document Viewer"
                  />
                ) : viewingDoc.name.match(/\.(mp4|webm|ogg|mov)$/i) || viewingDoc.type.startsWith('video/') ? (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-lg" src={viewingDoc.url}>
                    Your browser does not support the video tag.
                  </video>
                ) : viewingDoc.name.match(/\.(mp3|wav|ogg|m4a)$/i) || viewingDoc.type.startsWith('audio/') ? (
                  <div className="p-10 bg-surface rounded-2xl flex flex-col items-center gap-6 shadow-md border border-border">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-1">{viewingDoc.name}</h3>
                      <p className="text-xs text-subtext">Audio File Player</p>
                    </div>
                    <audio controls className="w-full min-w-[300px]" src={viewingDoc.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e] p-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#cccccc] uppercase tracking-wider">
                          {viewingDoc.name.match(/\.(rar|zip|exe|dll|bin|iso|7z)$/i) ? 'BINARY CONTENT' : 'CODE READER'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e639c] text-white font-mono shadow-sm">
                        {viewingDoc.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar p-4">
                      <code className="text-xs font-mono whitespace-pre-wrap text-[#9cdcfe] break-all leading-relaxed tab-4 block">
                        {textPreview || "Reading file stream..."}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Editor */}
      <AnimatePresence>
        {isEditingImage && selectedFile && (
          <ImageEditor
            file={selectedFile}
            onClose={() => setIsEditingImage(false)}
            onSave={(newFile) => {
              processFile(newFile);
              setIsEditingImage(false);
              toast.success("Image updated!");
            }}
          />
        )}
      </AnimatePresence>

      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        toolType={selectedToolType}
        currentModel={selectedToolType ? toolModels[selectedToolType] : 'gemini-flash'}
        onSelectModel={handleModelSelect}
        pricing={TOOL_PRICING}
      />



      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: window.innerWidth < 1024 ? '100%' : 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`
              fixed lg:relative inset - y - 0 left - 0 z - [60] lg: z - 10
      h - full bg - secondary / 95 dark: bg - [#121212] / 95 border - r border - border
              flex flex - col backdrop - blur - 3xl shadow - 2xl lg: shadow - none overflow - hidden lg: rounded - r - 3xl
            `}
          >
            {/* Sidebar Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm text-maintext">History</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigate('/dashboard/chat', { state: { agentType: activeAgent.agentName, agent: activeAgent } });
                    setShowHistory(false);
                  }}
                  className="p-1.5 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="lg:hidden p-1.5 text-subtext hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3 border border-border">
                    <MessageCircle className="w-6 h-6 text-subtext/40" />
                  </div>
                  <p className="text-xs font-medium text-subtext leading-relaxed">
                    No conversations yet.<br />Start chatting with AIVA!
                  </p>
                  <button
                    onClick={() => {
                      navigate('/dashboard/chat');
                      setShowHistory(false);
                    }}
                    className="mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                Object.entries(groupedSessionsComputed).map(([group, groupSessions]) => {
                  if (groupSessions.length === 0) return null;
                  const isCollapsed = collapsedGroups[group];

                  return (
                    <div key={group} className="mb-4">
                      <button
                        onClick={() => toggleGroupCollapse(group)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-subtext uppercase tracking-wider sticky top-0 bg-secondary/95 backdrop-blur-sm z-10 hover:text-primary transition-colors group/header"
                      >
                        <span>{group}</span>
                        <div className={`p - 0.5 rounded - md transition - all ${isCollapsed ? '-rotate-90 bg-primary/10 text-primary' : 'rotate-0 text-subtext group-hover/header:bg-primary/5'} `}>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </button>

                      {!isCollapsed && (
                        <div className="space-y-1 mt-1 origin-top animate-in slide-in-from-top-2 duration-200">
                          {groupSessions.map((s) => (
                            <div key={s.sessionId} className="group relative">
                              {editingSessionId === s.sessionId ? (
                                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-xl border border-primary/20 m-1">
                                  <input
                                    autoFocus
                                    className="flex-1 bg-transparent text-sm font-bold text-maintext focus:outline-none min-w-0"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameSession(s.sessionId, editingTitle);
                                      if (e.key === 'Escape') setEditingSessionId(null);
                                    }}
                                  />
                                  <button onClick={() => handleRenameSession(s.sessionId, editingTitle)} className="p-1 text-green-500 hover:bg-green-500/10 rounded-md">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingSessionId(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-md">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      navigate(`/ dashboard / chat / ${s.sessionId} `);
                                      setShowHistory(false);
                                    }}
                                    className={`
      w - full text - left p - 3 rounded - xl transition - all flex items - start gap - 3
                                    ${currentSessionId === s.sessionId
                                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                        : 'hover:bg-surface-hover border border-transparent'
                                      }
      `}
                                  >
                                    <div className={`
      shrink - 0 w - 8 h - 8 rounded - lg flex items - center justify - center transition - colors
                                    ${currentSessionId === s.sessionId ? 'bg-primary text-white' : 'bg-secondary text-subtext group-hover:text-primary group-hover:bg-primary/10'}
      `}>
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                      <p className={`text - sm font - bold truncate leading - none mb - 1.5 ${currentSessionId === s.sessionId ? 'text-primary' : 'text-maintext'} `}>
                                        {s.title || "Untitled Chat"}
                                      </p>
                                      <p className="text-[10px] text-subtext font-medium flex items-center gap-1.5">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(s.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </p>
                                    </div>
                                  </button>

                                  {/* Session Actions */}
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSessionId(s.sessionId);
                                        setEditingTitle(s.title || "");
                                      }}
                                      className="p-1.5 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                      title="Rename"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteSession(s.sessionId, e)}
                                      className="p-1.5 text-subtext hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence >

      {/* Main Area */}
      <div
        className="flex-1 flex flex-col relative bg-gradient-to-br from-secondary via-background to-secondary/50 w-full min-w-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary flex flex-col items-center justify-center pointer-events-none">
            <Cloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-primary">Drop to Upload</h3>
          </div>
        )}

        {/* Header */}
        <div className="h-12 md:h-14 border-b border-border flex items-center justify-between px-3 md:px-4 bg-secondary z-10 shrink-0 gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => setTglState(prev => ({ ...prev, sidebarOpen: true }))}
              className="lg:hidden p-2 -ml-2 text-subtext hover:text-maintext rounded-lg hover:bg-surface/50 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p - 2 rounded - lg transition - colors ${showHistory ? 'text-primary bg-primary/10' : 'text-subtext hover:text-maintext hover:bg-surface/50'} `}
              title="Chat History"
            >
              <History className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary truncate">
                {activeAgent.agentName === 'AIVA' || !activeAgent.agentName ? t('brandName') : activeAgent.agentName}
              </span>
              {activeAgent.agentName !== 'AIVA' && activeAgent.agentName && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  Powered by A-Series
                </span>
              )}
            </div>
          </div>

          {/* Mode Indicator & Actions */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: `${getModeColor(isDeepSearch ? 'DEEP_SEARCH' : currentMode)} 15`,
                color: getModeColor(isDeepSearch ? 'DEEP_SEARCH' : currentMode)
              }}
            >
              <span>{getModeIcon(isDeepSearch ? 'DEEP_SEARCH' : currentMode)}</span>
              <span className="hidden sm:inline">{getModeName(isDeepSearch ? 'DEEP_SEARCH' : currentMode)}</span>
            </div>
          </div>
        </div>





        {/* <button className="flex items-center gap-2 text-subtext hover:text-maintext text-sm">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Device</span>
            </button> */}



        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto p-1 sm:p-2 md:p-3 pb-48 md:pb-56 space-y-2.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent aiva-scalable-text"
        >
          {messages.length > 0 && (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`group relative flex items - start gap - 2 md: gap - 3 w - full max - w - 5xl mx - auto cursor - pointer ${msg.role === 'user' ? 'flex-row-reverse' : ''
                    } `}
                  onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                >
                  {/* Actions Menu (Always visible for discoverability) */}

                  <div
                    className={`w - 8 h - 8 rounded - full flex items - center justify - center shrink - 0 ${msg.role === 'user'
                      ? 'bg-primary/80 backdrop-blur-md shadow-sm'
                      : 'bg-surface border border-border shadow-sm'
                      } `}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <img src={msg.agentAvatar || "/AGENTS_IMG/AIVA.png"} alt={msg.agentName || "AI"} className="w-5 h-5 object-contain" />
                    )}
                  </div>

                  <div
                    className={`flex flex - col ${msg.role === 'user' ? 'items-end' : 'items-start'
                      } max - w - [85 %] sm: max - w - [80 %] md: max - w - [75 %]`}
                  >
                    <div
                      className={`group / bubble relative px - 3 py - 2.5 sm: px - 5 sm: py - 4 rounded - 2xl sm: rounded - [1.5rem] leading - relaxed whitespace - pre - wrap break-words shadow - sm w - fit max - w - full transition - all duration - 300 min - h - [40px] hover: scale - [1.002] ${msg.role === 'user'
                        ? 'bg-primary/80 backdrop-blur-md border border-white/20 text-white rounded-tr-sm shadow-lg shadow-primary/20 text-sm sm:text-base'
                        : `bg-surface border border-border/40 text-maintext rounded-tl-sm shadow-sm hover:shadow-md text-sm sm:text-base ${msg.id === typingMessageId ? 'ai-typing-glow ai-typing-shimmer outline outline-offset-1 outline-primary/20' : ''}`
                        } `}
                    >

                      {msg.isProcessing && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 animate-pulse">
                          <Loader size="sm" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-tighter">Preparing Audio...</span>
                        </div>
                      )}

                      {/* Attachment Display */}
                      {((msg.attachments && msg.attachments.length > 0) || msg.attachment) && (
                        <div className="flex flex-col gap-3 mb-3 mt-1">
                          {(msg.attachments || (msg.attachment ? [msg.attachment] : [])).map((att, idx) => (
                            <div key={idx} className="w-full">
                              {att.type === 'image' ? (
                                <div
                                  className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.01] cursor-pointer max-w-[320px]"
                                  onClick={() => setViewingDoc(att)}
                                >
                                  <img
                                    src={att.url}
                                    alt="Attachment"
                                    className="w-full h-auto max-h-[400px] object-contain bg-black/5"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`flex items - center gap - 3 p - 3 rounded - xl border transition - colors backdrop - blur - md ${msg.role === 'user' ? 'bg-transparent border-white/20 hover:bg-white/10 shadow-none' : 'bg-secondary/30 border-border hover:bg-secondary/50'} `}>
                                  <div
                                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer p-0.5 rounded-lg"
                                    onClick={() => setViewingDoc(att)}
                                  >
                                    <div className={`w - 10 h - 10 rounded - lg flex items - center justify - center shrink - 0 ${(() => {
                                      const name = (att.name || '').toLowerCase();
                                      if (msg.role === 'user') return 'bg-white shadow-sm';
                                      if (name.endsWith('.pdf')) return 'bg-red-50 dark:bg-red-900/20';
                                      if (name.match(/\.(doc|docx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                                      if (name.match(/\.(xls|xlsx|csv)$/)) return 'bg-emerald-50 dark:bg-emerald-900/20';
                                      if (name.match(/\.(ppt|pptx)$/)) return 'bg-orange-50 dark:bg-orange-900/20';
                                      return 'bg-secondary';
                                    })()
                                      } `}>
                                      {(() => {
                                        const name = (att.name || '').toLowerCase();
                                        const baseClass = "w-6 h-6";
                                        if (name.match(/\.(xls|xlsx|csv)$/)) return <FileSpreadsheet className={`${baseClass} text - emerald - 600`} />;
                                        if (name.match(/\.(ppt|pptx)$/)) return <Presentation className={`${baseClass} text - orange - 600`} />;
                                        if (name.endsWith('.pdf')) return <FileText className={`${baseClass} text - red - 600`} />;
                                        if (name.match(/\.(doc|docx)$/)) return <FileIcon className={`${baseClass} text - blue - 600`} />;
                                        return <FileIcon className={`${baseClass} text - primary`} />;
                                      })()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold truncate text-xs mb-0.5">{att.name || 'File'}</p>
                                      <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                                        {(() => {
                                          const name = (att.name || '').toLowerCase();
                                          if (name.endsWith('.pdf')) return 'PDF • Preview';
                                          if (name.match(/\.(doc|docx)$/)) return 'WORD • Preview';
                                          if (name.match(/\.(xls|xlsx|csv)$/)) return 'EXCEL';
                                          if (name.match(/\.(ppt|pptx)$/)) return 'SLIDES';
                                          return 'DOCUMENT';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className={`p - 2 rounded - lg transition - colors shrink - 0 ${msg.role === 'user' ? 'hover:bg-white/20 text-white' : 'hover:bg-primary/10 text-primary'} `}
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}






                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 min-w-[200px] w-full">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white/10 text-white rounded-xl p-3 text-sm focus:outline-none resize-none border border-white/20 placeholder-white/50"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit(msg);
                              }
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <div className="flex gap-3 justify-end items-center">
                            <button
                              onClick={cancelEdit}
                              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(msg)}
                              className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.content && (
                          <div id={`msg - text - ${msg.id} `} className={`max - w - full break-words leading - relaxed whitespace - normal ${msg.role === 'user' ? 'text-white' : 'text-maintext'} `}>
                            {msg.role === 'user' && msg.mode && msg.mode !== MODES.NORMAL_CHAT && (
                              <div
                                className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-full w-fit border border-white/10 shadow-sm backdrop-blur-xl"
                                style={{
                                  backgroundColor: `${getModeColor(msg.mode)} 22`,
                                  borderColor: `${getModeColor(msg.mode)} 44`
                                }}
                              >
                                <span className="text-[10px] sm:text-xs drop-shadow-sm">{getModeIcon(msg.mode)}</span>
                                <span
                                  className="text-[9px] font-black uppercase tracking-[0.1em] drop-shadow-sm"
                                  style={{ color: 'white' }}
                                >
                                  {getModeName(msg.mode)}
                                </span>
                              </div>
                            )}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => {
                                  const isInternal = href && href.startsWith('/');
                                  if (isInternal) {
                                    return (
                                      <button
                                        onClick={() => navigate(href)}
                                        className="text-primary hover:underline font-bold"
                                      >
                                        {children}
                                      </button>
                                    );
                                  }
                                  return (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                                    >
                                      {children}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  );
                                },
                                p: ({ children }) => <p className={`mb-1.5 last:mb-0 ${msg.role === 'user' ? 'm-0 leading-normal' : 'leading-relaxed'} `}>{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 last:mb-0 space-y-1.5 marker:text-primary transition-all">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 last:mb-0 space-y-1.5 marker:text-primary transition-all">{children}</ol>,
                                li: ({ children }) => <li className="mb-1 last:mb-0 transition-colors">{children}</li>,
                                h1: ({ children }) => <h1 className="font-bold mb-2 mt-3 block text-[1.4em] text-primary tracking-tight">{children}</h1>,
                                h2: ({ children }) => <h2 className="font-bold mb-1.5 mt-2 block text-[1.2em] text-primary tracking-tight">{children}</h2>,
                                h3: ({ children }) => <h3 className="font-bold mb-1 mt-1.5 block text-[1.1em] text-primary tracking-tight">{children}</h3>,
                                strong: ({ children }) => <strong className="font-bold text-primary/90">{children}</strong>,
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  if (!inline && match) {
                                    return (
                                      <div className="relative group/code my-4">
                                        <div className="absolute top-0 left-0 right-0 h-9 bg-surface/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 rounded-t-xl z-10">
                                          <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-subtext/60 ml-2">
                                              {match[1]}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                              toast.success('Code copied!');
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-subtext/40 hover:text-primary"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <div className="overflow-x-auto rounded-xl border border-white/5 shadow-2xl bg-[#050505]">
                                          <pre className="p-4 pt-12 text-sm leading-relaxed font-mono">
                                            <code className={className} {...props}>
                                              {children}
                                            </code>
                                          </pre>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-primary font-bold mx-0.5" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                img: ({ node, ...props }) => {
                                  return (
                                    <div
                                      className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm cursor-zoom-in max-w-md"
                                      onClick={() => setViewingDoc({ url: props.src, type: 'image', name: 'Generated Image' })}
                                    >
                                      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{activeAgent.agentName || 'AISA'} Generated Asset</span>
                                        </div>
                                      </div>
                                      <img
                                        {...props}
                                        className="w-full max-w-full h-auto rounded-xl bg-black/5"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.src = 'https://placehold.co/600x400?text=Image+Generating...';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/generated:opacity-100 transition-opacity pointer-events-none" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(props.src, 'aiva-generated.png');
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
                                  );
                                },
                              }}
                            >
                              {String(msg.content || msg.text || "").replace(
                                /(?:```(?:json)?\s*)?(\{[\s\S]*?"image_url"\s*:\s*"([^"]+)"[\s\S]*?\})(?:\s*```)?/gi,
                                (match, jsonBlock, url) => `\n\n![Edited Image](${url})\n\n`
                              )}
                            </ReactMarkdown>

                                                        {/* Dynamic Video Rendering */}
                            {msg.videoUrl && (
                              <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-opacity pointer-events-none">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AISA Generated Video</span>
                                  </div>
                                </div>

                                {msg.videoUrl && (
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

                      {/* File Conversion Download Button */}
                      {
                        msg.conversion && msg.conversion.file && (
                          <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                            {/* Integrated Audio Player for Voice Conversations */}
                            {msg.conversion.mimeType.startsWith('audio/') && (
                              <div className="bg-primary/5 rounded-xl p-2 border border-primary/10 mb-2">
                                <audio
                                  controls
                                  className="w-full h-10 accent-primary rounded-lg"
                                  src={msg.conversion.file ? `data:${msg.conversion.mimeType};base64,${msg.conversion.file}` : msg.conversion.blobUrl}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}

                            <div className="flex items-center justify-between px-1 py-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-maintext truncate">{msg.conversion.fileName}</p>
                                <p className="text-[10px] text-subtext font-bold uppercase tracking-widest flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                                    {msg.conversion.fileSize || "Ready"}
                                  </span>
                                  {msg.conversion.charCount && (
                                    <span className="px-1.5 py-0.5 bg-secondary/30 text-subtext rounded-md border border-border/50">
                                      {msg.conversion.charCount} CHARS
                                    </span>
                                  )}
                                  {msg.conversion.mimeType.includes('audio')
                                    ? 'AUDIO • MP3'
                                    : msg.conversion.mimeType.includes('pdf')
                                      ? 'PDF • DOCUMENT'
                                      : msg.conversion.mimeType.includes('presentation')
                                        ? 'SLIDES • PPT'
                                        : msg.conversion.mimeType.includes('spreadsheet')
                                          ? 'EXCEL • SHEET'
                                          : 'WORD • DOCUMENT'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => {
                                  try {
                                    // For conversion files, we can use the stored file property
                                    const byteCharacters = atob(msg.conversion.file);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: msg.conversion.mimeType });
                                    const url = URL.createObjectURL(blob);
                                    setViewingDoc({
                                      url: url,
                                      name: msg.conversion.fileName,
                                      type: msg.conversion.mimeType
                                    });
                                  } catch (err) {
                                    toast.error("Failed to open document preview");
                                  }
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl transition-all hover:bg-primary/20 shadow-sm font-bold text-sm active:scale-95"
                              >
                                <Eye className="w-4 h-4" />
                                Open & View
                              </button>

                              <button
                                onClick={() => {
                                  const downloadToast = toast.loading("Starting download...", { duration: 2000 });

                                  // High-visibility security tip for Chrome blocks on local IP
                                  setTimeout(() => {
                                    toast((t) => (
                                      <div className="flex flex-col gap-1">
                                        <p className="font-bold text-xs text-red-600 flex items-center gap-1">
                                          <Monitor className="w-3 h-3" /> SECURITY TIP
                                        </p>
                                        <p className="text-[11px] leading-tight">
                                          Chrome may block this because you're using a local IP.
                                          Click <b>"Download insecure file"</b> in the top-right tray to save it.
                                        </p>
                                      </div>
                                    ), {
                                      duration: 8000,
                                      position: 'top-center',
                                      style: {
                                        background: '#fff',
                                        color: '#000',
                                        border: '2px solid #ef4444',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                      }
                                    });
                                  }, 800);

                                  try {
                                    // Create download link
                                    const byteCharacters = atob(msg.conversion.file);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: msg.conversion.mimeType });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = msg.conversion.fileName;
                                    a.style.display = 'none';
                                    document.body.appendChild(a);
                                    a.click();

                                    setTimeout(() => {
                                      document.body.removeChild(a);
                                      // Revoke after a delay to ensure the browser has started the "Save As" process
                                      setTimeout(() => URL.revokeObjectURL(url), 10000);
                                      toast.dismiss(downloadToast);
                                      toast.success("Download request sent!");
                                    }, 500);
                                  } catch (err) {
                                    toast.dismiss(downloadToast);
                                    toast.error("Download failed");
                                    console.error("Manual Download Error:", err);
                                  }
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl transition-all hover:bg-primary/90 shadow-sm font-bold text-sm active:scale-95"
                              >
                                <Download className="w-4 h-4" />
                                Download {msg.conversion.mimeType.includes('audio')
                                  ? 'Audio'
                                  : msg.conversion.mimeType.includes('pdf')
                                    ? 'PDF'
                                    : msg.conversion.mimeType.includes('presentation')
                                      ? 'PPT'
                                      : msg.conversion.mimeType.includes('spreadsheet')
                                        ? 'Excel'
                                        : 'Document'}
                              </button>

                              <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border text-maintext rounded-xl transition-all hover:bg-hover font-bold text-sm shadow-sm active:scale-95 whitespace-nowrap">
                                  <Share className="w-4 h-4" />
                                  Share
                                </Menu.Button>

                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right divide-y divide-border rounded-xl bg-surface shadow-2xl border border-border focus:outline-none z-[100] overflow-hidden">
                                    <div className="px-1 py-1">

                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              const text = `I've converted "${msg.conversion.fileName}" into voice audio using ${activeAgent.agentName || 'AIVA'}! ${window.location.href}`;
                                              const url = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                                                ? `whatsapp://send?text=${encodeURIComponent(text)}`
                                                : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                              window.open(url, '_blank');
                                            }}
                                            className={`${active ? 'bg-green-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              const text = `${activeAgent.agentName || 'AIVA'} Audio Conversion: ${msg.conversion.fileName}`;
                                              const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
                                              window.open(url, '_blank');
                                            }}
                                            className={`${active ? 'bg-sky-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <Send className="h-4 w-4" />
                                            Telegram
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                    <div className="px-1 py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(window.location.href);
                                              toast.success("Link copied!");
                                            }}
                                            className={`${active ? 'bg-primary text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                          >
                                            <Copy className="h-4 w-4" />
                                            Copy Link
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </div>
                        )
                      }

                      {/* AI Feedback Actions */}
                      {
                        msg.role !== 'user' && !msg.conversion && (
                          <div className="mt-4 pt-3 border-t border-border/40 w-full block">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                              {(() => {
                                // Filter out feedback prompts for system/error messages or "Thinking..." etc.
                                const contentStr = typeof msg.content === 'string' ? msg.content : '';
                                const isSystemMessage = contentStr && (contentStr.startsWith('System Message:') || contentStr.startsWith('System Error:') || contentStr.includes('dbDemoModeMessage'));
                                if (isSystemMessage) return null;

                                // Detect if the AI response contains Hindi (Devanagari script)
                                const isHindiContent = /[\u0900-\u097F]/.test(contentStr);
                                const prompts = isHindiContent ? FEEDBACK_PROMPTS.hi : FEEDBACK_PROMPTS.en;
                                const promptIndex = (msg.id.toString().charCodeAt(msg.id.toString().length - 1) || 0) % prompts.length;
                                return (
                                  <p className="text-xs text-subtext font-medium flex items-center gap-1.5 shrink-0 m-0">
                                    {prompts[promptIndex]}
                                    <span className="text-sm">😊</span>
                                  </p>
                                );
                              })()}
                              <div className="flex flex-col items-end gap-2 self-end sm:self-auto">
                                <div className="flex items-center gap-3">
                                  {(() => {
                                    const vIcons = (() => {
                                      const mode = msg.mode;
                                      if (!mode || mode === MODES.NORMAL_CHAT || mode === MODES.DEEP_SEARCH) {
                                        return ['volume', 'copy', 'thumbsUp', 'thumbsDown', 'share', 'pdf'];
                                      }
                                      switch (mode) {
                                        case MODES.IMAGE_GEN:
                                        case MODES.VIDEO_GEN:
                                          return ['thumbsUp', 'thumbsDown'];
                                        case MODES.AUDIO_GEN:
                                          return ['volume', 'thumbsUp', 'thumbsDown'];
                                        case MODES.CODING_HELP:
                                          return ['copy', 'thumbsUp', 'thumbsDown'];
                                        case MODES.FILE_CONVERSION:
                                          return ['pdf', 'thumbsUp', 'thumbsDown'];
                                        default:
                                          return ['volume', 'copy', 'thumbsUp', 'thumbsDown', 'share', 'pdf'];
                                      }
                                    })();

                                    return (
                                      <>
                                        {vIcons.includes('volume') && (
                                          <button
                                            onClick={() => {
                                              const isHindi = /[\u0900-\u097F]/.test(msg.content);
                                              speakResponse(msg.content, isHindi ? 'Hindi' : 'English', msg.id, msg.attachments || [], true);
                                            }}
                                            className={`transition-colors p-1.5 rounded-lg ${speakingMessageId === msg.id
                                              ? 'text-primary bg-primary/10'
                                              : 'text-subtext hover:text-primary hover:bg-surface-hover'
                                              }`}
                                            title={speakingMessageId === msg.id && !isPaused ? "Pause" : "Speak"}
                                          >
                                            {speakingMessageId === msg.id && !isPaused ? (
                                              <Pause className="w-3.5 h-3.5" />
                                            ) : (
                                              <Volume2 className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        )}
                                        {vIcons.includes('copy') && (
                                          <button
                                            onClick={() => handleCopyMessage(msg.content)}
                                            className="text-subtext hover:text-maintext transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                            title="Copy"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {vIcons.includes('thumbsUp') && (
                                          <button
                                            onClick={() => handleThumbsUp(msg.id)}
                                            className={`transition-colors p-1.5 rounded-lg ${messageFeedback[msg.id]?.type === 'up'
                                              ? 'text-blue-500 bg-blue-500/10'
                                              : 'text-subtext hover:text-primary hover:bg-surface-hover'
                                              }`}
                                            title="Helpful"
                                          >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {vIcons.includes('thumbsDown') && (
                                          <button
                                            onClick={() => handleThumbsDown(msg.id)}
                                            className={`transition-colors p-1.5 rounded-lg ${messageFeedback[msg.id]?.type === 'down'
                                              ? 'text-red-500 bg-red-500/10'
                                              : 'text-subtext hover:text-red-500 hover:bg-surface-hover'
                                              }`}
                                            title="Not Helpful"
                                          >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {vIcons.includes('share') && (
                                          <button
                                            onClick={() => handleShare(msg.content)}
                                            className="text-subtext hover:text-primary transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                            title="Share Text"
                                          >
                                            <Share className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                        {vIcons.includes('pdf') && (
                                          <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="text-subtext hover:text-red-500 transition-colors flex items-center" disabled={pdfLoadingId === msg.id}>
                                              {pdfLoadingId === msg.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                              ) : (
                                                <FileText className="w-4 h-4" />
                                              )}
                                            </Menu.Button>
                                            <Transition
                                              as={Fragment}
                                              enter="transition ease-out duration-100"
                                              enterFrom="transform opacity-0 scale-95"
                                              enterTo="transform opacity-100 scale-100"
                                              leave="transition ease-in duration-75"
                                              leaveFrom="transform opacity-100 scale-100"
                                              leaveTo="transform opacity-0 scale-95"
                                            >
                                              <Menu.Items className="absolute bottom-full right-0 sm:left-0 mb-2 w-44 origin-bottom-right sm:origin-bottom-left divide-y divide-border rounded-xl bg-card shadow-2xl ring-1 ring-black ring-opacity-10 focus:outline-none z-50 overflow-hidden backdrop-blur-xl border border-border/50">
                                                <div className="px-1.5 py-1.5">
                                                  <Menu.Item>
                                                    {({ active }) => (
                                                      <button
                                                        onClick={() => handlePdfAction('open', msg)}
                                                        className={`${active ? 'bg-primary text-white shadow-md' : 'text-maintext hover:bg-primary/5'
                                                          } group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200`}
                                                      >
                                                        <Eye className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-primary'}`} />
                                                        View PDF
                                                      </button>
                                                    )}
                                                  </Menu.Item>
                                                  <Menu.Item>
                                                    {({ active }) => (
                                                      <button
                                                        onClick={() => handlePdfAction('download', msg)}
                                                        className={`${active ? 'bg-primary text-white shadow-md' : 'text-maintext hover:bg-primary/5'
                                                          } group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200`}
                                                      >
                                                        <Download className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-primary'}`} />
                                                        Download PDF
                                                      </button>
                                                    )}
                                                  </Menu.Item>
                                                  <Menu.Item>
                                                    {({ active }) => (
                                                      <button
                                                        onClick={() => handlePdfAction('share', msg)}
                                                        className={`${active ? 'bg-primary text-white shadow-md' : 'text-maintext hover:bg-primary/5'
                                                          } group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200`}
                                                      >
                                                        <Share className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-primary'}`} />
                                                        Share PDF
                                                      </button>
                                                    )}
                                                  </Menu.Item>
                                                </div>
                                              </Menu.Items>
                                            </Transition>
                                          </Menu>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>


                              </div>
                            </div>
                          </div>
                        )
                      }
                    </div >
                    <span className="text-[10px] text-subtext mt-0 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div >

                  {/* Hover Actions - User Only (AI has footer) */}
                  {
                    msg.role === 'user' && (
                      <div className={`flex items-center gap-1 transition-opacity duration-200 self-start mt-2 mr-0 flex-row-reverse ${activeMessageId === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>

                        <button
                          onClick={() => handleCopyMessage(msg.content || msg.text)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!msg.attachment && (
                          <button
                            onClick={() => startEditing(msg)}
                            className="p-1.5 text-blue-500 hover:text-primary hover:bg-surface rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {msg.attachment && (
                          <button
                            onClick={() => handleRenameFile(msg)}
                            className="p-1.5 text-blue-500 hover:text-primary hover:bg-surface rounded-full transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {/* Only show Undo for the most recent user message if it's the last or second to last message in the whole chat */}
                        {msg.id === messages.findLast(m => m.role === 'user')?.id && (
                          <button
                            onClick={handleUndo}
                            className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                            title="Undo"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleMessageDelete(msg.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  }
                </div >
              ))}

              {
                isLoading && (
                  <div className="flex items-start gap-4 max-w-4xl mx-auto">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                      <img src="/AGENTS_IMG/AIVA.png" alt="AIVA" className="w-5 h-5 object-contain" />

                    </div>
                    <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-surface border border-border flex items-center gap-3">
                      <span className="text-sm font-medium text-subtext animate-pulse">
                        {loadingText}
                      </span>
                      <div className="flex gap-1">
                        <span
                          className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )
              }
            </>
          )}

          <div ref={messagesEndRef} />
        </div >

        {/* Welcome Screen - Absolute Overlay */}
        {
          messages.length === 0 && (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-start sm:justify-center text-center px-4 pt-10 pb-32 sm:pt-20 sm:pb-40 overflow-y-auto no-scrollbar pointer-events-auto">
              <div className="flex flex-col items-center my-auto w-full max-w-4xl">









                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-maintext tracking-tight w-full leading-normal sm:leading-relaxed drop-shadow-sm px-4 shrink-0">
                  {activeAgent.agentName === 'AIVA' || !activeAgent.agentName ? t('chatPage.welcomeMessage') : `Hello! I’m ${activeAgent.agentName}, how can I help you today?`}
                </h2>

                <div className="mt-8 sm:mt-12 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-5 duration-700 shrink-0">
                  <div className="bg-gradient-to-br from-blue-600/10 via-white/5 to-purple-600/10 backdrop-blur-3xl rounded-3xl sm:rounded-[2.5rem] border border-white/20 shadow-xl p-3 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {[
                        {
                          icon: ImageIcon,
                          title: "Generate Image",
                          desc: "Create stunning visuals and artistic illustrations from your text descriptions.",
                          action: () => {
                            if (inputRef.current) {
                              inputRef.current.value = "Generate an image of ";
                              inputRef.current.focus();
                            }
                          }
                        },
                        {
                          icon: Search,
                          title: "Deep Search",
                          desc: "Comprehensive web research and data analysis for complex topics.",
                          action: () => {
                            setIsDeepSearch(true);
                            if (inputRef.current) inputRef.current.focus();
                            toast.success("Deep Search Mode Enabled");
                          }
                        },
                        {
                          icon: FileText,
                          title: "Analyze Document",
                          desc: "Chat with PDFs and documents to extract insights and summaries.",
                          action: () => uploadInputRef.current?.click()
                        },
                        {
                          icon: Headphones,
                          title: "Voice Chat",
                          desc: "Talk to AIVA naturally with real-time voice interaction.",
                          action: () => handleVoiceInput()
                        }
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={item.action}
                          className="group bg-white/30 dark:bg-white/5 border border-white/30 dark:border-white/10 p-3 rounded-2xl text-left transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 backdrop-blur-2xl shrink-0"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white ring-1 ring-white/20">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-maintext text-sm tracking-tight leading-tight">{item.title}</h4>
                          </div>
                          <p className="text-[11px] font-medium text-subtext leading-relaxed px-1 opacity-90">
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-4 bg-transparent z-20">
          <div className="max-w-5xl mx-auto relative px-1 sm:px-2">

            {/* File Preview Area */}
            {filePreviews.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-4 px-2 overflow-x-auto custom-scrollbar no-scrollbar flex gap-3 pb-2 z-20 pointer-events-auto">
                {filePreviews.map((preview) => (
                  <div
                    key={preview.id}
                    className="relative shrink-0 w-64 md:w-72 bg-surface/95 dark:bg-zinc-900/95 border border-border/50 rounded-2xl p-2.5 flex items-center gap-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-300 ring-1 ring-black/5"
                  >
                    <div className="relative group shrink-0">
                      {preview.type.startsWith('image/') ? (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border/50 bg-black/5">
                          <img src={preview.url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>
                      )}

                      <div className="absolute -top-2 -right-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(preview.id)}
                          className="p-1 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-surface"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-sm font-semibold text-maintext truncate pr-1">{preview.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-lg uppercase tracking-wider font-bold">
                          {preview.type.split('/')[1]?.split('-')[0] || 'FILE'}
                        </span>
                        <span className="text-[10px] text-subtext font-medium">
                          {(preview.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative w-full max-w-5xl mx-auto flex items-center gap-1 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 rounded-2xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-primary/20 backdrop-blur-3xl px-1 z-50">
              <input
                id="file-upload"
                type="file"
                ref={uploadInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <input
                id="drive-upload"
                type="file"
                ref={driveInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <input
                id="doc-voice-upload"
                type="file"
                onChange={handleDocToVoiceSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <input
                id="photos-upload"
                type="file"
                ref={photosInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*"
              />
              <input
                id="camera-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                capture="environment"
              />

              {/* Left Actions Group */}
              <div className="flex items-center gap-0.5 pl-0.5 shrink-0">
                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      ref={menuRef}
                      className="absolute bottom-full left-0 mb-4 w-60 bg-surface/95 dark:bg-[#1a1a1a]/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-30 backdrop-blur-xl ring-1 ring-black/5"
                    >
                      <div className="p-1.5 space-y-0.5">
                        {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canCamera && (
                          <label
                            htmlFor="camera-upload"
                            onClick={() => setTimeout(() => setIsAttachMenuOpen(false), 500)}
                            className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                              <Camera className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Camera & Scan</span>
                          </label>
                        )}
                        <label
                          htmlFor="file-upload"
                          onClick={() => setIsAttachMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                            <Paperclip className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Upload files</span>
                        </label>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  ref={attachBtnRef}
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isAttachMenuOpen ? 'bg-primary text-white rotate-45' : 'bg-secondary hover:bg-primary/10 text-subtext hover:text-primary'}`}
                  title="Add to chat"
                >
                  <Plus className="w-5 h-5" />
                </button>

                
                <div className="relative">
                  <button
                    type="button"
                    ref={toolsBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();

                      const ownedToolsCount = userAgents.length;

                      if (ownedToolsCount === 0) {
                        toast("You haven't activated any AI tools yet. Redirecting to Marketplace...", {
                          icon: '🛍️',
                          duration: 3000
                        });
                        setTimeout(() => {
                          navigate('/dashboard/marketplace');
                        }, 2000);
                        return;
                      }

                      setIsToolsMenuOpen(!isToolsMenuOpen);
                      console.log("Tools Menu Toggled:", !isToolsMenuOpen);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isToolsMenuOpen || isImageGeneration || isDeepSearch || isAudioConvertMode || isDocumentConvert || isCodeWriter || isVideoGeneration || (activeAgent.slug && activeAgent.slug.startsWith('tool-')) ? 'bg-primary/20 text-primary scale-110 shadow-lg shadow-primary/30 ring-2 ring-primary/20' : 'bg-transparent text-subtext hover:text-primary hover:bg-secondary'}`}
                    title="AI Magic Tools"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
                
              </div >

              {/* High-Visibility Tools Menu */}
              <AnimatePresence>
                {isToolsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                    ref={toolsMenuRef}
                    className="absolute bottom-full left-0 mb-4 z-50 pointer-events-none"
                  >
                    {(() => {
                      const ownedToolsCount = userAgents.length;

                      if (ownedToolsCount === 0) return null;

                      return (
                        <div className="w-72 sm:w-80 px-1 pointer-events-auto">
                          {/* Features Vertical Panel */}
                          <div className="bg-surface/95 dark:bg-[#1a1a1a]/95 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-border shadow-2xl p-2 sm:p-4 mb-2 sm:mb-4 ring-1 ring-black/5">
                            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                              {[
                                {
                                  id: 'image-gen',
                                  slug: 'tool-image-gen',
                                  title: 'Image Gen',
                                  desc: 'Create high-quality AI images.',
                                  icon: Sparkles,
                                  avatar: '/AGENTS_IMG/deepart.png',
                                  color: 'text-fuchsia-500 dark:text-fuchsia-400',
                                  bgColor: 'bg-fuchsia-500/10',
                                  active: isImageGeneration,
                                  onClick: () => {
                                    const newState = !isImageGeneration;
                                    setIsImageGeneration(newState);
                                    if (newState) {
                                      setActiveAgent({ agentName: 'Generate Image', category: 'Creative', slug: 'tool-image-gen', avatar: '/AGENTS_IMG/AISA.png' });
                                    } else {
                                      setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    }
                                    setIsDeepSearch(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsVideoGeneration(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'video-gen-standard',
                                  slug: 'tool-video-standard',
                                  title: 'AI Video Gen Standard (Veo)',
                                  desc: 'Generate high-quality video (Powered by Veo 3)',
                                  icon: Video,
                                  avatar: '/AGENTS_IMG/AIVIDEO.png',
                                  color: 'text-indigo-500 dark:text-indigo-400',
                                  bgColor: 'bg-indigo-500/10',
                                  active: activeAgent.slug === 'tool-video-standard',
                                  onClick: () => {
                                    setIsToolsMenuOpen(false);
                                    setActiveAgent({ agentName: 'AI Video Gen Standard', category: 'Creative', slug: 'tool-video-standard', avatar: '/AGENTS_IMG/AISA.png' });
                                    setInputValue("Generate a professional Veo video for...");
                                    inputRef.current?.focus();
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(true);
                                  }
                                },
                                {
                                  id: 'video-gen-pro',
                                  slug: 'tool-video-pro',
                                  title: 'AI Video Generator Pro (Veo 3)',
                                  desc: 'Cinematic Professional Video (Powered by Veo 3)',
                                  icon: Sparkles,
                                  avatar: '/AGENTS_IMG/AIVIDEO.png',
                                  color: 'text-purple-500 dark:text-purple-400',
                                  bgColor: 'bg-purple-500/10',
                                  active: activeAgent.slug === 'tool-video-pro',
                                  onClick: () => {
                                    setIsToolsMenuOpen(false);
                                    setActiveAgent({ agentName: 'AI Video Generator Pro', category: 'Creative', slug: 'tool-video-pro', avatar: '/AGENTS_IMG/AIVIDEO.png' });
                                    setInputValue("Generate an advanced Veo Pro video for...");
                                    inputRef.current?.focus();
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(true);
                                  }
                                },
                                {
                                  id: 'video-gen-max',
                                  slug: 'tool-video-max',
                                  title: 'AI Video Generator Max (Veo 3.1 Max)',
                                  desc: 'Ultra Cinematic 4K+ Production (Powered by Veo 3.1 Max)',
                                  icon: Sparkles,
                                  avatar: '/AGENTS_IMG/AIVIDEO.png',
                                  color: 'text-amber-500 dark:text-amber-400',
                                  bgColor: 'bg-amber-500/10',
                                  active: activeAgent.slug === 'tool-video-max',
                                  onClick: () => {
                                    setIsToolsMenuOpen(false);
                                    setActiveAgent({ agentName: 'AI Video Generator Max', category: 'Creative', slug: 'tool-video-max', avatar: '/AGENTS_IMG/AIVIDEO.png' });
                                    setInputValue("Generate a cinematic masterpiece with Veo Max for...");
                                    inputRef.current?.focus();
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(true);
                                  }
                                },
                                {
                                  id: 'deep-search',
                                  slug: 'tool-deep-search',
                                  title: 'Deep Search',
                                  desc: 'Advanced reasoning & web research.',
                                  icon: Search,
                                  avatar: '/AGENTS_IMG/deepsearch.png',
                                  color: 'text-blue-500 dark:text-blue-400',
                                  bgColor: 'bg-blue-500/10',
                                  active: isDeepSearch,
                                  onClick: () => {
                                    const newState = !isDeepSearch;
                                    setIsDeepSearch(newState);
                                    if (newState) {
                                      setActiveAgent({ agentName: 'Deep Search', category: 'Research', slug: 'tool-deep-search', avatar: '/AGENTS_IMG/AISA.png' });
                                    } else {
                                      setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    }
                                    setIsImageGeneration(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsVideoGeneration(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'audio-convert',
                                  slug: 'tool-audio-convert',
                                  title: 'Text to Audio',
                                  desc: 'Natural Voice synthesis.',
                                  icon: Headphones,
                                  avatar: '/AGENTS_IMG/AIVOICE.png',
                                  color: 'text-violet-500 dark:text-violet-400',
                                  bgColor: 'bg-violet-500/10',
                                  active: isAudioConvertMode,
                                  onClick: () => {
                                    const newState = !isAudioConvertMode;
                                    setIsAudioConvertMode(newState);
                                    if (newState) {
                                      setActiveAgent({ agentName: 'Convert to Audio', category: 'Creative', slug: 'tool-audio-convert', avatar: '/AGENTS_IMG/AISA.png' });
                                    } else {
                                      setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    }
                                    setIsDeepSearch(false);
                                    setIsImageGeneration(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsVideoGeneration(false);
                                    setIsVideoGeneration(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'ai-document',
                                  slug: 'tool-ai-document',
                                  title: 'AI Document Analysis',
                                  desc: 'Extract text & insights from docs.',
                                  icon: FileText,
                                  avatar: '/AGENTS_IMG/AIDOC.png',
                                  color: 'text-emerald-500 dark:text-emerald-400',
                                  bgColor: 'bg-emerald-500/10',
                                  active: activeAgent.slug === 'tool-ai-document',
                                  onClick: () => {
                                    setActiveAgent({ agentName: 'AI Document', category: 'Business OS', slug: 'tool-ai-document', avatar: '/AGENTS_IMG/default.png' });
                                    setIsImageGeneration(false);
                                    setIsVideoGeneration(false);
                                    setIsDeepSearch(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsToolsMenuOpen(false);
                                    // Trigger file upload if possible, or just focus input
                                    if (uploadInputRef.current) uploadInputRef.current.click();
                                  }
                                },
                                {
                                  id: 'ai-blur',
                                  slug: 'tool-ai-blur',
                                  title: 'AI Blur (Privacy)',
                                  desc: 'Auto-blur faces & objects in video.',
                                  icon: Eye, // Using Eye icon for privacy/visibility
                                  avatar: '/AGENTS_IMG/AIPRIVACY.png',
                                  color: 'text-gray-500 dark:text-gray-400',
                                  bgColor: 'bg-gray-500/10',
                                  active: activeAgent.slug === 'tool-ai-blur' || activeAgent.slug === 'ai-blur',
                                  onClick: () => {
                                    setActiveAgent({ agentName: 'AI Blur', category: 'Design & Creative', slug: 'tool-ai-blur', avatar: '/AGENTS_IMG/default.png' });
                                    setIsImageGeneration(false);
                                    setIsVideoGeneration(false);
                                    setIsDeepSearch(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'ai-detector',
                                  slug: 'tool-ai-detector',
                                  title: 'AI Detector',
                                  desc: 'Identify objects & people in video.',
                                  icon: Target, // Using Target icon for detection
                                  avatar: '/AGENTS_IMG/AISCAN.png',
                                  color: 'text-teal-500 dark:text-teal-400',
                                  bgColor: 'bg-teal-500/10',
                                  active: activeAgent.slug === 'tool-ai-detector' || activeAgent.slug === 'ai-detector',
                                  onClick: () => {
                                    setActiveAgent({ agentName: 'AI Detector', category: 'Data & Intelligence', slug: 'tool-ai-detector', avatar: '/AGENTS_IMG/default.png' });
                                    setIsImageGeneration(false);
                                    setIsVideoGeneration(false);
                                    setIsDeepSearch(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'convert',
                                  slug: 'tool-universal-converter',
                                  title: 'Universal Document Converter',
                                  desc: 'Bidirectional conversion for PDF, DOCX, PPTX, XLSX, and Images.',
                                  icon: FileText,
                                  avatar: '/AGENTS_IMG/AICONVERT.png',
                                  color: 'text-amber-500 dark:text-amber-400',
                                  bgColor: 'bg-amber-500/10',
                                  active: isDocumentConvert,
                                  onClick: () => {
                                    const newState = !isDocumentConvert;
                                    setIsDocumentConvert(newState);
                                    if (newState) {
                                      setActiveAgent({ agentName: 'Universal Converter', category: 'Productivity', slug: 'tool-universal-converter', avatar: '/AGENTS_IMG/AISA.png' });
                                    } else {
                                      setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    }
                                    setIsDeepSearch(false);
                                    setIsImageGeneration(false);
                                    setIsAudioConvertMode(false);
                                    setIsCodeWriter(false);
                                    setIsVideoGeneration(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'code',
                                  slug: 'tool-code-writer',
                                  title: 'Code Writer',
                                  desc: 'Expert coding & debugging.',
                                  icon: Code,
                                  avatar: '/AGENTS_IMG/AISCRIPT.png',
                                  color: 'text-emerald-500 dark:text-emerald-400',
                                  bgColor: 'bg-emerald-500/10',
                                  active: isCodeWriter,
                                  onClick: () => {
                                    const newState = !isCodeWriter;
                                    setIsCodeWriter(newState);
                                    if (newState) {
                                      setActiveAgent({ agentName: 'Code Writer', category: 'Coding', slug: 'tool-code-writer', avatar: '/AGENTS_IMG/AISA.png' });
                                    } else {
                                      setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    }
                                    setIsDeepSearch(false);
                                    setIsImageGeneration(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsVideoGeneration(false);
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'assistant',
                                  slug: 'tool-ai-personal-assistant',
                                  title: 'AI Personal Assistant',
                                  desc: 'Your dedicated AI assistant for scheduling and tasks.',
                                  icon: CalendarIcon,
                                  avatar: '/AGENTS_IMG/AIPERSONAL.png',
                                  color: 'text-rose-500 dark:text-rose-400',
                                  bgColor: 'bg-rose-500/10',
                                  active: activeAgent.slug === 'tool-ai-personal-assistant',
                                  onClick: () => {
                                    navigate('/dashboard/ai-personal-assistant');
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'image-editing',
                                  slug: 'tool-image-editing-customization',
                                  title: 'Image Editor',
                                  desc: 'AI-powered image modification.',
                                  icon: Edit2,
                                  avatar: '/AGENTS_IMG/AIMARKET.png',
                                  color: 'text-purple-500 dark:text-purple-400',
                                  bgColor: 'bg-purple-500/10',
                                  active: activeAgent.slug === 'tool-image-editing-customization',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Image Editing', category: 'Creative', slug: 'tool-image-editing-customization', avatar: '/AGENTS_IMG/AIPHOTO.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },

                                {
                                  id: 'music-lyria',
                                  slug: 'tool-lyria-for-music',
                                  title: 'Music Generation',
                                  desc: 'High-fidelity AI music generation.',
                                  icon: Music,
                                  avatar: '/AGENTS_IMG/AIMUSIC.png',
                                  color: 'text-pink-500 dark:text-pink-400',
                                  bgColor: 'bg-pink-500/10',
                                  active: activeAgent.slug === 'tool-lyria-for-music',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Lyria (For Music)', category: 'Creative', slug: 'tool-lyria-for-music', avatar: '/AGENTS_IMG/AIMUSIC.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'time-series',
                                  slug: 'tool-time-series-forecasting',
                                  title: 'Predictive Analytics',
                                  desc: 'Automated BQML forecasting.',
                                  icon: TrendingUp,
                                  avatar: '/AGENTS_IMG/AICRAFT.png',
                                  color: 'text-blue-600 dark:text-blue-400',
                                  bgColor: 'bg-blue-600/10',
                                  active: activeAgent.slug === 'tool-time-series-forecasting',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Time Series Forecasting', category: 'Data & Intelligence', slug: 'tool-time-series-forecasting', avatar: '/AGENTS_IMG/AICRAFT.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'llm-auditor',
                                  slug: 'tool-llm-auditor',
                                  title: 'LLM Auditor',
                                  desc: 'Verify AI response accuracy.',
                                  icon: ShieldCheck,
                                  avatar: '/AGENTS_IMG/AILEGAL.png',
                                  color: 'text-slate-600 dark:text-slate-400',
                                  bgColor: 'bg-slate-600/10',
                                  active: activeAgent.slug === 'tool-llm-auditor',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'LLM Auditor', category: 'Research', slug: 'tool-llm-auditor', avatar: '/AGENTS_IMG/AILEGAL.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'shopping',
                                  slug: 'tool-personalized-shopping',
                                  title: 'Smart Shopping',
                                  desc: 'Brand-tailored recommendations.',
                                  icon: ShoppingBag,
                                  avatar: '/AGENTS_IMG/AIMARKET.png',
                                  color: 'text-rose-500 dark:text-rose-400',
                                  bgColor: 'bg-rose-500/10',
                                  active: activeAgent.slug === 'tool-personalized-shopping',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Personalized Shopping', category: 'Sales & Marketing', slug: 'tool-personalized-shopping', avatar: '/AGENTS_IMG/AIMARKET.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'brand-seo',
                                  slug: 'tool-brand-search-optimization',
                                  title: 'Brand SEO',
                                  desc: 'Competitor & keyword analysis.',
                                  icon: Globe,
                                  avatar: '/AGENTS_IMG/AIBRAND.png',
                                  color: 'text-orange-600 dark:text-orange-400',
                                  bgColor: 'bg-orange-600/10',
                                  active: activeAgent.slug === 'tool-brand-search-optimization',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Brand Search Optimization', category: 'Sales & Marketing', slug: 'tool-brand-search-optimization', avatar: '/AGENTS_IMG/AIBRAND.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'fomc',
                                  slug: 'tool-fomc-research',
                                  title: 'FOMC Research',
                                  desc: 'Financial data analysis.',
                                  icon: DollarSign,
                                  avatar: '/AGENTS_IMG/AICORE.png',
                                  color: 'text-emerald-700 dark:text-emerald-500',
                                  bgColor: 'bg-emerald-700/10',
                                  active: activeAgent.slug === 'tool-fomc-research',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'FOMC Research', category: 'Research', slug: 'tool-fomc-research', avatar: '/AGENTS_IMG/AICORE.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'img-scoring',
                                  slug: 'tool-image-scoring',
                                  title: 'Image Scoring',
                                  desc: 'Policy-compliant evaluation.',
                                  icon: Target,
                                  avatar: '/AGENTS_IMG/AISCAN.png',
                                  color: 'text-blue-700 dark:text-blue-500',
                                  bgColor: 'bg-blue-700/10',
                                  active: activeAgent.slug === 'tool-image-scoring',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Image Scoring', category: 'Design & Creative', slug: 'tool-image-scoring', avatar: '/AGENTS_IMG/AISCAN.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'data-science',
                                  slug: 'tool-data-science',
                                  title: 'Data Science',
                                  desc: 'Natural language data modeling.',
                                  icon: Database,
                                  avatar: '/AGENTS_IMG/AILAB.png',
                                  color: 'text-cyan-600 dark:text-cyan-400',
                                  bgColor: 'bg-cyan-600/10',
                                  active: activeAgent.slug === 'tool-data-science',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Data Science Agent', category: 'Data & Intelligence', slug: 'tool-data-science', avatar: '/AGENTS_IMG/AILAB.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'rag-engine',
                                  slug: 'tool-rag-engine',
                                  title: 'RAG Engine',
                                  desc: 'Context-aware grounded AI.',
                                  icon: Brain,
                                  avatar: '/AGENTS_IMG/AIMIND.png',
                                  color: 'text-teal-600 dark:text-teal-400',
                                  bgColor: 'bg-teal-600/10',
                                  active: activeAgent.slug === 'tool-rag-engine',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'RAG Engine', category: 'Data & Intelligence', slug: 'tool-rag-engine', avatar: '/AGENTS_IMG/AIMIND.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'finance-advisor',
                                  slug: 'tool-financial-advisor',
                                  title: 'Finance Advisor',
                                  desc: 'Investment & finance AI.',
                                  icon: Briefcase,
                                  avatar: '/AGENTS_IMG/AIPAY.png',
                                  color: 'text-green-700 dark:text-green-500',
                                  bgColor: 'bg-green-700/10',
                                  active: activeAgent.slug === 'tool-financial-advisor',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Financial Advisor', category: 'HR & Finance', slug: 'tool-financial-advisor', avatar: '/AGENTS_IMG/AIPAY.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'marketing-agency',
                                  slug: 'tool-marketing-agency',
                                  title: 'Marketing AI',
                                  desc: 'Full-stack marketing automation.',
                                  icon: Megaphone,
                                  avatar: '/AGENTS_IMG/AIMARKET.png',
                                  color: 'text-purple-700 dark:text-purple-500',
                                  bgColor: 'bg-purple-700/10',
                                  active: activeAgent.slug === 'tool-marketing-agency',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Marketing Agency', category: 'Sales & Marketing', slug: 'tool-marketing-agency', avatar: '/AGENTS_IMG/AIMARKET.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'cust-service',
                                  slug: 'tool-customer-service',
                                  title: 'Customer Service',
                                  desc: 'Video & image-based support.',
                                  icon: Headset,
                                  avatar: '/AGENTS_IMG/AICARE.png',
                                  color: 'text-sky-600 dark:text-sky-400',
                                  bgColor: 'bg-sky-600/10',
                                  active: activeAgent.slug === 'tool-customer-service',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Customer Service AI', category: 'Business OS', slug: 'tool-customer-service', avatar: '/AGENTS_IMG/AICARE.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'academic',
                                  slug: 'tool-academic-research',
                                  title: 'Academic Assistant',
                                  desc: 'Scholarly publication analysis.',
                                  icon: GraduationCap,
                                  avatar: '/AGENTS_IMG/AIDOC.png',
                                  color: 'text-rose-700 dark:text-rose-500',
                                  bgColor: 'bg-rose-700/10',
                                  active: activeAgent.slug === 'tool-academic-research',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Academic Research Assistant', category: 'Research', slug: 'tool-academic-research', avatar: '/AGENTS_IMG/AIDOC.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'bug-assistant',
                                  slug: 'tool-bug-assistant',
                                  title: 'Bug Assistant',
                                  desc: 'Software bug resolution.',
                                  icon: Bug,
                                  avatar: '/AGENTS_IMG/AISCRIPT.png',
                                  color: 'text-zinc-700 dark:text-zinc-500',
                                  bgColor: 'bg-zinc-700/10',
                                  active: activeAgent.slug === 'tool-bug-assistant',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Bug Assistant', category: 'Coding', slug: 'tool-bug-assistant', avatar: '/AGENTS_IMG/AISCRIPT.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'travel',
                                  slug: 'tool-travel-concierge',
                                  title: 'Travel Concierge',
                                  desc: 'Real-time itinerary planning.',
                                  icon: MapPin,
                                  avatar: '/AGENTS_IMG/AITRANS.png',
                                  color: 'text-orange-600 dark:text-orange-400',
                                  bgColor: 'bg-orange-600/10',
                                  active: activeAgent.slug === 'tool-travel-concierge',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Travel Concierge', category: 'Lifestyle', slug: 'tool-travel-concierge', avatar: '/AGENTS_IMG/AITRANS.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'nvidia-nemotron',
                                  slug: 'tool-nvidia-nemotron-nano-12b',
                                  title: 'NVIDIA Nemotron',
                                  desc: 'Efficient 12B model for speed and accuracy.',
                                  icon: Zap,
                                  avatar: '/AGENTS_IMG/default.png',
                                  color: 'text-green-600 dark:text-green-400',
                                  bgColor: 'bg-green-600/10',
                                  active: activeAgent.slug === 'tool-nvidia-nemotron-nano-12b',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'NVIDIA Nemotron', category: 'Data & Intelligence', slug: 'tool-nvidia-nemotron-nano-12b', avatar: '/AGENTS_IMG/personal-assistant.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'claude-sonnet',
                                  slug: 'tool-claude-sonnet-4-5',
                                  title: 'Claude Sonnet 4.5',
                                  desc: 'Leading model for research & coding.',
                                  icon: Brain,
                                  avatar: '/AGENTS_IMG/default.png',
                                  color: 'text-orange-600 dark:text-orange-400',
                                  bgColor: 'bg-orange-600/10',
                                  active: activeAgent.slug === 'tool-claude-sonnet-4-5',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Claude Sonnet 4.5', category: 'Data & Intelligence', slug: 'tool-claude-sonnet-4-5', avatar: '/AGENTS_IMG/deep-search.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'blip2',
                                  slug: 'tool-blip2',
                                  title: 'AI Image Analysis',
                                  desc: 'Advanced vision-language reasoning.',
                                  icon: ImageIcon,
                                  avatar: '/AGENTS_IMG/default.png',
                                  color: 'text-blue-500 dark:text-blue-400',
                                  bgColor: 'bg-blue-500/10',
                                  active: activeAgent.slug === 'tool-blip2',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'BLIP2 Vision', category: 'Data & Intelligence', slug: 'tool-blip2', avatar: '/AGENTS_IMG/image-gen.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'path-foundation',
                                  slug: 'tool-path-foundation',
                                  title: 'Pathology Research',
                                  desc: 'AI for pathology diagnostics research.',
                                  icon: ShieldCheck,
                                  avatar: '/AGENTS_IMG/default.png',
                                  color: 'text-red-500 dark:text-red-400',
                                  bgColor: 'bg-red-500/10',
                                  active: activeAgent.slug === 'tool-path-foundation',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Path Foundation', category: 'Medical AI', slug: 'tool-path-foundation', avatar: '/AGENTS_IMG/rag.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                },
                                {
                                  id: 'derm-foundation',
                                  slug: 'tool-derm-foundation',
                                  title: 'Dermatology AI',
                                  desc: 'Skin condition identification AI.',
                                  icon: MapPin,
                                  avatar: '/AGENTS_IMG/default.png',
                                  color: 'text-yellow-600 dark:text-yellow-400',
                                  bgColor: 'bg-yellow-600/10',
                                  active: activeAgent?.slug === 'tool-derm-foundation',
                                  onClick: () => {
                                    setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                    setActiveAgent({ agentName: 'Derm Foundation', category: 'Medical AI', slug: 'tool-derm-foundation', avatar: '/AGENTS_IMG/dermatology.png' });
                                    setIsToolsMenuOpen(false);
                                  }
                                }
                              ].concat(
                                userAgents
                                  .filter(agent => agent && agent.slug && ![
                                    'tool-image-gen', 'tool-video-gen', 'tool-deep-search', 'tool-audio-convert',
                                    'tool-universal-converter', 'tool-code-writer', 'tool-ai-personal-assistant',
                                    'tool-image-editing-customization', 'tool-fast-video-generator', 'tool-lyria-for-music',
                                    'tool-ai-document', 'tool-ai-blur', 'tool-ai-detector', 'tool-time-series-forecasting', 'tool-llm-auditor', 'tool-personalized-shopping',
                                    'tool-brand-search-optimization', 'tool-fomc-research', 'tool-image-scoring',
                                    'tool-data-science', 'tool-rag-engine', 'tool-financial-advisor',
                                    'tool-marketing-agency', 'tool-customer-service', 'tool-academic-research',
                                    'tool-bug-assistant', 'tool-travel-concierge', 'tool-nvidia-nemotron-nano-12b',
                                    'tool-claude-sonnet-4-5', 'tool-blip2', 'tool-path-foundation', 'tool-derm-foundation'
                                  ].includes(agent.slug?.startsWith('tool-') ? agent.slug : `tool-${agent.slug}`))
                                  .map(agent => ({
                                    id: agent.slug,
                                    slug: agent.slug?.startsWith('tool-') ? agent.slug : `tool-${agent.slug}`,
                                    title: agent.agentName,
                                    desc: agent.description || agent.category,
                                    icon: getToolIcon(agent.slug?.startsWith('tool-') ? agent.slug : `tool-${agent.slug}`),
                                    avatar: agent.avatar,
                                    color: 'text-primary',
                                    bgColor: 'bg-primary/10',
                                    active: activeAgent?.slug === agent.slug || activeAgent?.slug === (agent.slug?.startsWith('tool-') ? agent.slug : `tool-${agent.slug}`),
                                    onClick: () => {
                                      setIsImageGeneration(false); setIsDeepSearch(false); setIsAudioConvertMode(false); setIsDocumentConvert(false); setIsCodeWriter(false); setIsVideoGeneration(false);
                                      setActiveAgent({ agentName: agent.agentName, category: agent.category, slug: agent.slug, avatar: agent.avatar || '/AGENTS_IMG/default.png' });
                                      setIsToolsMenuOpen(false);
                                    }
                                  }))
                              ).filter(tool => tool && tool.slug && userAgents.some(a => a && a.slug && (a.slug === tool.slug || `tool-${a.slug}` === tool.slug || a.slug === tool.slug.replace('tool-', '')))).map((tool) => (
                                <button
                                  key={tool.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    tool.onClick();
                                  }}
                                  className={`
                                  group flex items-center gap-3 sm:gap-4 w-full p-2 sm:p-3 rounded-xl transition-all duration-200 border text-left shrink-0
                                  ${tool.active
                                      ? 'bg-primary/10 border-primary/30 shadow-sm'
                                      : 'bg-surface border-border hover:bg-secondary hover:border-primary/20 hover:scale-[1.01]'
                                    }
                                `}
                                >
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 overflow-hidden ${tool.active ? 'bg-primary text-white shadow-md' : `${tool.bgColor} ${tool.color}`}`}>
                                    {tool.avatar ? (
                                      <img src={tool.avatar} alt={tool.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <tool.icon size={20} strokeWidth={2.5} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className={`text-sm font-bold tracking-tight ${tool.active ? 'text-primary' : 'text-maintext'}`}>
                                        {tool.title}
                                      </h4>
                                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Active</span>
                                    </div>
                                    <p className="text-xs text-subtext truncate opacity-90">
                                      {tool.desc}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>

                              {/* Reset to AIVA Button */}
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => {
                                    setIsToolsMenuOpen(false);
                                    navigate('/dashboard/marketplace');
                                  }}
                                  className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all group"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/20 rounded-lg text-primary text-xs shrink-0">
                                      <ShoppingBag size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Explore</span>
                                  </div>
                                  <Plus size={14} className="text-primary group-hover:rotate-90 transition-transform" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsImageGeneration(false);
                                    setIsVideoGeneration(false);
                                    setIsDeepSearch(false);
                                    setIsAudioConvertMode(false);
                                    setIsDocumentConvert(false);
                                    setIsCodeWriter(false);
                                    setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                                    setIsToolsMenuOpen(false);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 transition-all group flex items-center gap-2"
                                >
                                  <X size={14} className="group-hover:rotate-90 transition-transform" />
                                  <span className="text-xs font-bold uppercase tracking-wider">Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Input Area */}
              < div className="relative flex-1 min-w-0 py-1 px-1" >
                <AnimatePresence>
                  {(isDeepSearch || isImageGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isVideoGeneration || (activeAgent.slug && activeAgent.slug.startsWith('tool-'))) && (
                    <div className="absolute bottom-full left-0 mb-5 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full max-w-full pb-2">
                      {/* Agent Tool Pill (Primary) */}
                      {activeAgent.slug && activeAgent.slug.startsWith('tool-') && (
                        <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-xl text-xs font-bold border border-primary/30 backdrop-blur-xl whitespace-nowrap shrink-0 shadow-lg shadow-primary/10 group transition-all hover:scale-105">
                          <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                            {activeAgent.avatar ? (
                              <img src={activeAgent.avatar} alt={activeAgent.agentName} className="w-full h-full object-cover" />
                            ) : (
                              React.createElement(getToolIcon(activeAgent.slug), { size: 14, strokeWidth: 3, className: "shrink-0" })
                            )}
                          </div>
                          <span className="hidden sm:inline uppercase tracking-widest">{activeAgent.agentName}</span>
                          <button
                            onClick={() => {
                              setActiveAgent({ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA.png' });
                              setIsImageGeneration(false);
                              setIsVideoGeneration(false);
                              setIsDeepSearch(false);
                              setIsAudioConvertMode(false);
                              setIsDocumentConvert(false);
                              setIsCodeWriter(false);
                            }}
                            className="ml-1.5 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      )}

                      {isVoiceMode && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold border border-blue-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Volume2 size={12} strokeWidth={3} /> <span className="hidden sm:inline">Voice Mode</span>
                          <button onClick={() => setIsVoiceMode(false)} className="ml-1 hover:text-blue-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isAudioConvertMode && activeAgent.slug !== 'tool-audio-convert' && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-bold border border-indigo-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Headphones size={12} strokeWidth={3} /> <span className="hidden sm:inline">Audio Convert</span>
                          <button onClick={() => setIsAudioConvertMode(false)} className="ml-1 hover:text-indigo-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isDocumentConvert && activeAgent.slug !== 'tool-universal-converter' && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold border border-emerald-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <FileText size={12} strokeWidth={3} /> <span className="hidden sm:inline">Universal Converter</span>
                          <button onClick={() => setIsDocumentConvert(false)} className="ml-1 hover:text-emerald-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isCodeWriter && activeAgent.slug !== 'tool-code-writer' && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-bold border border-orange-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Code size={12} strokeWidth={3} /> <span className="hidden sm:inline">Code Writer</span>
                          <button onClick={() => setIsCodeWriter(false)} className="ml-1 hover:text-orange-800"><X size={12} /></button>
                        </motion.div>
                      )}

                    </div>
                  )}
                </AnimatePresence>



                <textarea
                  ref={inputRef}
                  value={inputValue}
                  disabled={isLoading}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim() || selectedFiles.length > 0) {
                        handleSendMessage(e);
                      }
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder={isAudioConvertMode ? "Enter text to convert..." : isDocumentConvert ? "Upload file & ask to convert..." : isCodeWriter ? "Ask for any code or paste bugs..." : `Ask ${activeAgent.agentName === 'AIVA' || !activeAgent.agentName ? 'AIVA' : activeAgent.agentName}...`}
                  rows={1}
                  className={`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none p-0 text-maintext text-left placeholder-subtext/50 resize-none overflow-y-auto custom-scrollbar leading-relaxed aiva-scalable-text flex items-center`}
                  style={{ minHeight: '24px', maxHeight: '150px', lineHeight: '24px' }}
                />
              </div >

              {/* Right Actions Group */}
              < div className="flex items-center gap-1 sm:gap-1.5 pr-0.5 shrink-0" >
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-600 uppercase">REC</span>
                  </div>
                )}

                {
                  !isListening && (
                    <>
                      {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVideo && !inputValue.trim() && (
                        <button
                          type="button"
                          onClick={() => setIsLiveMode(true)}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-subtext hover:text-primary hover:bg-secondary transition-colors"
                          title="Live Video Call"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                      )}

                      {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVoice && (
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-subtext hover:text-primary hover:bg-secondary'}`}
                          title="Voice Input"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )
                }

                {
                  isLoading ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (abortControllerRef.current) abortControllerRef.current.abort();
                        setIsLoading(false);
                        isSendingRef.current = false;
                      }}
                      className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                    >
                      <div className="w-3 h-3 bg-white rounded-sm" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">

                      <button
                        type="submit"
                        disabled={(!inputValue.trim() && filePreviews.length === 0) || isLoading}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${(!inputValue.trim() && filePreviews.length === 0) ? 'bg-secondary text-subtext/50 shadow-none' : 'bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-primary/30 hover:scale-105 hover:shadow-primary/40'}`}
                      >
                        <Send className="w-5 h-5 ml-0.5" />
                      </button>
                    </div>
                  )
                }
              </div >
            </form >
          </div >
        </div >

        {/* Live AI Modal */}
        < AnimatePresence >
          {isLiveMode && (
            <LiveAI
              onClose={() => setIsLiveMode(false)}
              language={currentLang}
            />
          )}
        </AnimatePresence >

        {/* Feedback Modal */}
        < Transition appear show={feedbackOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setFeedbackOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-maintext flex justify-between items-center"
                    >
                      Share feedback
                      <button onClick={() => setFeedbackOpen(false)} className="text-subtext hover:text-maintext">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Title>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Incorrect or incomplete", "Not what I asked for", "Slow or buggy", "Style or tone", "Safety or legal concern", "Other"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleFeedbackCategory(cat)}
                          className={`text-xs px-3 py-2 rounded-full border transition-colors ${feedbackCategory.includes(cat)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-subtext border-border hover:border-maintext'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <textarea
                        className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-3 text-sm focus:outline-none border border-transparent focus:border-border text-maintext placeholder-subtext resize-none"
                        rows={3}
                        placeholder="Share details (optional)"
                        value={feedbackDetails}
                        onChange={(e) => setFeedbackDetails(e.target.value)}
                      />
                    </div>

                    <div className="mt-4 text-[10px] text-subtext leading-tight">
                      Your conversation will be included with your feedback to help improve the AI.
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        disabled={isSubmittingFeedback}
                        className={`inline-flex justify-center items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all ${isSubmittingFeedback ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        onClick={submitFeedback}
                      >
                        {isSubmittingFeedback && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {isSubmittingFeedback ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition >

      </div >
    </div >
  );
};

export default Chat;
