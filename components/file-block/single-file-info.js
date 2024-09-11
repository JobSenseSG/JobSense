import { css } from 'emotion';

const SingleFileInfo = ({
  fileData,
  borderColor,
  color,
  fileKey,
  blockId,
  onDelete,
}) => {
  return (
    <div
      className={css`
        padding: 8px;
        border-top: 1px solid ${borderColor};
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: ${color};
      `}
    >
      <div>{fileData.name} </div>
      <div
        className={css`
          margin-left: 5px;
        `}
        role="button"
        tabIndex="-1"
        onClick={() => {
          onDelete(blockId, fileKey);
        }}
      >
        <svg
          focusable="false"
          viewBox="0 0 24 24"
          role="presentation"
          className={css`
            width: 20px;
            height: 20px;
            fill: ${color};
          `}
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </div>
    </div>
  );
};

export default SingleFileInfo;
