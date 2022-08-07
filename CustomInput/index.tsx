import * as React from 'react'
import { Icon_arrow_down, Icon_arrow_up, Icon_check_input } from '../../IconSVG'
import './index.css'

interface IProps {
    isRequire?: boolean
    label?: string
    placeholder?: string
    onChangeText: Function
    value: string | number
    maxLength?: number
    type?: 'number' | 'text'
    InputStyle?: any
    isError?: boolean
    onBlur?: Function
    isIconSuccess?: boolean
    disable?: boolean
    handleFocus?: Function
}
type TKeyNumber = 'keyup' | 'keydown'

interface IActionChangeNumber {
    key: TKeyNumber,
    btnStyle: any,
    icon: any
}

const ACTION_CHANGE_NUMBER: IActionChangeNumber[] = [
    { key: 'keyup', btnStyle: { borderRadius: '0px 8px 0px 0px' }, icon: <Icon_arrow_up /> },
    { key: 'keydown', btnStyle: { borderRadius: '0px 0px 8px 0px' }, icon: <Icon_arrow_down /> }
]

export function CustomInput({ isRequire, label, isIconSuccess, disable, placeholder, onBlur, onChangeText, isError, value, maxLength, type, InputStyle, handleFocus }: IProps) {
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [isFocus, setIsFocus] = React.useState(false)

    React.useEffect(() => {
        if (isIconSuccess) {
            setIsSuccess(!isError)
        }
    }, [value])


    const onChange = (e: any) => {
        let text = e.target.value
        if (type === 'number') {
            onChangeText(text.replace(/[^0-9]/g, ""))
        } else {
            onChangeText(text)
        }
    }

    const onChangeNumber = (type: TKeyNumber) => {
        let newValue = value ? value : 0
        if (type === 'keyup') {
            onChangeText(Number(newValue) + 1)
        } else {
            if (Number(newValue) - 1 <= 0) {
                onChangeText(0)
            } else {
                onChangeText(Number(newValue) - 1)
            }
        }
    }

    const handleOnFocus = (e) => {
        if (handleFocus)
            handleFocus(e);

        setIsFocus(true)
    }

    const handleOnBlur = () => {
        if (onBlur) {
            onBlur()
        }
        setIsFocus(false)
    }


    const mainClassName = (isSuccess && isFocus) ? 'custom__input__outline custom__input__outline__success'
        : (isError) ? 'custom__input__outline custom__input__outline__error' : 'custom__input__outline'
    return (<div className={mainClassName}>
        <input
            placeholder=' '
            value={value}
            type="text"
            onChange={onChange}
            maxLength={maxLength ? maxLength : null}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            style={InputStyle ? InputStyle : null}
            disabled={disable || false}
        />
        <label>{label} {isRequire && <span style={{ color: '#CA4E4A' }}>*</span>}</label>
        {(isIconSuccess && isSuccess && isFocus) && <div className='custom__input__check__maxlength'>
            <Icon_check_input />
        </div>}
        {(type && type === 'number') && <div className='custom__input__type__number'>
            {ACTION_CHANGE_NUMBER.map((item, index) => (<div
                className='btn__change'
                style={item.btnStyle}
                onClick={() => onChangeNumber(item.key)}
                key={index}
            >
                {item.icon}
            </div>))}
        </div>}
    </div>)
}
