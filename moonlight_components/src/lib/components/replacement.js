



import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"
import { marshall } from "@aws-sdk/util-dynamodb"
import cookie from "cookie"


// Global Vars 
var CONFIG = {}
var ENV = ""
var PARTNER = ""
var PARTNER_NAME = ""
// var configName = ""


var REGION = ""
var ROLE_NAME = ""
var ID_POOL_ID = ""
// var AWS_ROLE = ""

// var TOP_LOCATION = ""
// var PATH_LOCATION = ""
// var FULL_LOCATION = ""

var MOONLIGHT_PERCENT_CONTROL = 0

// var REC_TABLE_NAME = ""
var EVENT_TABLE_NAME = ""
// var CONFIG_TABLE_NAME = ""

var docClient = null

// var urlParams = ""
var BaseDomain = ""



//Initialize
// let retries = 0;

let USER_ID = "";
let SESSION_ID = "";
let setupId = "";


var user_info = {
    repeat_visitor: false,
};
export const moonlightParam = "mid"

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
    console.log("Generating status")
    console.log("Percent Control", MOONLIGHT_PERCENT_CONTROL)
    const randNumber = Math.floor(Math.random() * 100) + 1
    // console.log("number",randNumber)
    let status = "";
    if (randNumber < MOONLIGHT_PERCENT_CONTROL) {
        status = "control"
    } else {
        status = "experiment"
    }

    return status
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
                event_value: "0.0",
                event_type: "locationInfo",
                event_info: location_info,
                trigger: "locationInfo",
                trigger_element_path: "onload",
                element_path: " ",
                location: window.location.href + ":" + "n/a" + ":" + setupId
            }
            // console.log("sending location info",event.event_type)
            sendEvent(event)
        })
        .catch((data, status) => {
            console.log("Request failed", data);
            // console.log("status",status);
        });
};

export function grabSessionSpecificInfo(){

    gather_ip_attributes()
    // need line to grab utm variables
    // need line to grab moonlight id
    // need line to grab device information

    const session_info = {
        "sessionId": SESSION_ID,
        "referrer": document.referrer
    }

    // console.log("sending session info")
    const event = {
        event_value: 0,
        event_type: "action",
        event_info: session_info,
        trigger: "NewSession",
        location: window.location.href + ":" + "N/A" + ":" + setupId
    }
    sendEvent(event)

}




// next section defines the user_id and sets it into a cookie so repeate users can be identified

// let STATUS = "";
// let location_info = {}
// let urlParams = "";
// constant/function that sets a cookie (allows us to track repeate vistors)
const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString() + ";";
    var domain = BaseDomain ? "domain=" + BaseDomain + ";" : "";
    console.log("cookie value",cname + "=" + cvalue + ";" + expires + domain + "path=/")
    document.cookie = cname + "=" + cvalue + ";" + expires + domain + "path=/";
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






// export function checkVisitor() {
//     //check if user id is set
//     // console.log("Start to check visitor")
//     USER_ID = getUserId()
//     SESSION_ID = getSessionId()

// }


export function sendEvent(event){
    const event_type = event.event_type;

    // console.log("Starting event send")

    const event_id = generateUUID()

    const eventData = {
        event_id: event_id,
        event_info: event.event_info,
        event_timestamp: Date.now(),
        event_type: event_type,
        event_value: event.event_value,
        location: event.location,
        trigger: event.trigger,
        partner: PARTNER_NAME,
        session_id: SESSION_ID,
        user_id: USER_ID,
    };

    // console.log("ee",eventData)

    const params = {
        TableName: EVENT_TABLE_NAME,
        Item: marshall(eventData),
    };

    docClient.putItem(params, (err, data) => {
        if (err) {
            console.warn("Moonlight: Sending Event Error", err);
        }
    });
};

export function setCustomDimension(){

    let mid = null
    // let uuid = null

    if (typeof window !== 'undefined') {

        // const presetValue = window.localStorage.getItem("mcd")
        // if (presetValue){
        //     console.log("Using preset value",presetValue)
        //     return presetValue
        // }

        let searchParams = new URLSearchParams(window.location.search)
        // console.log("search",searchParams.get("medit"))
        if (searchParams.get(moonlightParam)) {
            mid = searchParams.get(moonlightParam) == "001" ? "control" : "experiment"
        } else {
            mid = null
        }
        const uuid = getCookie("moonlight.uuid");
        if (!uuid){
            console.error("Error: Moonlight uuid not set.")
            return "NA:" + mid
        }
        const dimensionValue = uuid + ":" + mid
        // window.localStorage.setItem("mcd",dimensionValue)
        return dimensionValue

    } else {
        return "window_not_set"
    }

    


}

