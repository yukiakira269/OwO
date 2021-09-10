import { Component } from "react";
import {
  CurrentConfigurationId,
  getConfigurationId,
  getConfigurationModel,
  setConfigurationId,
  setConfigurationModel,
  StateConfiguration,
} from "./State";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import "@progress/kendo-theme-default/dist/all.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { withTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import ConfigurationModel from "./Model";
import "./style.css";
import "./../../../Shared/ch-kendoTheme/kendoTheme.css";
import { ConfigurationService } from "./Service";
import { getMasterStateData, getProcessorListState } from "../../../Shared/Common/MasterDataState";

import ProcessorConfirmModal, {
  ProcessorConfirmed,
} from "./modal/confirm-modal.component";
import { Prompt } from "react-router-dom";

const emptyProcessorId: any = "00000000-0000-0000-0000-000000000000";
class Configuration extends Component<any, any> {
  apiService: any = null;
  nav: any = null;
  constructor(props: any) {
    super(props);
    this.state = {
      startConfigurationModel: null,
      currentConfigurationModel: new ConfigurationModel(),
      ProcessorList: [],
      showModal: false,
      processorModel: "",
      processorConfirmed: false,
      formIsValid: false,
      showValidationMessge: false,
    };
    this.apiService = new ConfigurationService();
  }

  componentDidMount() {
    this.nav = document.getElementById("navbar") as HTMLElement;
    this.nav.addEventListener("click", this.showValidation);
    this.getProcessorList();
    PubSub.subscribe("CONFIGURATION_CHECK", this.handleConfigurationChange);
  }

  componentWillUnmount() {
    this.nav.removeEventListener("click", this.showValidation);
    if (JSON.stringify(this.state.startConfigurationModel) !== JSON.stringify(this.state.currentConfigurationModel)) {
      this.saveConfiguration();
    }
    PubSub.unsubscribe("CONFIGURATION_CHECK");
  }

  getProcessorList = async () => {
    let value: any = await getProcessorListState();
    let data = value.data.filter((prod: any) => prod.IsRaptorSupport);
    data.unshift({
      ProductLineId: emptyProcessorId,
      Model: "Select Processor",
      IsRaptorSupport: true,
    });
    this.setState({ ProcessorList: data });
    await this.getConfigurationModelFromState();
    await this.getProcessorStatusFromState();
  };

  getConfigurationModelFromState = () => {
    getConfigurationModel(StateConfiguration)
      .then((value: any) => {
        getConfigurationId(CurrentConfigurationId)
          .then((currentConfigurationId: any) => {
            if (currentConfigurationId != "") {
              this.setState({
                currentConfigurationModel: {
                  Id: currentConfigurationId,
                  SystemName: value.SystemName,
                  ProcessorId: value.ProcessorId,
                  CustomerName: value.CustomerName,
                  AddressLine1: value.AddressLine1,
                  AddressLine2: value.AddressLine2,
                  City: value.City,
                  State: value.State,
                  ZipCode: value.ZipCode,
                  Country: value.Country,
                },
              });
            } else {
              this.setState({ currentConfigurationModel: new ConfigurationModel() });
            }
          })
          .then(() => {
            this.setState({ startConfigurationModel: this.state.currentConfigurationModel });
            this.handleValidation();
          })
      });
  };

  getProcessorStatusFromState = async () => {
    var response = await getMasterStateData(ProcessorConfirmed);
    if (response) {
      this.setState({ processorConfirmed: true });
    }
  };



  handleConfigurationChange = (msg: any, data: any) => {
    setConfigurationModel(this.state.currentConfigurationModel);
    PubSub.publish("ROUTE_SUCCESS", data);
  };

  handleProcessorChange = (processorName: string) => {
    this.setState({ processorModel: processorName, show: true });
  };

  handleValidation = () => {
    if (this.invalidForm()) {
      this.setState({ formIsValid: false });
    } else {
      this.setState({ formIsValid: true });
      this.showValidation();
    }
  };

  saveConfiguration = async () => {
    setConfigurationModel(this.state.currentConfigurationModel);
    const res = await this.apiService.saveSystemConfiguration(this.state.currentConfigurationModel)
    if (res.data !== emptyProcessorId) {
      setConfigurationId(res.data);
    }
  }

