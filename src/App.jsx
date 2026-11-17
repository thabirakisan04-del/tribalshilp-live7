import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookOpenText,
  Camera,
  CheckCircle2,
  CloudRain,
  CloudSun,
  HeartHandshake,
  ImagePlus,
  Leaf,
  MapPinned,
  MessageCircle,
  Mic,
  Music4,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  SunMedium,
  TrendingUp,
  Upload,
  UserRound,
  Wallet,
} from 'lucide-react';
import { askGemini, analyzeLeaf } from './utils/gemini';

const navItems = [
  { id: 'krishi', label: 'KrishiSahayak', icon: Leaf },
  { id: 'kala', label: 'KalaShilp', icon: ShoppingBag },
  { id: 'roots', label: 'TribalRoots', icon: MapPinned },
  { id: 'guru', label: 'GuruShilp', icon: BookOpenText },
];

const diseaseLibrary = [
  {
    name: 'Leaf Blast',
    crop: 'Rice',
    severity: 'High',
    confidence: 92,
    remedy: 'Apply neem-based biofungicide and avoid excess nitrogen. Maintain field spacing for air circulation.',
    remedyOdia: 'ନୀମ-ଆଧାରିତ ଜୀବ ଜନ୍ତୁ ରୋଗନିରୋଧକ ବ୍ୟବହାର କରନ୍ତୁ ଏବଂ ଅଧିକ ନଇଟ୍ରୋଜେନ ବିରତ ରହନ୍ତୁ।',
  },
  {
    name: 'Brown Spot',
    crop: 'Maize',
    severity: 'Moderate',
    confidence: 87,
    remedy: 'Use resistant seeds and remove infected debris to reduce fungal spread.',
    remedyOdia: 'ରୋଗମୁକ୍ତ ବୀଜ ବ୍ୟବହାର କରନ୍ତୁ ଏବଂ ସଂକ୍ରମିତ ପତ୍ର ତ୍ୟାଗ କରନ୍ତୁ।',
  },
  {
    name: 'Powdery Mildew',
    crop: 'Cucumber',
    severity: 'Medium',
    confidence: 81,
    remedy: 'Spray potassium bicarbonate and ensure shading during peak heat hours.',
    remedyOdia: 'ପଟାସିୟମ୍ ବିକାରଣ ସ୍ପ୍ରେ କରନ୍ତୁ ଏବଂ ଉଚ୍ଚ ଗ୍ରୀଷ୍ମରେ ଆଞ୍ଚଳିକ ଛାୟା ରଖନ୍ତୁ।',
  },
];

const marketItems = [
  {
    title: 'Pattachitra Story Scroll',
    artisan: 'Bishnu Mahapatra',
    tribe: 'Odisha',
    price: '₹2,450',
    material: 'Cotton & natural dyes',
    badge: 'Authentic',
  },
  {
    title: 'Dhokra Brass Bowl',
    artisan: 'Rita Sabar',
    tribe: 'Chhattisgarh',
    price: '₹1,980',
    material: 'Lost-wax brass',
    badge: 'Handcrafted',
  },
  {
    title: 'Sambalpuri Ikat Saree',
    artisan: 'Mina Bhoi',
    tribe: 'Western Odisha',
    price: '₹3,600',
    material: 'Silk & ikat weave',
    badge: 'Limited',
  },
];

const tribesDirectory = [
  { name: 'Gond', region: 'Madhya Pradesh', speciality: 'Forest stewardship' },
  { name: 'Santal', region: 'Jharkhand', speciality: 'Agroforestry' },
  { name: 'Bhil', region: 'Rajasthan', speciality: 'Folk music' },
  { name: 'Kondh', region: 'Odisha', speciality: 'Hill farming' },
  { name: 'Oraon', region: 'Chhattisgarh', speciality: 'Rice cultivation' },
  { name: 'Munda', region: 'Jharkhand', speciality: 'Traditional ecology' },
];

const guruModules = [
  {
    title: 'Pattachitra Storytelling',
    duration: '14 min',
    level: 'Beginner',
    accent: 'bg-amber-100 text-amber-900',
    script: 'Learn the sacred narrative techniques of Odisha murals and color preparation from natural pigments.',
  },
  {
    title: 'Dhokra Metal Craft Basics',
    duration: '12 min',
    level: 'Intermediate',
    accent: 'bg-rose-100 text-rose-900',
    script: 'Follow the wax-mold process, polishing steps, and community finishing methods used by tribal metal artisans.',
  },
  {
    title: 'Sambalpuri Ikat Weaving',
    duration: '18 min',
    level: 'Advanced',
    accent: 'bg-emerald-100 text-emerald-900',
    script: 'Understand dyeing precision, motif mapping, and loom rhythm used in Odisha ikat design traditions.',
  },
];

