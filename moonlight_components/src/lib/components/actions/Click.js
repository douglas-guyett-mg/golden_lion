import React from "react"
import { sendEvent } from "./replacement"

import { useEffect } from 'react'


const Click = ({ children, componentId, setupId }) => {

    var pageLocation = ""

    const action = {
        "event_type": "action",
        "event_info": {},
        "name": componentId,
        "trigger": "click",
        "event_value": "1.0",
        "location": ""
    }

    useEffect(() => {
        // pageLocation = window.location.pathname

        action["location"] = window.location.href + ":" + componentId + ":" + setupId
    });



    return (
        <>
            <children.type {...children.props} onClick={() => sendEvent(action)}>{children.props.children}</children.type>
        </>
    )
}


export default Click;