import { Checkbox, Select, Password } from "./utils/form.js";
import {
  Popover,
  Tabs,
  FormatValue,
  FilterSettings,
} from "./utils/settings.js";

class ServiceModal {
  constructor() {
    //modal elements
    this.modal = document.querySelector("[services-modal]");
    this.modalTitle = this.modal.querySelector("[services-modal-title]");
    this.modalTabs = this.modal.querySelector(["[services-tabs]"]);
    this.modalTabsHeader = this.modal.querySelector(["[services-tabs-header]"]);

    this.modalCard = this.modal.querySelector("[services-modal-card]");
    //modal forms
    this.formNewEdit = this.modal.querySelector("[services-modal-form]");
    this.formDelete = this.modal.querySelector("[services-modal-form-delete]");
    //container
    this.container = document.querySelector("main");
    this.init();
  }

  //store default config data on DOM
  //to update modal data on new button click

  getActionAndServName(target) {
    const action = target.closest("button").getAttribute("services-action");
    const serviceName = target.closest("button").getAttribute("services-name");

    return [action, serviceName];
  }

  init() {
    this.modal.addEventListener("click", (e) => {
      //close
      try {
        if (e.target.closest("button").hasAttribute("services-modal-close")) {
          this.closeModal();
        }
      } catch (err) {}
    });

    this.container.addEventListener("click", (e) => {
      //edit action
      try {
        if (
          e.target.closest("button").getAttribute("services-action") === "edit"
        ) {
          //set form info and right form
          const [action, serviceName] = this.getActionAndServName(e.target);
          this.setForm(action, serviceName, this.formNewEdit);
          //get service data and parse it
          //multiple type logic is launch at same time on relate class
          const servicesSettings = e.target
            .closest("[services-service]")
            .querySelector("[services-settings]")
            .getAttribute("value");
          const obj = JSON.parse(servicesSettings);
          this.updateModalData(obj);
          //show modal
          this.openModal();
        }
      } catch (err) {}
      //new action
      try {
        if (
          e.target.closest("button").getAttribute("services-action") === "new"
        ) {
          //set form info and right form
          const [action, serviceName] = this.getActionAndServName(e.target);
          this.setForm(action, serviceName, this.formNewEdit);
          //set default value with method default
          this.setSettingsDefault();
          //server name is unset
          const inpServName = document.querySelector("input#SERVER_NAME");
          inpServName.getAttribute("value", "");
          inpServName.value = "";

          //show modal
          this.openModal();
        }
      } catch (err) {}
      //delete action
      try {
        if (
          e.target.closest("button").getAttribute("services-action") ===
          "delete"
        ) {
          //set form info and right form
          const [action, serviceName] = this.getActionAndServName(e.target);
          this.setForm(action, serviceName, this.formDelete);
          //show modal
          this.openModal();
        }
      } catch (err) {}
    });
  }

  setSettingsDefault() {
    const inps = this.modal.querySelectorAll("input");
    inps.forEach((inp) => {
      //form related values are excludes
      const inpName = inp.getAttribute("name");
      if (
        inpName === "csrf_token" ||
        inpName === "OLD_SERVER_NAME" ||
        inpName === "operation"
      )
        return;

      //for all other settings values
      const defaultMethod = "default";
      const defaultVal = inp.getAttribute("default-value") || "";

      //SET VALUE
      if (inp.getAttribute("type") === "checkbox") {
        inp.checked = defaultVal === "yes" ? true : false;
        inp.setAttribute("value", defaultVal);
        inp.value = defaultVal;
        inp.setAttribute("method", defaultMethod);
      }

      if (inp.getAttribute("type") !== "checkbox") {
        inp.setAttribute("value", defaultVal);
        inp.setAttribute("method", defaultMethod);
      }

      //SET METHOD
      this.setDisabled(inp, defaultMethod);
    });

    const selects = this.modal.querySelectorAll("select");
    selects.forEach((select) => {
      const defaultMethod = "default";
      const defaultVal = select.getAttribute("default-value") || "";

      document
        .querySelector(
          `[setting-select=${select.getAttribute("setting-select-default")}]`
        )
        .removeAttribute("disabled");

      select.parentElement
        .querySelector(
          `button[setting-select-dropdown-btn][value='${defaultVal}']`
        )
        .click();

      this.setDisabled(select, defaultMethod);
    });
  }

  setDisabled(inp, method) {
    if (method === "ui" || method === "default") {
      inp.removeAttribute("disabled");
    } else {
      inp.setAttribute("disabled", "");
    }
  }

