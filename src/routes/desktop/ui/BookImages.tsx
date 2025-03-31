import React, { useState } from 'react'

export default function BookImages({ images, style }: { images: string[], style: string }) {

    const [ind, setInd] = useState(0)
    const [modal, setModal] = useState(false);

    function slideLeft(e) {
        e.stopPropagation()
        if (ind > 0) {
            setInd(prev => prev - 1);
        }
    }

    function slideRight(e) {
        e.stopPropagation()
        if (ind < images.length - 1) {
            setInd(prev => prev + 1);
        }
    }

    if(images.length == 1){
        return(
            <>
                {modal?<div onClick={()=>setModal(false)} className='absolute cursor-pointer z-10 left-0 flex justify-center items-center bg-dark/55 top-0 bottom-0 right-0'>
                     <img onClick={(e)=>e.stopPropagation()} className='h-[85%] cursor-default w-auto max-w-[85%]' src={`/${images[ind]}`} />
                </div>:<></>}
                <div onClick={()=>setModal(true)} className='relative cursor-pointer mx-auto select-none w-fit h-fit rounded-lg'>
                    <img alt="Фотография" className={style} src={`/${images[ind]}`} />
                </div>
            </>
        )
    }

    return (
        <>
            {modal?<div onClick={()=>setModal(false)} className='absolute cursor-pointer z-10 left-0 flex justify-center items-center bg-dark/55 top-0 bottom-0 right-0'>
                 <img onClick={(e)=>e.stopPropagation()} className='h-[85%] cursor-default w-auto max-w-[85%]' src={`/${images[ind]}`} />
            </div>:<></>}
            <div onClick={()=>setModal(true)} className='relative cursor-pointer mx-auto select-none w-fit h-fit rounded-lg'>
                <div onClick={(e)=>slideLeft(e)} className='absolute top-2 left-2 rounded-full bg-lbrown/35
                         w-[46px] flex pointer cursor-pointer hover:bg-lbrown items-center justify-center h-[46px] text-4xl text-white'>
                    <span className='h-[40px]'>{"<"}</span>
                </div>
                <img alt="Фотография" className={style} src={`/${images[ind]}`} />
                <div onClick={(e)=>slideRight(e)} className='absolute top-2 right-2 bg-lbrown/35
                         w-[46px] flex pointer cursor-pointer rounded-full hover:bg-lbrown items-center justify-center h-[46px] text-4xl text-white'>
                    <span className='h-[40px]'>{">"}</span>
                </div>
            </div>
        </>
    )
}
