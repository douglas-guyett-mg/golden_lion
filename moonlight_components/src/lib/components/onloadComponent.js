import React from "react"
import { sendEvent } from "./replacement"
import { useEffect } from 'react'




const OnloadComponent = ({ adjustmentId }) => {


    const action = {
        "event_type": "action",
        "event_info": adjustmentId,
        "trigger_element_path": "N/A",
        "trigger_type": "page_load",
        "name": adjustmentId,
        "trigger_method": "onload",
        "event_value": "1.0"
    }

    useEffect(() => {

        action["trigger_element_path"] = window.location.pathname

        sendEvent(action)
        
    },[]);



    return (
        <>
            
        </>
    )
}


export default OnloadComponent;