const paramValue = () => {


    if (typeof window !== 'undefined') {

        let searchParams = new URLSearchParams(window.location.search)
        // console.log("search",searchParams.get("medit"))
        if (searchParams.get(moonlightParam)) {
            return searchParams.get(moonlightParam) == "001" ? "control" : "experiment"
        } else {
            return null
        }
    } else {
        return null
    }

}

const getSessionId = () => {
    console.log("checking session id")
    let newCookie = null
    try {
        const cookieName = "moonlight.sessionId";
        // Get cookie
        const uuid = getCookie(cookieName);
        if (!uuid) {
            let sessionId = window.localStorage.getItem("SESSION_ID")
            //TODO: NEED TO ADD IN ANOTHER BREAK FOR QUERY PARAM
            if (!sessionId) {
                console.log("session id not found creating new one")
                sessionId = generateUUID();
                SESSION_ID = sessionId
                newCookie = setCookie(cookieName, sessionId, 1000)
                window.localStorage.setItem("SESSION_ID", sessionId)
                grabSessionSpecificInfo()
            } else{
                newCookie = setCookie(cookieName, sessionId, 1000)
            }
            return sessionId;
        }
        // user_info["repeat_visitor"] = true;
        return uuid;
    } catch (e) {
        // console.log("First Attempt Session")
        // console.log("Error: ", e)

        // try {
        //     window.onload = function () {
        //         getSessionId()
        //     };

        // } catch (error) {
        // console.log("Client retrieval error");
        console.warn(`Moonlight: Session Id Retrieval Error ${e}`);

        // }

    }
};

// need to add function here that creates condition TODOO
function getStatus(status) {
    let outStatus = status
    try {
        const cookieName = "moonlight.status";
        // Get cookie
        const statusCookieValue = getCookie(cookieName);
        if (!statusCookieValue) {
            if (!outStatus) {
                outStatus = generateStatus()
            }
            const newCookie = setCookie(cookieName, outStatus, 1000);
            // location_info = gather_ip_attributes()
            const event = {
                event_value: 0,
                event_type: "action",
                event_info: { "status": outStatus },
                trigger: "NewStatus",
                location: window.location.href + ":" + "N/A" + ":" + setupId
            }
            sendEvent(event)

            return outStatus;

        }
        return statusCookieValue;
    } catch (e) {
        console.log("Status retrieval error");
        console.warn(`Moonlight: Status Retrieval Error ${e}`);
    }
};

// gets the current moonlight Id.  If it is not set than creates a new one and send a NewUser Event
const getUserId = () => {
    // console.log("checking user id")
    try {
        const cookieName = "moonlight.uuid";
        // Get cookie
        const uuid = getCookie(cookieName);
        console.log("Set Uuid", uuid)
        if (!uuid) {
            console.log("user id not found creating new one")
            const uuidNew = generateUUID();
            const newCookie = setCookie(cookieName, uuidNew, 1000);
            USER_ID = uuidNew
            const event = {
                event_value: 0,
                event_type: "action",
                event_info: {},
                trigger: "NewUser",
                location: window.location.href + ":" + "N/A" + ":" + setupId
            }
            sendEvent(event)
            return uuidNew;
        }
        user_info["repeat_visitor"] = true;
        return uuid;
    } catch (e) {


        console.warn(`Moonlight: User Id Retrieval Error ${e}`);


    }
};





// Function to Gather State
export function GatherCurrentState(req) {

    const cookies = cookie.parse(req ? req.headers.cookie || "" : document.cookie)

    let status = null
    // Check for Id cookie <- we don't use this but it is good to know because 
    //will help with defining when behavior is abnormal
    const uuid = cookies["moonlight.uuid"] ? cookies["moonlight.uuid"] : null;
    console.log("uuid", uuid)
    // Check for Status Cookie
    const statusCookieValue = cookies["moonlight.status"] ? cookies["moonlight.status"] : null;
    console.log("status Cookie", statusCookieValue)
    // Check for Param
    const paramStatus = paramValue()
    console.log("param Value", paramStatus)
    // set status var
    if (statusCookieValue) {
        if (!paramStatus) {
            status = statusCookieValue
        } else if (paramStatus == statusCookieValue) {
            status = paramStatus
        } else {
            // TODO send error
            console.error(`param status: ${paramStatus} does not equal status cookie: ${statusCookieValue}`)
            status = paramStatus
        }
    } else {
        if (paramStatus) {
            status = paramStatus
        } else {
            // TODO send error
            status = "TBD"
        }
    }
    console.log("Status", status)
    return status


}

