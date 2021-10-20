import React from "react"
import { useState, useEffect } from "react"
import { retireve_configs } from "./replacement"




const ReplaceComponent = ({ children, adjustmentId }) => {


    const [replaceDict, setReplaceDict] = useState(null)
    const [success, setSuccess] = useState(true)


    useEffect(() => {

        // Create an scoped async function in the hook
        async function runReplacement() {
            try {
                // gather configurations and adjustment for this id
                const rd = await retireve_configs(adjustmentId)
                // confirm that a value was returned
                if (!rd){
                    setSuccess(false)
                } 
                // if return value then update the component
                else {
                rd.replaceValue ? setReplaceDict(rd) : setSuccess(false)
                }
            } catch (e) {
                console.error("Issue requesting Moonlight.")
                console.error(e)
            }
        }
        // Execute the created function directly
        runReplacement();

    }, []);



    return (
        <>
            {success ? replaceDict ? <children.type  {...children.props} src={replaceDict.adjustment.adjustment_object_values[0].replacement_method === "setImage" ? replaceDict.replaceValue : children.props.src}  >{replaceDict.adjustment.adjustment_object_values[0].replacement_method === "innerHTML" ? replaceDict.replaceValue : children.props.children}</children.type> : <span></span> : <children.type {...children.props}>{children.props.children}</children.type>}
        </>
    )
}


export default ReplaceComponent;