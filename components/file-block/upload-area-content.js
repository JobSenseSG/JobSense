/**
 * QuillForms Dependencies
 */
import { useTheme, useMessages, HTMLParser } from '@quillforms/renderer-core';

/**
 * WordPress Dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * External Dependencies
 */
import tinyColor from 'tinycolor2';
import { css } from 'emotion';
import { size } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import FileIcon from './file-icon';
import ProgressBar from './progress-bar';
import SingleFileInfo from './single-file-info';

const UploadAreaContent = ({ attributes, blockId, files, multiple }) => {
  const humanFileSize = (bytes) => {
    let i = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
      (bytes / Math.pow(1000, i)).toFixed(2) * 1 +
      ' ' +
      ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  };

  const { deleteFile } = useDispatch('quillForms-fileblock');

  const { isPending } = useSelect((select) => {
    return {
      isPending: select('quillForms/renderer-core').isFieldPending(blockId),
    };
  });
  const theme = useTheme();
  const messages = useMessages();

  // Just add active class to have a basic animation
  useEffect(() => {
    if (Object.entries(files)?.length && !isPending) {
      setTimeout(() => {
        document
          .querySelectorAll(
            `.blocklib-file-block-${blockId}-display__uploaded-file`
          )
          .forEach((fileElement) => fileElement?.classList?.add('active'));
      }, 50);
    }
  }, [files, isPending]);

  const answersColor = tinyColor(theme.answersColor);
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100%;
        width: 100%;
        padding: 20px;
      `}
    >
      {size(files) === 0 || isPending ? (
        <div
          className={css`
            position: relative;
          `}
        >
          <>
            <svg
              className={css`
                fill: ${answersColor.setAlpha(0.3).toString()};
              `}
              width="115"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0V0z" fill="none"></path>
              <path d="M12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6m0-2C9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4z"></path>
            </svg>
            <div
              className={css`
                position: absolute;
                width: 35px;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
                justify-content: center;
                border-radius: 17px;
                left: 40.2px;
                top: 29.4px;
                bottom: 28px;
                z-index: 1;
                overflow: hidden;
                & {
                }
                @keyframes isUploading {
                  0% {
                    transform: translateY(0%);
                  }

                  100% {
                    transform: translateY(-50%);
                  }
                }
              `}
            >
              <div
                className={css`
                  animation: ${isPending &&
                  ` 1s cubic-bezier( 0.8, 0.3, 0.4, 0.8 ) 0s
							infinite normal none running isUploading;
					`};
                `}
              >
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  className={css`
                    fill: ${answersColor.setAlpha(0.3).toString()};
                  `}
                >
                  <path d="M12 3.172l-6.414 6.414c-.781.781-.781 2.047 0 2.828s2.047.781 2.828 0l1.586-1.586v7.242c0 1.104.895 2 2 2 1.104 0 2-.896 2-2v-7.242l1.586 1.586c.391.391.902.586 1.414.586s1.023-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-6.414-6.414z"></path>
                </svg>
                {isPending && (
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    className={css`
                      fill: ${answersColor.setAlpha(0.3).toString()};
                    `}
                  >
                    <path d="M12 3.172l-6.414 6.414c-.781.781-.781 2.047 0 2.828s2.047.781 2.828 0l1.586-1.586v7.242c0 1.104.895 2 2 2 1.104 0 2-.896 2-2v-7.242l1.586 1.586c.391.391.902.586 1.414.586s1.023-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-6.414-6.414z"></path>
                  </svg>
                )}
              </div>
            </div>
          </>
        </div>
      ) : (
        <div
          className={css`
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            width: 100%;
            padding: 10px 0;
          `}
        >
          {Object.entries(files).map(([fileKey, fileData]) => {
            return (
              <div
                className={classnames(
                  `blocklib-file-block-${blockId}-display__uploaded-file`,
                  css`
                    flex: 0 0 auto;
                    margin-right: 10px;
                    width: 200px;
                    border-radius: 5px;
                    overflow: hidden;
                    border: 1px solid ${answersColor.setAlpha(1).toString()};
                    transition:
                      transform 0.2s ease-in-out,
                      opacity 0.2s ease-in-out;

                    &.active {
                      opacity: 1;
                      transform: scale(1);
                    }

                    &:not(.active) {
                      opacity: 0;
                      transform: scale(0);
                    }
                  `
                )}
                key={fileKey}
              >
                {fileData.type === 'application/pdf' ? (
                  <div
                    className={css`
                      width: 200px;
                      border-radius: 5px;
                      overflow: hidden;
                      border: 1px solid ${answersColor.setAlpha(1).toString()};
                    `}
                  >
                    <div
                      className={css`
                        height: 200px;
                        width: 100%;
                        display: flex;
                        -webkit-box-align: center;
                        align-items: center;
                        -webkit-box-pack: center;
                        justify-content: center;
                        background: ${answersColor.setAlpha(0.3).toString()};
                      `}
                    >
                      <FileIcon color={answersColor.setAlpha(1).toString()} />
                    </div>
                    <SingleFileInfo
                      fileData={fileData}
                      borderColor={answersColor.setAlpha(1).toString()}
                      color={theme.questionsColor}
                      fileKey={fileKey}
                      blockId={blockId}
                      onDelete={(id, key) => deleteFile(id, key)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {size(files) === 0 && (
        <>
          <div
            className={css`
              color: ${theme.questionsColor};
              font-size: 13px;
              strong:nth-child(1) {
                color: ${theme.answersColor};
              }
            `}
          >
            <strong> Choose file </strong> or <strong>Drag here</strong>
          </div>
          <div
            className={css`
              margin-top: 15px;
              font-size: 13px;
              color: ${theme.questionsColor};
            `}
          >
            Max File Size is {attributes.maxFileSize} MB
          </div>
        </>
      )}

      {isPending && (
        <>
          <ProgressBar progress={Object.entries(files)[0][1]?.progress} />

          <div
            className={css`
              margin-top: 3px;
              color: ${theme.answersColor};
            `}
          >
            Uploading...
          </div>
        </>
      )}
    </div>
  );
};
export default UploadAreaContent;