// Execute Server flow
export function RunServerSideSetUp(status) {
    let outStatus = status
    console.log("outStatus", status)
    // note this must happen before redirect happens
    // if TBD randomly choose status based on percentage passed in
    if (outStatus === "TBD") {
        outStatus = generateStatus()
        console.log("generated outStatus", outStatus)
    }
    // if status is experiment set mi query param to 002
    // do we want to send event here <- I don't think so because won't be filled with any useful information
    if (outStatus == "experiment") {
        return "002"
    } else if (outStatus == "control") {
        return "001"
    } else {
        console.error(`Error Moonlight Status: ${outStatus} not recognized.`)
        return null
    }
    // if status is control set mi query param to 001

}

// Execute Client Side Flow
export function RunClientSideSetUp(status) {
    let outStatus = status
    console.log("outStatus", outStatus)
    // if status is TBD, set to N/A and stop
    if (outStatus === "TBD") {
        outStatus == "N/A"
        return
    }
    // get moonlight id
    const uuid = getUserId()
    USER_ID = uuid
    console.log("USER_ID",USER_ID)
    // get status && confirm that it equals input status
    const cookieStatus = getStatus(outStatus)
    if (cookieStatus != outStatus) {
        console.error(`Cookie Status: ${cookieStatus} and input status:${outStatus} do not equal`)
        const newCookie = setCookie("moonlight.status", outStatus, 1000);
    }
    // If status is experiment get session id
    console.log("outStatusS",outStatus)
    if (outStatus == "experiment") {
        console.log("Setting Session Id")
        const sessionId = getSessionId()
        SESSION_ID = sessionId
    }
    const customDimension = setCustomDimension()
    return customDimension

}

// Function to initialize the required variables 
export function MoonlightInit(config) {
    console.log("initializing")
    // Make sure that it is only initialized once <- this should be just a check
    if (!CONFIG === {}) {
        console.error("Trying to initialize Moonlight More than once")
        return
    }

    // set the global configuration to the input config dict
    CONFIG = config
    // This is a name convention that is a hold over where we had a unique 'universe' for each partner
    // TODO: clean up converntion in code so that partner actuall refers to partner...currently all partners on private Universe
    PARTNER = CONFIG.UNIVERSE
    // Set the identifier for the partner
    PARTNER_NAME = CONFIG.PARTNER_NAME
    // Allows us to set cookies that are accessible by all sub & main domains
    BaseDomain = CONFIG.BaseDomain || null


    // Everything below is currently using the default values
    // We want to default to the develop environment if it is not set <- we should update this so that we are using the production database (need to fix analytics for this)
    ENV = CONFIG.ENV || "develop"

    // Default aws vars required to access the unathenticated identity pool
    REGION = CONFIG.REGION || "us-east-1";
    ROLE_NAME = CONFIG.ROLE_NAME || "webflow_adjustment";
    ID_POOL_ID = CONFIG.ID_POOL_ID
    // AWS_ROLE = CONFIG.AWS_ROLE || `Cognito_${ROLE_NAME}_${PARTNER}_${ENV}_Unauth_Role`;


    // config var that sets the time required for a Hover event to be sent
    // HOVER_WAIT_TIME = CONFIG.HOVER_WAIT_TIME || 1000;

    // vars that are fixed for all current partners no longer needed to be passed 
    // const REC_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_adjustments";
    const EVENT_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "web_events";
    // const CONFIG_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_config";
    const EXECUTION_LEVEL = CONFIG.EXECUTION_LEVEL || "user_interaction";

    // These are not currently being used.  They were used to grab the replacement configuration
    // TOP_LOCATION = CONFIG.TOP_LOCATION + ":" + PARTNER_NAME + ":base" //|| "key" + window.location.protocol + "//" + window.location.host;
    // PATH_LOCATION = "/ReactComponent";
    // FULL_LOCATION = TOP_LOCATION + PATH_LOCATION
    // this will be used when executing replacements.  Currently not used.
    // configName = CONFIG.configName || "active_config";

    // Determines how any people we send in the control condition
    MOONLIGHT_PERCENT_CONTROL = CONFIG.PERCENT_CONTROL || 10;
    console.log("Moonlight control",MOONLIGHT_PERCENT_CONTROL)
    // required values for the dynamo db calls
    // REC_TABLE_NAME = `${REC_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
    EVENT_TABLE_NAME = `${EVENT_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
    // CONFIG_TABLE_NAME = `${CONFIG_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;

    /**
   * AWS Retrieval
   */

    // Initialize the unauthenticated Cognito Client that has permission to post the the dynamo Db
    const cognitoIdentityClient = new CognitoIdentityClient({
        region: "us-east-1"
    });


    // initialize the client allowing post to the dynamo DB
    docClient = new DynamoDB({
        region: REGION,
        credentials: fromCognitoIdentityPool({
            client: cognitoIdentityClient,
            identityPoolId: ID_POOL_ID
        })
    });
}