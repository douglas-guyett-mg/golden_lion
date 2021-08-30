# moonlight-react

This project provides react components to ab test, optimize, and personalize react applications.  For the components to function properly, you must have an account with Moonlight.  To sign up for an account, please email: contact@moonlightgroup.net. For further information please contact contact@moonlightgroup.net.

## Installation

`npm install moonlight-react`

## Usage

`import {ReplaceComponent, ActionComponent, MoonlightInit} from "moonlight-react"`

### Initialization
Moonlight requires you to initialize the components with a configuration file:

    const moonlight_config = {
      "UNIVERSE":"private",
      "PARTNER_NAME":"example-partner",
      "TOP_LOCATION":"API-KEY",
      "ID_POOL_ID":`EXAMPLE-ID`
    }
    
    MoonlightInit(moonlight_config)
    
Note: This must be initialized prior to using any of the components.  If you are using Moonlight components, please initialize in App.js

### Implementation
Once Moonlight is initiated, you simply wrap the component you want to optimize with the ReplaceComponent.  Once you sign up for a Moonlight account, you will be given a set of moonlight ids that correspond to different content you have uploaded.  Add that as a prop called adjustmentId.  See below for an example:

    <ReplaceComponent adjustmentId = "8765b32"><img src="https://frontend-components-develop.s3-us-west-1.amazonaws.com/sanguine_personnalize_products.png"></img></ReplaceComponent>
    
Note: It is recommended to set up a fully functional react component to be wrapped by Moonlight.  That way given any errors, the original component will still appear.
