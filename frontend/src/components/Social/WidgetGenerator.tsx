'use client';

import React, { useState } from 'react';
import { Copy, Check, Layout, Code2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WidgetGenerator = () => {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    if (!user) return null;

    const widgetUrl = `${window.location.origin}/widgets/${user.id}`;
    const embedCode = `<iframe 
  src="${widgetUrl}" 
  width="300" 
  height="240" 
  style="border:none; border-radius: 24px; overflow: hidden;"
  scrolling="no"
></iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">Showcase Your Progress</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Embed your stats on your blog or website</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Preview */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Code2 size={12} /> Live Preview
                        </h4>
                        <div className="bg-neutral-50 p-8 rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-100">
                            <iframe
                                src={widgetUrl}
                                width="300"
                                height="240"
                                style={{ border: 'none', borderRadius: '24px', overflow: 'hidden' }}
                                scrolling="no"
                            />
                        </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gimme the code</h4>
                        <div className="relative group">
                            <textarea
                                readOnly
                                value={embedCode}
                                className="w-full h-[140px] p-4 bg-neutral-900 text-neutral-300 font-mono text-xs rounded-xl border border-neutral-800 resize-none focus:outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                            >
                                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Copy and paste this into any HTML page.
                        </div>

                        <div className="pt-4">
                            <a
                                href={widgetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                            >
                                Open in new window <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Note */}
            {!user.is_profile_public && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                    <div className="text-amber-600 mt-0.5">⚠️</div>
                    <div>
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Profile is currently private</p>
                        <p className="text-[10px] text-amber-700 font-medium uppercase tracking-widest mt-1">
                            Your widget will only be visible if you set your profile to public in <span className="underline cursor-pointer">Settings</span>.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WidgetGenerator;
