import * as React from 'react'
import './index.css'

interface CarouselParams {
    children: any
    max_width?: any
    isOverWidth?: boolean
    btnStyle?: any
    swipeScrollTolerance?: number
    isHiddenBtnScroll?: boolean
}


export const Carousel: React.FC<CarouselParams> = ({ children, max_width, isHiddenBtnScroll, isOverWidth, btnStyle, swipeScrollTolerance }: CarouselParams): JSX.Element => {
    let scrl = React.useRef(null);
    const [scrollX, setscrollX] = React.useState(0);
    const [scrolEnd, setscrolEnd] = React.useState(false);
    const [actualWidth, setActualWidth] = React.useState(null)

    React.useEffect(() => {
        let clientWidth = document.getElementById('carousel__id').clientWidth;
        setActualWidth(clientWidth)
    }, [children])


    //Slide click
    const slide = (shift) => {
        scrl.current.scrollLeft += shift;
        setscrollX(scrollX + shift);

        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {
            setscrolEnd(true);
        } else {
            setscrolEnd(false);
        }
    };

    const scrollCheck = () => {
        setscrollX(scrl.current.scrollLeft);
        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {
            setscrolEnd(true);
        } else {
            setscrolEnd(false);
        }
    };


    const isCheckWidth = (isOverWidth || (max_width && Number(max_width) === actualWidth)) ? true : false
    swipeScrollTolerance = swipeScrollTolerance || 50
    return (
        <div
            className='carousel__maxWidth'
            id="carousel__id"
            style={{ maxWidth: max_width ? max_width + 'px' : '800px' }}
        >
            {(scrollX !== 0 && isCheckWidth && !isHiddenBtnScroll) && <button
                onClick={() => slide(-swipeScrollTolerance)}
                id="prev"
                className={`carousel__button carousel__button__prev ${btnStyle ? btnStyle : ''}`}
            >
                <Icon_previous />
            </button>}
            <div ref={scrl} className='carousel__container' onScroll={scrollCheck}>
                {children}
            </div>
            {(!scrolEnd && isCheckWidth && !isHiddenBtnScroll) && <button
                onClick={() => slide(+swipeScrollTolerance)}
                id="next"
                className={`carousel__button carousel__button__next ${btnStyle ? btnStyle : ''}`}
            >
                <Icon_next />
            </button>}
        </div>
    )
}

const Icon_next = () => {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.3602 7.52637L6.58682 3.7597C6.52484 3.69721 6.45111 3.64762 6.36987 3.61377C6.28863 3.57993 6.20149 3.5625 6.11348 3.5625C6.02548 3.5625 5.93834 3.57993 5.8571 3.61377C5.77586 3.64762 5.70213 3.69721 5.64015 3.7597C5.51598 3.88461 5.44629 4.05357 5.44629 4.2297C5.44629 4.40582 5.51598 4.57479 5.64015 4.6997L8.94015 8.03303L5.64015 11.333C5.51598 11.4579 5.44629 11.6269 5.44629 11.803C5.44629 11.9792 5.51598 12.1481 5.64015 12.273C5.70189 12.336 5.77552 12.3861 5.85677 12.4205C5.93802 12.4548 6.02528 12.4727 6.11348 12.473C6.20169 12.4727 6.28894 12.4548 6.37019 12.4205C6.45144 12.3861 6.52507 12.336 6.58682 12.273L10.3602 8.50636C10.4278 8.44394 10.4818 8.36817 10.5188 8.28384C10.5557 8.1995 10.5748 8.10843 10.5748 8.01636C10.5748 7.9243 10.5557 7.83323 10.5188 7.74889C10.4818 7.66456 10.4278 7.58879 10.3602 7.52637Z" fill="#021337" />
    </svg>
}

const Icon_previous = () => {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.66655 8.5332L9.46655 12.2665C9.73322 12.5332 10.1332 12.5332 10.3999 12.2665C10.6666 11.9999 10.6666 11.5999 10.3999 11.3332L7.13322 7.99987L10.3999 4.66654C10.6666 4.39987 10.6666 3.99987 10.3999 3.7332C10.2666 3.59987 10.1332 3.5332 9.93322 3.5332C9.73322 3.5332 9.59989 3.59987 9.46655 3.7332L5.66655 7.46654C5.39989 7.79987 5.39989 8.19987 5.66655 8.5332C5.66655 8.46654 5.66655 8.46654 5.66655 8.5332Z" fill="#021337" />
    </svg>
}
