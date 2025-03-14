import { useEffect } from "react";
import Header from "./ui/header/Header";
import './../../index.css'
import { Outlet } from "react-router-dom";
import Footer from "./ui/Footer";
import store from "../../utils/store";

export default function Root(){

    useEffect(()=>{
        let fetchInit = async () =>{
            await store.fetchUser()
        }
        fetchInit()
    },[])


    return(
    <div className="w-full gap-6 inter h-fit items-center min-h-[100vh] flex flex-col bg-white">
        <Header/>
        <Outlet/>
        <Footer/>
    </div>)
}