'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import type { SelectHTMLAttributes } from 'react';

export type MultiSelectOption = {
  value: string | number;
  label: string;
};

export type MultiSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value'
> & {
  label?: string;
  error?: string | boolean;
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
};

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  (
    { label, error, options, value = [], onChange, className = '', ...props },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(value);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
      setSelectedValues(value);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleToggle = (optionValue: string | number) => {
      const stringValue = String(optionValue);
      const newValues = selectedValues.includes(stringValue)
        ? selectedValues.filter((v) => v !== stringValue)
        : [...selectedValues, stringValue];
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const selectedLabels = options
      .filter((opt) => selectedValues.includes(String(opt.value)))
      .map((opt) => opt.label);

    return (
      <div className="w-full relative" ref={containerRef}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2 rounded-md border outline-none text-left bg-white ${
              error
                ? 'border-red-500'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            } ${className}`}
            disabled={props.disabled}
          >
            {selectedLabels.length > 0 ? (
              <span className="text-sm text-gray-900">
                {selectedLabels.length}件選択中
              </span>
            ) : (
              <span className="text-sm text-gray-500">選択してください</span>
            )}
          </button>

          {isOpen && !props.disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="p-2 space-y-1">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(
                    String(option.value),
                  );
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(option.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 隠しselect要素（フォーム送信用） */}
        <select
          ref={ref || selectRef}
          multiple
          className="hidden"
          value={selectedValues}
          onChange={() => {
            // この要素は非表示で、実際の操作はbuttonとcheckboxで行われるため、
            // ここでは何もしない（警告回避のための空のハンドラー）
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {selectedValues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {label}
                <button
                  type="button"
                  onClick={() => {
                    const option = options.find((opt) => opt.label === label);
                    if (option) {
                      handleToggle(option.value);
                    }
                  }}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
