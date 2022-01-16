// console.log("starting")
// import AWS from "aws-sdk";

import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
// import * as AWS from "@aws-sdk/client-dynamodb";
import {
    CONFIG,
    TOP_LOCATION,
    REGION,
    ID_POOL_ID,
    REC_TABLE_NAME,
    EVENT_TABLE_NAME,
    CONFIG_TABLE_NAME,
    configName,
    // urlParams,
    PARTNER_NAME,
    PATH_LOCATION,
    FULL_LOCATION,
    MOONLIGHT_PERCENT_CONTROL,
    docClient
} from "./global_vars";

//Initialize
let retries = 0;

// /**
//  * AWS Retrieval
//  */


//  const cognitoIdentityClient = new CognitoIdentityClient({
//     region: "us-east-1"
// });

// const docClient = new DynamoDB({
//     region: REGION,
//     credentials: fromCognitoIdentityPool({
//         client: cognitoIdentityClient,
//         identityPoolId: ID_POOL_ID
//     })
// });

var user_info = {
    repeat_visitor: false,
};

const generateUUID = () => {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = 0//(performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
};


const generateStatus = () => {
    // console.log("Generating status")
    const randNumber = Math.floor(Math.random() * 100) + 1
    // console.log("number",randNumber)
    let status = "";
    if (randNumber < MOONLIGHT_PERCENT_CONTROL) {
        status = "control"
    } else {
        status = "experiment"
    }
    // const newUserInfo = {"status":status}
    // const location_info = gather_ip_attributes()
    // newUserInfo["city"] = location_info["city"]
    // newUserInfo["country"] = location_info["country"]

    const event = {
        event_value: 0,
        event_type: "newUser",
        event_info: status,
        trigger_method: "newUser",
        trigger_element_path: "onload",
        element_path: " "
    }
    sendEvent(event)
    return status
};

// add attributes to user
const setUser = () => {
    gather_ip_attributes();
};

const checkLocal = () => {
    const businessLocation = CONFIG.businessLocation || "Napa";

    if (user_info["location"] === businessLocation) {
        user_info["local"] = true;
    } else {
        user_info["local"] = false;
    }
};

const gather_ip_attributes = () => {
    // user_info = {}
    fetch("https://extreme-ip-lookup.com/json/")
        .then((res) => res.json())
        .then((response) => {
            // user_info["location"] = response["city"];
            // console.log(
            //   "A"
            // )
            const location_info = { "city": response["city"], "country": response["countryCode"], "region": response["region"], "platform": navigator.platform, "vendor": navigator.vendor, "appVersion": navigator.appVersion, "userAgent": navigator.userAgent, "language": navigator.language }
            // return location_info
            // console.log("b")
            // console.log("user location", user_info["location"]);
            // checkLocal();
            const event = {
                event_value: 0,
                event_type: "locationInfo",
                event_info: location_info,
                trigger_method: "locationInfo",
                trigger_element_path: "onload",
                element_path: " "
            }
            sendEvent(event)
        })
        .catch((data, status) => {
            console.log("Request failed");
        });
};

export const grabSessionSpecificInfo = () => {

    const session_info = { "referrer": document.referrer }

    const event = {
        event_value: 0,
        event_type: "sessionInfo",
        event_info: session_info,
        trigger_method: "sessionInfo",
        trigger_element_path: "onload",
        element_path: " "
    }
    sendEvent(event)

}




// next section defines the user_id and sets it into a cookie so repeate users can be identified
let session_id_start = "";
let USER_ID = "";
let STATUS = "";
let location_info = {}
let urlParams = "";
// constant/function that sets a cookie (allows us to track repeate vistors)
const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
// constant/function to get any exsiting cookies on page
const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};
// check to see if the ID has already been set, if so grab otherwise set a new cookie
const getUserId = () => {
    try {
        const cookieName = "moonlight.uuid";
        // Get cookie
        const cookie = getCookie(cookieName);
        if (!cookie) {
            const uuid = generateUUID();
            const newCookie = setCookie(cookieName, uuid, 1000);

            return newCookie;
        }
        user_info["repeat_visitor"] = true;
        return cookie;
    } catch (e) {
        console.log("Client retrieval error");
        console.warn(`Moonlight: Client Id Retrieval Error ${e}`);
    }
};

// need to add function here that creates condition TODOO
export function getStatus(){
    try {
        const cookieName = "moonlight.status";
        // Get cookie
        const cookie = getCookie(cookieName);
        if (!cookie) {
            const status = generateStatus()
            const newCookie = setCookie(cookieName, status, 1000);
            location_info = gather_ip_attributes()
            return status;
        }
        return cookie;
    } catch (e) {
        console.log("Status retrieval error");
        console.warn(`Moonlight: Status Retrieval Error ${e}`);
    }
};


