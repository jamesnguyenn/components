import * as React from 'react'
import { Icon, InputHasIcon } from '@haravan/hrw-react-components';
import { Icon_search } from '../../IconSVG';
import './index.css'
import { debounce } from 'lodash';

interface IProps {
    handleOnPressEnter: Function
    isResetFilter: boolean
    placeholder: string
    debounceTime?: number
}

export function InputSearchList({ handleOnPressEnter, isResetFilter, placeholder, debounceTime = 300 }: IProps) {
    const [textSearch, setTextSearch] = React.useState('')

    React.useEffect(() => {
        setTextSearch('')
    }, [isResetFilter])

    const handlePressEnter = (value: string) => {
        setTextSearch(value)
        handleOnPressEnter(value)
    }

    const debounceFunc = debounce((value) => handlePressEnter(value), debounceTime)

    const clearSearch = () => {
        setTextSearch('')
        handleOnPressEnter('')
    }

    return (
        <div className="input-search-list__viewSearch">
            <InputHasIcon
                className='input-search-list__searchBox'
                onChange={debounceFunc}
                value={textSearch}
                placeholder={placeholder}
                prefix={<Icon_search />}
                suffix={textSearch.length > 0 ? <div onClick={clearSearch} style={{ cursor: 'pointer' }}>
                    <Icon type='timesCircle' theme='solid' />
                </div> : null}
            />
        </div>
    )
}
