'use client';

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, SearchIcon } from '../icons';

export type SelectOption = {
  value: string | number;
  label: string;
};

type SelectValue = string | number | undefined;

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | boolean;
  options: SelectOption[];
  isSearchable?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      className = '',
      value,
      onChange,
      onBlur,
      isSearchable = true,
      id,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const [focusedIndex, setFocusedIndex] = useState(0);

    const [internalValue, setInternalValue] = useState<SelectValue>(() => {
      const val = value ?? props.defaultValue;
      if (Array.isArray(val)) {
        return val[0] as SelectValue;
      }
      return val as SelectValue;
    });

    // 内部操作用のRef
    const innerSelectRef = useRef<HTMLSelectElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsContainerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // ★修正1: Refの結合処理 (useEffectを使わないコールバックRefパターン)
    const setRefs = useCallback(
      (node: HTMLSelectElement | null) => {
        // 内部Refの更新
        innerSelectRef.current = node;

        // 外部から渡されたRefの更新
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // 一意なIDの生成（ARIA属性用）
    const listboxId = id ? `${id}-listbox` : 'select-listbox';

    const currentValue = useMemo((): SelectValue => {
      if (value !== undefined) {
        return Array.isArray(value)
          ? (value[0] as SelectValue)
          : (value as SelectValue);
      }
      const val = internalValue ?? props.defaultValue;
      return Array.isArray(val)
        ? (val[0] as SelectValue)
        : (val as SelectValue);
    }, [value, internalValue, props.defaultValue]);

    const selectedLabel = useMemo(() => {
      if (currentValue === undefined || currentValue === '') {
        return '';
      }
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(currentValue),
      );
      return selectedOption?.label || '';
    }, [options, currentValue]);

    const filteredOptions = useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [options, searchQuery]);

    useEffect(() => {
      if (isOpen) {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
          });
        }
        setTimeout(() => {
          if (isSearchable) {
            searchInputRef.current?.focus();
          }
        }, 0);
        setFocusedIndex(0);
      } else {
        setSearchQuery('');
        setFocusedIndex(0);
      }
    }, [isOpen, isSearchable]);

    useEffect(() => {
      if (isOpen && optionRefs.current[focusedIndex]) {
        optionRefs.current[focusedIndex]?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }, [focusedIndex, isOpen]);

    useEffect(() => {
      if (innerSelectRef.current && value === undefined) {
        const selectValue = innerSelectRef.current.value;
        if (selectValue && selectValue !== String(internalValue ?? '')) {
          setInternalValue(selectValue);
        }
      }
    }, [value, internalValue]);

    useEffect(() => {
      const handleScroll = (event: Event) => {
        if (isOpen && menuRef.current?.contains(event.target as Node)) {
          return;
        }
        if (isOpen) setIsOpen(false);
      };

      const handleResize = () => {
        if (isOpen) setIsOpen(false);
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(target) &&
          menuRef.current &&
          !menuRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isOpen]);

    const handleOptionClick = (optionValue: string | number) => {
      setInternalValue(optionValue);

      if (innerSelectRef.current) {
        // 値を更新
        innerSelectRef.current.value = String(optionValue);

        const event = new Event('change', { bubbles: true });
        innerSelectRef.current.dispatchEvent(event);

        // 親から渡された onChange があれば呼ぶ（念のため）
        // ※ dispatchEvent で拾われるケースが多いが、Reactの制御コンポーネントとしては明示呼び出しも安全
        if (onChange) {
          // ReactのSyntheticEvent互換のオブジェクトを渡す必要が出てくる場合があるが、
          // 基本は dispatchEvent でネイティブ動作に寄せるのがAIの推奨
          // ここでは dispatchEvent だけで動作しない環境（一部のテスト等）への保険として
          // 必要であれば残すが、基本は dispatchEvent だけでOK。
          // 今回はAI指摘に従いネイティブイベント優先にするため、明示的な onChange(synthetic) は削除しても良いが
          // 既存動作の互換性のため残すなら以下のようにする（今回はAI推奨の dispatchEvent 方式のみにする）
        }
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions.length > 0) {
            handleOptionClick(filteredOptions[focusedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    return (
      <div className="w-full relative">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <select
          ref={setRefs} // ★修正1: コールバックRefを使用
          id={id}
          className="sr-only"
          value={currentValue ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
          tabIndex={-1} // キーボード操作はカスタムボタン側で行うため
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative" ref={dropdownRef}>
          <button // NOSONAR: Custom select implementation required
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-label={label || '選択肢'}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={props.disabled}
            className={`w-full px-3 py-2 rounded-md border outline-none transition-all duration-200 flex items-center justify-between min-w-0 ${
              error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            } ${
              props.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            } ${className}`}
          >
            <span
              className={`${
                selectedLabel ? 'text-gray-900' : 'text-gray-500'
              } truncate flex-1 min-w-0 text-left`}
            >
              {selectedLabel || '選択してください'}
            </span>
            <span className="shrink-0 ml-2">
              <ChevronDownIcon />
            </span>
          </button>

          {isOpen &&
            !props.disabled &&
            createPortal(
              <div // NOSONAR: Custom select implementation required
                ref={menuRef}
                id={listboxId}
                role="listbox"
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  zIndex: 9999,
                }}
                className="bg-white border border-gray-300 rounded-b-md shadow-lg overflow-hidden flex flex-col"
              >
                {isSearchable && (
                  <div className="p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setFocusedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="検索..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
                        <SearchIcon />
                      </span>
                    </div>
                  </div>
                )}

                <div
                  ref={optionsContainerRef}
                  className="overflow-auto max-h-60"
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => {
                      const isSelected =
                        String(option.value) === String(currentValue ?? '');
                      const isFocused = index === focusedIndex;

                      return (
                        <button // NOSONAR: Custom select implementation required
                          key={option.value}
                          ref={(el) => {
                            optionRefs.current[index] = el;
                          }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleOptionClick(option.value)}
                          onMouseEnter={() => setFocusedIndex(index)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors scroll-my-1 ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700'
                          } ${isFocused ? 'bg-gray-100' : ''}`}
                        >
                          {option.label}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      該当する候補がありません
                    </div>
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