  setForm(action, serviceName, formEl) {
    this.modalTitle.textContent = `${action} ${serviceName}`;
    formEl.setAttribute("id", `form-${action}-${serviceName}`);
    formEl
      .querySelector(`input[name="operation"]`)
      .setAttribute("value", action);

    if (action === "edit" || action === "new") {
      this.showNewEditForm();
      const oldNameInp = formEl.querySelector(`input[name="OLD_SERVER_NAME"]`);
      oldNameInp.setAttribute("value", serviceName);
      oldNameInp.value = serviceName;
    }

    if (action === "delete") {
      this.showDeleteForm();
      formEl.querySelector(
        `[services-modal-text]`
      ).textContent = `Are you sure you want to delete ${serviceName} ?`;
      const nameInp = formEl.querySelector(`input[name="SERVER_NAME"]`);
      nameInp.setAttribute("value", serviceName);
      nameInp.value = serviceName;
    }
  }

  showNewEditForm() {
    this.cardViewport();
    this.showTabs();
    this.hideForms();
    this.formNewEdit.classList.remove("hidden");
  }

  showDeleteForm() {
    this.cardNoViewport();
    this.hideTabs();
    this.hideForms();

    this.formDelete.classList.remove("hidden");
  }

  cardViewport() {
    this.modalCard.classList.add("h-[90vh]");
    this.modalCard.classList.add("w-full");
  }

  cardNoViewport() {
    this.modalCard.classList.remove("h-[90vh]");
    this.modalCard.classList.remove("w-full");
  }

  hideForms() {
    this.formNewEdit.classList.add("hidden");
    this.formDelete.classList.add("hidden");
  }

  hideTabs() {
    this.modalTabs.classList.remove("grid");
    this.modalTabs.classList.add("hidden");

    this.modalTabsHeader.classList.remove("flex");
    this.modalTabsHeader.classList.add("hidden");
  }

  showTabs() {
    this.modalTabs.classList.add("grid");
    this.modalTabs.classList.remove("hidden");
    this.modalTabsHeader.classList.add("flex");
    this.modalTabsHeader.classList.remove("hidden");
  }

  updateModalData(settings) {
    //use this to select inputEl and change value
    for (const [key, data] of Object.entries(settings)) {
      //change format to match id
      const value = data["value"];
      const method = data["method"];
      try {
        const inps = this.modal.querySelectorAll(`[name='${key}']`);

        inps.forEach((inp) => {
          //form related values are excludes
          const inpName = inp.getAttribute("name");
          if (
            inpName === "csrf_token" ||
            inpName === "OLD_SERVER_NAME" ||
            inpName === "operation"
          )
            return;

          //SET DISABLED / ENABLED
          //for regular input
          if (
            inp.tagName === "INPUT" &&
            inp.getAttribute("type") !== "checkbox"
          ) {
            inp.setAttribute("value", value);
            inp.value = value;
            inp.setAttribute("method", method);
          }
          //for checkbox
          if (
            inp.tagName === "INPUT" &&
            inp.getAttribute("type") === "checkbox"
          ) {
            inp.checked = value === "yes" ? true : false;
            inp.setAttribute("value", value);
            inp.setAttribute("method", method);

            if (inp.hasAttribute("disabled")) {
              const hidden_inp = inp
                .closest("div[checkbox-handler]")
                .querySelector("input[type='hidden']");
              hidden_inp.setAttribute("value", value);
              hidden_inp.setAttribute("method", method);
            }
          }
          //for select
          if (inp.tagName === "SELECT") {
            inp.parentElement
              .querySelector(
                `button[setting-select-dropdown-btn][value='${value}']`
              )
              .click();
            inp.setAttribute("method", method);
          }

          //check disabled/enabled after setting values and methods
          this.setDisabled(inp, method);
        });
      } catch (err) {}
    }
  }

  //UTILS
  toggleModal() {
    this.modal.classList.toggle("hidden");
    this.modal.classList.toggle("flex");
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.modal.classList.remove("flex");
  }

  openModal() {
    //switch to first setting
    document.querySelector("button[tab-handler]").click();
    //show modal el
    this.modal.classList.add("flex");
    this.modal.classList.remove("hidden");
  }
}

class Multiple {
  constructor(prefix) {
    this.prefix = prefix;
    this.container = document.querySelector("main");
    this.modalForm = document.querySelector(`[${this.prefix}-modal-form]`);
    this.init();
  }

