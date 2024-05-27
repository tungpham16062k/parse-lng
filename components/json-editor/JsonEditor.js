import classNames from 'classnames';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { withStyles } from '@mui/styles';
import { styles } from './styles';

let JSONEditor = null;

let line = null,
    col = null;

function JsonEditor(_props, ref) {
    const {
        classes,
        isOverwriteColor,
        height,
        content,
        autoFormat,
        autoMinimize,
        mode = 'text',
        readOnly = false,
        onClick = () => null,
        onChangeMode = () => null,
        ...props
    } = _props || {};

    const refContainer = useRef(null);
    const refEditor = useRef(null);
    const [curHeight, setCurHeight] = useState();

    useImperativeHandle(ref, () => ({
        ref: refEditor,
        refContainer,
        onInsertVariable: handleInsertVariable,
        onSetContent: handleSetContent,
    }));

    useEffect(() => {
        const initComp = async () => {
            if (!JSONEditor) {
                await import('vanilla-jsoneditor').then((e) => {
                    JSONEditor = e.JSONEditor;
                });
            }
            // create editor
            try {
                refEditor.current = new JSONEditor({
                    target: refContainer.current,
                    props: {
                        content,
                        mode,
                        readOnly,
                        onBlur,
                        onChangeMode,
                        ...(props || {}),
                    },
                });
            } catch (error) {}

            return () => {
                // destroy editor
                if (refEditor.current) {
                    refEditor.current.destroy?.();
                    refEditor.current = null;
                }
            };
        };
        initComp();
    }, []);

    // update props
    useEffect(() => {
        if (refEditor.current) {
            refEditor.current.updateProps(props);
        }
    }, [props]);

    useEffect(() => {
        if (refContainer.current) {
            setTimeout(() => {
                let elmNavCol = refContainer?.current?.querySelector('.jse-status-bar');
                elmNavCol?.addEventListener('DOMSubtreeModified', handleClickJsonEditor);
                if (autoFormat) {
                    const btnNode = refContainer.current?.querySelector('.jse-actions button');
                    if (btnNode) btnNode.click();
                }
                if (autoMinimize) {
                    setTimeout(() => handleAutoMinimize(), 20);
                }
            }, 50);
            return () => {
                if (refContainer.current) {
                    let elmNavCol = refContainer.current?.querySelector('.jse-status-bar');
                    elmNavCol?.removeEventListener('DOMSubtreeModified', handleClickJsonEditor);
                }
            };
        }
    }, [refContainer.current]);

    const onBlur = () => {
        line = null;
        col = null;
    };

    const handleInsertVariable = (value, { line, col } = {}) => {
        if (value && (line || col) !== null) {
            let str = `{{${value}}}`;
            let { text } = content || {};
            const lineTexts = text.split('\n');
            let _text = lineTexts[line - 1] || '';
            _text = _text.slice(0, col - 1) + str + _text.slice(col - 1);
            lineTexts[line - 1] = _text;
            refEditor.current?.update({ ...content, text: lineTexts.join('\n') });
        }
    };

    const handleClickJsonEditor = () => {
        if (refContainer.current) {
            let elmWrapper = refContainer.current;
            let elmNavCol = elmWrapper.querySelector('.jse-status-bar');
            if (elmNavCol) {
                let [_line, _col] = Array.from(elmNavCol.children);
                line = Number(_line?.innerText?.replace('Line:', '').trim());
                col = Number(_col?.innerText?.replace('Column:', '').trim());
                onClick({ line, col });
            }
        }
    };

    const handleAutoMinimize = () => {
        if (refContainer.current) {
            let elmWrapper = refContainer.current;
            const lineNumbersElm = elmWrapper.querySelector('.cm-lineNumbers');
            const elms = lineNumbersElm.querySelectorAll('.cm-gutterElement:not(.cm-activeLineGutter)');
            let totalLine = elms[elms.length - 1]?.outerText;
            if (totalLine) {
                totalLine = Number(totalLine);
                const hMenu = elmWrapper.querySelector('.jse-menu')?.getBoundingClientRect().height || 34;
                const hLine = elmWrapper.querySelector('.cm-line')?.getBoundingClientRect().height || 18;
                const hStatusBar = elmWrapper.querySelector('.jse-status-bar')?.getBoundingClientRect().height || 23;
                const nextHeight = totalLine * hLine + hMenu + hStatusBar + 40;
                if (elmWrapper.getBoundingClientRect().height > nextHeight) {
                    setCurHeight(nextHeight);
                }
            }
        }
    };

    const handleSetContent = (content) => refEditor.current?.update({ ...content });

    return (
        <div
            style={{ height: curHeight || height || '100%' }}
            className={classNames('vanilla-jsoneditor-react', classes.headerColor, {
                [classes.wrapper]: !!isOverwriteColor,
            })}
            ref={refContainer}
            onClick={handleClickJsonEditor}
        />
    );
}

export default withStyles(styles)(forwardRef(JsonEditor));
