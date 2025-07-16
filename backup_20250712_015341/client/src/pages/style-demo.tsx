import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Palette, Type, Sparkles, Eye } from 'lucide-react';

export default function StyleDemo() {
  const [activeSection, setActiveSection] = useState('typography');

  const sections = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'glassmorphism', label: 'Glassmorphism', icon: Eye },
    { id: 'animations', label: 'Animations', icon: Sparkles },
  ];

  const renderTypographySection = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4 text-shadow">Typography Examples</h3>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white text-shadow-lg">Main Heading (4xl)</h1>
          <h2 className="text-3xl font-bold text-white text-shadow">Secondary Heading (3xl)</h2>
          <h3 className="text-2xl font-semibold text-white text-shadow-sm">Tertiary Heading (2xl)</h3>
          <h4 className="text-xl font-medium text-white">Quaternary Heading (xl)</h4>
          <p className="text-gray-200 leading-relaxed">
            This is body text using the Inter font family. It demonstrates improved readability 
            with proper line spacing and contrast.
          </p>
        </div>
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4 text-shadow">Extended Color Palette</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-accent-primary p-4 rounded-lg text-white font-medium">Primary</div>
          <div className="bg-accent-secondary p-4 rounded-lg text-white font-medium">Secondary</div>
          <div className="bg-accent-tertiary p-4 rounded-lg text-white font-medium">Tertiary</div>
          <div className="bg-accent-success p-4 rounded-lg text-white font-medium">Success</div>
          <div className="bg-accent-warning p-4 rounded-lg text-white font-medium">Warning</div>
          <div className="bg-accent-error p-4 rounded-lg text-white font-medium">Error</div>
          <div className="bg-accent-info p-4 rounded-lg text-white font-medium">Info</div>
        </div>

        <h4 className="text-xl font-bold text-white mb-3 text-shadow-sm">Content Type Colors</h4>
        <div className="space-y-2">
          <p className="text-definition font-bold">Definition: Important concept explanations</p>
          <p className="text-example font-bold">Example: Practical demonstrations</p>
          <p className="text-instruction font-bold">Instruction: Step-by-step guidance</p>
          <p className="text-question font-bold">Question: Interactive prompts</p>
          <p className="text-answer font-bold">Answer: Correct solutions</p>
        </div>
      </div>
    </div>
  );

  const renderGlassmorphismSection = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4 text-shadow">Glassmorphism Effects</h3>
        <p className="text-gray-200 mb-4">
          This card uses the glass-effect class with backdrop blur and transparent backgrounds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-card p-4 rounded-lg">
            <h4 className="text-lg font-bold text-white mb-2">Glass Card</h4>
            <p className="text-gray-200">Lighter glassmorphism effect for content cards.</p>
          </div>
          <div className="glass-effect p-4 rounded-lg">
            <h4 className="text-lg font-bold text-white mb-2">Glass Effect</h4>
            <p className="text-gray-200">Stronger glassmorphism for overlays and modals.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnimationsSection = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4 text-shadow">Animated Backgrounds</h3>
        
        <div className="bg-animated-gradient p-6 rounded-lg text-white font-bold text-center mb-6">
          <p className="text-xl">Animated Gradient Background</p>
          <p className="text-sm mt-2 opacity-90">Watch the colors shift smoothly</p>
        </div>

        <div className="space-y-4">
          <button className="px-6 py-3 bg-accent-primary hover:bg-accent-secondary rounded-lg font-medium transition-all duration-200 text-white hover:scale-105 hover:shadow-lg">
            Hover Animation Button
          </button>
          
          <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <p className="text-white">Hover to see scale and shadow effects</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 bg-accent-primary hover:bg-accent-secondary rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-4xl font-bold text-white text-shadow-lg">Style Demo</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="glass-card p-1 rounded-lg mb-8 inline-flex">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeSection === id
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeSection === 'typography' && renderTypographySection()}
          {activeSection === 'colors' && renderColorsSection()}
          {activeSection === 'glassmorphism' && renderGlassmorphismSection()}
          {activeSection === 'animations' && renderAnimationsSection()}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Enhanced styling system with Inter font, extended color palette, glassmorphism effects, and smooth animations.
          </p>
        </div>
      </div>
    </div>
  );
}