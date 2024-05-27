import React, { Component, Fragment } from 'react';
import { cloneDeep, debounce, isArray, isEmpty, isObject, isString } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import JSON5 from 'json5';
import { withStyles } from '@mui/styles';
import { Button, TextField } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

import { styles } from './styles';

import JsonEditor from 'components/json-editor';

const validLngs = ['vi', 'en'];

const randomString = (strLength) => {
    let defaultstring = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let length = strLength ?? 0;
    return Array.from({ length })
        .map(() => {
            let rnum = Math.floor(Math.random() * defaultstring.length);
            return defaultstring.substring(rnum, rnum + 1);
        })
        .join('');
};

const genText = (value) => {
    return isArray(value) && !isEmpty(value) ? value.join('|') : value || '';
};

const genJson = () => ({ text: '{\n  \n}' });

class RootContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderReady: false,
            list: [],
            json: genJson(),
            lngText: validLngs.join(', '),
            lngs: cloneDeep(validLngs),
            excelData: '',
        };
        this.jsonRef = null;
    }

    componentDidMount() {
        this.initState();
    }

    initState = () => {
        const datas = [];

        console.timeEnd();
        this.setState({ renderReady: true, list: datas, json: genJson() });
    };

    handleChange = (json) => {
        this.setState({ json });
    };

    hanleParse = () => {
        const { json, lngs: _lngs } = this.state;
        let { text } = json || {};
        text = text || '';
        let lngData = {};
        const list = [];
        if (text) {
            let datas = JSON5.parse(text);
            if (isObject(datas)) {
                const setLng = (obj, prefix) =>
                    Object.keys(obj || {}).forEach((key) => {
                        const value = obj[key] || '';
                        if (isObject(value) && !isArray(value)) setLng(value, key);
                        else {
                            let targetId = `${prefix ? `${prefix}.` : ''}${key}`;
                            const setDatas = (data, { isArr, addTargetId } = {}) => {
                                let _value = data[0];
                                const _targetId = targetId + (addTargetId || '');
                                lngData[_targetId] = _value;
                                const _tbl = {
                                    id: randomString(10),
                                    key: _targetId,
                                    ...(isArr && { isArr }),
                                };
                                _lngs.forEach((key, _idx) => {
                                    _tbl[key] = data[_idx];
                                });
                                list.push(_tbl);
                            };
                            if (isString(value)) {
                                lngData[targetId] = _lngs.map(() => value || '');
                            } else if (isArray(value, true) && value.length > _lngs.length) {
                                value.forEach((i, idx) => {
                                    setDatas(i, {
                                        addTargetId: `.${idx}`,
                                        isArr: true,
                                    });
                                });
                            } else {
                                setDatas(value);
                            }
                        }
                    });
                setLng(datas);
                toast.success('Parse thành công');
            }
        }
        this.setState({ list });
    };

    handleCopyExcel = () => {
        const { list, lngs } = this.state;
        if (isArray(list) && !isEmpty(list)) {
            const excelData = list
                .map((item) => {
                    const { key } = item || {};
                    let text = key;
                    lngs.forEach((lng) => {
                        text += `\t${genText(item?.[lng] || '')}`;
                    });
                    return text;
                })
                .join('\n');
            navigator.clipboard.writeText(excelData);
            toast.success('Copy thành công');
        } else {
            toast.error('Chưa có dữ liệu');
        }
    };

    handleClear = () => {
        const json = genJson();
        this.setState({ list: [], json, excelData: '' }, () => {
            this.jsonRef?.onSetContent(json);
        });
    };

    handleChangeLngInput = (value) => {
        let _value = String(value || '');
        this.setState({ lngText: _value, lngs: _value.split(',').map((i) => i.trim()) }, () => {});
    };

    handleChangeExcelInput = (value) => {
        this.setState({ excelData: value || '' });
    };

    hanleParseExcel = () => {
        const { excelData, lngs } = this.state;
        let _value = String(excelData || '');
        const columns = _value.split('\n');
        const list = [];
        if (isArray(columns, true)) {
            columns.forEach((item) => {
                if (item) {
                    const [key, ...data] = (item || '')?.split('\t');
                    const _tbl = {
                        id: randomString(10),
                        key: key,
                    };
                    lngs?.forEach((key, _idx) => {
                        _tbl[key] = data[_idx];
                    });
                    list.push(_tbl);
                }
            });
        }

        const datas = {};
        if (isArray(list, true)) {
            list.forEach((item) => {
                if (item) {
                    const { key } = item;
                    const [mainKey, subKey] = (key || '').split('.');
                    let arr = [];
                    lngs?.forEach((lng) => {
                        let text = item[lng] || '';
                        if (text?.includes('|')) {
                            text = text.split('|');
                        }
                        arr.push(item[lng] || '');
                    });
                    if (subKey) {
                        datas[mainKey] = datas[mainKey] || {};
                        datas[mainKey][subKey] = arr;
                    } else datas[key] = arr;
                }
            });
        }

        const json = { text: JSON.stringify(datas) };
        this.setState({ list, json: json }, () => this.jsonRef?.onSetContent(json));
    };

    _renderContent = () => {
        const { renderReady, list, lngs } = this.state;
        const { classes } = this.props;
        return (
            <Fragment>
                {!renderReady ? (
                    <span style={{ padding: 24 }}>{'Loading...'}</span>
                ) : (
                    <div className={classes.box}>
                        <div className={classes.textarea}>
                            <TextField
                                multiline
                                label={'Excel Data'}
                                color={'info'}
                                rows={4}
                                variant={'filled'}
                                onChange={(e) => this.handleChangeExcelInput(e.target.value)}
                            />
                        </div>
                        <div className={classes.table}>
                            <table>
                                {isArray(list) && !isEmpty(list) && (
                                    <Fragment>
                                        <tr className={'header'}>
                                            <td>
                                                <span>{'KEY'}</span>
                                            </td>
                                            {lngs?.map((lng) => (
                                                <td key={lng}>
                                                    <span>{lng.toUpperCase()}</span>
                                                </td>
                                            ))}
                                        </tr>
                                        {list.map((item) => {
                                            const _item = item || {};
                                            const { id, key } = _item;
                                            return (
                                                <tr key={id}>
                                                    <td className={'col-key'}>
                                                        <span>{key}</span>
                                                    </td>
                                                    {lngs?.map((lng) => {
                                                        const data = _item[lng];
                                                        return (
                                                            <td key={lng}>
                                                                <span>{genText(data)}</span>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </Fragment>
                                )}
                            </table>
                        </div>
                    </div>
                )}
            </Fragment>
        );
    };

    render() {
        const { json, renderReady, lngText } = this.state;
        const { classes } = this.props;
        return (
            <Fragment>
                <ToastContainer
                    position={'bottom-right'}
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={'colored'}
                />
                <div className={classes.wrapper}>
                    <div className={classes.left}>
                        <div className={classes.input}>
                            <TextField
                                label={'Ngôn ngữ (Cách nhau bằng dấu phẩy)'}
                                color={'info'}
                                rows={4}
                                value={lngText}
                                variant={'filled'}
                                onChange={(e) => this.handleChangeLngInput(e.target.value)}
                            />
                        </div>
                        <div className={classes.action}>
                            {renderReady && (
                                <Fragment>
                                    <Button
                                        variant={'contained'}
                                        color={'error'}
                                        onClick={this.handleClear}
                                    >
                                        CLEAR
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        color={'success'}
                                        onClick={this.hanleParse}
                                    >
                                        PARSE JSON
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        color={'warning'}
                                        onClick={this.hanleParseExcel}
                                    >
                                        PARSE EXCEL
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        color={'info'}
                                        onClick={this.handleCopyExcel}
                                    >
                                        COPY EXCEl TABLE
                                    </Button>
                                </Fragment>
                            )}
                        </div>
                        <div className={classes.editor}>
                            {renderReady && (
                                <JsonEditor
                                    ref={(ref) => (this.jsonRef = ref)}
                                    content={json}
                                    onChange={this.handleChange}
                                />
                            )}
                        </div>
                    </div>
                    {this._renderContent()}
                </div>
            </Fragment>
        );
    }
}

export default withStyles(styles)(RootContainer);