  showValidation = () => {
    const navs = document.querySelectorAll("[data-tab]");
    if (this.invalidForm()) {
      navs.forEach((nav: any) => { nav.style.cursor = "not-allowed" });
      (document.getElementById("allowed") as any).style.cursor = "pointer"
      this.setState({ showValidationMessage: true });
    } else if (!this.invalidForm()) {
      navs.forEach((nav: any) => { nav.style.cursor = "pointer" });
      this.setState({ showValidationMessage: false });
    }
  };

  invalidForm = (): boolean => {
    return (
      this.state.currentConfigurationModel.ProcessorId == emptyProcessorId ||
      this.state.currentConfigurationModel.SystemName.length == 0
    );
  };

  onProcessorChange = async (event: any) => {
    let dropDownvalue = event.target.value.ProductLineId;
    let processor = this.state.ProcessorList.filter(
      (prod: any) => prod.ProductLineId == dropDownvalue
    );
    if (processor[0].Model != this.state.ProcessorList[0].Model) {
      this.handleProcessorChange(processor[0].Model);
    }
    this.setState((prevState: any) => ({
      currentConfigurationModel: { ...prevState.currentConfigurationModel, ["ProcessorId"]: dropDownvalue },
    }));
  };

  updateDropdown = async () => {
    var response = await getMasterStateData(ProcessorConfirmed);
    if (!response) {
      this.setState((prevState: any) => ({
        currentConfigurationModel: {
          ...prevState.currentConfigurationModel,
          ["ProcessorId"]: this.state.ProcessorList[0].ProductLineId,
        },
      }));
    }
    this.setState({ show: false });
  };

  render() {
    const { t, i18n } = this.props;
    return (
      <div className="container" onBlur={this.handleValidation}>
        <Prompt
          when={!this.state.formIsValid}
          message={(location, action) => {
            return this.state.formIsValid;
          }}
        />
        {this.state.show && (
          <ProcessorConfirmModal processorName={this.state.processorModel} />
        )}
        <div className="raptor-tab-content">
          <form className="form-horizontal">
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">
                  {t("system_name")}:
                </label>
                <span className="raptor-asterisk-operator">∗</span>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="system_name"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.SystemName}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["SystemName"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">{t("processor")}:</label>
                <span className="raptor-asterisk-operator">∗</span>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <DropDownList
                  id="processor"
                  onFocus={this.updateDropdown}
                  disabled={this.state.processorConfirmed}
                  className="raptorProcessorSelect"
                  data={this.state.ProcessorList}
                  textField="Model"
                  dataItemKey="ProductLineId"
                  value={
                    this.state.ProcessorList.filter(
                      (prod: any) =>
                        prod.ProductLineId == this.state.currentConfigurationModel.ProcessorId
                    )[0]
                  }
                  onChange={(e) => {
                    this.onProcessorChange(e);
                  }}
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">
                  {t("customer_name")}:
                </label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="customer_name"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.CustomerName}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["CustomerName"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">Address Line 1:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="address_line1"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.AddressLine1}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["AddressLine1"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">Address Line 2:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="address_line2"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.AddressLine2}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["AddressLine2"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">City:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="city"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.City}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["City"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">State/Province:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="state"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.State}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["State"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">Zip/Postal Code:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="zip_code"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.ZipCode}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["ZipCode"]: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-lg-2 col-md-3 col-sm-4">
                <label className="raptorcustom-label">Country Region:</label>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-7">
                <input
                  id="country"
                  type="text"
                  className="form-control"
                  value={this.state.currentConfigurationModel.Country}
                  onChange={(e) =>
                    this.setState((prevState: any) => ({
                      currentConfigurationModel: {
                        ...prevState.currentConfigurationModel,
                        ["Country"]: e.target.value,
                      },
                    }))
                  }
                />
                <small className="text-muted float-end mt-3">
                  <span className="raptor-asterisk-operator">*</span>
                  Required field
                </small>
              </div>
            </div>
          </form>
          {this.state.showValidationMessage && (
            <div className="validationMessage text-danger">
              You must provide both a SystemName and select a Processor
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation()(Configuration);
function NavigationContext(NavigationContext: any) {
  throw new Error("Function not implemented.");
}
