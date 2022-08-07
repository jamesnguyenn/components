import { Collapse } from '@haravan/hrw-react-components'
import * as React from 'react'
import { Icon_collapse_down, Icon_collapse_up } from '../../IconSVG'
import './index.css'

interface IProps {
    children: any
    header: any
    isBoxShadow?: boolean
    isNotPadding?: boolean
}

export function CollapseCustom({ children, header, isBoxShadow, isNotPadding }: IProps) {
    const [collapseArr, setCollapseArr] = React.useState(['1'])

    const isCollapseBasic = collapseArr.some(collapse => collapse === "1")
    return (
        <div className={`Lnd-collapse-custom ${isBoxShadow ? 'Lnd-box-shadow' : ''} ${isNotPadding ? 'Lnd-content-not-padding' : ''}`}>
            <Collapse defaultActiveKey={['1']} onChange={(value: string[]) => setCollapseArr(value)}>
                <Collapse.Panel
                    showArrow={false}
                    header={header}
                    key="1"
                    extra={<div className='icon-extra'>
                        {isCollapseBasic ? <Icon_collapse_up /> : <Icon_collapse_down />}
                    </div>}
                >
                    <div className="view-children">
                        {children}
                    </div>
                </Collapse.Panel>
            </Collapse>
        </div>
    )
}
