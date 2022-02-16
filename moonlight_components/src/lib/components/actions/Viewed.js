import React from "react"


import { useEffect } from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import { sendEvent } from "../replacement"


const Viewed = ({ children, componentId, setupId }) => {

    var pageLocation = ""

    const sendSetUpId = setupId ? setupId : ""

    const action = {
        "event_type": "action",
        "event_info": {},
        "name": componentId,
        "trigger": "Viewed",
        "event_value": "0.0",
        "location": "not_set:" + ":" + componentId + ":" + sendSetUpId
    }

    useEffect(() => {
        action["location"] = window.location.href + ":" + componentId + ":" + sendSetUpId
    },[]);

    const onSlide = (isVisible) => {
        // isVisible ? alert("this worked") : ""
        isVisible ? sendEvent(action) : ""
    }



    return (
        <>

            <VisibilitySensor onChange={onSlide}>
                <children.type {...children.props} >{children.props.children}</children.type>
            </VisibilitySensor>
        </>
    )
}


export default Viewed;