export const sendEvent = (event) => {
    const event_type = event.event_type;

    // console.log("Starting event send")

    const event_id = generateUUID()
    if (session_id_start === ""){
        session_id_start = generateUUID();
        sessionStorage.setItem("session_id", session_id_start);

    }
    if (USER_ID === "") {
         // need to add in section here to identify user and split into control or experiment based on that
        const cookie = getUserId();
        // console.log("Starting")
        USER_ID = getCookie("moonlight.uuid");
    }

    // console.log("event_id",event_id)

    const eventData = {
        event_id: event_id,
        event_info: event.event_info,
        event_timestamp: Date.now(),
        event_type: event_type,
        event_value: event.event_value,
        location: event.location,
        trigger: event.trigger,
        partner: PARTNER_NAME,
        session_id: sessionStorage.getItem("session_id") || "error",
        user_id: USER_ID,
    };

    

    const params = {
        TableName: EVENT_TABLE_NAME,
        Item: marshall(eventData),
    };

    // console.log("About to send event");
    // console.log("params", params);
    // console.log("event_id", event_id)
    docClient.putItem(params, (err, data) => {
        if (err) {
            console.warn("Moonlight: Sending Event Error", err);
        }
    });
};

const replaceContentOne = (obj, replacement_info, adjustment_key_name, trigger_element, event_info) => {
    var success = true
    // console.log("replacement_info", replacement_info);
    for (var replace_obj_indx in replacement_info) {
        var replace_obj = replacement_info[replace_obj_indx];

        var replace_value = obj[replace_obj["replacement_name"]];

        const event = {
            event_value: 0,
            event_type: "adjustment",
            event_info: event_info,
            trigger_method: adjustment_key_name,
            trigger_element_path: ":" + trigger_element,
            element_path: replace_obj.element_xpath
        }
        sendEvent(event);
    }
    // console.log("replace", replace_value)
    return replace_value
};

const replaceContent = (data, adjustment_object_values, adjustment_key_name, trigger_element, event_info) => {
    // console.log("Starting Replacement");
    // console.log("Replace data", data);
    //switching to non iteration here because will do one version per change.
    return replaceContentOne(data, adjustment_object_values, adjustment_key_name, trigger_element, event_info);
};

const render = (data, adjustment_object_values, adjustment_key_name, trigger_element, event_info) => {
    // console.log("Starting Rendering");
    // console.log("Render Data", data);
    // Determine here if injecting entire element or replacing parts
    return replaceContent(data, adjustment_object_values, adjustment_key_name, trigger_element, event_info);
};


const executeChange = (adjustment, event) => {

    var adjustment_object = adjustment.adjustment_object;
    // this is the object that holds the information around what is actually being modified on the page
    const adjustment_object_values = event.adjustment_object_values;

    const event_info = {
        adjustment_name: adjustment.adjustment_name,
        adjustment_group: event.adjustment_group,
        replacement_id: event.id || event.adjustment_group
    }
    // console.log("rendering")
    // const renderSuccess = render(
    //     adjustment_object,
    //     adjustment_object_values,
    //     event.adjustment_key_name,
    //     event.trigger_element_path,
    //     event_info
    // );
    return {
        "replaceValue": render(
            adjustment_object,
            adjustment_object_values,
            event.adjustment_key_name,
            event.trigger_element_path,
            event_info
        ), "adjustment": event
    };
    // if (renderSuccess) {
    //     event.adjustment_completed = true;
    // }
    // console.log("REN",renderSuccess)
    // return renderSuccess

}


const queryData = (event, adjustment_id, default_adjustment_key, execute) => {
    // If replacing, hide element
    // console.log("Starting Query");
    // console.log("adjustment_key", adjustment_id);

    // if (event.trigger_method === "onload") {
    //     var adjustment = JSON.parse(window.localStorage.getItem(adjustment_id))
    //     if (adjustment) {
    //         console.log("Using cache for adjustment change", adjustment)
    //         if (execute) {
    //             return executeChange(adjustment, event)
    //         }
    //         return
    //     }
    // }
    // console.log("Adjustment Key",adjustment_id)
    const params = {
        TableName: REC_TABLE_NAME,
        KeyConditionExpression: "adjustment_key = :c",
        ExpressionAttributeValues: marshall({
            ":c": String(adjustment_id),
        }),
    };
    const aa = new Promise((resolve, reject) => {
        try {
            docClient.query(params, (err, data) => {
                if (err) {
                    console.warn("Moonlight: querying data error ", err);
                    return err;
                }
                const items = data.Items;
                if (items && !items[0]) {
                    console.log("no data found")
                    resolve(false)
                }

                // Required because not all keys will have been seen before
                // if (items && !items[0]) {
                //     console.log("Going Default");
                //     if (retries < 2) {
                //         console.log("querying default")
                //         retries++;
                //         return queryData(event, default_adjustment_key, default_adjustment_key, true);
                //     }
                // }
                var adjustment = unmarshall(items[0]);
                // console.log("Adjustment", adjustment)
                window.localStorage.setItem(adjustment_id, JSON.stringify(adjustment))
                if (execute) {
                    // console.log("executing")
                    resolve(executeChange(adjustment, event))
                }
                return
            });
        } catch (err) {

            reject(err);

        }
    })
    return aa
};



