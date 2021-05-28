sap.ui.define([
	"com/infocus/MyPMS/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
], function(Controller, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.MainView", {
		onInit: function() {

			var _self = this;
			var _model = _self.getView().getModel();
			_self.empDetails = {};

			sap.ui.core.BusyIndicator.show();

			//Fetch Employee data from service...
			var employmentSetURL = "/ConcurrentEmploymentSet?$expand=ToItems";
			_model.read(employmentSetURL, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log(response);
					var empId = response.results[0].Pernr;

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

					_self.getView().setModel(new JSONModel(_self.empDetails), "emp");

				},
				error: function() {
					console.log('Data fetch error');
				}
			});
		}
	});
});