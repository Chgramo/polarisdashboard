sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "dash/utils/utility",
        "sap/ushell/services/CrossApplicationNavigation"
    ],
    function(BaseController,Filter,FilterOperator,Sorter,utility,Container,CrossApplicationNavigation){
      "use strict";
  
      return BaseController.extend("dash.controller.controller.App", {
        onInit()
         {
            this.counter=4;
            utility.Init(this); 
            utility.objectHeaderData(this);
            utility.objectTypeFilterData(this);
            utility.recordTypeFilterData(this);
            utility.InteractingOrgFilterData(this);
            utility.InteractionPurposeFilterData(this);
            
            
         },
        //  onPress:function(oEvent){
             
        //     // var sObjectUuid = oEvent.getSource().getParent().getParent().getBindingContext('relModel').getProperty('RelObjectUuid');
        //                         // navigate to product information application
        //                         var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
        //                         var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
        //                         target: {
        //                         semanticObject: "ManageProductInfo",
        //                         action: "display"
        //                         },
        //                         // params: {
        //                         // "RecordID": "00000800.COR.001"
        //                         // }
        //                         })) || "";
        //                         /*oCrossAppNavigator.toExternal({
        //                         target: {
        //                         shellHash: hash
        //                         }
        //                         });*/
        //                         // To open in new tab
        //                         var url = window.location.href.split('#')[0] + hash;
        //                         sap.m.URLHelper.redirect(url, true);
             
        //  },
          onSelectionChange:function()
          
          {
            // debugger;
            var sIconTabRes=this.getView().byId("card1conTabHeader").oSelectedItem.getProperty("text"),
            aSorter=[];
            switch(sIconTabRes) 
            {
                case "My Recent Records":
                    utility.resetModel(this);
                    aSorter.push(new Sorter("ChangedOn",true,false));
                    this.onSearch();
                    var oListItems = this.getView().byId('card1List').getBinding("items");
                    oListItems.sort(aSorter);
                    // utility.setLength(this);
                    // onSearch();
                  break;
                case "My Recent favorites":
                    utility.resetModel(this);
                    this.onSearch();
                    var oListItems = this.getView().byId('card1List').getBinding("items");
                    //  utility.setLength(this);
                    // this.onSearch();
                  break;
            }  
          },
        //   
          onSmartChange:function(oEvent)
          {
            
          },
         /**
        * To fetch X-CSRF token
        * @return {string} token
        * @private
        */
        onPressWF: function () {
            var sToken = "";
            $.ajax({
                url: "/dashboarddashboard/bpmworkflowruntime/v1/task-instances",
                method: "GET",
                async: false,
                contentType:"application/json",
                // headers: {
                //     "X-CSRF-Token": "Fetch"
                // },
                success: function (data) {
                    // sToken = data.getResponseHeader("X-CSRF-Token");
                }
            });
            return sToken;
        },
        barchartModel:function()
        {
           var oModel= new JSONModel();
           oModel.loadData("model/data.json");
           this.getView().setModel(oModel,"data");
               
        },

        onSearch: function(oEvent) {
            debugger;
            
            var arr=[this.getView().byId('one').mProperties.selectedKeys,
            this.getView().byId('Two').mProperties.selectedKeys,
            this.getView().byId('Intorg').mProperties.selectedKeys,
            this.getView().byId('Intprp').mProperties.selectedKeys
            ],
            // aFilters=["Object Type","Record Type","Interacting Organization","Interaction Purpose"] ,//oEvent.mParameters.selectionSet.map(d=>d.mProperties.selectedKeys),
            aFilter=[];
            for (var i=0; i<arr.length; i++)
                {
                    if (arr[i].length!=0){
                        var sfilterObj=`${i}`;
                        // aFilter.push(new Filter(sfilterObj,FilterOperator.EQ,true));
                    for(let j=0; j<arr[i].length; j++){
                        var oListItems = this.getView().byId('card1List').getBinding("items");
                    
                        switch(sfilterObj){
                            case '0':
                                  aFilter.push(new Filter("ObjectType",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break;
                            case '1' :
                                aFilter.push(new Filter("RecordType",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break; 
                            case '2' :
                                aFilter.push(new Filter("InteractingOrgId",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break; 
                            case '3' :
                            aFilter.push(new Filter("InteractionPurposeId",FilterOperator.EQ,arr[i][j]));
                            // oListItems.filter(aFilter);
                                break;    
                        }
                        }
                    }
                    
                }
                
            if(this.getView().byId('card1conTabHeader').oSelectedItem.getProperty("text")=="My Recent favorites" )
            {
            
                aFilter.push(new Filter("IsFavorite",FilterOperator.EQ,true));
                oListItems.filter(aFilter);
            }
            else
            {
                oListItems.filter(aFilter);
            }
            // utility.setLength(this);
        },

        onInboxSearch:function(oEvent){
            debugger;
            var arr=[]= oEvent.mParameters.selectionSet.map(d=>d.mProperties.selectedKeys);
            var aFilter=[];
            var oListItems = this.getView().byId('card2List').getBinding("items");
            for (var i=0; i<arr.length; i++)
                {
                    if (arr[i].length!=0){
                        var sfilterObj=oEvent.getParameter("selectionSet")[i].getBindingInfo("items").model;
                        // aFilter.push(new Filter(sfilterObj,FilterOperator.EQ,true));
                    for(let j=0; j<arr[i].length; j++){
                       
                        switch(sfilterObj){
                            case 'objtype':
                                  aFilter.push(new Filter("ObjectType",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break;
                            case 'rectyp' :
                                aFilter.push(new Filter("RecordType",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break; 
                            case 'intorg' :
                                aFilter.push(new Filter("InteractingOrgId",FilterOperator.EQ,arr[i][j]));
                                //   oListItems.filter(aFilter);
                                break; 
                            case 'intprp' :
                            aFilter.push(new Filter("InteractionPurposeId",FilterOperator.EQ,arr[i][j]));
                            // oListItems.filter(aFilter);
                                break; 
                            default:
                                break;

                        }
                    }
                }
                
        }
        oListItems.filter(aFilter);
        utility.setLength1(this);
        utility.resetModel1(this);
        
    },
    onchartSearch:function(oEvent){

    }
    
      });
    }
  );
  
  