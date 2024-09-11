/**
 * QuillForms Dependencies
 */
import { useTheme } from '@quillforms/renderer-core';
/**
 * External Dependencies
 */
import { css } from 'emotion';
import tinycolor from 'tinycolor2';

const ProgressBar = ({ progress }) => {
  const theme = useTheme();
  const answersColor = tinycolor(theme.answersColor);
  return (
    <div
      className={css`
        position: relative;
        height: 7px;
        border-radius: 3px;
        overflow: hidden;
        width: 200px;
        margin-top: 15px;
        border-radius: 2px;
        background: ${answersColor.setAlpha(0.4).toString()};
      `}
    >
      <div
        className={css`
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          transition: width 0.3s;
          -webkit-transition: width 0.3s;
          -moz-transition: width 0.3s;
          -o-transition: width 0.3s;

          width: ${progress}%;
          background: ${answersColor.setAlpha(1).toString()};
        `}
      />
    </div>
  );
};

export default ProgressBar;
