sap.ui.define([
	"com/infocus/MyPMS/controller/BaseController",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.MainView", {
		onInit: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var empDetailSet = "/ConcurrentEmploymentSet";

			sap.ui.core.BusyIndicator.show();
			_model.read(empDetailSet, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					
					console.log(response);
					var empId = response.results[0].Pernr;
					console.log("Employee ID: "+empId);
					

					//var confFlag = response.ExConfFlag;
					/*var confFlag = true;
					if (confFlag == false) {
						MessageBox.alert("You are not eligible for PMS", {
							actions: [MessageBox.Action.OK],
							onClose: function() {}
						});
					} else {*/
						// console.log("You are eligible for PMS")
						// var empId = response.ExPernr;
						//console.log(_self.getOwnerComponent().getRouter());
						
						
						// var headerContentURL="/HeaderSet?$filter=(ImPernr eq '40003007' and ImBegda eq datetime'2021-04-01T00:00:00' and ImEndda eq datetime'2021-05-18T00:00:00')&$expand=ToItems"
						
						
						/*var headerContentURL = "/HeaderSet(ImPernr='" + empId +
								"',ImBegda=datetime'2021-05-18T00:00:00',ImEndda=datetime'2021-06-30T00:00:00')?$expand=ToItems"*/
						/*var headerContentURL = "/HeaderSet"
						_model.callFunction(headerContentURL, {
							method: "GET",
							urlParameters: {
								"ImPernr": ImPernr,
								"ImBegda":"2021-05-18T00:00:00",
								"ImEndda":"2021-06-30T00:00:00"
							},
							success: function(response) {
								console.log(response);
							},
							error: function(error) {
								console.log(error);
							}
						});*/
						
						// var oHeader = _self.getView().byId("objHeader");
					
						// var oFilters = [
						// 	new sap.ui.model.Filter("ImPernr","EQ", "40003007"),
						// 	new sap.ui.model.Filter("ImBegda","EQ", "datetime'2021-04-01T00:00:00'"),
						// 	new sap.ui.model.Filter("ImEndda","EQ", "datetime'2021-06-30T00:00:00'")
						// ];
						
						// //oHeader.setModel(this.getModel());
						// oHeader.bindItems("/HeaderSet",null,null,oFilters);
						
					/*	var headerContentURL="/HeaderSet?$filter=ImPernr eq '40003007' and ImBegda eq datetime'2021-04-01T00:00:00' and ImEndda eq datetime'2021-05-18T00:00:00'&$expand=ToItems";
												
						_model.read(headerContentURL, {
							success: function(response) {
								console.log(response);
							},
							error: function(error) {
								console.log(error);
							}
						});*/
						
						
						
						
						
						
						
					// }

				},
				error: function() {
					console.log('Data fetch error');
				}
			});
		}
	});
});