const generate_adjustment_key = (adjustment) => {
    // take in adjustmentID
    // return the full path
    // also need to add in addendum for AB testing
    // console.log("A")
    if (adjustment.adjustment_key_name == "a_b") {
        return adjustment.adjustment_key_name + ":" + adjustment.addendum;
    }
    else if (adjustment.adjustment_key_name == "state") {
        // console.log("location_info",location_info)
        const utm_campaign = urlParams.get("utm_content")
        if (utm_campaign) {
            return utm_campaign;
        }
        else {
            return adjustment.default_adjustment_key
        }
    }
    else {
        return adjustment.id
    }
};




const gatherAdjustment = (adjustment, updateDict) => {
    // console.log("starting adjustment");
    // console.log("adjustment event", adjustment.id);

    // the adjustment key depends on the adjustment (user_id, event_path, etc)
    const adjustment_key = generate_adjustment_key(adjustment);

    // Gather the data from the db
    var adjustment_group = adjustment.adjustment_group;
    var full_prog_event_path =
        FULL_LOCATION + ":" + adjustment_group + ":" + adjustment_key;
    var full_prog_default_event_path =
        FULL_LOCATION + ":" + adjustment_group + ":" + adjustment.default_adjustment_key;
    return queryData(adjustment, full_prog_event_path, full_prog_default_event_path, true, updateDict);
};



// Setting up configuration
const set_ab_path = (action) => {
    const key_name = action.adjustment_group + "_addendum"
    var addendum = JSON.parse(window.localStorage.getItem(key_name))
    // if (addendum) {
    //     action["addendum"] = addendum.toString() + ":end";
    // }
    if (action["trigger_type"] === "even_split") {
        // add in line so that user gets same ab

        const max = action["trigger_element_path"];
        addendum = Math.floor(Math.random() * Math.floor(max));
        // console.log("setting",addendum)
        action["addendum"] = addendum.toString() + ":end";
        window.localStorage.setItem(key_name, JSON.stringify(addendum))
    }

};

// starting function

export function retireve_configs(componentID, updateDict) {

    urlParams = new URLSearchParams(window.location.search);
    // create a session_id to track events that all happen within one session.  Here session is defined as duration of the page.
    session_id_start = generateUUID();
    sessionStorage.setItem("session_id", session_id_start);

    // need to add in section here to identify user and split into control or experiment based on that
    const cookie = getUserId();
    // console.log("Starting")
    USER_ID = getCookie("moonlight.uuid");
    const statusCookie = getStatus();
    STATUS = getCookie("moonlight.status");
    grabSessionSpecificInfo()
    if (STATUS === "control") {
        // console.log("setting adjustments")
        return false
    }

    // console.log("retrieving")
    //Initialize
    var availableConfigs = JSON.parse(window.localStorage.getItem("availableConfigs"))
    // console.log("aa", availableConfigs)
    var adjustment = {}
    // if (availableConfigs) {
    if (false) {
        // console.log("grabbed from local storage", availableConfigs)
        // console.log("Grabbing configs from local storage")
        // console.log("PP",PATH_LOCATION)
        // console.log("CON",configName)
        if (PATH_LOCATION in availableConfigs[configName]) {
            // console.log("running")
            adjustment = availableConfigs[configName][PATH_LOCATION]["REPLACEMENT"][componentID]
            set_ab_path(adjustment)
            adjustment.id = componentID
            // console.log("gg", adjustment)
            // return { "replaceValue": gatherAdjustment(adjustment), "adjustment": adjustment }
            return gatherAdjustment(adjustment, updateDict)
        }
        return
    }

    let retries = 0;
    // console.log("THis is the top", TOP_LOCATION)
    // console.log("This is the table", CONFIG_TABLE_NAME)
    const params = {
        TableName: CONFIG_TABLE_NAME,
        KeyConditionExpression: "config_group_id = :c",
        ExpressionAttributeValues: marshall({
            ":c": String(TOP_LOCATION),
        }),
    };

    const tt = new Promise((resolve, reject) => {
        try {
            docClient.query(params, (err, data) => {
                // console.log("Querying for configs")
                if (err) {
                    console.warn("Moonlight: querying data error ", err);
                    return err;
                }
                // console.log("Data",data)
                const items = data.Items;
                // console.log("Items", items)
                if (items && !items[0]) {
                    // console.log("Moonlight: No Configs");
                    return;
                } else {
                    availableConfigs = unmarshall(items[0]).available_configs;
                    window.localStorage.setItem("availableConfigs", JSON.stringify(availableConfigs))
                    // console.log("Using Config: ", configName)
                    if (PATH_LOCATION in availableConfigs[configName]) {
                        adjustment = availableConfigs[configName][PATH_LOCATION]["REPLACEMENT"][componentID]
                        set_ab_path(adjustment)
                        adjustment.id = componentID
                        // return { "replaceValue": gatherAdjustment(adjustment), "adjustment": adjustment }
                        resolve(gatherAdjustment(adjustment, updateDict))
                        // resolve("https://frontend-components-develop.s3.us-west-1.amazonaws.com/chapterFacebookDemo.png")
                    }
                }
            });
        } catch (err) {

            reject(err);

        }
    })
    return tt
}
