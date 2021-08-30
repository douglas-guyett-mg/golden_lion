
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"

export var CONFIG = {}
export var ENV = ""
export var PARTNER = ""
export var PARTNER_NAME = ""
export var configName = ""


export var REGION = ""
export var ROLE_NAME = ""
export var ID_POOL_ID = ""
export var AWS_ROLE = ""


export var HOVER_WAIT_TIME = null

export var TOP_LOCATION = ""
export var PATH_LOCATION = ""
export var FULL_LOCATION = ""

export var PERCENT_CONTROL = ""

export var REC_TABLE_NAME = ""
export var EVENT_TABLE_NAME = ""
export var CONFIG_TABLE_NAME = ""

export var docClient = null

export const urlParams = new URLSearchParams(window.location.search);


const MoonlightInit = (config) => {
  CONFIG = config
  ENV = CONFIG.ENV || "develop"
  PARTNER = CONFIG.UNIVERSE
  PARTNER_NAME = CONFIG.PARTNER_NAME
  configName = CONFIG.configName || "active_config";


  REGION = CONFIG.REGION || "us-east-1";
  ROLE_NAME = CONFIG.ROLE_NAME || "webflow_adjustment";
  ID_POOL_ID = CONFIG.ID_POOL_ID
  AWS_ROLE = CONFIG.AWS_ROLE || `Cognito_${ROLE_NAME}_${PARTNER}_${ENV}_Unauth_Role`;


  HOVER_WAIT_TIME = CONFIG.HOVER_WAIT_TIME || 1000;

  const REC_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_adjustments";
  const EVENT_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "web_events";
  const CONFIG_TABLE_PREFIX = CONFIG.REC_TABLE_PREFIX || "webflow_config";
  const EXECUTION_LEVEL = CONFIG.EXECUTION_LEVEL || "user_interaction";

  TOP_LOCATION = CONFIG.TOP_LOCATION + ":" + PARTNER_NAME + ":base" || "key" + window.location.protocol + "//" + window.location.host;
  PATH_LOCATION = "/ReactComponent";
  FULL_LOCATION = TOP_LOCATION + PATH_LOCATION

  PERCENT_CONTROL = 10;

  REC_TABLE_NAME = `${REC_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
  EVENT_TABLE_NAME = `${EVENT_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;
  CONFIG_TABLE_NAME = `${CONFIG_TABLE_PREFIX}_${PARTNER}_${EXECUTION_LEVEL}_${ENV}`;

  /**
 * AWS Retrieval
 */


  const cognitoIdentityClient = new CognitoIdentityClient({
    region: "us-east-1"
  });

  docClient = new DynamoDB({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId: ID_POOL_ID
    })
  });
}


export default MoonlightInit;