'use client';

import { useState, useEffect } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';
import type { UseFormRegisterReturn } from 'react-hook-form';

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
  error?: string;
  register?: UseFormRegisterReturn;
};

export const ColorPicker = ({
  label,
  value,
  onChange,
  error,
  register,
}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerColor, setPickerColor] = useState(value);

  useEffect(() => {
    setPickerColor(value);
  }, [value]);

  const handleColorChange = (color: ColorResult) => {
    const hexColor = color.hex;
    setPickerColor(hexColor);
    onChange(hexColor);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
            className="w-16 h-10 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: pickerColor || value }}
            aria-label="カラーピッカーを開く"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (register?.onChange) {
                register.onChange(e);
              }
            }}
            onBlur={register?.onBlur}
            name={register?.name}
            ref={register?.ref}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#1E88E5"
          />
        </div>
        {isOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              aria-label="カラーピッカーを閉じる"
            />
            <div className="relative z-50 mt-2">
              <SketchPicker color={pickerColor} onChange={handleColorChange} />
            </div>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
