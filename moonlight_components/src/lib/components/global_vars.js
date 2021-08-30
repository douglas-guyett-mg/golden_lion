
export const CONFIG = (window && window.MOONLIGHT_CONFIG) || {
  "UNIVERSE":"private",
  "PARTNER_NAME":"chapter",
  "LIVE": true,
  "TOP_LOCATION":"getchapter.com"
};
export const ENV = CONFIG.ENV || "develop";
export const PARTNER = CONFIG.UNIVERSE || "public";
export const GTM = CONFIG.GTM || false;
export const PARTNER_NAME = CONFIG.PARTNER_NAME || PARTNER 



//Unclear what these are for
// const CONTROL_RATE =
//   CONFIG.CONTROL_RATE !== undefined ? CONFIG.CONTROL_RATE : 1;

// Initialization info
export const urlParams = new URLSearchParams(window.location.search);
export var configName = urlParams.get("demoName") || "active_config";
export const showOutlines = CONFIG.showOutlines ||urlParams.get("showOutlines");
export const demoOn = CONFIG.demoOn || urlParams.get("moonlightdemo");
export const original = urlParams.get("original");
export const LIVE = CONFIG.LIVE || false;


//aws cred info
// `us-east-1:718461c3-b005-446d-aed9-57c8d7edde93`
export const REGION = CONFIG.REGION || "us-east-1";
export const ROLE_NAME = CONFIG.ROLE_NAME || "webflow_adjustment";
export const ID_POOL_ID = 
  CONFIG.ID_POOL_ID || `us-east-1:bc76ea89-eb0e-4722-9012-34cc274af7ce`;
  
export const AWS_ROLE =
  CONFIG.AWS_ROLE || `Cognito_${ROLE_NAME}_${PARTNER}_${ENV}_Unauth_Role`;

// console.log("Live",LIVE)
// console.log("configName",configName)
// console.log("url2",urlParams)
// console.log("gtm",GTM)
// console.log("Universe",PARTNER)
// console.log("id_pool",ID_POOL_ID)

export const HOVER_WAIT_TIME = CONFIG.HOVER_WAIT_TIME || 1000;

const REC_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_adjustments";
const EVENT_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "web_events";
const CONFIG_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_config";
const EXECUTION_LEVEL = CONFIG.EXECUTION_LEVEL || "user_interaction";
// export const TOP_LOCATION =
//   CONFIG.TOP_LOCATION || "key" + window.location.href.split("?")[0];
export const TOP_LOCATION =
  CONFIG.TOP_LOCATION + ":" + PARTNER_NAME + ":base" || "key" + window.location.protocol + "//" + window.location.host;
export const PATH_LOCATION = "/ReactComponent";
export const FULL_LOCATION = TOP_LOCATION + PATH_LOCATION

// console.log("Top Location", TOP_LOCATION)

export const PERCENT_CONTROL = 10;

export const REC_TABLE_NAME = `${REC_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
export const EVENT_TABLE_NAME = `${EVENT_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
export const CONFIG_TABLE_NAME = `${CONFIG_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;

export const trigger_recs_dict = {
  hover: { element: true, method: "delay" },
  click: { element: true, method: "basic" },
};
export const replacement_additional_dict = {
  innerHTML: { additional: {} },
  setImage: { additional: { attribute_name: "src" } },
  setLink: { additional: { attribute_name: "href" } },
};

export const defaultActions = [
  {
    name: "onload",
    event_value: 0,
    event_type: "action",
    event_info: "onload",
    trigger_type: "page_load",
    trigger_element_path: "N/A",
    trigger_method: "onload",
  },
];

export const defautlUserAttributes = [
  {
    attribute: "local",
    status: false,
    options: [true, false],
  },
  {
    attribute: "repeat_visitor",
    status: false,
    options: [true, false],
  },
];
