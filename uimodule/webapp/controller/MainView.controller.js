sap.ui.define(["com/infocus/MyPMS/controller/BaseController"], function(Controller) {
	"use strict";

	return Controller.extend("com.infocus.MyPMS.controller.MainView", {
		onInit: function() {
			var model = this.getView().getModel();
			var empDetailSet = "/EmpDetailsSet('HCM_ESS')";

			sap.ui.core.BusyIndicator.show();
			model.read(empDetailSet, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();

					var confFlag = response.ExConfFlag;
					if (confFlag == false) {
						// sap.m.MessageBox.alert("You are not eligible for PMS.", {
						// 	actions: [sap.m.MessageBox.Action.OK],
						// 	onClose: function() {}
						// });
						console.log("You are not eligible for PMS")
					}else{
						console.log("You can eligible for PMS")
					}
					
					var empId=response.ExPernr;
			
					//Emp SubGroup
					var empSubgroup=response.ExEmpSubgroup;
				
				
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