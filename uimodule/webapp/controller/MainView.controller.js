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
		_getFormFragment: function(sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();

			if (!pFormFragment) {
				pFormFragment = sap.ui.xmlfragment(oView.getId(), "com.infocus.MyPMS.view.SelfAppraisal" + sFragmentName, this);
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},
		_showFormFragment: function(sFragmentName) {
			var oPage = this.byId("fragPanel");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		onInit: function() {

			var _self = this;
			var _model = _self.getView().getModel();
			_self.empDetails = {};

			this._formFragments = {};
			//this._showFormFragment('Display');

			sap.ui.core.BusyIndicator.show();

			//Fetch Employee data from service...
			sap.ui.core.BusyIndicator.show();
			var employmentSetURL = "/ConcurrentEmploymentSet";
			_model.read(employmentSetURL, {
				urlParameters: {
					"$expand": "ToItems"
				},
				success: function(response) {
					//sap.ui.core.BusyIndicator.hide();
					console.log(response);
					_self.empId = response.results[0].Pernr;

					_self.empDetails = response.results[0];

					//console.log("Previous positions")
					//console.log(_self.empDetails.ToItems.results)

					for (let item in _self.empDetails.ToItems.results) {
						var pDay = parseInt(_self.empDetails.ToItems.results[item].PeriodDay);
						pDay = pDay > 0 ? (pDay + " Day" + (pDay > 1 ? "s" : "")) : "";
						var pMonth = parseFloat(_self.empDetails.ToItems.results[item].PeriodMonth, 0);
						pMonth = pMonth > 0 ? (pMonth + " Month" + (pMonth > 1 ? "s" : "")) : "";
						var pYear = parseFloat(_self.empDetails.ToItems.results[item].PeriodYear, 0);
						pYear = pYear > 0 ? (pYear + " Year" + (pYear > 1 ? "s" : "")) : "";

						_self.empDetails.ToItems.results[item].Period = pYear + " " + pMonth + " " + pDay;
					}

					_self.getView().setModel(new JSONModel(_self.empDetails.ToItems), "positions");

					//DOB as Text
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd-MM-yyyy"
					});
					_self.empDetails.ExDOBText = oDateFormat.format(_self.empDetails.ExDob);
					_self.empDetails.ExDOJText = oDateFormat.format(_self.empDetails.ExDoj);

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
			//console.log(oEvent);
			var oButton = oEvent.getSource(),
				oView = this.getView();

			// create popover
			/*if (!this._pPopover) {
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
			});*/
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment(oView.getId(), "com.infocus.MyPMS.view.AgreePopover", this)
				oView.addDependent(this._oPopover);
			}

			this._oPopover.openBy(oButton);
		},
		onAgreeSelectionChanged: function(oEvent) {
			this.IAgreeCheckboxSelected = oEvent.getParameters().selected;
			this.byId("agree").setEnabled(this.IAgreeCheckboxSelected);
		},
		onExit: function() {
			//Clean up the popovers...
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},
		handleSaveAppraisalPress: function() {
			//Calling the save data function.
			var data = this.getView().getModel("appraisalData").oData;

			this._oPopover.close();
			this.createData("Y");
		},
		handleCancelAppraisalPress: function() {
			this._oPopover.close();
		},
		handleSaveAsDraft: function() {

			this.createData("N");
		},
		handleMaxCharValidation: function(oControlEvent) {
			//console.log(oControlEvent);
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
					//console.log(response);

					_self.appraisalData = response;
					_self.getView().setModel(new JSONModel(_self.appraisalData), "appraisalData");

					//Switch to Noneditable mode if the saveFlag is Y
					var saveFlag = response.Saveflag;
					_self.toggeleNonEditableMode(saveFlag);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					_self.appraisalData = {
						Empid: _self.empId,
						ApprComm1: "",
						ApprComm2: "",
						ApprComm3: "",
						AppraiserId: "",
						ConstrainFaced: "",
						Empid: "",
						Failure1: "",
						Failure2: "",
						Failure3: "",
						MajorTask1: "",
						MajorTask2: "",
						MajorTask3: "",
						Period: "01",
						Saveflag: "",
					};
					_self.getView().setModel(new JSONModel(_self.appraisalData), "appraisalData");
				}
			});
		},
		toggeleNonEditableMode: function(saveFlag) {
			var _self=this;
			console.log('Saveflag value: ' + saveFlag);
			/*_self._showFormFragment("Display");
			if (saveFlag === 'Y') {
				_self.getView().byId("frag1--achievement1").setEditable(false);
				_self.getView().byId("frag1--achievement2").setEditable(false);
				_self.getView().byId("frag1--achievement3").setEditable(false);
	
				_self.getView().byId("frag1--failure1").setEditable(false);
				_self.getView().byId("frag1--failure2").setEditable(false);
				_self.getView().byId("frag1--failure3").setEditable(false);
	
				_self.getView().byId("frag1--constrainFaced").setEditable(false);
				_self.getView().byId("frag1--trainingDevNeed").setEditable(false);
				//_self.getView().byId("frag1--achievement1").setEditable(false);
			}*/
			/*if (saveFlag === 'Y') {
				_self._showFormFragment("DisplayNonEditable");
			} else {
				_self._showFormFragment("Display");
			}*/
			//saveFlag='N';
			if(saveFlag==='Y'){
				_self.getView().byId("fragPanel1").setVisible(false);
				_self.getView().byId("fragPanel2").setVisible(true);
				_self.getView().byId("otbFooter").setVisible(false);
			}else{
				_self.getView().byId("fragPanel1").setVisible(true);
				_self.getView().byId("fragPanel2").setVisible(false);
				_self.getView().byId("otbFooter").setVisible(true);
			}
		},
		validateFailure: function() {
			var data = this.getView().getModel("appraisalData").oData;
			var isF1 = data.Failure1 && data.Failure1.trim().length > 0;
			var isF2 = data.Failure2 && data.Failure2.trim().length > 0;
			var isF3 = data.Failure3 && data.Failure3.trim().length > 0;

			if (isF1 && isF2) {
				return true;
			}
			if (isF1 && isF3) {
				return true;
			}
			if (isF2 && isF3) {
				return true;
			}
			return false;
		},
		createData: function(saveParmanent) {
			var _self=this;
			sap.ui.core.BusyIndicator.show();

			//Fetch the model data for Self Appraisal
			var data = this.getView().getModel("appraisalData").oData;
			//Setting additional properties....
			data.Saveflag = saveParmanent;
			data.Empid = this.empId;

			console.log('Sending Appraisal Data to server...');
			console.log(data);

			if (!this.validateFailure()) {
				MessageBox.error("You must add atleast two failures.");
				sap.ui.core.BusyIndicator.hide();
			} else {
				sap.ui.core.BusyIndicator.show();
				var odataModel = this.getView().getModel();
				console.log("Saving data...");
				console.log(data);
				odataModel.create("/empappraiseSet", data, {
					success: function(data, response) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.success("Your appraisal saved " + (saveParmanent === "N" ? "as draft" : "") + " successfully...");
						//console.log(response);
						//Switch to Noneditable mode if the saveFlag is Y
						var saveFlag = data.Saveflag;
						_self.toggeleNonEditableMode(saveFlag);
					},
					error: function(error) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Error while creating the data");
						console.log(error);
					}
				});
			}

		},
		onDesignationPress: function() {

			var that = this;
			if (!that.resizableDialog) {
				var oTable = new sap.m.Table("tab-1", {
					inset: true,
					mode: sap.m.ListMode.None,
					includeItemInSelection: false,
				});
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

				oTable.bindItems("positions>/results", new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
						text: "{positions>Position}"
					}), new sap.m.Text({
						text: "{positions>Period}"
					}), new sap.m.Text({
						text: "{positions>Location}",
					}), ]
				}));

				oTable.addColumn(col1);
				oTable.addColumn(col2);
				oTable.addColumn(col3);

				that.resizableDialog = new Dialog({
					title: 'Details of last three position (Excluding Present)',
					contentWidth: "650px",
					contentHeight: "200px",
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

			//this._getDialog().open();
		},
		_getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.infocus.MyPMS.view.PositionsDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		onCloseDialog: function() {
			this._getDialog().close();
		}
	});
});