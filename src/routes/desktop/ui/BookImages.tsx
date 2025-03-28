import React, { useState } from 'react'

export default function BookImages({ images, style }: { images: string[], style: string }) {

    const [ind, setInd] = useState(0)

    function slideLeft(){
        if(ind > 0){
            setInd(prev=>prev-1);
        }
    }

    function slideRight(){
        if(ind < images.length - 1){
            setInd(prev=>prev+1);
        }
    }

    return (
        <div className='relative mx-auto select-none w-fit h-fit rounded-lg'>
            <div onClick={slideLeft} className='absolute top-2 left-2 rounded-full bg-lbrown/35
                         w-[46px] flex pointer cursor-pointer hover:bg-lbrown items-center justify-center h-[46px] text-4xl text-white'>
                <span className='h-[40px]'>{"<"}</span>
            </div>
            <img alt="Фотография" className={style} src={`/${images[ind]}`}/>
            <div onClick={slideRight} className='absolute top-2 right-2 bg-lbrown/35
                         w-[46px] flex pointer cursor-pointer rounded-full hover:bg-lbrown items-center justify-center h-[46px] text-4xl text-white'>
                <span className='h-[40px]'>{">"}</span>
            </div>
        </div>
    )
}