  init() {
    window.addEventListener("load", () => {
      this.hiddenIfNoMultiples();
    });

    this.container.addEventListener("click", (e) => {
      //edit button
      try {
        if (
          e.target.closest("button").getAttribute("services-action") === "edit"
        ) {
          //remove all multiples
          this.removePrevMultiples();
          //get multiple service values and parse as obj
          const servicesSettings = e.target
            .closest("[services-service]")
            .querySelector("[services-settings]")
            .getAttribute("value");
          const obj = JSON.parse(servicesSettings);
          //keep only multiple settings value
          const multipleSettings = this.getMultiplesOnly(obj);
          const sortMultiples =
            this.sortMultipleByContainerAndSuffixe(multipleSettings);
          this.setMultipleToDOM(sortMultiples);
        }
      } catch (err) {}
      //new button
      try {
        if (
          e.target.closest("button").getAttribute("services-action") === "new"
        ) {
          this.removePrevMultiples();
          this.addOneMultGroup();
        }
      } catch (err) {}
    });

    this.modalForm.addEventListener("click", (e) => {
      //ADD BTN
      try {
        if (
          e.target.closest("button").hasAttribute(`${this.prefix}-multiple-add`)
        ) {
          //get plugin from btn
          const btn = e.target.closest("button");
          const attName = btn.getAttribute(`${this.prefix}-multiple-add`);
          //get all multiple groups
          const multipleEls = document.querySelectorAll(
            `[${this.prefix}-settings-multiple*="${attName}"]`
          );
          //case no schema
          if (multipleEls.length <= 0) return;

          //get the next container number logic
          //default is 0
          let topNum = 0;
          //loop on curr multiples, get the name suffix for each
          //and keep the highest num
          multipleEls.forEach((container) => {
            const ctnrName = container.getAttribute(
              "services-settings-multiple"
            );
            const num = this.getSuffixNumOrFalse(ctnrName);
            if (!isNaN(num) && num > topNum) topNum = num;
          });
          //the final number is num
          //num is total - 1 because of hidden SCHEMA container
          const currNum = `${multipleEls.length >= 2 ? topNum + 1 : topNum}`;
          const setNum = +currNum === 0 ? `` : `_${currNum}`;
          //the default (schema) group is the last group
          const schema = document.querySelector(
            `[${this.prefix}-settings-multiple="${attName}_SCHEMA"]`
          );
          //clone schema to create a group with new num
          const schemaClone = schema.cloneNode(true);
          this.changeCloneSuffix(schemaClone, setNum);
          this.setDisabled();
          this.showClone(schema, schemaClone);
          //insert new group before first one
          //show all groups
          this.showMultByAtt(attName);
        }
      } catch (err) {}

      //TOGGLE BTN
      try {
        if (
          e.target
            .closest("button")
            .hasAttribute(`${this.prefix}-multiple-toggle`)
        ) {
          const att = e.target
            .closest("button")
            .getAttribute(`${this.prefix}-multiple-toggle`);
          this.toggleMultByAtt(att);
        }
        //remove last child
      } catch (err) {}

      //REMOVE BTN
      try {
        if (
          e.target
            .closest("button")
            .hasAttribute(`${this.prefix}-multiple-delete`)
        ) {
          const multContainer = e.target.closest(
            "[services-settings-multiple]"
          );
          multContainer.remove();
        }
        //remove last child
      } catch (err) {}
    });
  }

  sortMultipleByContainerAndSuffixe(obj) {
    const sortMultiples = {};
    for (const [name, value] of Object.entries(obj)) {
      //split name and check if there is a suffixe
      const splitName = name.split("_");
      //suffixe start with number 1, if none give arbitrary 0 value to store on same group
      const isSuffixe = !isNaN(splitName[splitName.length - 1]) ? true : false;
      const suffixe = isSuffixe ? splitName[splitName.length - 1] : "0";
      //remove suffix if exists and query related name_SCHEMA to get container info
      const nameSuffixLess = isSuffixe
        ? name.replace(`_${splitName[splitName.length - 1]}`, "").trim()
        : name.trim();
      const relateSetting = document.querySelector(
        `[setting-container=${nameSuffixLess}_SCHEMA]`
      );
      const relateCtnr = relateSetting.closest("[services-settings-multiple]");
      const relateCtnrName = relateCtnr.getAttribute(
        "services-settings-multiple"
      );
      //then we sort the setting on the right container name by suffixe number
      if (!(relateCtnrName in sortMultiples)) {
        sortMultiples[relateCtnrName] = {};
      }

      if (!(suffixe in sortMultiples[relateCtnrName])) {
        sortMultiples[relateCtnrName][suffixe] = {};
      }
      sortMultiples[relateCtnrName][suffixe][name] = value;
    }
    return sortMultiples;
  }

