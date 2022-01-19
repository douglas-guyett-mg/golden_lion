import React from "react"
import { sendEvent } from "../replacement"
import { useEffect } from 'react'




const PageView = ({ componentId, setupId }) => {

    const sendSetUpId = setupId ? setupId : ""


    const action = {
        "event_type": "action",
        "event_info": {},
        "name": componentId,
        "trigger": "PageView",
        "event_value": "0.0",
        "location": ""
    }

    useEffect(() => {
        // pageLocation = window.location.pathname

        action["location"] = window.location.href + ":" + componentId + ":" + sendSetUpId
        sendEvent(action)
        // getSessionId()
        

        // return () => clearTimeout(timer)
    },[]);



    return (
        <>
            
        </>
    )
}


export default PageView;