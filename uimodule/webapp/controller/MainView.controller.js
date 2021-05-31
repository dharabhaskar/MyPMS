sap.ui.define([
	"com/infocus/MyPMS/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
], function(Controller, MessageBox, JSONModel, Fragment, MessageToast, Button, Dialog, List, StandardListItem) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.MainView", {
		onInit: function() {

			var _self = this;
			var _model = _self.getView().getModel();
			_self.empDetails = {};

			sap.ui.core.BusyIndicator.show();

			//Fetch Employee data from service...
			sap.ui.core.BusyIndicator.show();
			var employmentSetURL = "/ConcurrentEmploymentSet?$expand=ToItems";
			_model.read(employmentSetURL, {
				success: function(response) {
					//sap.ui.core.BusyIndicator.hide();
					console.log(response);
					_self.empId = response.results[0].Pernr;

					_self.empDetails = response.results[0];

					//DOB as Text
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd-MM-yyyy"
					});
					_self.empDetails.ExDOBText = oDateFormat.format(_self.empDetails.ExDob);

					//Period of Promotion
					var proDay = parseInt(_self.empDetails.ExPromPeriodDay);
					proDay = proDay > 0 ? (proDay + " Day" + (proDay > 1 ? "s" : "")) : "";
					var proMonth = parseFloat(_self.empDetails.ExPromPeriodMonth, 0);
					proMonth = proMonth > 0 ? (proMonth + " Month" + (proMonth > 1 ? "s" : "")) : "";
					var proYear = parseFloat(_self.empDetails.ExPromPeriodYear, 0);
					proYear = proYear > 0 ? (proYear + " Year" + (proYear > 1 ? "s" : "")) : "";
					_self.empDetails.PeriodOfLastPromotion = proYear + " " + proMonth + " " + proDay;

					//Service In Department
					var srvDay = parseInt(_self.empDetails.ExServiceCompDay, 0)
					srvDay = srvDay > 0 ? (srvDay + " Day" + (srvDay > 1 ? "s" : "")) : "";
					var srvMonth = parseFloat(_self.empDetails.ExServiceCompMonth, 0);
					srvMonth = srvMonth > 0 ? (srvMonth + " Month" + (srvMonth > 1 ? "s" : "")) : "";
					var srvYear = parseFloat(_self.empDetails.ExServiceCompYear, 0);
					srvYear = srvYear > 0 ? (srvYear + " Year" + (srvYear > 1 ? "s" : "")) : "";
					_self.empDetails.ServiceInDepartment = srvYear + " " + srvMonth + " " + srvDay;

					var basicPay = parseFloat(_self.empDetails.ExCurrBasic).toFixed(2);
					_self.empDetails.ExCurrBasic = basicPay;

					//Basic Pay format
					/*var oFormat = NumberFormat.getCurrencyInstance({
						"currencyCode": false,
						"customCurrencies": {
							"RS": {
								"symbol": "\u0243",
								"decimals": 2
							}
						}
					});

					_self.empDetails.ExCurrBasic=oFormat.format(_self.empDetails.ExCurrBasic, "RS"); // "Ƀ 123.457"*/

					_self.getView().setModel(new JSONModel(_self.empDetails), "emp");

					_self.byId("emp_selfappr_page").scrollTo(0);

					//Fetching appraisal data from server.
					_self.fetchAppraisalDataFromService();

				},
				error: function() {
					console.log('Data fetch error');
				}
			});
		},
		handleIAgreePopoverPress: function(oEvent) {
			console.log(oEvent);
			var oButton = oEvent.getSource(),
				oView = this.getView();

			console.log(oView);

			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "com.infocus.MyPMS.view.AgreePopover",
					controller: this,
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					//oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},
		handleSaveAppraisalPress: function() {
			//this.byId("myPopover").close();
			//Calling the save data function.
			this.createData();
		},
		handleCancelAppraisalPress: function() {
			this.byId("myPopover").close();

		},
		handleSaveAsDraft: function() {
			MessageToast.show("You clicked on save as draft. (No service attached!!!)")
		},
		handleMaxCharValidation: function(oControlEvent) {
			console.log(oControlEvent);
			if (!oControlEvent.getParameters.value) {
				oControlEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			}
		},
		fetchAppraisalDataFromService: function() {
			var _self = this;
			sap.ui.core.BusyIndicator.show();
			var appraisalGetURL = "/empappraiseSet('" + _self.empId + "')";
			_self.getView().getModel().read(appraisalGetURL, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log(response);
					if (response.statusCode && response.statusCode === "404") {
						//When a user has no data.
						_self.appraisalData = {

						}
					} else {
						_self.appraisalData = response;
						_self.getView().setModel(new JSONModel(_self.appraisalData), "appraisalData");
					}
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});
		},
		createData: function() {
			var data = this.getView().getModel("appraisalData").oData;
			sap.ui.core.BusyIndicator.show();

			console.log("Saving data....");
			console.log(data);
			var odataModel = this.getView().getModel();
			odataModel.create("/empappraiseSet", data, {
				success: function(data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show("Your appraisal saved successfully...");
					console.log(response);
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error while creating the data");
					console.log(error);
				}
			});
		},
		onDesignationPress: function() {
			var _self = this;
			var prevPositionsData = {
				"array":[{
					"Position": "Manager",
					"Period": "2 year 6 Month",
					"Location": "Mumbai"
				}]
			}
			_self.getView().setModel(new JSONModel(prevPositionsData), "prevPosData");

			var oTable = new sap.m.Table("idPrdList", {
				inset: true,
				mode: sap.m.ListMode.None,
				includeItemInSelection: false,
			});
			var colItems = new sap.m.ColumnListItem("colItems", {
				type: "Active"
			});
			oTable.bindAggregation("items", "prevPosData>/array", colItems);

			var col1 = new sap.m.Column("col1", {
				header: new sap.m.Label({
					text: "Position"
				})
			});
			var col2 = new sap.m.Column("col2", {
				header: new sap.m.Label({
					text: "Period"
				})
			});
			var col3 = new sap.m.Column("col3", {
				header: new sap.m.Label({
					text: "Location"
				})
			});
			var txtNAME = new sap.m.Text("txtPosition", {
				text: "{Position}"
			});
			colItems.addCell(txtNAME);

			oTable.addColumn(col1);
			oTable.addColumn(col2);
			oTable.addColumn(col3);

			var that = this;
			if (!that.resizableDialog) {
				that.resizableDialog = new Dialog({
					title: 'Details of last three position (Excluding Present)',
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					content: oTable,
					beginButton: new Button({
						text: 'Close',
						press: function() {
							that.resizableDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.resizableDialog);
			}

			that.resizableDialog.open();
		}
	});
});