sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "sap/m/MessageToast",
    "sap/ui/table/TreeTable",
    "sap/ui/core/Item",
    "sap/ui/model/FilterType",
    "sap/m/MessageBox",
    "sap/ui/core/format/DateFormat"
], function (JSONModel, ODataModel, Filter, FilterOperator, formatter, MessagePopover, MessagePopoverItem, MessageToast, TreeTable, Item, FilterType, utility, MessageBox,DateFormat) {
    "use strict";
    return {
        // Global Data
         Init:function(oProductInfoController)
         {
           oProductInfoController._oDynamicModel=oProductInfoController.getOwnerComponent().getModel();
           oProductInfoController.oTempModel=[];
           oProductInfoController.oModelIndices=[];
         },
         
        objectHeaderData:function(oProductInfoController)
        {
           var url = `/ObjectHeader`,
           aFilter=[];
           aFilter.push(new Filter("CreatedBy",FilterOperator.EQ,"CB9980000221"));
        //    aFilter.push(new Filter("ObjectType", FilterOperator.EQ, "MAA"));
           oProductInfoController._oDynamicModel.read(url, {                                 
           filters: aFilter,
           
           urlParameters: {
           "$expand": `to_RecordType/to_StatusSchema/to_StatusSchemaTrans`
           },
           success: function (oResult) {
           
               var aResults = oResult.results;
               aResults.map(m=>m.visible=true);
               var oInitialModel=new sap.ui.model.json.JSONModel();  
               aResults.filter(d=>d.ChangedDate=sap.ui.core.format.DateFormat.getDateTimeInstance({

                pattern: "yyyy-MM-dd"

            }).format(new Date(d.ChangedDate)))
               oInitialModel.setData(aResults);
               oProductInfoController.getView().setModel(oInitialModel,"Card1RecModel");
              
               this.getLifecycleStatus(oProductInfoController);
               this.returnRecordType(oProductInfoController);
           }.bind(this),
           error: function (oError) {
           }
           });
        },
        objectHeaderDataStatus:function(oProductInfoController)
         {
            var url = `/ObjectHeader`,
            aFilter=[];
            aFilter.push(new Filter("CreatedBy",FilterOperator.EQ,"CB9980000221"));
            oProductInfoController._oDynamicModel.read(url, {                                 
            filters: aFilter,
            
            urlParameters: {
            "$expand": `to_RecordType/to_StatusSchema/to_StatusSchemaTrans`
            },
            success: function (oResult) {
            
                var aResults = oResult.results;
                aResults.map(m=>m.visible=true);
                var oInitialModel=new sap.ui.model.json.JSONModel();  
                oInitialModel.setData(aResults);
               
                oProductInfoController.getView().setModel(oInitialModel,"StatusCardModel");
                this.getLifecycleStatus(oProductInfoController);
                this.returnRecordType(oProductInfoController);
                this.setstatusChartModel(oProductInfoController);
            }.bind(this),
            error: function (oError) {
            }
            });
         },
         objectBarChart:function(oProductInfoController)
         {
             debugger;
            var url = `/ObjectHeader`,
            aFilter=[];
            aFilter.push(new Filter("CreatedBy",FilterOperator.EQ,"CB9980000221"));
            aFilter.push(new Filter("ObjectType", FilterOperator.EQ, "MAA"));
            oProductInfoController._oDynamicModel.read(url, {                                 
            filters: aFilter,
                
            urlParameters: {
            
                    "$expand": `to_ClassAttribVal/to_ClassAttribAttachVal`
    
                },
                success: function (oResult) {
                    debugger;
                    var aResults = oResult.results;
                    aResults.map(m=>m.visible=true);
                    var oInitialModel=new sap.ui.model.json.JSONModel();  
                    
                    var aCountry=[];
                    for(var i=0;i<oResult.results.length;i++)
                        {
                            debugger;
                           
                            if(oResult.results[i].to_ClassAttribVal.results.length>0)
                            {
                                if(oResult.results[i].to_ClassAttribVal.results.filter(d=>d.AttributeId=='IDMP55_MACOUNTRY').length!=0)
                                {
                                    aCountry.push(oResult.results[i].to_ClassAttribVal.results.filter(d=>d.AttributeId=='IDMP55_MACOUNTRY')[0])
                                }
                            }
                            
                        }
                        oInitialModel.setData(aCountry);
                    oProductInfoController.getView().setModel(oInitialModel,"BarChartCardRecModel");
                   
                    this.getLifecycleStatus(oProductInfoController);
                    this.returnRecordType(oProductInfoController);
                }.bind(this),
                error: function (oError) {
                    debugger;
                    var a=0;
                }
                });
         },
         getLifecycleStatus:function(oProductInfoController)
         {

            var url = `/StatusText`,lifeCycle=[],that=this;

            oProductInfoController._oDynamicModel.read(url,{
             success: function (oResult) 
             {
                 lifeCycle = oResult.results;
                 that.launchWF(oProductInfoController,lifeCycle);
             }.bind(this),
             error: function (oError)
             {
             }
         });
        },
         returnRecordType:function(oProductInfoController)
         {
              var url = `/RecordType`; 
               oProductInfoController._oDynamicModel.read(url,{
                success: function (oResult) {
                    var aResults = oResult.results;
                    var recTypemodel=this.getRecordType(aResults);
                    var oModel=new sap.ui.model.json.JSONModel();
                    oModel.setData(recTypemodel);
                    oProductInfoController.getView().setModel(oModel,"RecordTypeModel");
                   }.bind(this),
                error: function (oError) {
                }
                });
          },
          launchWF:function(oProductInfoController,lifeCycle)
          {

                var oTaskData = {},that=this;
                $.ajax({
                    url: "/dashboarddashboard/bpmworkflowruntimeodata/v1/tcm/TaskCollection?$format=json" ,
                    method: "GET",
                    // contentType: "application/json",
                    async: false,
                    success: function (data) 
                    {
                         var aResults=data.d.results,Inboxdata=[];
                         for(var i=0;i<aResults.length;i++)
                         {
                             var a={};
                            //  a.Highlight=aResults[i].Highlight,
                             a.TaskTitle=aResults[i].TaskTitle,
                             a.Priority=aResults[i].Priority,
                            aResults[i].aRecordInfo=[];       
                            var aType=that.getWFUserTaskContext(aResults[i].InstanceID);
                            a.Due=that.formatDate(new Date(parseInt(aType.RecordInfo.KeyDate.slice(6,19)))),
                            a.ObjectType=aType.RecordInfo.ObjectType;
                            a.RecordId=aType.RecordInfo.RecordId;
                            a.ObjectDescr=aType.RecordInfo.ObjectDescr;
                            a.RecordType=aType.RecordInfo.RecordType;
                            a.StatusId=aType.RecordInfo.StatusId;
                            a.InteractingOrgId=aType.RecordInfo.InteractingOrgId;
                            a.InteractionPurposeId=aType.RecordInfo.InteractionPurposeId;
                            Inboxdata.push(a)
                         }
                         that.setChartModel(Inboxdata,oProductInfoController);
                         
                         var oModel=new sap.ui.model.json.JSONModel();
                         oModel.setData(Inboxdata);
                         oProductInfoController.getView().setModel(oModel,"Card2RecModel");
                    }
                });
               
            },
         setChartModel:function(adata,oProductInfoController)
         {
            var aChartData=[];
            var aPriority=["LOW","HIGH","MEDIUM"],aCountPriority=[0,0,0];
            for(var i=0;i<adata.length;i++)
            {
               for(var j=0;j<aPriority.length;j++)
               {
                 if(adata[i].Priority==aPriority[j])
                 {
                    aCountPriority[j]+=1; 
                 }
               }
            }
            for(var k=0;k<aPriority.length;k++)
            {
                var oChartData={};
                oChartData.priority=aPriority[k];
                oChartData.priorityCount=aCountPriority[k]; 
                aChartData.push(oChartData);
            }
            var oModel=new sap.ui.model.json.JSONModel();
            oModel.setData(aChartData);
            oProductInfoController.getView().setModel(oModel,"PriorityChart");
            
         },

        
         setstatusChartModel:function(oProductInfoController)
         {
               
                debugger;
                var aStatusRes=oProductInfoController.getView().getModel("StatusCardModel").getData(),aStatusModel=[],oStatusModel,aStatusList=[],aStatusCount=[];
                for(var i=0;i<aStatusRes.length;i++)
                {
                    oStatusModel={};
                    oStatusModel.StatusText=aStatusRes[i].StatusText;
                    if(aStatusList.filter(d=>d==aStatusRes[i].StatusText).length==0)
                    {
                        aStatusList.push(aStatusRes[i].StatusText);
                        aStatusCount.push(0);
                    }
                    aStatusModel.push(oStatusModel);
                   
                }
                for(var j=0;j<aStatusModel.length;j++)
                {
                     for(var k=0;k<aStatusList.length;k++)
                     {
                         if(aStatusModel[j].StatusText==aStatusList[k])
                         {
                            aStatusCount[k]+=1;
                         }
                     }
                } 
                var finalStatusModel=[];
                for(var i=0;i<aStatusList.length;i++)
                {
                    var oStateModel={}
                    oStateModel.status= aStatusList[i];
                    oStateModel.statusCount=aStatusCount[i];
                    finalStatusModel.push(oStateModel);
                }
               var statusChart=new JSONModel();
              statusChart.setData(finalStatusModel);
              oProductInfoController.getView().setModel(statusChart,"StatusChart");
         },
         getRecordType:function(results)
         {
            var recType=[];
            results.map(function(val){
              var orec={};
              orec.recordType=val.RecordTypeText.split("-")[0]; 
              orec.RecordTypeText=val.RecordTypeText;
              recType.push(orec); 
            })
             return recType;
         },
         getWFUserTaskContext:function(sTaskId) {
            var oContextData = {};
            $.ajax({
                url: "/dashboarddashboard/bpmworkflowruntime/v1/task-instances/"+sTaskId+"/context",
                method: "GET",
                async: false,
                success: function (data) 
                {
                    oContextData = data;
                }
            });
            return oContextData;
        },
        formatDate: function (date) 
        {
            
            // jQuery.sap.require("sap.ui.core.format.DateFormat");
            if (date) 
            {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd"
				});
                return oDateFormat.format(date);
            } 
            else 
            {
                return "No Date Found";
            }
        },
        // setLength:function(oProductInfoController,b=5)
        //  {
        //     this.resetModel(oProductInfoController);
        //     var aLength=oProductInfoController.getView().byId('card1List').getBinding("items"),
        //     aDisplay=[];
        //     if(aLength.oList.length>5 && aLength.aIndices.length>5)
        //     {
        //         for(var i=0;i<aLength.aIndices.length;i++)
        //         {
        //              aDisplay.push(aLength.oList[aLength.aIndices[i]]);
        //         } 
                
        //         var aTemparr=[],m=b;
        //         for(var j=b-1;j>=m-5;j--)
        //         {
        //              aTemparr.push(j)
        //         }
         
        //         for(var i=0;i<aDisplay.length;i++)
        //         {
        //              if(!(aTemparr.includes(i)))
        //              {
        //                 aDisplay[i].visible=false;
        //              }
        //         }
        //         oProductInfoController.getView().getModel("Card1RecModel").setProperty("/",aDisplay);
        //     }
        //  },
        //  resetModel:function(oProductInfoController)
        //  {
        //     var aLength=oProductInfoController.getView().byId('card1List').getBinding("items");
        //     for(var i=0;i<aLength.oList.length;i++)
        //     {
        //         aLength.oList[i].visible=true;
        //     } 
        //     oProductInfoController.getView().getModel("Card1RecModel").setProperty("/",aLength.oList);
             
        //  },
        //  setLength1:function(oProductInfoController,b=5)
        //  {
        //     this.resetModel1(oProductInfoController);
        //     var aLength=oProductInfoController.getView().byId('card2List').getBinding("items"),
        //     aDisplay=[];
        //     if(aLength.oList.length>5)
        //     {
        //         for(var i=0;i<aLength.aIndices.length;i++)
        //         {
        //              aDisplay.push(aLength.oList[aLength.aIndices[i]]);
        //         } 
                
        //         var aTemparr=[],m=b;
        //         for(var j=b-1;j>=m-5;j--)
        //         {
        //              aTemparr.push(j)
        //         }
         
        //         for(var i=0;i<aDisplay.length;i++)
        //         {
        //              if(!(aTemparr.includes(i)))
        //              {
        //                 aDisplay[i].visible=false;
        //              }
        //         }
        //         oProductInfoController.getView().getModel("Card2RecModel").setProperty("/",aDisplay);
        //     }
        //  },
         
        //  resetModel1:function(oProductInfoController)
        //  {
        //     var aLength=oProductInfoController.getView().byId('card2List').getBinding("items");
        //     for(var i=0;i<aLength.oList.length;i++)
        //     {
        //         aLength.oList[i].visible=true;
        //     } 
        //     oProductInfoController.getView().getModel("Card2RecModel").setProperty("/",aLength.oList);
             
        //  },
         objectTypeFilterData:function(oProductInfoController)
         {
            var url = `/ObjectHeader`
            oProductInfoController._oDynamicModel.read(url, {            
            success: function (oResult) {
                
                var aResults = oResult.results;
                var key="ObjectTypeText";
                var oList =    aResults.reduce(function(ObjTypes, x) {
                    (ObjTypes[x[key]] = ObjTypes[x[key]] || []).push(x);
                    
                    return ObjTypes;
                    }, {

                    });
                    oProductInfoController._aObjectType = [];
            for (var i in oList){
                var ObjlistType = {
                    ObjTypes : i,
                    ObjTypeid : oList[i][0].ObjectType
                }
                oProductInfoController._aObjectType.push(ObjlistType);
                }
                var ObjtypeModel=new sap.ui.model.json.JSONModel();  
                ObjtypeModel.setData(oProductInfoController._aObjectType);
                oProductInfoController.byId("one").setModel(ObjtypeModel,"objtype");
                oProductInfoController.byId("inboxid").setModel(ObjtypeModel,"objtype");
                oProductInfoController.byId("Viz1").setModel(ObjtypeModel,"objtype");
                // oProductInfoController.byId("VizChartObj").setModel(ObjtypeModel,"objtype");
                // oProductInfoController.byId("VizChart3Obj").setModel(ObjtypeModel,"objtype");
            }.bind(this),
            error: function (oError) {
            }
            });
         },

         recordTypeFilterData:function(oProductInfoController)
         {
            var url = `/ObjectHeader`
            oProductInfoController._oDynamicModel.read(url, {            
            success: function (oResult) {
                
                var aResults = oResult.results;
                var key="RecordTypeText";
                var oList =    aResults.reduce(function(ObjTypes, x) {
                    (ObjTypes[x[key]] = ObjTypes[x[key]] || []).push(x);
                    return ObjTypes;
                    }, {
                    });
                    oProductInfoController._aObjectType = [];
            for (var i in oList){
                var ObjlistType = {
                    ObjTypes : i,
                    ObjTypeid : oList[i][0].RecordType
                }
                oProductInfoController._aObjectType.push(ObjlistType);
                }
                var RecordtypeModel=new sap.ui.model.json.JSONModel();  
                RecordtypeModel.setData(oProductInfoController._aObjectType);
                oProductInfoController.byId("Two").setModel(RecordtypeModel,"rectyp");
                oProductInfoController.byId("inboxid2").setModel(RecordtypeModel,"rectyp");
                oProductInfoController.byId("Viz2").setModel(RecordtypeModel,"rectyp");
                // oProductInfoController.byId("VizChartRec").setModel(RecordtypeModel,"rectyp");
                // oProductInfoController.byId("VizChart3Rec").setModel(RecordtypeModel,"rectyp");
                
            }.bind(this),
            error: function (oError) {
            }
            });
         },

         InteractingOrgFilterData:function(oProductInfoController)
         {
            var url = `/ObjectHeader`
            oProductInfoController._oDynamicModel.read(url, {            
            success: function (oResult) {
               
                var aResults = oResult.results;
                var key="InteractingOrgText";
                var oList = aResults.reduce(function(ObjTypes, x) {
                    (ObjTypes[x[key]] = ObjTypes[x[key]] || []).push(x);
                    return ObjTypes;
                    }, {
                    });
                    oProductInfoController._aObjectType = [];
            for (var i in oList){
                var ObjlistType = {
                    ObjTypes : i,
                    ObjTypeid : oList[i][0].InteractingOrgId
                }
                oProductInfoController._aObjectType.push(ObjlistType);
                }
                var IntorgModel=new sap.ui.model.json.JSONModel();  
                IntorgModel.setData(oProductInfoController._aObjectType);
                oProductInfoController.byId("Intorg").setModel(IntorgModel,"intorg");
                oProductInfoController.byId("inboxid3").setModel(IntorgModel,"intorg");
                oProductInfoController.byId("Viz3").setModel(IntorgModel,"intorg");
                // oProductInfoController.byId("VizChart3Ior").setModel(IntorgModel,"intorg");
                // oProductInfoController.byId("VizChartIor").setModel(IntorgModel,"intorg");
                
                
            }.bind(this),
            error: function (oError) {
            }
            });
         },

         InteractionPurposeFilterData:function(oProductInfoController)
         {
            var url = `/ObjectHeader`
            oProductInfoController._oDynamicModel.read(url, {            
            success: function (oResult) {
                
                var aResults = oResult.results;
                var key="InteractionPurposeText";
                var oList = aResults.reduce(function(ObjTypes, x) {
                    (ObjTypes[x[key]] = ObjTypes[x[key]] || []).push(x);
                    return ObjTypes;
                    }, {
                    });
                    oProductInfoController._aObjectType = [];
            for (var i in oList){
                var ObjlistType = {
                    ObjTypes : i,
                    ObjTypeid : oList[i][0].InteractionPurposeId
                }
                oProductInfoController._aObjectType.push(ObjlistType);
                }
                var IntPur=new sap.ui.model.json.JSONModel();  
                IntPur.setData(oProductInfoController._aObjectType);
                oProductInfoController.byId("Intprp").setModel(IntPur,"intprp");
                oProductInfoController.byId("inboxid4").setModel(IntPur,"intprp");
                oProductInfoController.byId("Viz4").setModel(IntPur,"intprp");
                // oProductInfoController.byId("VizChartIntprp").setModel(IntPur,"intprp");
                // oProductInfoController.byId("VizChart3Intprp").setModel(IntPur,"intprp");
                
               
                
            }.bind(this),
            error: function (oError) {
            }
            });
         }, 
       
    }

});

 