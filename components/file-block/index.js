import { registerBlockType } from "@quillforms/blocks";
import display from "./display";
import "../lib/store";
registerBlockType("file-upload", {
    attributes: {
        maxFileSize: {
            type: "number",
            default: 2
        },
        allowedFileExtensions: {
            type: "string",
            default: ""
        }
    },
    supports: {
        required: true,
        editable: true,
        logic: true,
        logicConditions: false,
        attachment: false
    },
    display
});
