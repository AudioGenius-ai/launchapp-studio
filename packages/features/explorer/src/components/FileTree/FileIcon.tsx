import React from 'react';
import {
  FileText,
  FileCode,
  Film,
  Music,
  Archive,
  FileX,
  Folder,
  FolderOpen,
  FileType,
  Code2,
  Braces,
  Hash,
  FileImage,
} from 'lucide-react';
import type { FileSystemNode, FileIconType } from '@code-pilot/types';
import { getFileIcon } from '@code-pilot/types';
import { cn } from '@code-pilot/ui-kit';

interface FileIconProps {
  node: FileSystemNode;
  isExpanded?: boolean;
  className?: string;
}

const iconMap: Record<FileIconType, React.ComponentType<any>> = {
  typescript: FileCode,
  javascript: FileCode,
  react: FileCode,
  vue: FileCode,
  svelte: FileCode,
  html: Code2,
  css: Hash,
  scss: Hash,
  json: Braces,
  markdown: FileText,
  rust: FileCode,
  python: FileCode,
  java: FileCode,
  cpp: FileCode,
  go: FileCode,
  ruby: FileCode,
  php: FileCode,
  yaml: FileText,
  toml: FileText,
  xml: Code2,
  image: FileImage,
  video: Film,
  audio: Music,
  pdf: FileType,
  archive: Archive,
  text: FileText,
  binary: FileX,
  folder: Folder,
  'folder-open': FolderOpen,
  unknown: FileText,
};

const iconColors: Partial<Record<FileIconType, string>> = {
  typescript: 'text-blue-500',
  javascript: 'text-yellow-500',
  react: 'text-cyan-500',
  vue: 'text-green-500',
  svelte: 'text-orange-500',
  html: 'text-orange-600',
  css: 'text-blue-600',
  scss: 'text-pink-500',
  json: 'text-gray-600',
  markdown: 'text-gray-700',
  rust: 'text-orange-700',
  python: 'text-blue-400',
  java: 'text-red-600',
  cpp: 'text-blue-700',
  go: 'text-cyan-600',
  ruby: 'text-red-500',
  php: 'text-purple-600',
  yaml: 'text-gray-600',
  toml: 'text-gray-600',
  xml: 'text-green-600',
  image: 'text-purple-500',
  video: 'text-pink-600',
  audio: 'text-indigo-500',
  pdf: 'text-red-700',
  archive: 'text-amber-600',
  folder: 'text-blue-500',
  'folder-open': 'text-blue-500',
};

export function FileIcon({ node, isExpanded, className }: FileIconProps) {
  let iconType: FileIconType;
  
  if (node.type === 'directory') {
    iconType = isExpanded ? 'folder-open' : 'folder';
  } else {
    iconType = getFileIcon(node.name);
  }

  const Icon = iconMap[iconType] || iconMap.unknown;
  const color = iconColors[iconType];

  return <Icon className={cn('flex-shrink-0', color, className)} />;
}