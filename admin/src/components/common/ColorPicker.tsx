import React from 'react';
import './ColorPicker.css';

const PRESETS = [
  '#FF6B6B', '#F97316', '#F59E0B', '#10B981',
  '#4ECDC4', '#4A90D9', '#7B3FC4', '#8B5CF6',
  '#EC4899', '#EF4444', '#14B8A6', '#1D4ED8',
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => (
  <div className="color-picker">
    <div className="color-picker__row">
      <div className="color-picker__preview" style={{ background: value }} />
      <input
        type="text"
        className="form-input color-picker__hex"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#7B3FC4"
        maxLength={7}
        spellCheck={false}
      />
      <input
        type="color"
        className="color-picker__native"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={label ?? 'Pick colour'}
      />
    </div>
    <div className="color-picker__swatches">
      {PRESETS.map((hex) => (
        <button
          key={hex}
          type="button"
          className={`color-picker__swatch ${value === hex ? 'color-picker__swatch--active' : ''}`}
          style={{ background: hex }}
          onClick={() => onChange(hex)}
          title={hex}
        />
      ))}
    </div>
  </div>
);
