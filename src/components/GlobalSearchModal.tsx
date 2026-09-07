import React, { useState, useEffect, useRef } from 'react';
import { Search, X, GraduationCap, Users2, Calendar, Award, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string, extra?: any) => void;
  onSelectStudent?: (studentId: string) => void;
  onSelectResult?: (type: string, id: string, link: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectStudent,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: any) => {
    if (onSelectResult) {
      onSelectResult(item.type, item.id, item.link);
    } else {
      if (item.type === 'student' && onSelectStudent) {
        onSelectStudent(item.id);
      } else if (item.type === 'group' && onNavigate) {
        onNavigate('groups', { groupId: item.id });
      } else if (item.type === 'lesson' && onNavigate) {
        onNavigate('schedule');
      } else if (item.type === 'exam' && onNavigate) {
        onNavigate('exams');
      }
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      apiRequest(`/search?q=${encodeURIComponent(query.trim())}`).then(res => {
        setLoading(false);
        if (res.success && res.data) {
          setResults(res.data);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'group': return <Users2 className="w-4 h-4 text-blue-600" />;
      case 'lesson': return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'exam': return <Award className="w-4 h-4 text-purple-600" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'student': return 'طالب';
      case 'group': return 'مجموعة';
      case 'lesson': return 'حصة';
      case 'exam': return 'اختبار';
      default: return 'عنصر';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم الهاتف، المجموعة، أو الحصة..."
            className="w-full text-sm outline-none placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            إلغاء
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400">
              جاري البحث في السجلات...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {(results || []).map((item, idx) => (
                <button
                  key={`${item.type}_${item.id}_${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-right p-3 rounded-xl flex items-center justify-between group transition-colors ${
                    selectedIndex === idx ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedIndex === idx ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'
                    }`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          {getBadge(item.type)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowLeft className={`w-4 h-4 transition-colors shrink-0 ${
                    selectedIndex === idx ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-600'
                  }`} />
                </button>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500">لم يتم العثور على أي نتائج مطابقة لـ "{query}"</p>
            </div>
          )}

          {!query && (
            <div className="p-6 text-center">
              <p className="text-xs text-slate-400">اكتب للبحث الفوري في قائمة الطلاب والمجموعات والحصص والاختبارات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
