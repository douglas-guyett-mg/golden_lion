let mcd = null
try{
myLibrary.MoonlightInit({
      "UNIVERSE": "private",
      "PARTNER_NAME": "parkcellars",
      "TOP_LOCATION": "",
      "ID_POOL_ID": "us-east-1:bc76ea89-eb0e-4722-9012-34cc274af7ce",
      "BaseDomain": "parkcellars.com"
    })
const status = myLibrary.GatherCurrentState()
mcd = myLibrary.RunClientSideSetUp(status)
window.sessionStorage.setItem("mcd",mcd)
} catch (error) {
console.log("error")}
ga("set","dimension1",mcd)