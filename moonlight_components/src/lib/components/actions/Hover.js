import React from "react"


import { useEffect, useState } from 'react'
// import VisibilitySensor from 'react-visibility-sensor'
import { sendEvent } from "./replacement"

const HOVER_WAIT_TIME = 5


const Viewed = ({ children, componentId, setupId }) => {

    var pageLocation = ""

   const [count, setCount] = useState(0)
   const [hoverStart, setHoverStart] = useState(0)

    const action = {
        "event_type": "action",
        "event_info": {},
        "name": componentId,
        "trigger": "Hover",
        "event_value": "0.0",
        "location": ""
    }



    useEffect(() => {
        // pageLocation = window.location.pathname

        action["location"] = window.location.href + ":" + componentId + ":" + setupId
        const timer = setTimeout(() => setCount(count + 1), 1e3)

        // return () => clearTimeout(timer)
    });


    const startTimer = () => {

        console.log("starting count",count)
        setHoverStart(count)
    }

    const checkDuration = () => {
        console.log("exit")
        console.log("Count",count)
        if ((count - hoverStart) > HOVER_WAIT_TIME) {
            // alert("this worked")
            action["event_info"] = {"duration":count - hoverStart}
            sendEvent(action)
        }
    }

    // const detectHover = () => {

    //     var hover_wait_time = HOVER_WAIT_TIME;
    //     el.addEventListener("mouseover", function () {
    //         timeout.push(
    //             setTimeout(() => {
    //                 add_process(action, el);
    //             }, hover_wait_time)
    //         );
    //     });
    //     el.addEventListener("mouseout", function () {
    //         timeout.map((to) => clearTimeout(to));
    //     });
    // }



    return (
        <>
        <div 
        onMouseEnter={() => startTimer()}
        onMouseLeave={() => checkDuration()}>
            <children.type {...children.props}
                // onMouseEnter={() => alert("hello")}
                // onMouseLeave={() => alert("goodbye")}
                // onClick={() => alert("hi")}
            >
                {children.props.children}
            </children.type>
            </div>
        </>

    )
}


export default Viewed;