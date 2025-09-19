import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Mail, Globe, ArrowRight, Zap, MessageSquare, Phone, Users, Bot, Send, X, Minimize2, Maximize2, HelpCircle, Lock, Eye, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  threats: string[];
  recommendations: string[];
  details: {
    suspiciousLinks: number;
    grammarIssues: number;
    urgencyKeywords: number;
    domainAge: string;
    senderReputation: string;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'email' | 'url' | 'sms' | 'social'>('email');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m your AI security assistant. I can help you understand phishing attacks, explain security best practices, or answer any questions about online safety. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const mockAnalyze = (text: string, type: 'email' | 'url' | 'sms' | 'social'): AnalysisResult => {
    // Mock analysis algorithm
    const suspiciousPatterns = [
      'urgent', 'immediate', 'verify', 'suspended', 'click here', 
      'act now', 'limited time', 'winner', 'congratulations', 'free',
      'claim now', 'expires today', 'last chance', 'confirm identity',
      'account locked', 'security alert', 'update payment', 'prize'
    ];
    
    const smsPatterns = [
      'text stop', 'reply stop', 'opt out', 'shortcode', 'premium rate',
      'call now', 'txt back', 'send to', 'msg&data rates'
    ];
    
    const socialPatterns = [
      'dm me', 'check bio', 'link in bio', 'follow for follow',
      'investment opportunity', 'make money fast', 'work from home'
    ];
    
    const threats: string[] = [];
    const recommendations: string[] = [];
    
    const lowerText = text.toLowerCase();
    let riskScore = 0;
    
    // Check for suspicious patterns
    suspiciousPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        riskScore += 15;
        threats.push(`Contains urgency keyword: "${pattern}"`);
      }
    });
    
    // Type-specific pattern checking
    if (type === 'sms') {
      smsPatterns.forEach(pattern => {
        if (lowerText.includes(pattern)) {
          riskScore += 20;
          threats.push(`SMS-specific suspicious pattern: "${pattern}"`);
        }
      });
      
      // Check for premium rate numbers
      if (text.match(/\b(900|976|550)\d{7}\b/)) {
        riskScore += 35;
        threats.push('Premium rate phone number detected');
      }
    }
    
    if (type === 'social') {
      socialPatterns.forEach(pattern => {
        if (lowerText.includes(pattern)) {
          riskScore += 18;
          threats.push(`Social media scam indicator: "${pattern}"`);
        }
      });
    }
    
    // Check for suspicious URLs
    const urlCount = (text.match(/http[s]?:\/\/[^\s]+/g) || []).length;
    const shortUrlCount = (text.match(/(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly)/g) || []).length;
    
    if (type === 'sms' && urlCount > 0) {
      riskScore += 30;
      threats.push('Suspicious links in SMS message');
    } else if (urlCount > 2) {
      riskScore += 25;
      threats.push('Multiple suspicious links detected');
    }
    
    if (shortUrlCount > 0) {
      riskScore += 20;
      threats.push(`${shortUrlCount} shortened URL(s) detected`);
    }
    
    // Check for grammar issues (mock)
    const grammarIssues = Math.floor(Math.random() * 3);
    if (grammarIssues > 0) {
      riskScore += grammarIssues * 10;
      threats.push(`${grammarIssues} grammar/spelling issues found`);
    }
    
    // Check for suspicious domains
    if (type === 'url' && (text.includes('.tk') || text.includes('.ml') || text.includes('.ga') || text.includes('.cf'))) {
      riskScore += 30;
      threats.push('Suspicious domain detected');
    }
    
    // Check for phone numbers in inappropriate contexts
    const phoneNumbers = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);
    if (phoneNumbers && (type === 'email' || type === 'social')) {
      riskScore += 15;
      threats.push('Unexpected phone number in message');
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore < 20) {
      riskLevel = 'low';
      recommendations.push('Content appears legitimate');
      recommendations.push('Always verify sender identity');
    } else if (riskScore < 50) {
      riskLevel = 'medium';
      recommendations.push('Exercise caution with this content');
      recommendations.push('Verify through official channels');
      recommendations.push('Do not click suspicious links');
    } else {
      riskLevel = 'high';
      recommendations.push('High risk of phishing - do not interact');
      recommendations.push('Report to your IT security team');
      recommendations.push('Delete the message immediately');
    }
    
    // Type-specific recommendations
    if (type === 'sms') {
      if (riskLevel !== 'low') {
        recommendations.push('Do not reply to suspicious SMS messages');
        recommendations.push('Block the sender number');
      }
    }
    
    if (type === 'social') {
      if (riskLevel !== 'low') {
        recommendations.push('Report the account to the platform');
        recommendations.push('Do not share personal information');
      }
    }
    
    return {
      riskLevel,
      confidence: Math.min(85 + Math.floor(Math.random() * 10), 95),
      threats,
      recommendations,
      details: {
        suspiciousLinks: urlCount,
        grammarIssues,
        urgencyKeywords: suspiciousPatterns.filter(p => lowerText.includes(p)).length,
        domainAge: type === 'url' ? `${Math.floor(Math.random() * 365)} days` : 'N/A',
        senderReputation: type !== 'url' ? ['Unknown', 'Poor', 'Good'][Math.floor(Math.random() * 3)] : 'N/A'
      }
    };
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setShowResult(false);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysisResult = mockAnalyze(input, inputType);
    setResult(analysisResult);
    setIsAnalyzing(false);
    setShowResult(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  // Chatbot functions
  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('phishing') || lowerMessage.includes('what is')) {
      return "Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data. They typically use fake emails, websites, or messages that look authentic to trick victims into revealing their information.";
    }
    
    if (lowerMessage.includes('email') && (lowerMessage.includes('safe') || lowerMessage.includes('secure'))) {
      return "To stay safe with emails: 1) Always verify the sender's identity, 2) Don't click suspicious links - hover to see the real URL, 3) Be wary of urgent requests for personal info, 4) Check for grammar/spelling errors, 5) Use official websites to log into accounts, not email links.";
    }
    
    if (lowerMessage.includes('sms') || lowerMessage.includes('text')) {
      return "SMS phishing (smishing) is common. Red flags include: unexpected texts with links, requests for personal info, urgent payment demands, or messages from unknown numbers. Never click links in suspicious texts - verify through official channels instead.";
    }
    
    if (lowerMessage.includes('social media') || lowerMessage.includes('facebook') || lowerMessage.includes('instagram')) {
      return "Social media scams often involve fake investment opportunities, romance scams, or impersonation. Always verify profiles, don't share personal info with strangers, be skeptical of get-rich-quick schemes, and report suspicious accounts.";
    }
    
    if (lowerMessage.includes('password') || lowerMessage.includes('secure')) {
      return "Password security tips: Use unique, complex passwords for each account, enable two-factor authentication, use a password manager, never share passwords, and change them if you suspect a breach.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help you with: understanding different types of phishing attacks, email security best practices, SMS/text message safety, social media security, password protection, and general cybersecurity advice. What specific topic interests you?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Stay vigilant and remember - when in doubt, verify through official channels. Feel free to ask me anything else about cybersecurity!";
    }
    
    return "That's a great question! I can help you understand phishing attacks, security best practices, and how to stay safe online. Could you be more specific about what you'd like to know? For example, ask me about email security, SMS safety, or social media protection.";
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsBotTyping(true);

    // Simulate bot thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: generateBotResponse(chatInput),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, botResponse]);
    setIsBotTyping(false);
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 w-8 h-8 text-cyan-400 animate-ping opacity-20">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Phishing Attack Detector
                </h1>
                <p className="text-xs text-slate-400">AI-Powered Security Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
                <Lock className="w-4 h-4" />
                <span>Secure Analysis</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!showResult && (
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-spin-slow opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Advanced Threat
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Detection System
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Protect yourself from sophisticated phishing attacks across all communication channels. 
              Our AI-powered system analyzes emails, websites, SMS messages, and social media content 
              to identify potential security threats before they compromise your data.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        {!showResult && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 mb-8">
            <div className="mb-8">
              <label className="block text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-cyan-400" />
                <span>Select Analysis Type</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { type: 'email', icon: Mail, label: 'Email', color: 'from-blue-500 to-cyan-500' },
                  { type: 'url', icon: Globe, label: 'Website', color: 'from-emerald-500 to-teal-500' },
                  { type: 'sms', icon: MessageSquare, label: 'SMS', color: 'from-purple-500 to-pink-500' },
                  { type: 'social', icon: Users, label: 'Social Media', color: 'from-orange-500 to-red-500' }
                ].map(({ type, icon: Icon, label, color }) => (
                  <button
                    key={type}
                    onClick={() => setInputType(type as any)}
                    className={`group relative flex flex-col items-center space-y-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      inputType === type
                        ? `bg-gradient-to-r ${color} text-white shadow-lg shadow-blue-500/25 scale-105`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{label}</span>
                    {inputType === type && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Search className="w-5 h-5 text-cyan-400" />
                <span>
                  {inputType === 'email' && 'Paste suspicious email content:'}
                  {inputType === 'url' && 'Enter suspicious website URL:'}
                  {inputType === 'sms' && 'Paste suspicious SMS/text message:'}
                  {inputType === 'social' && 'Paste suspicious social media content:'}
                </span>
              </label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    inputType === 'email' ? 'Paste the full email content including subject, sender, and body...' :
                    inputType === 'url' ? 'Enter the website URL you want to check...' :
                    inputType === 'sms' ? 'Paste the SMS/text message content you received...' :
                    'Paste the social media post, message, or comment you want to analyze...'
                  }
                  className={`w-full px-6 py-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-white placeholder-slate-400 backdrop-blur-sm ${
                    inputType === 'url' ? 'h-24' : 'h-48'
                  }`}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                  <span>Analyzing Threat...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  <span>Detect Phishing Attack</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Section */}
        {showResult && result && (
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setShowResult(false)}
              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors group"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span>Analyze Another Threat</span>
            </button>

            {/* Risk Assessment */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Zap className="w-7 h-7 text-cyan-400" />
                <h3 className="text-3xl font-bold text-white">Threat Analysis Results</h3>
              </div>

              <div className={`flex items-center space-x-4 p-6 rounded-2xl border-2 mb-8 ${getRiskColor(result.riskLevel)}`}>
                {getRiskIcon(result.riskLevel)}
                <div>
                  <div className="font-bold text-2xl capitalize">{result.riskLevel} Risk Level</div>
                  <div className="text-lg">Analysis Confidence: {result.confidence}%</div>
                </div>
              </div>

              {/* Threats Detected */}
              {result.threats.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-white text-xl mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <span>Security Threats Identified</span>
                  </h4>
                  <div className="space-y-3">
                    {result.threats.map((threat, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-200">{threat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mb-8">
                <h4 className="font-bold text-white text-xl mb-4 flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <span>Security Recommendations</span>
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-200">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Details */}
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/50">
                <h4 className="font-bold text-white text-xl mb-4">Detailed Analysis Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Suspicious Links', value: result.details.suspiciousLinks, icon: Globe },
                    { label: 'Grammar Issues', value: result.details.grammarIssues, icon: AlertCircle },
                    { label: 'Urgency Keywords', value: result.details.urgencyKeywords, icon: Zap },
                    { label: 'Domain Age', value: result.details.domainAge, icon: Eye },
                    { label: 'Sender Reputation', value: result.details.senderReputation, icon: Shield }
                  ].map(({ label, value, icon: Icon }, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
                      <Icon className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-sm text-slate-400">{label}</div>
                        <div className="font-semibold text-white">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
          >
            <Bot className="w-6 h-6" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-ping opacity-20"></div>
          </button>
        ) : (
          <div className={`bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 transition-all duration-300 ${
            isChatMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-6 h-6 text-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-white">AI Security Assistant</h4>
                  <p className="text-xs text-slate-400">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isChatMinimized && (
              <>
                {/* Chat Messages */}
                <div ref={chatMessagesRef} className="flex-1 p-4 space-y-4 h-80 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700/50 text-slate-200 border border-slate-600/50 px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-700/50">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about phishing, security tips..."
                      className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isBotTyping}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            Advanced Multi-Platform Phishing Detector • AI-Powered Security Analysis • Always verify suspicious content through official channels
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-slate-500">
            <span>© 2024 Security Solutions</span>
            <span>•</span>
            <span>Privacy Protected</span>
            <span>•</span>
            <span>Real-time Analysis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;