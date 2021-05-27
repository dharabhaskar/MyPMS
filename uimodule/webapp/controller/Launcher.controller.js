sap.ui.define([
	"com/infocus/MyPMS/controller/BaseController",
	"sap/m/MessageBox"
	], function(Controller,MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.Launcher", {
		handleEligibilityTest: function() {
			var _self=this;
			var model = this.getView().getModel();
			var empDetailSet = "/EmpDetailsSet('HCM_ESS')";

			sap.ui.core.BusyIndicator.show();
			model.read(empDetailSet, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();

					//var confFlag = response.ExConfFlag;
					var confFlag = true;
					if (confFlag == false) {
						MessageBox.alert("You are not eligible for PMS", {
							actions: [MessageBox.Action.OK],
							onClose: function() {}
						});
					} else {
						console.log("You are eligible for PMS")
						console.log(_self.getOwnerComponent().getRouter());
						_self.getOwnerComponent().getRouter().navTo("MainView");
					}

					var empId = response.ExPernr;

					//Emp SubGroup
					var empSubgroup = response.ExEmpSubgroup;

					console.log(empId);
					console.log(response);
				},
				error: function() {
					console.log('Data fetch error');
				}
			});
		}
	});
});