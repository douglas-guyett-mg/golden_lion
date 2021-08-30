import React from "react"
import { sendEvent } from "./replacement"




const ActionComponent = ({ children, adjustmentId }) => {


    const action = {
        "event_type": "action",
        "event_info": adjustmentId,
        "trigger_element_path": "N/A",
        "trigger_type": "page_load",
        "name": adjustmentId,
        "trigger_method": "onload",
        "event_value": "1.0"
      }



    return (
        <>
            <children.type {...children.props} onClick={() => sendEvent(action)}>{children.props.children}</children.type>
        </>
    )
}


export default ActionComponent;