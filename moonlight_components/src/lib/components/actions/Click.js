import React from "react"
import { sendEvent } from "../replacement"

import { useEffect } from 'react'


const Click = ({ children, componentId, setupId }) => {

    var pageLocation = ""

    const sendSetUpId = setupId ? setupId : ""

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

        action["location"] = window.location.href + ":" + componentId + ":" + sendSetUpId
    });

    const logClick = (e) => {


        var tmp = document.createElement("div");
        const newEl = e.target.cloneNode(true)
        tmp.appendChild(newEl);
        console.log(tmp.innerHTML);


        action.event_info = {"sub_element":tmp.innerHTML}
        sendEvent(action)


    }



    return (
        <>
            <div onMouseDown={(e) => logClick(e)}>
                <children.type {...children.props} >{children.props.children}</children.type>
            </div>
        </>
    )
}


export default Click;