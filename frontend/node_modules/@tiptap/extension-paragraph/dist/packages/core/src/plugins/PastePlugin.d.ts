import { Slice } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
export declare const PastePlugin: (onPaste: (e: ClipboardEvent, slice: Slice) => void) => Plugin<any>;
