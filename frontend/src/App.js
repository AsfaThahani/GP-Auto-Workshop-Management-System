import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logoInvoice from './bill-logo.png';   
import logoLight from './logo-light.png';
import logoDark from './logo-dark.png';
import tinyLogoLight from './tiny-logo-light.png';
import tinyLogoDark from './tiny-logo-dark.png';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import {
  LayoutDashboard, Package, FileText, Sun, Moon, TrendingUp, TrendingDown, DollarSign,
  Plus, Trash2, CreditCard, Users, FileDown, Wrench, Settings,
  Sparkles, LogOut, Lock, Camera, Search, Edit2, Check, X, Wallet,
  Calendar, UserPlus, Receipt, Calculator, Bell, AlertTriangle, PanelLeftClose, PanelLeft, Eye, EyeOff, RotateCcw,
  ChevronLeft, ChevronRight, ChevronDown, Share2, Disc, HardHat, ShieldCheck, Copy, Send
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname || 'localhost'}:5000`;
const COLORS = ['#9ECAD6', '#789DBC', '#987D9A', '#55AD9B', '#9B7EBD'];

const formatPrice = (num) => {
  const n = Number(num || 0);
  return n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  });
};

const formatMileage = (val) => {
  if (!val && val !== 0) return '-';
  const s = String(val).trim();
  if (!s) return '-';
  return s.toLowerCase().endsWith('km') ? s : `${s}km`;
};

const formatInvoiceDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIdx, day);
      if (!isNaN(d.getTime())) {
        const monthName = d.toLocaleString('en-US', { month: 'short' });
        return `${day} ${monthName}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${monthName}, ${year}`;
    }
  } catch (e) {}
  return dateStr;
};

const formatCompact = (value) => {
  const n = Number(value || 0);
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

const ADMIN_ROLE_OPTIONS = [
  { value: 'Co-Owner & Admin', label: 'Co-Owner & Admin' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Managing Partner', label: 'Managing Partner' },
  { value: 'Senior Partner', label: 'Senior Partner' }
];

// --- SINGLE DATE PICKER (IOS STYLE FOR FORMS & TABLES) ---
function IOSDatePicker({ value, onChange, placeholder = 'Select date...', disabled = false, style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const parseToDate = (val) => {
    if (!val) return new Date();
    const parts = String(val).split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [viewDate, setViewDate] = useState(() => parseToDate(value));

  useEffect(() => {
    if (value) setViewDate(parseToDate(value));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(o => !o);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = (e) => { e.stopPropagation(); setViewDate(new Date(year, month - 1, 1)); };
  const nextMonth = (e) => { e.stopPropagation(); setViewDate(new Date(year, month + 1, 1)); };

  const toDateString = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const handleSelectDay = (day) => {
    const selected = toDateString(year, month, day);
    onChange(selected);
    setIsOpen(false);
  };

  const setPreset = (type) => {
    const today = new Date();
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (type === 'today') {
      onChange(fmt(today));
      setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setIsOpen(false);
    } else if (type === 'yesterday') {
      const yest = new Date();
      yest.setDate(today.getDate() - 1);
      onChange(fmt(yest));
      setViewDate(new Date(yest.getFullYear(), yest.getMonth(), 1));
      setIsOpen(false);
    }
  };

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  const daysCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysCells.push(<div key={`empty-${i}`} className="ios-day-cell empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const curStr = toDateString(year, month, d);
    const isSelected = curStr === value;
    const isToday = curStr === todayStr;
    daysCells.push(
      <button
        type="button"
        key={`day-${d}`}
        className={`ios-day-cell ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'is-today' : ''}`}
        onClick={() => handleSelectDay(d)}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="ios-select-wrapper" ref={wrapperRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 99999 : 'auto', ...style }}>
      <button
        type="button"
        className="ios-select-trigger"
        onClick={toggleOpen}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '8px', padding: '9px 12px', borderRadius: '10px',
          border: '1px solid ' + (isOpen ? 'var(--accent)' : 'var(--input-border)'),
          background: 'var(--bg-surface)',
          color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: 'var(--fs-base)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1, transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: isOpen ? '0 0 0 3px rgba(120, 157, 188, 0.18)' : 'none', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <Calendar size={15} style={{ flexShrink: 0, color: 'var(--accent)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value ? formatInvoiceDate(value) : placeholder}
          </span>
        </div>
        <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-secondary)', transition: 'transform 0.18s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <div 
          className="ios-calendar-popover" 
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 6px)', 
            left: 0, 
            zIndex: 99999, 
            minWidth: '290px', 
            width: 'max-content',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div className="ios-presets-row" style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button type="button" className="ios-preset-chip" onClick={() => setPreset('today')}>Today</button>
            <button type="button" className="ios-preset-chip" onClick={() => setPreset('yesterday')}>Yesterday</button>
          </div>
          <div className="ios-calendar-header">
            <button type="button" className="ios-calendar-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <h4>{monthName}</h4>
            <button type="button" className="ios-calendar-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
          <div className="ios-weekdays-grid">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className="ios-days-grid">
            {daysCells}
          </div>
          <div className="ios-calendar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {value ? formatInvoiceDate(value) : 'No date'}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="small-action-btn" onClick={() => { onChange(''); setIsOpen(false); }}>Clear</button>
              <button type="button" className="small-action-btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={() => setIsOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- DATE RANGE PICKER (FOR DASHBOARD) ---
function IOSCalendarPicker({ startDate, endDate, onRangeChange, isOpen, onClose }) {
  const [viewDate, setViewDate] = useState(() => startDate ? new Date(startDate) : new Date());
  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const toDateString = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const handleDayClick = (day) => {
    const selected = toDateString(year, month, day);
    if (!startDate || (startDate && endDate)) {
      onRangeChange(selected, '');
    } else {
      if (selected < startDate) {
        onRangeChange(selected, startDate);
      } else {
        onRangeChange(startDate, selected);
      }
    }
  };

  const applyPreset = (preset) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    if (preset === '7days') {
      const past = new Date(); past.setDate(today.getDate() - 7);
      onRangeChange(fmt(past), fmt(today));
    } else if (preset === '30days') {
      const past = new Date(); past.setDate(today.getDate() - 30);
      onRangeChange(fmt(past), fmt(today));
    } else if (preset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      onRangeChange(fmt(start), fmt(today));
    } else if (preset === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      onRangeChange(fmt(start), fmt(today));
    }
  };

  const daysCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysCells.push(<div key={`empty-${i}`} className="ios-day-cell empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const curStr = toDateString(year, month, d);
    const isSelected = curStr === startDate || curStr === endDate;
    const inRange = startDate && endDate && curStr > startDate && curStr < endDate;
    daysCells.push(
      <button
        type="button"
        key={`day-${d}`}
        className={`ios-day-cell ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
        onClick={() => handleDayClick(d)}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="ios-calendar-popover" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 99999, boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)' }}>
      <div className="ios-presets-row">
        <button type="button" className="ios-preset-chip" onClick={() => applyPreset('7days')}>Last 7 Days</button>
        <button type="button" className="ios-preset-chip" onClick={() => applyPreset('30days')}>Last 30 Days</button>
        <button type="button" className="ios-preset-chip" onClick={() => applyPreset('month')}>This Month</button>
        <button type="button" className="ios-preset-chip" onClick={() => applyPreset('year')}>This Year</button>
      </div>
      <div className="ios-calendar-header">
        <button type="button" className="ios-calendar-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <h4>{monthName}</h4>
        <button type="button" className="ios-calendar-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
      </div>
      <div className="ios-weekdays-grid">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>
      <div className="ios-days-grid">
        {daysCells}
      </div>
      <div className="ios-calendar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Range:</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap' }}>
            {startDate ? `${startDate} → ${endDate || '...'}` : 'No date selected'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="small-action-btn" onClick={() => onRangeChange('', '')}>Clear</button>
          <button type="button" className="small-action-btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function IOSSelect({ value, onChange, options, placeholder = 'Select...', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setIsOpen(false); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, options.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
      if (e.key === 'Enter' && highlight >= 0 && options[highlight]) {
        onChange(options[highlight].value);
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, highlight, options, onChange]);

  return (
    <div className="ios-select-wrapper" ref={wrapperRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 99999 : 'auto' }}>
      <button
        type="button"
        className="ios-select-trigger"
        onClick={() => { if (!disabled) setIsOpen(o => !o); }}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '8px', padding: '9px 12px', borderRadius: '10px',
          border: '1px solid ' + (isOpen ? 'var(--accent)' : 'var(--input-border)'),
          background: 'var(--bg-surface)',
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: 'var(--fs-base)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1, transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: isOpen ? '0 0 0 3px rgba(120, 157, 188, 0.18)' : 'none', textAlign: 'left'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-secondary)', transition: 'transform 0.18s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {isOpen && (
        <div className="ios-select-popover" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 99999, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 14px 35px rgba(0, 0, 0, 0.25)', padding: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {options.length === 0 && (<div style={{ padding: '10px 12px', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>No options</div>)}
          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlight;
            return (
              <button key={opt.value ?? idx} type="button" onMouseEnter={() => setHighlight(idx)} onClick={() => { onChange(opt.value); setIsOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: isSelected ? 'var(--accent)' : isHighlighted ? 'var(--bg-hover)' : 'transparent', color: isSelected ? '#fff' : 'var(--text-primary)', fontSize: 'var(--fs-base)', fontWeight: isSelected ? 600 : 500, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IOSAutocomplete({ value, onChange, onSelect, options, placeholder = 'Type or pick...', disabled = false, style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef(null);

  const filtered = React.useMemo(() => {
    const q = String(value || '').trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options.filter(o => o && o.toLowerCase().includes(q)).slice(0, 50);
  }, [value, options]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const commit = (val) => {
    onChange(val);
    if (onSelect) onSelect(val);
    setIsOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      handleFocus();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') { setIsOpen(false); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlight >= 0 && filtered[highlight] !== undefined) {
      e.preventDefault();
      commit(filtered[highlight]);
    }
  };

  return (
    <div className="ios-select-wrapper" ref={wrapperRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 99999 : 'auto', ...style }}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setIsOpen(true); setHighlight(-1); }}
        onFocus={handleFocus}
        onClick={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: '10px',
          border: '1px solid ' + (isOpen ? 'var(--accent)' : 'var(--input-border)'),
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: 'var(--fs-base)',
          fontWeight: 500,
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(120, 157, 188, 0.18)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s'
        }}
      />
      {isOpen && filtered.length > 0 && (
        <div
          className="ios-select-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 14px 35px rgba(0, 0, 0, 0.25)',
            padding: '6px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}
        >
          {filtered.map((opt, idx) => {
            const isHighlighted = idx === highlight;
            return (
              <button
                key={opt + idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => commit(opt)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isHighlighted ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--fs-base)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IOSQtyInput({ value, onChange, min = 0, max = 999999, step = 1, width = 100, style = {} }) {
  const clamp = (n) => {
    const num = Number(n);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };
  const set = (n) => onChange(clamp(n));
  const dec = () => set((Number(value) || 0) - step);
  const inc = () => set((Number(value) || 0) + step);
  const handleInput = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') { onChange(''); return; }
    onChange(raw);
  };
  const handleBlur = () => {
    if (value === '' || value === null || value === undefined) onChange(min);
    else set(Number(value));
  };
  const btnStyle = {
    width: '24px', height: '24px', borderRadius: '7px', border: 'none', background: 'var(--fill-tertiary)',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '14px', fontWeight: 700, lineHeight: 1, flexShrink: 0, transition: 'background 0.15s'
  };
  return (
    <div className="ios-qty-stepper" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px', borderRadius: '10px', border: '1px solid var(--input-border)', background: 'var(--bg-surface)', width: width + 'px', boxSizing: 'border-box', ...style }}>
      <button type="button" onClick={dec} disabled={(Number(value) || 0) <= min} style={{ ...btnStyle, opacity: (Number(value) || 0) <= min ? 0.35 : 1 }} title="Decrease">−</button>
      <input type="number" value={value} onChange={handleInput} onBlur={handleBlur} min={min} max={max} step={step} style={{ flex: 1, width: '100%', minWidth: 0, padding: '4px 2px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', fontWeight: 600, textAlign: 'center', outline: 'none' }} />
      <button type="button" onClick={inc} disabled={(Number(value) || 0) >= max} style={{ ...btnStyle, opacity: (Number(value) || 0) >= max ? 0.35 : 1 }} title="Increase">+</button>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ username: '', password: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [showPreview, setShowPreview] = useState(true);

  const [appAlert, setAppAlert] = useState({ isOpen: false, message: '' });
  const [deleteConfirmBox, setDeleteConfirmBox] = useState({ isOpen: false, action: null, title: '', message: '' });
  const [paymentBox, setPaymentBox] = useState({ isOpen: false, invoiceId: null, balance: 0, amount: '' });
  const [costEditBox, setCostEditBox] = useState({ isOpen: false, invoiceId: null, items: [] });
  const [viewInvoiceBox, setViewInvoiceBox] = useState({ isOpen: false, invoice: null });
  
  const [shareBox, setShareBox] = useState({ isOpen: false, phone: '', message: '', copied: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState([]);

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [isAddingInventory, setIsAddingInventory] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingFormData, setEditingFormData] = useState(null);
  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=GP+Auto&background=789DBC&color=fff';
  const [profilePic, setProfilePic] = useState(() => {
    try {
      return localStorage.getItem('gp_profile_pic') || DEFAULT_AVATAR;
    } catch (e) {
      return DEFAULT_AVATAR;
    }
  });

  const [businessInsights, setBusinessInsights] = useState('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [mergeNotice, setMergeNotice] = useState('');

  // --- REAL DATABASE STATES ---
  const [customers, setCustomers] = useState([]);
  const [newCustomerDraft, setNewCustomerDraft] = useState({ name: '', phone: '', vehicleReg: '', vehicleMake: '' });

  const [expenses, setExpenses] = useState([]);
  const [newExpenseDraft, setNewExpenseDraft] = useState({ date: new Date().toISOString().split('T')[0], desc: '', amount: '' });

  const [sales, setSales] = useState([]);
  const [newSaleDraft, setNewSaleDraft] = useState({ date: new Date().toISOString().split('T')[0], desc: '', amount: '', cost: '' });

  const [inventory, setInventory] = useState([]);
  const [newInventoryDraft, setNewInventoryDraft] = useState({ name: '', qty: '', threshold: '', price: '' });

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/customers`).then(res => res.json()).then(data => setCustomers(data)).catch(() => {});
    fetch(`${API_BASE_URL}/api/inventory`).then(res => res.json()).then(data => setInventory(data)).catch(() => {});
    fetch(`${API_BASE_URL}/api/invoices`).then(res => res.json()).then(data => setInvoices(data)).catch(() => {});
    fetch(`${API_BASE_URL}/api/sales`).then(res => res.json()).then(data => setSales(data)).catch(() => {});
    fetch(`${API_BASE_URL}/api/expenses`).then(res => res.json()).then(data => setExpenses(data)).catch(() => {});

    // Sync profile picture from backend
    fetch(`${API_BASE_URL}/api/settings/profilePic`)
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          setProfilePic(data.value);
          try { localStorage.setItem('gp_profile_pic', data.value); } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateFavicon = () => {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = isDarkMode !== undefined ? isDarkMode : isSystemDark;
      const faviconUrl = shouldUseDark ? tinyLogoDark : tinyLogoLight;

      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = faviconUrl;
    };

    updateFavicon();

    const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery && mediaQuery.addEventListener) {
      const handleThemeChange = () => updateFavicon();
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [isDarkMode]);

  const [billingDocType, setBillingDocType] = useState('Invoice');
  const [currencySymbol] = useState('Rs. ');
  const [customerMode, setCustomerMode] = useState('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [newInvoiceCustomer, setNewInvoiceCustomer] = useState({ name: '', phone: '', vehicleReg: '', vehicleMake: '' });

  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [serviceNotes, setServiceNotes] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`#${Math.floor(10000 + Math.random() * 90000)}`);

  const [timeFilter, setTimeFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [isIOSCalendarOpen, setIsIOSCalendarOpen] = useState(false);

  const [adminMembers, setAdminMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('gp_admin_members');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 1, name: 'Owner (You)', role: 'Primary Managing Partner' },
      { id: 2, name: 'Partner 1', role: 'Co-Owner & Admin' },
      { id: 3, name: 'Partner 2', role: 'Co-Owner & Admin' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('gp_admin_members', JSON.stringify(adminMembers));
    } catch (e) {}
  }, [adminMembers]);

  const [newAdminMember, setNewAdminMember] = useState({ name: '', role: 'Co-Owner & Admin' });

  const showAlert = (message) => setAppAlert({ isOpen: true, message });

  const checkDateInRange = (dateStr) => {
    if (!dateStr) return true;
    const dateObj = new Date(dateStr);
    const today = new Date();
    if (timeFilter === 'weekly') {
      const pastWeek = new Date(); pastWeek.setDate(today.getDate() - 7);
      return dateObj >= pastWeek;
    } else if (timeFilter === 'monthly') {
      const pastMonth = new Date(); pastMonth.setMonth(today.getMonth() - 1);
      return dateObj >= pastMonth;
    } else if (timeFilter === 'yearly') {
      const pastYear = new Date(); pastYear.setFullYear(today.getFullYear() - 1);
      return dateObj >= pastYear;
    } else if (timeFilter === 'custom') {
      if (customDateRange.start && dateObj < new Date(customDateRange.start)) return false;
      if (customDateRange.end && dateObj > new Date(customDateRange.end)) return false;
      return true;
    }
    return true;
  };

  const getChartLabel = () => {
    if (timeFilter === 'weekly') return 'This Week';
    if (timeFilter === 'monthly') return 'This Month';
    if (timeFilter === 'yearly') return 'This Year';
    return 'Custom Period';
  };

  const validSales = sales.filter(s => checkDateInRange(s.date));
  const validExpenses = expenses.filter(e => checkDateInRange(e.date));

  // DASHBOARD MATH COMBINED
  const salesRevenue = validSales.reduce((sum, item) => sum + Number(item.amount), 0);
  const salesGoodsCost = validSales.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const invoiceRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const invoiceGoodsCost = invoices.reduce((sum, inv) => sum + Number(inv.actualCost || 0), 0);
  const totalExpenseCost = validExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRevenue = salesRevenue + invoiceRevenue;
  const totalGoodsCost = salesGoodsCost + invoiceGoodsCost;
  const actualProfit = totalRevenue - totalGoodsCost - totalExpenseCost;

  const currentCustomer = customers.find(c => c.id === Number(selectedCustomerId) || c._id === selectedCustomerId);

  const uniqueExpenses = [...new Set(expenses.map(e => e.desc).filter(Boolean))];
  const uniqueSales = [...new Set(sales.map(s => s.desc).filter(Boolean))];
  const uniqueParts = [...new Set(inventory.map(i => i.name).filter(Boolean))];
  const uniqueCarMakes = [...new Set(customers.flatMap(c => (c.vehicles || []).map(v => v.make)).filter(Boolean))];

  const displayCustName = customerMode === 'new' ? newInvoiceCustomer.name : (currentCustomer?.name || '-');
  const displayCustPhone = customerMode === 'new' ? newInvoiceCustomer.phone : (currentCustomer?.phone || '-');
  const displayCustVehReg = customerMode === 'new' ? newInvoiceCustomer.vehicleReg : (selectedVehicleReg || '-');
  const displayCustVehMake = customerMode === 'new' ? newInvoiceCustomer.vehicleMake : (currentCustomer?.vehicles.find(v => v.reg === selectedVehicleReg)?.make || '-');

  const activeNotifications = inventory
    .filter(i => i.qty <= i.threshold && !dismissedNotifs.includes(i.id || i._id))
    .map(i => ({ id: i.id || i._id, text: `${i.name} is low on stock (${i.qty} left)` }));

  const clearNotification = (id) => { setDismissedNotifs([...dismissedNotifs, id]); };
  const handleLogin = (e) => { e.preventDefault(); if (loginDetails.username && loginDetails.password) setIsAuthenticated(true); };
  const handleLogout = () => { setIsAuthenticated(false); setLoginDetails({ username: '', password: '' }); };
  const askForConfirmation = (action, title, message) => { setDeleteConfirmBox({ isOpen: true, action, title, message }); };

  const goToPage = (page) => {
    setActivePage(page); setSearchQuery(''); setEditingItemId(null);
    setIsAddingCustomer(false); setIsAddingExpense(false); setIsAddingSale(false); setIsAddingInventory(false);
  };

  const runBusinessReport = async () => {
    setIsGeneratingInsights(true); setBusinessInsights('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-insights`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: sales, expenses: expenses, inventory: inventory })
      });
      const data = await response.json();
      setBusinessInsights(data.insight || data.message);
    } catch (error) {
      setBusinessInsights("Failed to connect to AI backend. Check your server.");
    }
    setIsGeneratingInsights(false);
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Please choose an image file (PNG, JPG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setProfilePic(dataUrl);
        try {
          localStorage.setItem('gp_profile_pic', dataUrl);
        } catch (err) {}

        fetch(`${API_BASE_URL}/api/settings/profilePic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: dataUrl })
        }).catch(err => console.warn('Could not sync profile pic to backend:', err));

        showAlert('Profile picture updated and saved successfully.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetProfilePic = () => {
    setProfilePic(DEFAULT_AVATAR);
    try {
      localStorage.removeItem('gp_profile_pic');
    } catch (err) {}
    fetch(`${API_BASE_URL}/api/settings/profilePic`, {
      method: 'DELETE'
    }).catch(() => {});
    showAlert('Profile picture reset to default avatar.');
  };

  const beginEditing = (item) => { setEditingItemId(item.id || item._id); setEditingFormData({ ...item }); };
  const stopEditing = () => { setEditingItemId(null); setEditingFormData(null); };

  const deleteItem = (category, id) => {
    askForConfirmation(async () => {
      try {
        if(category === 'customer') await fetch(`${API_BASE_URL}/api/customers/${id}`, { method: 'DELETE' });
        if(category === 'expense') await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: 'DELETE' });
        if(category === 'inventory') await fetch(`${API_BASE_URL}/api/inventory/${id}`, { method: 'DELETE' });
        if(category === 'sale') await fetch(`${API_BASE_URL}/api/sales/${id}`, { method: 'DELETE' });
      } catch (e) {}
      if(category === 'customer') setCustomers(customers.filter(c => (c.id || c._id) !== id));
      if(category === 'expense') setExpenses(expenses.filter(e => (e.id || e._id) !== id));
      if(category === 'inventory') setInventory(inventory.filter(i => (i.id || i._id) !== id));
      if(category === 'sale') setSales(sales.filter(s => (s.id || s._id) !== id));
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Confirm Delete", "Are you sure you want to delete this item?");
  };

  const saveNewCustomer = async (e) => {
    e.preventDefault(); 
    if (!newCustomerDraft.name) return;
    const newCustomerData = { name: newCustomerDraft.name, phone: newCustomerDraft.phone, vehicles: newCustomerDraft.vehicleReg ? [{ reg: newCustomerDraft.vehicleReg, make: newCustomerDraft.vehicleMake }] : [] };
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCustomerData) });
      const savedCustomer = await response.json();
      setCustomers([...customers, savedCustomer]);
      setNewCustomerDraft({ name: '', phone: '', vehicleReg: '', vehicleMake: '' }); setIsAddingCustomer(false);
    } catch (err) { showAlert("Failed to save customer."); }
  };
  
  const updateExistingCustomer = () => { 
    askForConfirmation(async () => {
      try {
        await fetch(`${API_BASE_URL}/api/customers/${editingItemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingFormData) });
      } catch (e) {}
      setCustomers(customers.map(c => (c.id || c._id) === editingItemId ? editingFormData : c)); stopEditing();
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Save Changes", "Update this customer's details?");
  };

  const saveNewExpense = async (e) => {
    e.preventDefault(); if (!newExpenseDraft.desc || !newExpenseDraft.amount) return;
    const newExpData = { date: newExpenseDraft.date || new Date().toISOString().split('T')[0], desc: newExpenseDraft.desc, amount: Number(newExpenseDraft.amount) };
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExpData) });
      const savedExp = await response.json();
      setExpenses([savedExp, ...expenses]);
      setNewExpenseDraft({ date: new Date().toISOString().split('T')[0], desc: '', amount: '' }); setIsAddingExpense(false);
    } catch (err) {
      setExpenses([{ id: Date.now(), ...newExpData }, ...expenses]);
      setNewExpenseDraft({ date: new Date().toISOString().split('T')[0], desc: '', amount: '' }); setIsAddingExpense(false);
    }
  };

  const updateExistingExpense = () => { 
    askForConfirmation(async () => {
      const updated = { ...editingFormData, amount: Number(editingFormData.amount) };
      try {
        await fetch(`${API_BASE_URL}/api/expenses/${editingItemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      } catch (e) {}
      setExpenses(expenses.map(e => (e.id || e._id) === editingItemId ? updated : e)); stopEditing();
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Save Changes", "Update this expense record?");
  };

  const saveNewInventoryItem = async (e) => {
    e.preventDefault(); 
    if (!newInventoryDraft.name || !newInventoryDraft.price) return;
    const newItemData = { name: newInventoryDraft.name, qty: Number(newInventoryDraft.qty) || 0, threshold: Number(newInventoryDraft.threshold) || 5, price: Number(newInventoryDraft.price) };
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItemData) });
      const savedItem = await response.json();
      setInventory([savedItem, ...inventory]);
      setNewInventoryDraft({ name: '', qty: '', threshold: '', price: '' }); setIsAddingInventory(false);
    } catch (err) { showAlert("Failed to save inventory."); }
  };

  const updateExistingInventoryItem = () => { 
    askForConfirmation(async () => {
      try {
        await fetch(`${API_BASE_URL}/api/inventory/${editingItemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingFormData) });
      } catch (e) {}
      setInventory(inventory.map(i => (i.id || i._id) === editingItemId ? editingFormData : i)); stopEditing();
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Save Changes", "Update this inventory item?");
  };

  // --- FIXED SALE CREATION WITH ROBUST ERROR HANDLING & OFFLINE FALLBACK ---
  const saveNewSale = async (e) => {
    e.preventDefault(); 
    if (!newSaleDraft.desc || !newSaleDraft.amount) return;
    const amountNum = Number(newSaleDraft.amount);
    const costNum = Number(newSaleDraft.cost || 0);
    const profitMargin = amountNum - costNum;
    
    // Explicitly cast numbers to guarantee schema validation succeeds
    const saleData = {
      date: newSaleDraft.date || new Date().toISOString().split('T')[0],
      desc: newSaleDraft.desc.trim(),
      amount: amountNum,
      cost: costNum,
      profit: profitMargin
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData) 
      });

      if (!response.ok) {
        let errMsg = `Server returned code ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson && (errJson.message || errJson.error)) {
            errMsg = errJson.message || errJson.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const savedSale = await response.json();
      setSales(prev => [savedSale, ...prev]);
      setNewSaleDraft({ date: new Date().toISOString().split('T')[0], desc: '', amount: '', cost: '' }); 
      setIsAddingSale(false);
    } catch (err) {
      console.error("Sale save error:", err);
      // Graceful offline fallback: if backend is down or network disconnected, save to local state
      if (err.name === 'TypeError' || err.message.toLowerCase().includes('fetch')) {
        const localSale = { id: Date.now(), ...saleData };
        setSales(prev => [localSale, ...prev]);
        setNewSaleDraft({ date: new Date().toISOString().split('T')[0], desc: '', amount: '', cost: '' }); 
        setIsAddingSale(false);
        showAlert("Server (localhost:5000) is unreachable. Sale was saved locally for this session.");
      } else {
        showAlert(`Failed to save sale: ${err.message}`);
      }
    }
  };

  const updateExistingSale = () => { 
    askForConfirmation(() => {
      const refreshedData = { 
        ...editingFormData, 
        amount: Number(editingFormData.amount || 0),
        cost: Number(editingFormData.cost || 0) 
      };
      refreshedData.profit = refreshedData.amount - refreshedData.cost;
      setSales(sales.map(s => (s.id || s._id) === editingItemId ? refreshedData : s)); stopEditing(); 
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Save Changes", "Update this sale record?");
  };

  const addLineItem = (type) => setLineItems([...lineItems, { id: Date.now() + Math.random(), type, desc: '', qty: 1, unitPrice: '' }]);
  const removeLineItem = (id) => setLineItems(lineItems.filter(t => t.id !== id));
  
  const updateLineItemDetails = (id, field, value) => {
    setLineItems(prev => {
      const current = prev.find(i => i.id === id);
      if (!current) return prev;
      if (field === 'desc' && value && String(value).trim()) {
        const norm = String(value).trim().toLowerCase();
        const duplicate = prev.find(i => i.id !== id && i.type === current.type && i.desc.trim().toLowerCase() === norm);
        if (duplicate) {
          const mergedQty = (Number(duplicate.qty) || 0) + (Number(current.qty) || 1);
          setMergeNotice(`"${duplicate.desc}" already exists — quantity increased to ${mergedQty}.`);
          setTimeout(() => setMergeNotice(''), 2500);
          return prev.filter(i => i.id !== id).map(i => i.id === duplicate.id ? { ...i, qty: mergedQty } : i);
        }
      }
      return prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'desc' && updatedItem.type === 'part') {
            const matchedInventoryItem = inventory.find(i => i.name.toLowerCase() === String(value).toLowerCase());
            if (matchedInventoryItem) { updatedItem.unitPrice = matchedInventoryItem.price; }
          }
          return updatedItem;
        }
        return item;
      });
    });
  };

  const getInvoiceTotal = () => lineItems.reduce((total, item) => total + ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0);

  const renderGroupedItems = (items, currencyForBill) => {
    if (!items || items.length === 0) {
      return (<tr className="ci-row-odd"><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontStyle: 'italic' }}>No items added yet.</td></tr>);
    }
    const groups = [
      { key: 'part', label: 'Parts', items: items.filter(i => i.type === 'part') },
      { key: 'service', label: 'Services', items: items.filter(i => i.type === 'service') },
      { key: 'labor', label: 'Labor', items: items.filter(i => i.type === 'labor') }
    ];
    const rows = [];
    let stripeIndex = 0;
    groups.forEach(group => {
      if (group.items.length === 0) return;
      rows.push(<tr key={`hdr-${group.key}`} className="ci-section-header-row"><td colSpan="4" className="ci-section-header-cell">{group.label}</td></tr>);
      group.items.forEach(item => {
        const qty = Number(item.qty) || 1;
        const price = Number(item.unitPrice) || 0;
        const amount = qty * price;
        const rowClass = stripeIndex % 2 === 1 ? 'ci-row-even' : 'ci-row-odd';
        stripeIndex++;
        rows.push(
          <tr key={item.id} className={rowClass}>
            <td className="ci-td-desc">{item.desc || 'Untitled Item'}</td>
            <td className="ci-td-qty">{qty}</td>
            <td className="ci-td-price">{currencyForBill}{formatPrice(price)}</td>
            <td className="ci-td-total">{currencyForBill}{formatPrice(amount)}</td>
          </tr>
        );
      });
    });
    return rows;
  };

  const clearInvoiceForm = () => {
    setLineItems([]); setAdvancePaid(''); setMileage(''); setServiceNotes('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setInvoiceNumber(`#${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const saveInvoiceToHistory = async (shouldShowAlert = true) => {
    if (lineItems.some(item => !item.desc.trim() || !item.unitPrice || Number(item.unitPrice) <= 0)) {
      showAlert("WARNING: Some items in the bill are missing a description or unit price. Please fix them.");
      return false;
    }
    if (lineItems.length === 0) {
      showAlert("Cannot save an empty invoice.");
      return false;
    }
    let activeClientName = 'Walk-in Customer'; let activeVehReg = '-'; let activeVehMake = '-';
    if (customerMode === 'new' && newInvoiceCustomer.name) {
      activeClientName = newInvoiceCustomer.name; activeVehReg = newInvoiceCustomer.vehicleReg || '-'; activeVehMake = newInvoiceCustomer.vehicleMake || '-';
      const newCust = { name: newInvoiceCustomer.name, phone: newInvoiceCustomer.phone, vehicles: newInvoiceCustomer.vehicleReg ? [{ reg: newInvoiceCustomer.vehicleReg, make: newInvoiceCustomer.vehicleMake }] : [] };
      try {
        const res = await fetch(`${API_BASE_URL}/api/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCust) });
        const savedCust = await res.json();
        setCustomers([...customers, savedCust]);
      } catch (e) { console.log(e); }
    } else if (customerMode === 'existing') {
      activeClientName = currentCustomer ? currentCustomer.name : 'Walk-in Customer';
      activeVehReg = selectedVehicleReg || '-'; activeVehMake = currentCustomer?.vehicles.find(v => v.reg === selectedVehicleReg)?.make || '-';
    }

    const newInvoiceRecord = {
      invoiceNo: invoiceNumber, docType: billingDocType, currency: currencySymbol, date: invoiceDate || new Date().toISOString().split('T')[0],
      customerName: activeClientName, customerPhone: displayCustPhone, vehicleReg: activeVehReg, vehicleMake: activeVehMake, mileage,
      tasks: [...lineItems], total: getInvoiceTotal(), actualCost: 0, 
      advance: Number(advancePaid) || 0, paymentHistory: advancePaid ? [{ id: Date.now(), date: invoiceDate || new Date().toISOString().split('T')[0], amount: Number(advancePaid) }] : [],
      recommendation: serviceNotes
    };
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newInvoiceRecord) });
      const savedInvoice = await res.json();
      setInvoices([savedInvoice, ...invoices]);
      if(shouldShowAlert) showAlert("Document saved to history successfully.");
      return true;
    } catch (error) {
      // Fallback local save if server unavailable
      setInvoices([{ id: Date.now(), ...newInvoiceRecord }, ...invoices]);
      if(shouldShowAlert) showAlert("Backend offline: Saved document to local session.");
      return true;
    }
  };

  const handleSaveAndPrint = async () => {
    const saved = await saveInvoiceToHistory(false);
    if (saved) { setTimeout(() => window.print(), 500); }
  };

  const openShareModal = (targetInvoice = null) => {
    const inv = targetInvoice || { docType: billingDocType, invoiceNo: invoiceNumber, currency: currencySymbol, date: invoiceDate || new Date().toISOString().split('T')[0], customerName: displayCustName, customerPhone: displayCustPhone, vehicleReg: displayCustVehReg, vehicleMake: displayCustVehMake, tasks: lineItems, total: getInvoiceTotal(), advance: Number(advancePaid || 0) };
    if (inv.tasks.length === 0) { showAlert("Please add items to invoice before sharing."); return; }
    const curr = inv.currency || currencySymbol;
    const itemsSummary = inv.tasks.map(item => `• ${item.desc} (x${item.qty}) - ${curr}${formatPrice((Number(item.qty)||0)*(Number(item.unitPrice)||0))}`).join('\n');
    const msg = `*GP AUTOMOTIVE - ${inv.docType.toUpperCase()}*
Invoice #: ${inv.invoiceNo}
Date: ${formatInvoiceDate(inv.date)}
Customer: ${inv.customerName}
Vehicle: ${inv.vehicleReg} (${inv.vehicleMake})

*Items:*
${itemsSummary}

*Total:* ${curr}${formatPrice(inv.total)}
*Advance Paid:* ${curr}${formatPrice(inv.advance)}
*Balance Due:* ${curr}${formatPrice(inv.total - inv.advance)}

Thank you for choosing GP Automotive!`;
    setShareBox({ isOpen: true, phone: inv.customerPhone && inv.customerPhone !== '-' ? inv.customerPhone : '', message: msg, copied: false });
  };

  const triggerWhatsApp = () => {
    const cleanPhone = (shareBox.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone) { window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareBox.message)}`, '_blank'); } 
    else { window.open(`https://wa.me/?text=${encodeURIComponent(shareBox.message)}`, '_blank'); }
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(shareBox.message);
    setShareBox(prev => ({ ...prev, copied: true }));
    setTimeout(() => setShareBox(prev => ({ ...prev, copied: false })), 2000);
  };

  const triggerNativeShare = () => {
    if (navigator.share) { navigator.share({ title: 'GP Automotive Invoice', text: shareBox.message }).catch(() => {}); } 
    else { copyShareText(); }
  };

  const receivePayment = async (e) => {
    e.preventDefault();
    const amountToPay = Number(paymentBox.amount);
    const activeInv = invoices.find(i => (i.id || i._id) === paymentBox.invoiceId);
    if (!activeInv || amountToPay <= 0) return;
    const currentBalance = activeInv.total - activeInv.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    if (amountToPay > currentBalance) { showAlert(`Payment of Rs. ${formatPrice(amountToPay)} exceeds the remaining balance of Rs. ${formatPrice(currentBalance)}.`); return; }
    const updatedInv = { ...activeInv, paymentHistory: [...activeInv.paymentHistory, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: amountToPay }] };
    try {
      if (activeInv._id) {
        await fetch(`${API_BASE_URL}/api/invoices/${activeInv._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedInv) });
      }
    } catch (err) {}
    setInvoices(invoices.map(inv => (inv.id || inv._id) === paymentBox.invoiceId ? updatedInv : inv));
    setPaymentBox({ isOpen: false, invoiceId: null, balance: 0, amount: '' });
  };

  const deletePaymentRecord = (invoiceId, paymentId) => {
    askForConfirmation(async () => {
      const targetInv = invoices.find(inv => (inv.id || inv._id) === invoiceId);
      if (targetInv) {
        const updatedInv = { ...targetInv, paymentHistory: targetInv.paymentHistory.filter(p => p.id !== paymentId) };
        try {
          if (targetInv._id) {
            await fetch(`${API_BASE_URL}/api/invoices/${targetInv._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedInv) });
          }
        } catch (err) {}
      }
      setInvoices(invoices.map(inv => {
        if ((inv.id || inv._id) === invoiceId) return { ...inv, paymentHistory: inv.paymentHistory.filter(p => p.id !== paymentId) };
        return inv;
      }));
      setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false });
    }, "Remove Payment", "Are you sure you want to delete this payment record?");
  };

  const handleItemCostChange = (itemId, costValue) => {
    setCostEditBox(prev => ({ ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, actualUnitCost: Number(costValue) } : item) }));
  };

  const recordActualCost = async (e) => {
    e.preventDefault();
    const targetInv = invoices.find(inv => (inv.id || inv._id) === costEditBox.invoiceId);
    const totalCalculatedCost = costEditBox.items.reduce((sum, item) => sum + ((item.actualUnitCost || 0) * item.qty), 0);
    if (targetInv) {
      const updatedInv = { ...targetInv, tasks: costEditBox.items, actualCost: totalCalculatedCost };
      try {
        if (targetInv._id) {
          await fetch(`${API_BASE_URL}/api/invoices/${targetInv._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedInv) });
        }
      } catch (err) {}
    }
    setInvoices(invoices.map(inv => {
      if((inv.id || inv._id) === costEditBox.invoiceId) {
        return { ...inv, tasks: costEditBox.items, actualCost: totalCalculatedCost };
      }
      return inv;
    }));
    setCostEditBox({ isOpen: false, invoiceId: null, items: [] });
  };

  if (!isAuthenticated) {
    return (
      <div className={`login-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="login-card">
          <img src={isDarkMode ? logoDark : logoLight} alt="GP Automotive" className="login-logo" />
          <h2>Sign In</h2>
          <form onSubmit={handleLogin} className="form-group" style={{ gap: '14px' }}>
            <input type="text" placeholder="Username" required value={loginDetails.username} onChange={e => setLoginDetails({ ...loginDetails, username: e.target.value })} />
            <input type="password" placeholder="Password" required value={loginDetails.password} onChange={e => setLoginDetails({ ...loginDetails, password: e.target.value })} />
            <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%' }}>Access Workspace</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'} ${viewInvoiceBox.isOpen ? 'modal-open' : ''}`}>
      {(showNotifications || isIOSCalendarOpen) && (
        <div className="popover-backdrop" onClick={() => { setShowNotifications(false); setIsIOSCalendarOpen(false); }} />
      )}



      {appAlert.isOpen && (
        <div className="modal-overlay app-alert-modal" style={{ zIndex: 10020 }} onClick={() => setAppAlert({ isOpen: false, message: '' })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} color="var(--warning)" /> System Notice</h3>
            <p style={{ marginTop: '12px', fontSize: 'var(--fs-base)' }}>{appAlert.message}</p>
            <div className="modal-actions"><button className="primary-btn" onClick={() => setAppAlert({ isOpen: false, message: '' })}>OK</button></div>
          </div>
        </div>
      )}

      {deleteConfirmBox.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 10015 }} onClick={() => setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{deleteConfirmBox.title}</h3><p>{deleteConfirmBox.message}</p>
            <div className="modal-actions"><button className="secondary-btn" onClick={() => setDeleteConfirmBox({ ...deleteConfirmBox, isOpen: false })}>Cancel</button><button className="primary-btn danger" onClick={deleteConfirmBox.action}>Confirm</button></div>
          </div>
        </div>
      )}

      {paymentBox.isOpen && (
        <div className="modal-overlay" onClick={() => setPaymentBox({ isOpen: false, invoiceId: null, balance: 0, amount: '' })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Manage Payments</h3>
            {(() => {
              const activeInv = invoices.find(i => (i.id || i._id) === paymentBox.invoiceId);
              if (!activeInv) return null;
              const paidSoFar = activeInv.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
              const currentBalance = activeInv.total - paidSoFar;
              return (
                <>
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Invoice Total:</span><span style={{ fontWeight: 600 }}>Rs. {formatPrice(activeInv.total)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Total Paid:</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {formatPrice(paidSoFar)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Balance Due:</span><span style={{ color: currentBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>Rs. {formatPrice(currentBalance)}</span></div>
                  </div>
                  {activeInv.paymentHistory.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment History</h4>
                      {activeInv.paymentHistory.map(payment => (
                        <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--separator)' }}>
                          <span style={{ fontSize: 'var(--fs-sm)' }}>{payment.date}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontWeight: 600 }}>Rs. {formatPrice(payment.amount)}</span><button type="button" className="icon-btn danger-text" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => deletePaymentRecord(activeInv.id || activeInv._id, payment.id)}><Trash2 size={14} /></button></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {currentBalance > 0 ? (
                    <form onSubmit={receivePayment}>
                      <div className="form-group" style={{ marginBottom: '16px' }}><label>Add New Payment (LKR)</label><input type="number" autoFocus required value={paymentBox.amount} onChange={e => setPaymentBox({ ...paymentBox, amount: e.target.value })} placeholder="0.00" /></div>
                      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setPaymentBox({ isOpen: false, invoiceId: null, balance: 0, amount: '' })}>Close</button><button type="submit" className="primary-btn">Record Payment</button></div>
                    </form>
                  ) : (<div className="modal-actions" style={{ marginTop: '16px' }}><button type="button" className="secondary-btn" onClick={() => setPaymentBox({ isOpen: false, invoiceId: null, balance: 0, amount: '' })}>Close</button></div>)}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {costEditBox.isOpen && (
        <div className="modal-overlay" onClick={() => setCostEditBox({ isOpen: false, invoiceId: null, items: [] })}>
          <div className="modal-card" style={{ maxWidth: '720px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>Log Actual Costs</h3>
              <button type="button" className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => setCostEditBox({ isOpen: false, invoiceId: null, items: [] })}><X size={14} /></button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Enter your unit cost for each item to accurately calculate profit.</p>
            <form onSubmit={recordActualCost}>
              <div style={{ maxHeight: '340px', overflowY: 'auto', overflowX: 'hidden', marginBottom: '16px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <table className="data-table cost-edit-table" style={{ border: 'none', width: '100%', minWidth: 'unset', tableLayout: 'fixed' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '36%', padding: '10px 12px' }}>Item Description</th>
                      <th style={{ width: '10%', textAlign: 'center', padding: '10px 6px' }}>Qty</th>
                      <th style={{ width: '18%', textAlign: 'right', padding: '10px 8px' }}>Revenue</th>
                      <th style={{ width: '18%', textAlign: 'right', padding: '10px 8px' }}>Unit Cost</th>
                      <th style={{ width: '18%', textAlign: 'right', padding: '10px 12px' }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costEditBox.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ padding: '10px 12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: 600 }}>{item.desc}</span> <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>({item.type})</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 6px' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600, padding: '10px 8px', whiteSpace: 'nowrap' }}>Rs. {formatPrice(item.qty * item.unitPrice)}</td>
                        <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                          <input 
                            type="number" 
                            className="table-input" 
                            style={{ textAlign: 'right', width: '100%', maxWidth: '90px', padding: '6px 8px', borderRadius: '8px' }} 
                            value={item.actualUnitCost || ''} 
                            onChange={e => handleItemCostChange(item.id, e.target.value)} 
                            placeholder="0.00" 
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)', padding: '10px 12px', whiteSpace: 'nowrap' }}>Rs. {formatPrice((item.actualUnitCost || 0) * item.qty)}</td>
                      </tr>
                    ))}
                    {costEditBox.items.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>No items in this invoice.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: '20px' }}>
                Total Invoice Cost: <span style={{ color: 'var(--danger)', marginLeft: '12px' }}>Rs. {formatPrice(costEditBox.items.reduce((sum, item) => sum + ((item.actualUnitCost || 0) * item.qty), 0))}</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setCostEditBox({ isOpen: false, invoiceId: null, items: [] })}>Cancel</button>
                <button type="submit" className="primary-btn">Save Final Cost</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewInvoiceBox.isOpen && viewInvoiceBox.invoice && (
        <div className="modal-overlay" id="print-active-modal" onClick={() => setViewInvoiceBox({ isOpen: false, invoice: null })}>
          <div className="modal-card view-invoice-modal-content" onClick={e => e.stopPropagation()}>
            <div className="view-modal-scroll-area final-invoice">
              <div className="custom-invoice-layout">
                <div className="ci-header-row">
                  <div className="ci-company-left"><img src={logoInvoice} alt="Logo" className="ci-logo" /><div className="ci-company-info">99/1, Quarry Road, Dehiwala, Colombo<br/>9477-1199991 | 9477-8916404</div></div>
                  <div className="ci-header-right">
                    <h1 className="ci-invoice-title">{(viewInvoiceBox.invoice.docType || 'INVOICE').toUpperCase()}</h1>
                    <table className="ci-meta-table"><tbody><tr><td className="ci-meta-label">{viewInvoiceBox.invoice.docType || 'Invoice'} No:</td><td className="ci-meta-value">{viewInvoiceBox.invoice.invoiceNo}</td></tr><tr><td className="ci-meta-label">{viewInvoiceBox.invoice.docType || 'Invoice'} Date:</td><td className="ci-meta-value">{formatInvoiceDate(viewInvoiceBox.invoice.date)}</td></tr></tbody></table>
                  </div>
                </div>
                <div className="ci-divider"></div>
                <div className="ci-info-grid">
                  <div className="ci-info-block"><div className="ci-info-heading">{viewInvoiceBox.invoice.docType || 'Invoice'} to:</div><div className="ci-info-row"><span className="ci-info-label">Name:</span><span className="ci-info-text">{viewInvoiceBox.invoice.customerName}</span></div><div className="ci-info-row"><span className="ci-info-label">Phone No:</span><span className="ci-info-text">{viewInvoiceBox.invoice.customerPhone || '-'}</span></div></div>
                  <div className="ci-info-block"><div className="ci-info-heading">Vehicle &amp; Service Info:</div><div className="ci-info-row"><span className="ci-info-label">Vehicle No:</span><span className="ci-info-text">{viewInvoiceBox.invoice.vehicleReg || '-'}</span></div><div className="ci-info-row"><span className="ci-info-label">Vehicle Model:</span><span className="ci-info-text">{viewInvoiceBox.invoice.vehicleMake || '-'}</span></div><div className="ci-info-row"><span className="ci-info-label">Mileage:</span><span className="ci-info-text">{formatMileage(viewInvoiceBox.invoice.mileage)}</span></div></div>
                </div>
                <table className="ci-items-table"><thead><tr><th className="ci-th-desc">Description</th><th className="ci-th-qty">Qty</th><th className="ci-th-price">Price</th><th className="ci-th-total">Total</th></tr></thead><tbody>{renderGroupedItems(viewInvoiceBox.invoice.tasks, viewInvoiceBox.invoice.currency || currencySymbol)}</tbody></table>
                <div className="ci-divider"></div>
                <div className="ci-totals-section">
                  <div className="ci-totals-box">
                    <div className="ci-totals-row"><span className="ci-totals-label">Sub-total :</span><span className="ci-totals-value">{(viewInvoiceBox.invoice.currency || currencySymbol)}{formatPrice(viewInvoiceBox.invoice.total)}</span></div>
                    <div className="ci-totals-row"><span className="ci-totals-label">Advance Paid:</span><span className="ci-totals-value">{(viewInvoiceBox.invoice.currency || currencySymbol)}{formatPrice(viewInvoiceBox.invoice.advance)}</span></div>
                    <div className="ci-balance-block"><span>Balance Due:</span><span>{(viewInvoiceBox.invoice.currency || currencySymbol)}{formatPrice(viewInvoiceBox.invoice.total - Number(viewInvoiceBox.invoice.advance || 0))}</span></div>
                  </div>
                </div>
                <div className="ci-footer"><p className="ci-thank-you">THANK YOU FOR YOUR BUSINESS</p><div className="ci-stripes"><div className="ci-stripe ci-stripe-blue"></div><div className="ci-stripe ci-stripe-dark"></div><div className="ci-stripe ci-stripe-red"></div></div></div>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '14px 20px', background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-color)', margin: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="secondary-btn" onClick={() => setViewInvoiceBox({ isOpen: false, invoice: null })}>Close</button>
              <button type="button" className="secondary-btn" onClick={() => openShareModal(viewInvoiceBox.invoice)}><Share2 size={13} /> Share</button>
              <button type="button" className="secondary-btn" onClick={() => {
                  setBillingDocType(viewInvoiceBox.invoice.docType || 'Invoice'); setInvoiceNumber(viewInvoiceBox.invoice.invoiceNo); setCustomerMode('new');
                  setInvoiceDate(viewInvoiceBox.invoice.date || new Date().toISOString().split('T')[0]);
                  setNewInvoiceCustomer({ name: viewInvoiceBox.invoice.customerName, phone: viewInvoiceBox.invoice.customerPhone || '', vehicleReg: viewInvoiceBox.invoice.vehicleReg !== '-' ? viewInvoiceBox.invoice.vehicleReg : '', vehicleMake: viewInvoiceBox.invoice.vehicleMake !== '-' ? viewInvoiceBox.invoice.vehicleMake : '' });
                  setMileage(viewInvoiceBox.invoice.mileage !== '-' ? viewInvoiceBox.invoice.mileage : ''); setLineItems(viewInvoiceBox.invoice.tasks.map(t => ({ ...t })));
                  setAdvancePaid(viewInvoiceBox.invoice.advance || ''); setServiceNotes(viewInvoiceBox.invoice.recommendation || ''); setViewInvoiceBox({ isOpen: false, invoice: null }); setActivePage('invoices');
              }}><Edit2 size={13} /> Edit Document</button>
              <button type="button" className="primary-btn" onClick={() => window.print()}><FileText size={14} /> Print Copy</button>
            </div>
          </div>
        </div>
      )}

      {shareBox.isOpen && (
        <div className="modal-overlay share-modal-overlay" style={{ zIndex: 10010 }} onClick={() => setShareBox({ isOpen: false, phone: '', message: '', copied: false })}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Share2 size={18} color="var(--accent)" /> Share Document</h3>
              <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => setShareBox({ isOpen: false, phone: '', message: '', copied: false })}><X size={14} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}><label>Customer Phone / WhatsApp Number</label><input type="text" placeholder="e.g. 0705765079" value={shareBox.phone} onChange={e => setShareBox({ ...shareBox, phone: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: '16px' }}><label>Message Preview</label><textarea rows="6" value={shareBox.message} onChange={e => setShareBox({ ...shareBox, message: e.target.value })} style={{ fontSize: 'var(--fs-sm)', lineHeight: '1.4' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="primary-btn" onClick={triggerWhatsApp} style={{ background: '#25D366' }}><Send size={15} /> WhatsApp</button>
              <button className="secondary-btn" onClick={copyShareText}>{shareBox.copied ? <><Check size={15} color="var(--success)" /> Copied!</> : <><Copy size={15} /> Copy Text</>}</button>
            </div>
            {typeof navigator.share === 'function' && (<button className="secondary-btn" onClick={triggerNativeShare} style={{ width: '100%', marginTop: '10px' }}><Share2 size={15} /> More Sharing Options...</button>)}
          </div>
        </div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="brand">
          <img src={isSidebarOpen ? (isDarkMode ? logoDark : logoLight) : (isDarkMode ? tinyLogoDark : tinyLogoLight)} alt="GP Auto" className="brand-logo" />
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}>{isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}</button>
        </div>
        <nav>
          <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => goToPage('dashboard')} title="Dashboard"><LayoutDashboard size={17} /> {isSidebarOpen && <span>Dashboard</span>}</button>
          <button className={activePage === 'invoices' ? 'active' : ''} onClick={() => goToPage('invoices')} title="Billing"><FileText size={17} /> {isSidebarOpen && <span>Billing & Quotes</span>}</button>
          <button className={activePage === 'invoiceHistory' ? 'active' : ''} onClick={() => goToPage('invoiceHistory')} title="Invoices"><Receipt size={17} /> {isSidebarOpen && <span>Invoices</span>}</button>
          <button className={activePage === 'profit' ? 'active' : ''} onClick={() => goToPage('profit')} title="Cost & Profit"><Calculator size={17} /> {isSidebarOpen && <span>Cost & Profit</span>}</button>
          <button className={activePage === 'sales' ? 'active' : ''} onClick={() => goToPage('sales')} title="Sales"><Wallet size={17} /> {isSidebarOpen && <span>Sales</span>}</button>
          <button className={activePage === 'expenses' ? 'active' : ''} onClick={() => goToPage('expenses')} title="Expenses"><CreditCard size={17} /> {isSidebarOpen && <span>Expenses</span>}</button>
          <button className={activePage === 'inventory' ? 'active' : ''} onClick={() => goToPage('inventory')} title="Inventory"><Package size={17} /> {isSidebarOpen && <span>Inventory</span>}</button>
          <button className={activePage === 'customers' ? 'active' : ''} onClick={() => goToPage('customers')} title="Customers"><Users size={17} /> {isSidebarOpen && <span>Customers</span>}</button>
        </nav>
        <div className="bottom-actions">
          <button className={activePage === 'settings' ? 'active' : ''} onClick={() => goToPage('settings')} title="Settings"><Settings size={17} /> {isSidebarOpen && <span>Settings</span>}</button>
          <button onClick={handleLogout} title="Log Out" className="logout-only-btn"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-left"><h1 className="page-title">{activePage === 'invoiceHistory' ? 'Invoice History' : activePage === 'profit' ? 'Cost & Profit Tracker' : activePage === 'sales' ? 'Sales' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1></div>
          <div className="header-right">
            <div className="notif-wrapper">
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)} title="Notifications"><Bell size={18} />{activeNotifications.length > 0 && <span className="notif-badge"></span>}</button>
              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">Alerts ({activeNotifications.length}){activeNotifications.length > 0 && (<button className="notif-clear-btn" onClick={() => { const ids = activeNotifications.map(n => n.id); setDismissedNotifs([...dismissedNotifs, ...ids]); }}>Clear All</button>)}</div>
                  <div className="notif-list">{activeNotifications.length === 0 ? (<div className="notif-empty">No new notifications.</div>) : (activeNotifications.map(notif => (<div className="notif-item" key={notif.id}><AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} /><div style={{ flex: 1 }}>{notif.text}</div><button className="notif-clear-btn" onClick={() => clearNotification(notif.id)}><X size={14} /></button></div>)))}</div>
                </div>
              )}
            </div>
            <button className="icon-btn theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="header-profile" onClick={() => goToPage('settings')}><img src={profilePic} alt="Profile" className="header-avatar" /></div>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <>
            <div className="dashboard-filters">
              <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
              <div className="segmented-control">
                <button className={timeFilter === 'weekly' ? 'active' : ''} onClick={() => { setTimeFilter('weekly'); setIsIOSCalendarOpen(false); }}>Week</button>
                <button className={timeFilter === 'monthly' ? 'active' : ''} onClick={() => { setTimeFilter('monthly'); setIsIOSCalendarOpen(false); }}>Month</button>
                <button className={timeFilter === 'yearly' ? 'active' : ''} onClick={() => { setTimeFilter('yearly'); setIsIOSCalendarOpen(false); }}>Year</button>
                <button className={timeFilter === 'custom' ? 'active' : ''} onClick={() => { setTimeFilter('custom'); setIsIOSCalendarOpen(true); }}>Custom</button>
              </div>
              {timeFilter === 'custom' && (<div style={{ position: 'relative', zIndex: 10001 }}><button type="button" className="ios-calendar-trigger" onClick={() => setIsIOSCalendarOpen(!isIOSCalendarOpen)}><Calendar size={14} color="var(--accent)" /><span>{customDateRange.start ? customDateRange.start : 'Start Date'}{' → '}{customDateRange.end ? customDateRange.end : 'End Date'}</span></button><IOSCalendarPicker startDate={customDateRange.start} endDate={customDateRange.end} isOpen={isIOSCalendarOpen} onClose={() => setIsIOSCalendarOpen(false)} onRangeChange={(start, end) => setCustomDateRange({ start, end })} /></div>)}
            </div>
            <div className="stats-grid">
              <div className="stat-card revenue"><div className="stat-icon-wrapper"><DollarSign size={20} /></div><div><h3>Total Revenue</h3><p>Rs. {formatPrice(totalRevenue)}</p></div></div>
              <div className="stat-card expenses"><div className="stat-icon-wrapper"><TrendingDown size={20} /></div><div><h3>Expenses + COGS</h3><p>Rs. {formatPrice(totalExpenseCost + totalGoodsCost)}</p></div></div>
              <div className="stat-card profit"><div className="stat-icon-wrapper"><TrendingUp size={20} /></div><div><h3>Net Profit</h3><p>Rs. {formatPrice(actualProfit)}</p></div></div>
            </div>
            <div className="content-split">
              <div className="panel" style={{ marginBottom: 0 }}>
                <div className="panel-header"><h2>Income vs Cost</h2></div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <BarChart data={[{ name: getChartLabel(), Income: totalRevenue, Expense: totalExpenseCost + totalGoodsCost }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                      <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px', fontSize: 'var(--fs-sm)' }} formatter={(value) => `Rs. ${formatCompact(value)}`} />
                      <Bar dataKey="Income" fill="#55AD9B" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar dataKey="Expense" fill="#987D9A" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="panel" style={{ marginBottom: 0 }}>
                <div className="panel-header"><h2>Revenue Breakdown</h2></div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={[{ name: 'Labor', value: totalRevenue * 0.45 || 65000 }, { name: 'Parts', value: totalRevenue * 0.35 || 55000 }, { name: 'Oils', value: totalRevenue * 0.20 || 30000 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} stroke="none">
                        {[0,1,2].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px', fontSize: 'var(--fs-sm)' }} formatter={(value) => `Rs. ${formatCompact(value)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header" style={{ marginBottom: '8px' }}><h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Business Analytics <div className="ai-badge"><Sparkles size={12} /> Assist</div></h2></div>
              <p className="ai-desc" style={{ marginBottom: '16px' }}>Scan your inventory, expenses, and revenue to get quick actionable advice.</p>
              <button className="primary-btn" onClick={runBusinessReport} disabled={isGeneratingInsights} style={{ width: 'fit-content' }}>{isGeneratingInsights ? 'Scanning Workshop Data...' : 'Run Business Report'}</button>
              {businessInsights && (
                <div className="insight-container">
                  <div className="insight-title" style={{ fontWeight: 700 }}>Executive Summary:</div>
                  <ul>
                    {businessInsights.split('\n').filter(l => l.trim()).map((line, i) => {
                      const cleanLine = line.replace(/^[•*\-\s]+/, '').replace(/\*\*/g, '').trim();
                      return <li key={i} style={{ fontWeight: 300, lineHeight: '1.75' }}>{cleanLine}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {activePage === 'invoiceHistory' && (
          <div className="panel">
            <table className="data-table compact-table">
              <thead><tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Vehicle Reg</th><th>Vehicle Model</th><th>Total</th><th>Paid</th><th>Balance</th><th width="160">Action</th></tr></thead>
              <tbody>
                {invoices.map(inv => {
                  const totalPaidAmount = inv.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
                  const amountDue = inv.total - totalPaidAmount;
                  return (
                    <tr key={inv.id || inv._id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNo}</td>
                      <td>{formatInvoiceDate(inv.date)}</td>
                      <td>{inv.customerName}</td>
                      <td>{inv.vehicleReg}</td>
                      <td>{inv.vehicleMake}</td>
                      <td>Rs. {formatPrice(inv.total)}</td>
                      <td style={{ color: 'var(--success)' }}>Rs. {formatPrice(totalPaidAmount)}</td>
                      <td style={{ color: amountDue > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>Rs. {formatPrice(amountDue)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="small-action-btn" onClick={() => setViewInvoiceBox({ isOpen: true, invoice: inv })}><Eye size={13} /> View</button>
                          <button className="small-action-btn" onClick={() => setPaymentBox({ isOpen: true, invoiceId: inv.id || inv._id, amount: '' })} style={amountDue <= 0 ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}>{amountDue > 0 ? '+ Pay' : <Check size={13} />}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No invoices generated yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activePage === 'profit' && (
          <div className="panel">
            <table className="data-table compact-table">
              <thead><tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Revenue</th><th>Actual Cost</th><th>Net Profit</th><th width="120">Action</th></tr></thead>
              <tbody>
                {invoices.map(inv => {
                  const margin = inv.total - inv.actualCost;
                  return (
                    <tr key={inv.id || inv._id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNo}</td>
                      <td>{formatInvoiceDate(inv.date)}</td>
                      <td>{inv.customerName}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {formatPrice(inv.total)}</td>
                      <td style={{ color: inv.actualCost > 0 ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}>{inv.actualCost > 0 ? `- Rs. ${formatPrice(inv.actualCost)}` : 'Not Logged'}</td>
                      <td style={{ fontWeight: 700, color: margin >= 0 ? 'var(--success)' : 'var(--danger)' }}>Rs. {formatPrice(margin)}</td>
                      <td><button className="small-action-btn" onClick={() => setCostEditBox({ isOpen: true, invoiceId: inv.id || inv._id, items: inv.tasks.map(t => ({...t})) })}>{inv.actualCost > 0 ? 'Edit Item Costs' : '+ Log Item Costs'}</button></td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No invoices generated yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* --- SALES WITH IOS DATE PICKER --- */}
        {activePage === 'sales' && (
          <div className="panel">
            <div className="panel-header">
              <div className="header-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: '320px', flex: 1 }}><Search size={14} /><input type="text" placeholder="Search sales..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <button className="primary-btn" onClick={() => setIsAddingSale(!isAddingSale)}>{isAddingSale ? 'Cancel' : <><Plus size={14} /> Log Sale</>}</button>
              </div>
            </div>
            {isAddingSale && (
              <form className="inline-add-section" onSubmit={saveNewSale}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <IOSDatePicker value={newSaleDraft.date} onChange={val => setNewSaleDraft({ ...newSaleDraft, date: val })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <IOSAutocomplete value={newSaleDraft.desc} onChange={val => setNewSaleDraft({ ...newSaleDraft, desc: val })} options={uniqueSales} placeholder="e.g. Over-the-counter sale" />
                  </div>
                  <div className="form-group"><label>Revenue (LKR)</label><input type="number" required value={newSaleDraft.amount} onChange={e => setNewSaleDraft({ ...newSaleDraft, amount: e.target.value })} /></div>
                  <div className="form-group"><label>Cost (LKR)</label><input type="number" placeholder="0" value={newSaleDraft.cost} onChange={e => setNewSaleDraft({ ...newSaleDraft, cost: e.target.value })} /></div>
                </div>
                <button type="submit" className="primary-btn" style={{ width: 'auto', marginTop: '16px' }}>Save Sale</button>
              </form>
            )}
            <table className="data-table">
              <thead><tr><th>Date</th><th>Description</th><th>Revenue</th><th>Cost</th><th>Profit</th><th width="120">Actions</th></tr></thead>
              <tbody>
                {sales.filter(s => s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase())).map(sale => (
                  <tr key={sale.id || sale._id}>
                    {editingItemId === (sale.id || sale._id) ? (
                      <>
                        <td style={{ minWidth: '150px' }}>
                          <IOSDatePicker value={editingFormData.date} onChange={val => setEditingFormData({ ...editingFormData, date: val })} />
                        </td>
                        <td style={{ minWidth: '180px' }}>
                          <IOSAutocomplete value={editingFormData.desc} onChange={val => setEditingFormData({ ...editingFormData, desc: val })} options={uniqueSales} placeholder="Description..." />
                        </td>
                        <td><input type="number" className="table-input" value={editingFormData.amount} onChange={e => setEditingFormData({ ...editingFormData, amount: e.target.value })} /></td>
                        <td><input type="number" className="table-input" value={editingFormData.cost || ''} onChange={e => setEditingFormData({ ...editingFormData, cost: e.target.value })} /></td>
                        <td>-</td>
                        <td className="action-cell"><button className="icon-btn success-text" onClick={updateExistingSale}><Check size={14} /></button><button className="icon-btn danger-text" onClick={stopEditing}><X size={14} /></button></td>
                      </>
                    ) : (
                      <>
                        <td>{formatInvoiceDate(sale.date)}</td>
                        <td>{sale.desc}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>+ Rs. {formatPrice(sale.amount)}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>- Rs. {formatPrice(sale.cost || 0)}</td>
                        <td style={{ fontWeight: 700 }}>Rs. {formatPrice((sale.amount || 0) - (sale.cost || 0))}</td>
                        <td className="action-cell"><button className="icon-btn" onClick={() => beginEditing(sale)}><Edit2 size={14} /></button><button className="icon-btn danger-text" onClick={() => deleteItem('sale', sale.id || sale._id)}><Trash2 size={14} /></button></td>
                      </>
                    )}
                  </tr>
                ))}
                {sales.filter(s => s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>{searchQuery ? 'No sales match your search.' : 'No sales recorded yet. Click "Log Sale" to add one.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- EXPENSES WITH IOS DATE PICKER --- */}
        {activePage === 'expenses' && (
          <div className="panel">
            <div className="panel-header">
              <div className="header-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: '320px', flex: 1 }}><Search size={14} /><input type="text" placeholder="Search expenses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <button className="primary-btn" onClick={() => setIsAddingExpense(!isAddingExpense)}>{isAddingExpense ? 'Cancel' : <><Plus size={14} /> Add Expense</>}</button>
              </div>
            </div>
            {isAddingExpense && (
              <form className="inline-add-section" onSubmit={saveNewExpense}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <IOSDatePicker value={newExpenseDraft.date} onChange={val => setNewExpenseDraft({ ...newExpenseDraft, date: val })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <IOSAutocomplete value={newExpenseDraft.desc} onChange={val => setNewExpenseDraft({ ...newExpenseDraft, desc: val })} options={uniqueExpenses} placeholder="e.g. Utility Bill" />
                  </div>
                  <div className="form-group"><label>Amount (LKR)</label><input type="number" required value={newExpenseDraft.amount} onChange={e => setNewExpenseDraft({ ...newExpenseDraft, amount: e.target.value })} /></div>
                </div>
                <button type="submit" className="primary-btn" style={{ width: 'auto', marginTop: '16px' }}>Save</button>
              </form>
            )}
            <table className="data-table">
              <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th width="120">Actions</th></tr></thead>
              <tbody>
                {expenses.filter(e => e.desc && e.desc.toLowerCase().includes(searchQuery.toLowerCase())).map(exp => (
                  <tr key={exp.id || exp._id}>
                    {editingItemId === (exp.id || exp._id) ? (
                      <>
                        <td style={{ minWidth: '150px' }}>
                          <IOSDatePicker value={editingFormData.date} onChange={val => setEditingFormData({ ...editingFormData, date: val })} />
                        </td>
                        <td style={{ minWidth: '180px' }}>
                          <IOSAutocomplete value={editingFormData.desc} onChange={val => setEditingFormData({ ...editingFormData, desc: val })} options={uniqueExpenses} placeholder="Description..." />
                        </td>
                        <td><input type="number" className="table-input" value={editingFormData.amount} onChange={e => setEditingFormData({ ...editingFormData, amount: e.target.value })} /></td>
                        <td className="action-cell"><button className="icon-btn success-text" onClick={updateExistingExpense}><Check size={14} /></button><button className="icon-btn danger-text" onClick={stopEditing}><X size={14} /></button></td>
                      </>
                    ) : (
                      <>
                        <td>{formatInvoiceDate(exp.date)}</td>
                        <td>{exp.desc}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>- Rs. {formatPrice(exp.amount)}</td>
                        <td className="action-cell"><button className="icon-btn" onClick={() => beginEditing(exp)}><Edit2 size={14} /></button><button className="icon-btn danger-text" onClick={() => deleteItem('expense', exp.id || exp._id)}><Trash2 size={14} /></button></td>
                      </>
                    )}
                  </tr>
                ))}
                {expenses.filter(e => e.desc && e.desc.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>{searchQuery ? 'No expenses match your search.' : 'No expenses recorded yet. Click "Add Expense" to log one.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activePage === 'inventory' && (
          <div className="panel">
            <div className="panel-header">
              <div className="header-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: '320px', flex: 1 }}><Search size={14} /><input type="text" placeholder="Search parts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <button className="primary-btn" onClick={() => setIsAddingInventory(!isAddingInventory)}>{isAddingInventory ? 'Cancel' : <><Plus size={14} /> Add Part</>}</button>
              </div>
            </div>
            {isAddingInventory && (
              <form className="inline-add-section" onSubmit={saveNewInventoryItem}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Item Name</label>
                    <IOSAutocomplete value={newInventoryDraft.name} onChange={val => setNewInventoryDraft({ ...newInventoryDraft, name: val })} options={uniqueParts} placeholder="e.g. Oil Filter" />
                  </div>
                  <div className="form-group"><label>Quantity</label><input type="number" className="qty-input" required placeholder="0" value={newInventoryDraft.qty} onChange={e => setNewInventoryDraft({ ...newInventoryDraft, qty: e.target.value })} /></div>
                  <div className="form-group"><label>Alert Threshold</label><input type="number" className="qty-input" placeholder="e.g. 5" value={newInventoryDraft.threshold} onChange={e => setNewInventoryDraft({ ...newInventoryDraft, threshold: e.target.value })} /></div>
                  <div className="form-group"><label>Unit Price (LKR)</label><input type="number" required placeholder="0.00" value={newInventoryDraft.price} onChange={e => setNewInventoryDraft({ ...newInventoryDraft, price: e.target.value })} /></div>
                </div>
                <button type="submit" className="primary-btn" style={{ width: 'auto', marginTop: '16px' }}>Save Item</button>
              </form>
            )}
            <table className="data-table">
              <thead><tr><th>Item</th><th>Stock</th><th>Price (LKR)</th><th>Status</th><th width="120">Actions</th></tr></thead>
              <tbody>
                {inventory.filter(i => i.name && i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                  <tr key={item.id || item._id}>
                    {editingItemId === (item.id || item._id) ? (
                      <>
                        <td style={{ minWidth: '180px' }}>
                          <IOSAutocomplete value={editingFormData.name} onChange={val => setEditingFormData({ ...editingFormData, name: val })} options={uniqueParts} placeholder="Item Name..." />
                        </td>
                        <td><input type="number" className="table-input qty-input" style={{ width: '60px' }} value={editingFormData.qty} onChange={e => setEditingFormData({ ...editingFormData, qty: e.target.value })} /></td>
                        <td><input type="number" className="table-input" value={editingFormData.price} onChange={e => setEditingFormData({ ...editingFormData, price: e.target.value })} /></td>
                        <td>-</td>
                        <td className="action-cell"><button className="icon-btn success-text" onClick={updateExistingInventoryItem}><Check size={14} /></button><button className="icon-btn danger-text" onClick={stopEditing}><X size={14} /></button></td>
                      </>
                    ) : (
                      <>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>
                          {item.qty === 0 ? (<span className="status-pill out"><span className="status-dot"></span> Out of Stock</span>) : item.qty <= item.threshold ? (<span className="status-pill low"><span className="status-dot"></span> Low Stock</span>) : (<span className="status-pill good"><span className="status-dot"></span> In Stock</span>)}
                        </td>
                        <td className="action-cell"><button className="icon-btn" onClick={() => beginEditing(item)}><Edit2 size={14} /></button><button className="icon-btn danger-text" onClick={() => deleteItem('inventory', item.id || item._id)}><Trash2 size={14} /></button></td>
                      </>
                    )}
                  </tr>
                ))}
                {inventory.filter(i => i.name && i.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>{searchQuery ? 'No inventory matches your search.' : 'No inventory items found. Add some parts to your database!'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activePage === 'customers' && (
          <div className="panel">
            <div className="panel-header">
              <div className="header-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: '320px', flex: 1 }}><Search size={14} /><input type="text" placeholder="Search customers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <button className="primary-btn" onClick={() => setIsAddingCustomer(!isAddingCustomer)}>{isAddingCustomer ? 'Cancel' : <><Plus size={14} /> Add Customer</>}</button>
              </div>
            </div>
            {isAddingCustomer && (
              <form className="inline-add-section" onSubmit={saveNewCustomer}>
                <div className="form-grid">
                  <div className="form-group"><label>Name</label><input type="text" required value={newCustomerDraft.name} onChange={e => setNewCustomerDraft({ ...newCustomerDraft, name: e.target.value })} /></div>
                  <div className="form-group"><label>Phone Number</label><input type="text" value={newCustomerDraft.phone} onChange={e => setNewCustomerDraft({ ...newCustomerDraft, phone: e.target.value })} /></div>
                  <div className="form-group"><label>Vehicle Reg No.</label><input type="text" placeholder="e.g. WP CAA-1234" value={newCustomerDraft.vehicleReg} onChange={e => setNewCustomerDraft({ ...newCustomerDraft, vehicleReg: e.target.value })} /></div>
                  <div className="form-group"><label>Vehicle Make/Model</label><IOSAutocomplete value={newCustomerDraft.vehicleMake} onChange={val => setNewCustomerDraft({ ...newCustomerDraft, vehicleMake: val })} options={uniqueCarMakes} placeholder="e.g. Toyota Prius" /></div>
                </div>
                <button type="submit" className="primary-btn" style={{ width: 'auto', marginTop: '16px' }}>Save Customer</button>
              </form>
            )}
            <table className="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Vehicle Reg</th><th>Vehicle Model</th><th width="120">Actions</th></tr></thead>
              <tbody>
                {customers.filter(c => c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                  <tr key={c.id || c._id}>
                    {editingItemId === (c.id || c._id) ? (
                      <>
                        <td><input type="text" className="table-input" value={editingFormData.name} onChange={e => setEditingFormData({ ...editingFormData, name: e.target.value })} /></td>
                        <td><input type="text" className="table-input" value={editingFormData.phone} onChange={e => setEditingFormData({ ...editingFormData, phone: e.target.value })} /></td>
                        <td colSpan="2"><span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Edit details inside</span></td>
                        <td className="action-cell"><button className="icon-btn success-text" onClick={updateExistingCustomer}><Check size={14} /></button><button className="icon-btn danger-text" onClick={stopEditing}><X size={14} /></button></td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.phone}</td>
                        <td>{c.vehicles.map(v => v.reg).join(', ')}</td>
                        <td>{c.vehicles.map(v => v.make).join(', ')}</td>
                        <td className="action-cell"><button className="icon-btn" onClick={() => beginEditing(c)}><Edit2 size={14} /></button><button className="icon-btn danger-text" onClick={() => deleteItem('customer', c.id || c._id)}><Trash2 size={14} /></button></td>
                      </>
                    )}
                  </tr>
                ))}
                {customers.filter(c => c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>{searchQuery ? 'No customers match your search.' : 'No customers found. Add your first customer!'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activePage === 'invoices' && (
          <div className={`invoice-workspace ${showPreview ? '' : 'preview-hidden'}`}>
            <div className="invoice-forms-col">
              <div className="panel" style={{ padding: '20px 18px', marginBottom: '14px' }}>
                <div className="panel-header" style={{ marginBottom: '14px' }}>
                  <h2 style={{ flex: 1, fontSize: 'var(--fs-lg)' }}>Document Settings</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="segmented-control">
                      <button className={billingDocType === 'Invoice' ? 'active' : ''} onClick={() => setBillingDocType('Invoice')}>Invoice</button>
                      <button className={billingDocType === 'Quotation' ? 'active' : ''} onClick={() => setBillingDocType('Quotation')}>Quote</button>
                    </div>
                    <button type="button" onClick={() => setShowPreview(v => !v)} className="preview-toggle-btn" title={showPreview ? 'Hide live preview' : 'Show live preview'}>
                      {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <div className="segmented-control" style={{ width: 'fit-content' }}>
                    <button className={customerMode === 'existing' ? 'active' : ''} onClick={() => setCustomerMode('existing')}>Existing</button>
                    <button className={customerMode === 'new' ? 'active' : ''} onClick={() => setCustomerMode('new')}>New</button>
                  </div>
                </div>
                <div className="form-grid">
                  {customerMode === 'existing' ? (
                    <>
                      <div className="form-group"><label>Customer</label><IOSSelect value={selectedCustomerId} onChange={(val) => { setSelectedCustomerId(val); setSelectedVehicleReg(''); }} placeholder="Select a customer..." options={customers.map(c => ({ value: c.id || c._id, label: `${c.name} (${c.phone})` }))} /></div>
                      <div className="form-group"><label>Vehicle</label><IOSSelect value={selectedVehicleReg} onChange={(val) => setSelectedVehicleReg(val)} disabled={!selectedCustomerId} placeholder="Select a vehicle..." options={(currentCustomer?.vehicles || []).map(v => ({ value: v.reg, label: `${v.reg} - ${v.make}` }))} /></div>
                    </>
                  ) : (
                    <>
                      <div className="form-group"><label>Name *</label><input type="text" required value={newInvoiceCustomer.name} onChange={e => setNewInvoiceCustomer({ ...newInvoiceCustomer, name: e.target.value })} placeholder="Full Name" /></div>
                      <div className="form-group"><label>Phone</label><input type="text" value={newInvoiceCustomer.phone} onChange={e => setNewInvoiceCustomer({ ...newInvoiceCustomer, phone: e.target.value })} placeholder="Phone Number" /></div>
                      <div className="form-group"><label>Vehicle Reg No.</label><input type="text" value={newInvoiceCustomer.vehicleReg} onChange={e => setNewInvoiceCustomer({ ...newInvoiceCustomer, vehicleReg: e.target.value })} placeholder="e.g. WP – 7357" /></div>
                      <div className="form-group"><label>Vehicle Make</label><IOSAutocomplete value={newInvoiceCustomer.vehicleMake} onChange={val => setNewInvoiceCustomer({ ...newInvoiceCustomer, vehicleMake: val })} options={uniqueCarMakes} placeholder="e.g. BMW E39 520i" /></div>
                    </>
                  )}
                  <div className="form-group"><label>Mileage (km)</label><input type="number" placeholder="Odometer reading" value={mileage} onChange={e => setMileage(e.target.value)} /></div>
                  <div className="form-group"><label>Document Date</label><IOSDatePicker value={invoiceDate} onChange={val => setInvoiceDate(val)} /></div>
                </div>
              </div>

              <div className="panel" style={{ padding: '20px 18px', marginBottom: '14px' }}>
                <h4 className="box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', fontSize: 'var(--fs-md)', fontWeight: 700 }}>
                  Line Items
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="small-action-btn" onClick={() => addLineItem('part')}><Disc size={13}/> + Part</button>
                    <button className="small-action-btn" onClick={() => addLineItem('service')}><Wrench size={13} /> + Service</button>
                    <button className="small-action-btn" onClick={() => addLineItem('labor')}><HardHat size={13} /> + Labor</button>
                  </div>
                </h4>
                {mergeNotice && (<div style={{ padding: '8px 10px', marginBottom: '10px', borderRadius: '8px', background: 'var(--fill-tertiary)', color: 'var(--text-secondary)', fontSize: 'var(--fs-xs)', fontWeight: 600 }}>{mergeNotice}</div>)}
                {lineItems.length > 0 && (
                  <div className="task-row-headers" style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 90px 80px 70px 30px', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    <div>Description</div><div style={{ textAlign: 'center' }}>Qty</div><div style={{ textAlign: 'right' }}>Price</div><div style={{ textAlign: 'right' }}>Amount</div><div></div>
                  </div>
                )}
                {(() => {
                  if (lineItems.length === 0) return <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>No items added yet. Click above to start adding items.</div>;
                  const groups = [
                    { key: 'part', label: 'Parts', items: lineItems.filter(i => i.type === 'part') },
                    { key: 'service', label: 'Services', items: lineItems.filter(i => i.type === 'service') },
                    { key: 'labor', label: 'Labor', items: lineItems.filter(i => i.type === 'labor') }
                  ];
                  return groups.map(group => {
                    if (group.items.length === 0) return null;
                    return (
                      <div key={group.key} style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--accent)', marginBottom: '6px', paddingLeft: '2px' }}>{group.label}</div>
                        {group.items.map(item => (
                          <div className="task-row" key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 90px 80px 70px 30px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                            <IOSAutocomplete value={item.desc} onChange={(val) => updateLineItemDetails(item.id, 'desc', val)} onSelect={(val) => updateLineItemDetails(item.id, 'desc', val)} placeholder={item.type === 'part' ? 'Part...' : item.type === 'service' ? 'Service...' : 'Labor...'} options={item.type === 'part' ? uniqueParts : [...uniqueExpenses, ...uniqueSales, ...uniqueParts]} />
                            <IOSQtyInput value={item.qty} onChange={(val) => updateLineItemDetails(item.id, 'qty', val)} min={1} step={1} width={90} />
                            <input type="number" placeholder="0.00" style={{ textAlign: 'right', fontSize: 'var(--fs-sm)' }} value={item.unitPrice} onChange={e => updateLineItemDetails(item.id, 'unitPrice', e.target.value)} />
                            <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{currencySymbol}{formatPrice((Number(item.qty) || 0) * (Number(item.unitPrice) || 0))}</div>
                            <button className="icon-btn danger-text" onClick={() => removeLineItem(item.id)} style={{ width: '28px', height: '28px', padding: 0 }}><Trash2 size={13} /></button>
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="panel" style={{ padding: '20px 18px', background: 'var(--bg-surface-2)' }}>
                <h4 className="box-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: '10px' }}>Finalize Details</h4>
                <div className="form-grid">
                  <div className="form-group"><label>Advance Paid ({currencySymbol.trim()})</label><input type="number" placeholder="0.00" value={advancePaid} onChange={e => setAdvancePaid(e.target.value)} /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Recommendations / Notes</label><textarea placeholder="e.g. Next service at 60,000km." value={serviceNotes} onChange={e => setServiceNotes(e.target.value)} style={{ minHeight: '38px', fontSize: 'var(--fs-sm)' }} /></div>
                </div>
              </div>
            </div>

            <div className="invoice-preview-col">
              <div className="invoice-preview-container preview-invoice" id="invoice-printable">
                <div className="custom-invoice-layout">
                  <div className="ci-header-row">
                    <div className="ci-company-left"><img src={logoInvoice} alt="Logo" className="ci-logo" /><div className="ci-company-info">99/1, Quarry Road, Dehiwala, Colombo<br/>9477-1199991 | 9477-8916404</div></div>
                    <div className="ci-header-right">
                      <h1 className="ci-invoice-title">{billingDocType.toUpperCase()}</h1>
                      <table className="ci-meta-table"><tbody><tr><td className="ci-meta-label">{billingDocType} No:</td><td className="ci-meta-value"><input type="text" className="inline-inv-input" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></td></tr><tr><td className="ci-meta-label">{billingDocType} Date:</td><td className="ci-meta-value">{formatInvoiceDate(invoiceDate)}</td></tr></tbody></table>
                    </div>
                  </div>
                  <div className="ci-divider"></div>
                  <div className="ci-info-grid">
                    <div className="ci-info-block"><div className="ci-info-heading">{billingDocType} to:</div><div className="ci-info-row"><span className="ci-info-label">Name:</span><span className="ci-info-text">{displayCustName}</span></div><div className="ci-info-row"><span className="ci-info-label">Phone No:</span><span className="ci-info-text">{displayCustPhone || '-'}</span></div></div>
                    <div className="ci-info-block"><div className="ci-info-heading">Vehicle &amp; Service Info:</div><div className="ci-info-row"><span className="ci-info-label">Vehicle No:</span><span className="ci-info-text">{displayCustVehReg}</span></div><div className="ci-info-row"><span className="ci-info-label">Vehicle Model:</span><span className="ci-info-text">{displayCustVehMake}</span></div><div className="ci-info-row"><span className="ci-info-label">Mileage:</span><span className="ci-info-text">{formatMileage(mileage)}</span></div></div>
                  </div>
                  <table className="ci-items-table"><thead><tr><th className="ci-th-desc">Description</th><th className="ci-th-qty">Qty</th><th className="ci-th-price">Price</th><th className="ci-th-total">Total</th></tr></thead><tbody>{renderGroupedItems(lineItems, currencySymbol)}</tbody></table>
                  <div className="ci-divider"></div>
                  <div className="ci-totals-section">
                    <div className="ci-totals-box">
                      <div className="ci-totals-row"><span className="ci-totals-label">Sub-total :</span><span className="ci-totals-value">{currencySymbol}{formatPrice(getInvoiceTotal())}</span></div>
                      <div className="ci-totals-row"><span className="ci-totals-label">Advance Paid:</span><span className="ci-totals-value">{currencySymbol}{formatPrice(advancePaid)}</span></div>
                      <div className="ci-balance-block"><span>Balance Due:</span><span>{currencySymbol}{formatPrice(getInvoiceTotal() - Number(advancePaid || 0))}</span></div>
                    </div>
                  </div>
                  <div className="ci-footer"><p className="ci-thank-you">THANK YOU FOR YOUR BUSINESS</p><div className="ci-stripes"><div className="ci-stripe ci-stripe-blue"></div><div className="ci-stripe ci-stripe-dark"></div><div className="ci-stripe ci-stripe-red"></div></div></div>
                </div>
              </div>
              <div className="action-buttons-row" style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button className="secondary-btn" style={{ flex: 1, padding: '10px' }} onClick={() => openShareModal()} title="Open share options popup"><Share2 size={15} /> Share / WhatsApp</button>
                <button className="primary-btn" style={{ flex: 1, padding: '10px' }} onClick={handleSaveAndPrint}><FileDown size={15} /> Save & Print</button>
                <button className="secondary-btn" title="Clear / Start New Invoice" style={{ width: '42px', padding: '10px' }} onClick={clearInvoiceForm}><RotateCcw size={15} /></button>
              </div>
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="settings-container">
            <div className="panel">
              <div className="panel-header"><h2>Profile Settings</h2></div>
              <div className="profile-edit-section" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div className="avatar-wrapper" style={{ position: 'relative' }}>
                  <img src={profilePic} alt="Profile" className="large-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                  <label className="avatar-upload-btn" title="Change profile photo" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex' }}>
                    <Camera size={14} color="#fff" />
                    <input type="file" accept="image/*" onChange={handleProfilePicUpload} hidden />
                  </label>
                </div>
                <div className="profile-info">
                  <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>{adminMembers[0].name}</h3>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{adminMembers[0].role}</p>
                </div>
                {profilePic !== DEFAULT_AVATAR && (
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '13px' }}
                    onClick={handleResetProfilePic}
                  >
                    Reset Photo
                  </button>
                )}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Workshop Admins & Partners</h2></div>
              <div className="user-create-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                  <label>Partner Name</label>
                  <input type="text" placeholder="e.g. Partner Name" value={newAdminMember.name} onChange={e => setNewAdminMember({...newAdminMember, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ width: '220px', minWidth: '180px' }}>
                  <label>Role</label>
                  <IOSSelect
                    value={newAdminMember.role}
                    onChange={val => setNewAdminMember({ ...newAdminMember, role: val })}
                    options={ADMIN_ROLE_OPTIONS}
                    placeholder="Select role"
                  />
                </div>
                <button className="primary-btn" style={{ height: '39px' }} onClick={() => { if(newAdminMember.name) { setAdminMembers([...adminMembers, { id: Date.now(), name: newAdminMember.name, role: newAdminMember.role }]); setNewAdminMember({ name: '', role: 'Co-Owner & Admin' }); } }}><UserPlus size={14} /> Add Partner</button>
              </div>
              <div style={{ marginTop: '16px' }}>
                {adminMembers.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16} color="var(--accent)" /><span style={{ fontWeight: 600 }}>{u.name}</span><span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginLeft: '8px' }}>({u.role})</span></div>
                    {u.id !== 1 && <button className="icon-btn danger-text" onClick={() => setAdminMembers(adminMembers.filter(m => m.id !== u.id))}><Trash2 size={14}/></button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h2>Security</h2></div>
              <form onSubmit={(e) => { e.preventDefault(); showAlert("Password updated successfully."); }} className="form-grid" style={{ alignItems: 'flex-end' }}>
                <div className="form-group"><label>Current Password</label><input type="password" required placeholder="••••••••" /></div>
                <div className="form-group"><label>New Password</label><input type="password" required placeholder="••••••••" /></div>
                <div className="form-group"><label>Confirm New Password</label><input type="password" required placeholder="••••••••" /></div>
                <div className="form-group"><button type="submit" className="primary-btn" style={{ width: '100%', height: '38px' }}><Lock size={14} /> Update</button></div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;