import React from "react"
import { sendEvent } from "./replacement"

import { useEffect } from 'react'


const ActionComponent = ({ children, adjustmentId }) => {

    var pageLocation = ""

    const action = {
        "event_type": "action",
        "event_info": adjustmentId,
        "trigger_element_path": "pending",
        "trigger_type": "action_taken",
        "name": adjustmentId,
        "trigger_method": "click",
        "event_value": "1.0"
    }

    useEffect(() => {
        // pageLocation = window.location.pathname
        action["trigger_element_path"] = window.location.pathname
    });



    return (
        <>
            <children.type {...children.props} onClick={() => sendEvent(action)}>{children.props.children}</children.type>
        </>
    )
}


export default ActionComponent;