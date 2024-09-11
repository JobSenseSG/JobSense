import { registerBlockType } from '@quillforms/blocks';
import display from './display';
import '../../lib/store';

registerBlockType('file-upload', {
  attributes: {
    maxFileSize: {
      type: 'number',
      default: 2, // Default file size limit
    },
    allowedFileExtensions: {
      type: 'string',
      default: '', // Allow all extensions by default
    },
  },
  supports: {
    required: true,
    editable: true,
    logic: true,
    logicConditions: false,
    attachment: false,
  },
  display, // The display function or component that handles file uploads
});
