// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * FileUpload — File upload component with drag-and-drop support.
 *
 * Features a drop zone with drag-over highlight, file list display
 * with remove buttons and file size formatting.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useRef, useCallback } from '../../../../core/src/hooks/index';
import { FormFieldWrapper } from '../../wrapper/src/FormFieldWrapper';

export interface FileUploadProps {
  /** Change handler, receives array of selected files */
  onChange: (files: File[]) => void;
  /** Accepted file types (e.g. 'image/*,.pdf') */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Help text */
  helpText?: string;
  /** HTML id for the input element */
  id?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function FileUpload(props: FileUploadProps) {
  const inputId = props.id ?? `fu-${Math.random().toString(36).slice(2, 8)}`;
  const {
    onChange,
    accept,
    multiple = false,
    maxSize,
    disabled = false,
    label,
    helpText,
  } = props;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (newFiles: File[]) => {
      setError('');
      const filtered: File[] = [];

      for (const file of newFiles) {
        if (maxSize && file.size > maxSize) {
          setError(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
          continue;
        }
        filtered.push(file);
      }

      const result = multiple ? [...files, ...filtered] : filtered.slice(0, 1);
      setFiles(result);
      onChange(result);
    },
    [files, multiple, maxSize, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const dt = e.dataTransfer;
      if (!dt) return;
      const dropped = Array.from(dt.files);
      validateAndSet(dropped);
    },
    [disabled, validateAndSet],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    },
    [],
  );

  const handleInputChange = useCallback(
    (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input.files) return;
      validateAndSet(Array.from(input.files));
      // Reset input so same file can be re-selected
      input.value = '';
    },
    [validateAndSet],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      onChange(updated);
    },
    [files, onChange],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (inputRef.current) (inputRef.current as HTMLInputElement).click();
  }, [disabled]);

  const dropZoneStyle: Record<string, string> = {
    border: `2px dashed ${isDragOver ? '#3b82f6' : error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isDragOver ? '#eff6ff' : '#fafafa',
    transition: 'all 0.15s',
    opacity: disabled ? '0.6' : '1',
  };

  const iconStyle: Record<string, string> = {
    fontSize: '28px',
    color: '#9ca3af',
    marginBottom: '8px',
  };

  const primaryTextStyle: Record<string, string> = {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '4px',
  };

  const secondaryTextStyle: Record<string, string> = {
    fontSize: '12px',
    color: '#9ca3af',
  };

  const hiddenInput = createElement('input', {
    id: inputId,
    ref: inputRef,
    type: 'file',
    accept,
    multiple,
    onChange: handleInputChange,
    disabled,
    style: { display: 'none' },
    tabIndex: -1,
  });

  const dropZone = createElement(
    'div',
    {
      style: dropZoneStyle,
      onClick: handleClick,
      onKeyDown: (e: Event) => {
        const key = (e as KeyboardEvent).key;
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          handleClick();
        }
      },
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      'aria-label': 'Upload files',
    },
    createElement('div', { style: iconStyle }, '\u2191'),
    createElement('div', { style: primaryTextStyle },
      createElement('span', { style: { color: '#3b82f6', fontWeight: '500' } }, 'Click to upload'),
      ' or drag and drop',
    ),
    accept
      ? createElement('div', { style: secondaryTextStyle }, accept)
      : null,
    maxSize
      ? createElement('div', { style: secondaryTextStyle }, `Max size: ${formatFileSize(maxSize)}`)
      : null,
  );

  // File list
  const fileList = files.length > 0
    ? createElement(
        'div',
        { style: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' } },
        ...files.map((file, idx) => {
          const fileItemStyle: Record<string, string> = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          };

          const removeBtnStyle: Record<string, string> = {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ef4444',
            fontSize: '14px',
            padding: '2px 6px',
            borderRadius: '4px',
          };

          return createElement(
            'div',
            { key: `file-${idx}`, style: fileItemStyle },
            createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' } },
              createElement('span', { style: { color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, file.name),
              createElement('span', { style: { color: '#9ca3af', fontSize: '11px', flexShrink: '0' } }, formatFileSize(file.size)),
            ),
            createElement(
              'button',
              {
                type: 'button',
                style: removeBtnStyle,
                onClick: (e: Event) => { e.stopPropagation(); handleRemoveFile(idx); },
                'aria-label': `Remove ${file.name}`,
              },
              '\u2715',
            ),
          );
        }),
      )
    : null;

  return createElement(FormFieldWrapper, {
    label,
    helpText,
    error: error || undefined,
    disabled,
    htmlFor: inputId,
  },
    createElement(
      'div',
      null,
      hiddenInput,
      dropZone,
      fileList,
    ),
  );
}
