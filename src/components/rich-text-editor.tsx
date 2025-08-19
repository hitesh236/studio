
'use client';

import * as React from 'react';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { Toolbar } from './rich-text-editor-toolbar';
import { cn } from '@/lib/utils';

const theme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'm-0 mb-2',
  quote: 'ml-4 border-l-4 pl-4 border-muted-foreground text-muted-foreground',
  heading: {
    h1: 'text-2xl font-bold mb-2',
    h2: 'text-xl font-semibold mb-2',
    h3: 'text-lg font-semibold mb-2',
  },
  list: {
    nested: {
      listitem: 'list-none ml-4',
    },
    ol: 'list-decimal list-inside mb-2',
    ul: 'list-disc list-inside mb-2',
    listitem: 'mb-1',
  },
  link: 'text-primary underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
  },
};

// When the editor is empty, it contains the JSON of a single paragraph with a single line break.
const initialJson = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

function Editor({ value, onChange }: { value?: string, onChange: (value: string) => void}) {
    const editorStateRef = React.useRef<EditorState>();
  
    return (
        <LexicalComposer initialConfig={{
            namespace: 'rich-text-editor',
            theme,
            onError: (error) => console.error(error),
            editorState: value && value.length > 0 ? value : initialJson,
            nodes: [
                HeadingNode, QuoteNode,
                TableCellNode, TableNode, TableRowNode,
                ListItemNode, ListNode,
                CodeHighlightNode, CodeNode,
                AutoLinkNode, LinkNode
            ]
        }}>
            <Toolbar />
            <div className="relative">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="min-h-24 w-full rounded-b-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />}
                    placeholder={<div className="absolute top-2 left-3 text-muted-foreground pointer-events-none">Enter text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <OnChangePlugin onChange={(editorState) => {
                editorStateRef.current = editorState;
                onChange(JSON.stringify(editorState.toJSON()));
            }} />
      </LexicalComposer>
    );
}

export function RichTextEditor({ value, onChange, placeholder }: { value?: string, onChange: (value: string) => void, placeholder?: string }) {
    // This is a bit of a hack to prevent hydration errors.
    // The editor will only be rendered on the client.
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground animate-pulse"></div>;
    }

    return <Editor value={value} onChange={onChange} />;
}
