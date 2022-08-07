import { Selection } from '@haravan/hrw-react-components'
import * as React from 'react'
import { Icon_collapse_down, Icon_collapse_up } from '../../IconSVG'
import './index.css'

interface IProps {
    defaultValue?: any
    children: any
    onChange: Function
}

export function CustomSelection({ defaultValue, children, onChange }: IProps) {
    const [isFocus, setIsFocus] = React.useState(false)

    const handleOnChange = (value) => {
        setIsFocus(false)
        onChange(value)
    }

    return (
        <div style={{ position: 'relative' }} >
            <Selection
                defaultValue={defaultValue}
                onChange={(value) => handleOnChange(value)}
                showArrow={false}
                className='Lnd__mono__select'
                dropdownStyle={{ zIndex: 10 }}
                onDropdownVisibleChange={(open) => setIsFocus(open)}
            >
                {children}
            </Selection>
            <div className='Lnd__mono__select__icon__dropdown' >
                {isFocus ? <Icon_collapse_up /> : <Icon_collapse_down />}
            </div>
        </div>
    )
}
