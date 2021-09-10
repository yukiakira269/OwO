import axios from "axios";
import { async } from "rxjs";
import { GetApiConfig } from "../../../Shared/Utilities/ApiUtility";
import ConfigurationModel from "./Model";

export class ConfigurationService {
  readonly baseApiUrl: any = process.env.REACT_APP_CH_API_URL;
  getProcessorList = async () => {
    return axios.get(
      this.baseApiUrl + "api/Configuration/GetProcessorList",
      GetApiConfig()
    ).catch(()=> new Error("Cannot fetch Processor List"));
  };

  getConfiguration = (configurationId: any, callback: any) => {
    axios
      .get(
        this.baseApiUrl +
          "api/Configuration/GetConfiguration?SystemId=" +
          configurationId,zz
        GetApiConfig()
      )
      .then(function (response) {
        callback(response);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  saveSystemConfiguration = async (configurationModel: ConfigurationModel) => {
    return axios.post(
      this.baseApiUrl + "/api/SystemConfiguration",
      configurationModel,
      GetApiConfig()
    )
    .catch(()=>new Error("Something went wrong while saving"))
  };
}