  addOneMultGroup() {
    const settings = document.querySelector("[services-modal-form]");
    const multAddBtns = settings.querySelectorAll("[services-multiple-add]");
    multAddBtns.forEach((btn) => {
      //check if already one (SCHEMA exclude so length >= 2)
      const plugin = btn.closest("[plugin-item]");
      if (plugin.querySelectorAll("[services-settings-multiple]").length >= 2)
        return;
      btn.click();
    });
  }

  showMultByAtt(att) {
    const multContainers = document.querySelectorAll(
      `[services-settings-multiple^=${att}]`
    );
    multContainers.forEach((container) => {
      if (
        !container.getAttribute("services-settings-multiple").includes("SCHEMA")
      )
        container.classList.remove("hidden");
    });
  }

  toggleMultByAtt(att) {
    const multContainers = document.querySelectorAll(
      `[services-settings-multiple^=${att}]`
    );
    multContainers.forEach((container) => {
      if (
        !container.getAttribute("services-settings-multiple").includes("SCHEMA")
      )
        container.classList.toggle("hidden");
    });
  }

  getMultiplesOnly(settings) {
    //get schema settings
    const multiples = {};
    const schemaSettings = document.querySelectorAll(
      `[setting-container$="SCHEMA"]`
    );
    // loop on every schema settings
    schemaSettings.forEach((schema) => {
      const schemaName = schema
        .getAttribute("setting-container")
        .replace("_SCHEMA", "")
        .trim();
      //check if match with service setting
      for (const [key, data] of Object.entries(settings)) {
        if (key.includes(schemaName)) {
          multiples[key] = {
            value: data["value"],
            method: data["method"],
          };
        }
      }
    });
    return multiples;
  }

  //put multiple on the right plugin, on schema container
  setMultipleToDOM(sortMultObj) {
    //we loop on each multiple that contains values to render to DOM
    for (const [schemaCtnrName, multGroupBySuffix] of Object.entries(
      sortMultObj
    )) {
      //we need to access the DOM schema container
      const schemaCtnr = document.querySelector(
        `[services-settings-multiple="${schemaCtnrName}"]`
      );
      //now we have to loop on each multiple settings group
      for (const [suffix, settings] of Object.entries(multGroupBySuffix)) {
        //we have to clone schema container first
        const schemaCtnrClone = schemaCtnr.cloneNode(true);
        //now we replace _SCHEMA by current suffix everywhere we need
        //unless it is 0 that means no suffix
        const suffixFormat = +suffix === 0 ? `` : `_${suffix}`;
        this.changeCloneSuffix(schemaCtnrClone, suffixFormat);
        //then we have to loop on every settings of current group to change clone values by right ones
        for (const [name, data] of Object.entries(settings)) {
          //get setting container of clone container
          const settingContainer = schemaCtnrClone.querySelector(
            `[setting-container="${name}"]`
          );
          //replace input info
          this.setSetting(data["value"], data["method"], settingContainer);
        }
        //send schema clone to DOM and show it
        this.showClone(schemaCtnr, schemaCtnrClone);
      }
    }

    //disabled after update values and method
    this.setDisabled();
  }

