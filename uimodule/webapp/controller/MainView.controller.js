sap.ui.define([
	"com/infocus/MyPMS/controller/BaseController",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.MainView", {
		onInit: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			

			sap.ui.core.BusyIndicator.show();

			//Check whether the loggedIn employee is Eligible for PMS.
			//=======================================================
			var eligibilityCheckServiceURL = "/EmpDetailsSet('HCM_ESS')";
			_model.read(eligibilityCheckServiceURL, {
				method: "GET",
				success: function(response) {
					console.log(response);

					
					//Get the employment details set
					//===========================================================
					var employmentSetURL = "/ConcurrentEmploymentSet";
					_model.read(employmentSetURL, {
						success: function(response) {
							sap.ui.core.BusyIndicator.hide();

							console.log(response);
							var empId = response.results[0].Pernr;
							console.log("Employee ID: " + empId);

						},
						error: function() {
							console.log('Data fetch error');
						}
					});
					//===========================================================
				},
				error: function(error) {
					console.log(error);
				}
			});
		}
	});
});