const weatherData = [
  { label: 'Temperature', value: '29°C', icon: SunMedium },
  { label: 'Humidity', value: '72%', icon: CloudRain },
  { label: 'Rain', value: 'Moderate', icon: CloudSun },
];

const mandiData = [
  { crop: 'Rice', price: '₹2,180/q', change: '+4.2%' },
  { crop: 'Millet', price: '₹1,340/q', change: '+2.8%' },
  { crop: 'Tur Dal', price: '₹6,400/q', change: '+1.7%' },
];

const initialChat = {
  role: 'assistant',
  text: 'Namaskar! Ask me about tribal heritage, food systems, festivals, crafts, or general culture questions.',
};

function formatHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function App() {
  const [activeTab, setActiveTab] = useState('krishi');
  const [leafQuery, setLeafQuery] = useState('Rice');
  const [leafImage, setLeafImage] = useState('');
  const [leafInsight, setLeafInsight] = useState(null);
  const [leafLoading, setLeafLoading] = useState(false);
  const [leafError, setLeafError] = useState('');

  const [marketForm, setMarketForm] = useState({
    name: '',
    artisan: '',
    place: 'Odisha',
    price: '',
    category: 'Pattachitra',
    details: '',
  });
  const [marketPreview, setMarketPreview] = useState('');
  const [certificate, setCertificate] = useState(null);

  const [tribeQuery, setTribeQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([initialChat]);
  const [chatLoading, setChatLoading] = useState(false);

  const [playingModule, setPlayingModule] = useState(null);

  const filteredDiseases = useMemo(() => {
    if (!leafQuery.trim()) return diseaseLibrary;
    return diseaseLibrary.filter(
      (entry) =>
        entry.name.toLowerCase().includes(leafQuery.toLowerCase()) ||
        entry.crop.toLowerCase().includes(leafQuery.toLowerCase()),
    );
  }, [leafQuery]);

  const filteredTribes = useMemo(() => {
    return tribesDirectory.filter((tribe) => {
      const matchesRegion = regionFilter === 'All' || tribe.region === regionFilter;
      const matchesQuery =
        !tribeQuery.trim() ||
        tribe.name.toLowerCase().includes(tribeQuery.toLowerCase()) ||
        tribe.speciality.toLowerCase().includes(tribeQuery.toLowerCase());
      return matchesRegion && matchesQuery;
    });
  }, [regionFilter, tribeQuery]);

  const regions = ['All', ...new Set(tribesDirectory.map((tribe) => tribe.region))];

  const handleLeafScan = async () => {
    setLeafLoading(true);
    setLeafError('');
    try {
      const prompt = `You are a crop disease expert for Indian agriculture. Analyze this crop leaf image and suggest a diagnosis, confidence, and organic home remedies. Return valid JSON only with fields: disease, confidence, summaryEn, summaryOdia, remedyEn, remedyOdia, cropName.`;
      const result = await analyzeLeaf({
        cropName: leafQuery || 'Crop',
        description: `Leaf health concern: ${leafQuery}. Please include both English and Odia guidance.`,
        image: leafImage,
        prompt,
      });

      if (!result.ok) {
        setLeafError(result.error || 'Unable to analyze the leaf right now.');
        return;
      }

      setLeafInsight(result.data);
    } catch (error) {
      setLeafError(error.message || 'Unable to complete the scan.');
    } finally {
      setLeafLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLeafImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGenerateCertificate = () => {
    const signature = `${marketForm.name}-${marketForm.artisan}-${marketForm.category}-${marketForm.place}`;
    const hash = formatHash(signature);
    setCertificate({
      id: `TS-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      hash,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(signature)}`,
    });
    setMarketPreview(`Authenticity certificate generated for ${marketForm.name || 'artisan item'}.`);
  };

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { role: 'user', text: chatInput };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput('');
    setChatLoading(true);

    const response = await askGemini(
      `You are a friendly cultural and heritage guide for India. Answer clearly in English and, when relevant, include a brief friendly note in simple Hindi or Odia. User question: ${userMessage.text}`,
    );

    setChatLoading(false);

    if (!response.ok) {
      setChatMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: response.error || 'The AI guide is unavailable right now. Please check your Gemini API key.',
        },
      ]);
      return;
    }

    const text = response.text || 'I am here to help with tribal heritage topics.';
    setChatMessages((current) => [...current, { role: 'assistant', text }]);
  };

  const handleSpeechPlay = (module) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setPlayingModule((current) => (current === module.title ? null : module.title));
      return;
    }

    window.speechSynthesis.cancel();
    if (playingModule === module.title) {
      setPlayingModule(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(module.script);
    utterance.lang = 'en-IN';
    utterance.onend = () => setPlayingModule(null);
    window.speechSynthesis.speak(utterance);
    setPlayingModule(module.title);
  };

  return (
    <div className="min-h-screen bg-stone-100 px-3 pb-28 pt-5 text-stone-800">
      <div className="mx-auto max-w-md">
        <header className="mb-4 rounded-[28px] bg-gradient-to-r from-forest via-emerald-800 to-emerald-700 p-4 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Science Exhibition</p>
              <h1 className="mt-1 text-2xl font-bold">TribalShilp</h1>
            </div>
            <div className="rounded-full bg-white/10 p-2">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </header>

        <main className="space-y-4">
          {activeTab === 'krishi' && (
            <section className="space-y-4">
              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">KrishiSahayak</p>
                    <h2 className="text-xl font-bold text-forest">Crop & Leaf Scanner</h2>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-2 text-forest">
                    <Leaf className="h-5 w-5" />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-3 text-sm font-medium text-forest">
                  <Upload className="h-4 w-4" />
                  Upload crop leaf photo
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                </label>

                {leafImage && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200">
                    <img src={leafImage} alt="Leaf preview" className="h-40 w-full object-cover" />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-stone-100 px-3 py-2">
                  <Search className="h-4 w-4 text-stone-500" />
                  <input
                    value={leafQuery}
                    onChange={(e) => setLeafQuery(e.target.value)}
                    placeholder="Search crop or disease"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                </div>

                <button
                  onClick={handleLeafScan}
                  disabled={leafLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 font-semibold text-white shadow-md disabled:opacity-70"
                >
                  {leafLoading ? 'Scanning...' : 'Scan leaf'}
                  <Camera className="h-4 w-4" />
                </button>

                {leafError && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {leafError}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-forest">Disease database</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-forest">{filteredDiseases.length} entries</span>
                </div>

                <div className="space-y-2">
                  {filteredDiseases.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setLeafInsight({
                        disease: item.name,
                        confidence: item.confidence,
                        summaryEn: `Likely ${item.name} in ${item.crop}.`,
                        summaryOdia: `${item.crop} ରେ ${item.name} ହୋଇପାରେ |`,
                        remedyEn: item.remedy,
                        remedyOdia: item.remedyOdia,
                        cropName: item.crop,
                      })}
                      className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3 text-left"
                    >
                      <div>
                        <p className="font-semibold text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.crop} • {item.severity}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-forest" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {weatherData.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-[20px] bg-white p-3 text-center shadow-soft">
                    <Icon className="mx-auto mb-2 h-5 w-5 text-ochre" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-forest">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-forest">Mandi advisory</h3>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  {mandiData.map((item) => (
                    <div key={item.crop} className="flex items-center justify-between rounded-2xl bg-stone-50 p-3">
                      <div>
                        <p className="font-semibold text-stone-800">{item.crop}</p>
                        <p className="text-xs text-stone-500">Local mandi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-forest">{item.price}</p>
                        <p className="text-xs text-emerald-600">{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {leafInsight && (
                <div className="rounded-[24px] bg-gradient-to-br from-emerald-50 to-amber-50 p-4 shadow-soft">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-forest">AI diagnosis</h3>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Disease</p>
                      <p className="mt-1 text-lg font-bold text-forest">{leafInsight.disease}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Confidence</p>
                      <p className="mt-1 text-lg font-bold text-ochre">{leafInsight.confidence}%</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="font-semibold text-forest">English</p>
                      <p className="mt-1 text-stone-700">{leafInsight.summaryEn}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="font-semibold text-forest">ଓଡ଼ିଆ</p>
                      <p className="mt-1 text-stone-700">{leafInsight.summaryOdia}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="font-semibold text-forest">Organic remedy</p>
                      <p className="mt-1 text-stone-700">{leafInsight.remedyEn}</p>
                      <p className="mt-2 text-stone-600">{leafInsight.remedyOdia}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'kala' && (
            <section className="space-y-4">
              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta/70">KalaShilp</p>
                    <h2 className="text-xl font-bold text-forest">Artisan marketplace</h2>
                  </div>
                  <div className="rounded-full bg-amber-100 p-2 text-terracotta">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {marketItems.map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-stone-200 bg-stone-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest">
                          {item.badge}
                        </span>
                        <span className="text-sm font-bold text-forest">{item.price}</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-800">{item.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">By {item.artisan}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                        <span>{item.tribe}</span>
                        <span>{item.material}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-forest">+ Sell Item</h3>
                  <Plus className="h-5 w-5 text-terracotta" />
                </div>

                <div className="space-y-3">
                  <input value={marketForm.name} onChange={(e) => setMarketForm({ ...marketForm, name: e.target.value })} placeholder="Item name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                  <input value={marketForm.artisan} onChange={(e) => setMarketForm({ ...marketForm, artisan: e.target.value })} placeholder="Artisan name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={marketForm.place} onChange={(e) => setMarketForm({ ...marketForm, place: e.target.value })} placeholder="Origin" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                    <input value={marketForm.price} onChange={(e) => setMarketForm({ ...marketForm, price: e.target.value })} placeholder="Price" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                  </div>
                  <select value={marketForm.category} onChange={(e) => setMarketForm({ ...marketForm, category: e.target.value })} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest">
                    <option>Pattachitra</option>
                    <option>Dhokra</option>
                    <option>Sambalpuri Ikat</option>
                    <option>Warli</option>
                  </select>
                  <textarea value={marketForm.details} onChange={(e) => setMarketForm({ ...marketForm, details: e.target.value })} rows="3" placeholder="Describe the craftsmanship, motifs, and story" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />

                  <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-terracotta bg-rose-50 px-3 py-3 text-sm font-medium text-terracotta">
                    <ImagePlus className="h-4 w-4" />
                    Upload product photo
                    <input type="file" accept="image/*" className="hidden" />
                  </label>

                  <button onClick={handleGenerateCertificate} className="w-full rounded-2xl bg-terracotta px-4 py-3 font-semibold text-white">Generate certificate</button>
                </div>
              </div>

              {certificate && (
                <div className="rounded-[24px] bg-gradient-to-br from-amber-50 to-rose-50 p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-terracotta/80">Certificate</p>
                      <h3 className="mt-1 text-lg font-bold text-forest">Authenticity verified</h3>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-forest" />
                  </div>
                  <div className="mt-3 rounded-2xl bg-white p-3">
                    <p className="text-sm font-semibold text-stone-700">Item: {marketForm.name || 'Tribal craft item'}</p>
                    <p className="mt-1 text-xs text-stone-500">ID: {certificate.id}</p>
                    <p className="mt-2 text-xs text-stone-500">Hash: {certificate.hash}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-700">QR code preview</p>
                      <p className="text-xs text-stone-500">Secure artifact record</p>
                    </div>
                    <img src={certificate.qrCode} alt="QR code preview" className="h-20 w-20 rounded-xl border border-stone-200 bg-white p-1" />
                  </div>
                  <p className="mt-3 text-sm text-stone-700">{marketPreview}</p>
                </div>
              )}
            </section>
          )}

          {activeTab === 'roots' && (
            <section className="space-y-4">
              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">TribalRoots</p>
                    <h2 className="text-xl font-bold text-forest">Heritage directory</h2>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-2 text-forest">
                    <MapPinned className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl bg-stone-100 px-3 py-2">
                    <Search className="h-4 w-4 text-stone-500" />
                    <input value={tribeQuery} onChange={(e) => setTribeQuery(e.target.value)} placeholder="Search tribe or heritage" className="w-full bg-transparent text-sm outline-none" />
                  </div>
                  <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none">
                    {regions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 space-y-2">
                  {filteredTribes.map((tribe) => (
                    <div key={tribe.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-800">{tribe.name}</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-forest">{tribe.region}</span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">{tribe.speciality}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">Ask AI</p>
                    <h3 className="text-lg font-bold text-forest">Heritage guide</h3>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-2 text-forest">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`rounded-2xl p-3 text-sm ${message.role === 'assistant' ? 'bg-emerald-50 text-stone-700' : 'bg-stone-100 text-stone-800'}`}>
                      {message.text}
                    </div>
                  ))}
                  {chatLoading && <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Thinking...</div>}
                </div>

                <div className="mt-3 flex gap-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about history, crafts, or traditions" className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                  <button onClick={handleAskAi} className="rounded-2xl bg-forest px-3 py-2.5 font-semibold text-white">Send</button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guru' && (
            <section className="space-y-4">
              <div className="rounded-[24px] bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/80">GuruShilp</p>
                    <h2 className="text-xl font-bold text-forest">Artisan academy</h2>
                  </div>
                  <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                    <Mic className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {guruModules.map((module) => (
                    <div key={module.title} className="rounded-[22px] border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${module.accent}`}>
                          {module.level}
                        </span>
                        <span className="text-xs text-stone-500">{module.duration}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-stone-800">{module.title}</h3>
                      <p className="mt-2 text-sm text-stone-600">{module.script}</p>
                      <button onClick={() => handleSpeechPlay(module)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-2.5 font-semibold text-white">
                        <Music4 className="h-4 w-4" />
                        {playingModule === module.title ? 'Pause lesson' : 'Play lesson'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-stone-200 bg-white/90 px-3 pb-safe pt-2 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
                  isActive ? 'bg-forest text-white shadow-soft' : 'text-stone-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