  changeCloneSuffix(schemaCtnrClone, suffix) {
    //rename multiple container
    schemaCtnrClone.setAttribute(
      "services-settings-multiple",
      schemaCtnrClone
        .getAttribute("services-settings-multiple")
        .replace("_SCHEMA", suffix)
    );

    //rename title
    const titles = schemaCtnrClone.querySelectorAll("h5");
    titles.forEach((title) => {
      const text = title.textContent;
      title.textContent = `${text} ${
        suffix ? `#${suffix.replace("_", "")}` : ``
      }`;
    });

    //rename setting container
    const settingCtnrs = schemaCtnrClone.querySelectorAll(
      "[setting-container]"
    );
    settingCtnrs.forEach((settingCtnr) => {
      settingCtnr.setAttribute(
        "setting-container",
        settingCtnr.getAttribute("setting-container").replace("_SCHEMA", suffix)
      );
    });

    //rename input
    try {
      const inps = schemaCtnrClone.querySelectorAll("input");
      this.renameLoop(inps, suffix);
    } catch (err) {}

    //rename select
    try {
      const selects = schemaCtnrClone.querySelectorAll("select");
      this.renameLoop(selects, suffix);
    } catch (err) {}
  }

  renameLoop(inps, suffix) {
    inps.forEach((inp) => {
      const newName = inp.getAttribute("name").replace("_SCHEMA", suffix);
      inp.setAttribute("name", newName);
      if (inp.hasAttribute("id")) inp.setAttribute("id", newName);
    });
  }

  setSetting(value, method, settingContainer) {
    //update input
    try {
      const inps = settingContainer.querySelectorAll("input");
      inps.forEach((inp) => {
        //form related values are excludes
        const inpName = inp.getAttribute("name");
        if (
          inpName === "csrf_token" ||
          inpName === "OLD_SERVER_NAME" ||
          inpName === "operation"
        )
          return;

        //for settings input
        if (inp.getAttribute("type") === "checkbox") {
          inp.checked = value === "yes" ? true : false;
          if (inp.hasAttribute("disabled")) {
            const hidden_inp = inp
              .closest("div[checkbox-handler]")
              .querySelector("input[type='hidden']");
            hidden_inp.setAttribute("value", value);
          }
        }

        inp.value = value;
        inp.setAttribute("method", method);
      });
    } catch (err) {}
    //update select
    try {
      const select = settingContainer.querySelector("select");
      const name = select.getAttribute("services-setting-select-default");
      const selTxt = document.querySelector(
        `[services-setting-select-text='${name}']`
      );

      selTxt.textContent = value;
      selTxt.setAttribute("value", value);
      const options = select.options;

      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        option.value === value
          ? option.setAttribute("selected")
          : option.removeAttribute("selected");
      }
      select.setAttribute("method", method);
    } catch (err) {}
  }

  showClone(schemaCtnr, schemaCtnrClone) {
    schemaCtnr.insertAdjacentElement("afterend", schemaCtnrClone);
    schemaCtnrClone.classList.remove("hidden");
    schemaCtnrClone.classList.add("grid");
  }

  setDisabled() {
    const multipleCtnr = document.querySelectorAll(
      "[services-settings-multiple]"
    );
    multipleCtnr.forEach((container) => {
      const settings = container.querySelectorAll("[setting-container]");

      settings.forEach((setting) => {
        //replace input info
        try {
          const inps = setting.querySelectorAll("input");
          inps.forEach((inp) => {
            const method = inp.getAttribute("method") || "default";
            if (method === "ui" || method === "default") {
              inp.removeAttribute("disabled");
            } else {
              inp.setAttribute("disabled", "");
            }
          });
        } catch (err) {}
        //or select
        try {
          const selects = setting.querySelectorAll("select");
          selects.forEach((select) => {
            const method = select.getAttribute("method") || "default";
            const name = select.getAttribute("services-setting-select-default");
            const selDOM = document.querySelector(
              `button[services-setting-select='${name}']`
            );
            if (method === "ui" || method === "default") {
              selDOM.removeAttribute("disabled", "");
            } else {
              selDOM.setAttribute("disabled", "");
            }
          });
        } catch (err) {}
      });
    });
  }

  //UTILS

  getSuffixNumOrFalse(name) {
    const num = !isNaN(Number(name.substring(name.lastIndexOf("_") + 1)))
      ? Number(name.substring(name.lastIndexOf("_") + 1))
      : "";
    return num;
  }

  hiddenIfNoMultiples() {
    //hide multiple btn if no multiple exist on a plugin
    const multiples = document.querySelectorAll(
      `[${this.prefix}-settings-multiple]`
    );
    multiples.forEach((container) => {
      if (container.querySelectorAll(`[setting-container]`).length <= 0)
        container.parentElement
          .querySelector("[multiple-handler]")
          .classList.add("hidden");
    });
  }

  removePrevMultiples() {
    const multiPlugins = document.querySelectorAll(
      `[${this.prefix}-settings-multiple]`
    );
    multiPlugins.forEach((multiGrp) => {
      if (
        !multiGrp.getAttribute("services-settings-multiple").includes("SCHEMA")
      )
        multiGrp.remove();
    });
  }

  showMultiple(el) {
    el.classList.add("grid");
    el.classList.remove("hidden");
  }

  setNameIDloop(iterable, value) {
    iterable.forEach((item) => {
      const currID = item.getAttribute("id");
      const currName = item.getAttribute("name");
      item.setAttribute("id", `${currID}_${value}`);
      item.setAttribute("name", `${currName}_${value}`);
    });
  }

  setNameID(el, value) {
    el.setAttribute("id", `${value}`);
    el.setAttribute("name", `${value}`);
  }
}

const setCheckbox = new Checkbox();
const setSelect = new Select();
const setPassword = new Password();

const setPopover = new Popover();
const setTabs = new Tabs();
const setModal = new ServiceModal();
const format = new FormatValue();
const setFilterGlobal = new FilterSettings(
  "settings-filter",
  "[service-content='settings']"
);

const setMultiple = new Multiple("services");
