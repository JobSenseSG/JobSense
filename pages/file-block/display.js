/**
 * WordPress Dependencies
 */
import { useEffect, useRef, useState } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";

/**
 * External Dependencies
 */
import { useDropzone } from "react-dropzone";
import tinyColor from "tinycolor2";
import { css } from "emotion";
import { size } from "lodash";

/**
 * QuillForms Dependencies
 */
import {
    useFormContext,
    useTheme,
    useMessages
} from "@quillforms/renderer-core";

/**
 * Internal Dependencies
 */
import UploadAreaContent from "./upload-area-content";
const YOUR_SERVER_URL = "localhost";
const FileBlockDisplay = ({
    id,
    attributes,
    setIsValid,
    isPreview,
    setIsAnswered,
    setIsPending,
    setPendingMsg,
    setValidationErr,
    blockWithError,
    showNextBtn,
    showErrMsg,
    val,
    setVal,
    isTouchScreen
}) => {
    const { formId } = useFormContext();
    const theme = useTheme();
    const messages = useMessages();
    const answersColor = tinyColor(theme.answersColor);

    const { multiple, maxFileSize, allowedFileExtensions, required } = attributes;

    const accept = allowedFileExtensions.trim()
        ? allowedFileExtensions
            .trim()
            .split(",")
            .filter((ext) => ext.trim())
            .map((ext) => `.${ext.trim()}`)
            .join(",")
        : "";

    const mounted = useRef(false);
    const wrapperRef = useRef();
    const { files } = useSelect((select) => {
        return {
            files: select("quillForms-fileblock").getFiles(id) ?? {}
        };
    });
    const filesRef = useRef();
    filesRef.current = files;

    const { addFile, updateFile, deleteFile, reset } = useDispatch(
        "quillForms-fileblock"
    );

    const onDropAccepted = (files) => {
        for (let file of files) {
            isPreview ? preview(file) : upload(file);
        }
    };

    const preview = (file) => {
        let fileKey = Math.random().toString(36).substr(2, 10);
        let fileData = {
            status: "success",
            progress: 100,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrlSrc: URL.createObjectURL(file)
        };

        addFile(id, fileKey, fileData);

        updateValue();
        showErrMsg(false);
        setIsAnswered(true);
        showNextBtn(true);
    };

    const upload = (file) => {
        let request = new XMLHttpRequest();

        let formData = new FormData();
        formData.append("action", "fileblock_upload");
        formData.append("form_id", formId);
        formData.append("field_id", id);
        formData.append("file", file);

        let fileKey = Math.random().toString(36).substr(2, 10);
        let fileData = {
            status: "pending",
            progress: 0,
            request,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrlSrc: URL.createObjectURL(file)
        };
        addFile(id, fileKey, fileData);

        request.open("POST", YOUR_SERVER_URL);

        request.upload.addEventListener("progress", function (e) {
            if (!mounted.current) return;
            let percent_complete = (e.loaded / e.total) * 100;
            updateFile(id, fileKey, {
                progress: percent_complete
            });
        });

        request.addEventListener("load", function (e) {
            if (!mounted.current) return;
            let response = request.response ?? {};
            let fileData;
            if (request.status === 201) {
                fileData = {
                    status: "success",
                    id: response.id,
                    hash: response.hash
                };
            } else {
                fileData = {
                    status: "failed",
                    error: response.message ?? "Cannot upload file."
                };
            }
            updateFile(id, fileKey, fileData);
            let isPending = updatePendingStatus();
            if (!isPending) {
                updateValue();
            }
        });
        request.send(formData);

        updatePendingStatus(true);
        showErrMsg(false);
        setIsAnswered(true);
        showNextBtn(true);
    };

    const updatePendingStatus = (status) => {
        if (status === undefined) {
            status =
                Object.values(filesRef.current).find(
                    (fileData) => fileData.status === "pending"
                ) !== undefined;
        }
        setIsPending(status);
        setPendingMsg(status ? "Uploading files..." : null);
        return status;
    };

    const onDropRejected = (files) => {
        // We just need to show the first error only
        blockWithError(files[0].errors[0].message);
    };

    const { getRootProps, getInputProps } = useDropzone({
        multiple: multiple,
        maxSize: maxFileSize * 1024 * 1024,
        accept,
        onDropAccepted,
        onDropRejected,
        disabled: multiple ? false : Object.values(filesRef.current).length >= 1
    });

    const checkFieldValidation = () => {
        if (required === true && (!val || size(val) === 0)) {
            setIsValid(false);
            setValidationErr(messages["label.errorAlert.required"]);
        }
        // else if ( size( val ) !== size( filesArr ) ) {
        // 	setIsValid( false );
        // 	setValidationErr( 'Some files cannot be uploaded!' );
        // }
        else {
            setIsValid(true);
            setValidationErr(null);
        }
    };

    useEffect(() => {
        checkFieldValidation();
    }, [val, attributes]);

    const updateValue = () => {
        let filesArr = Object.values(filesRef.current);

        let val = filesArr
            .filter((fileData) => fileData.status === "success")
            .map((fileData) => {
                if (isPreview) {
                    return {
                        id: 0,
                        hash: "preview"
                    };
                } else {
                    return {
                        id: fileData.id,
                        hash: fileData.hash
                    };
                }
            });
        setVal(val);
    };

    useEffect(() => {
        mounted.current = true;
        return () => {
            // delete pending files
            Object.entries(filesRef.current).forEach(([fileKey, fileData]) => {
                if (fileData.status === "pending") {
                    deleteFile(fileKey);
                }
            });
            mounted.current = false;
        };
    }, []);

    return (
        <div className="question__wrapper">
            <div
                {...getRootProps({ className: "dropzone" })}
                className={css`
          & {
            display: flex;
            flex-wrap: wrap;
            margin-top: 15px;
            width: 100%;
            min-height: 300px;
            max-height: 300px;
            overflow-y: auto;
            outline: none;
            cursor: pointer;
            background: ${answersColor.setAlpha(0.1).toString()};
            border: 1px dashed ${answersColor.setAlpha(0.8).toString()};

            &:hover {
              background: ${answersColor.setAlpha(0.2).toString()};
            }
          }
        `}
                ref={wrapperRef}
            >
                <input {...getInputProps()} />
                <UploadAreaContent attributes={attributes} blockId={id} files={files} />
            </div>
        </div>
    );
};
export default FileBlockDisplay;
