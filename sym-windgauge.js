(function (PV) {
	"use strict";

	function symbolVis() { };
	PV.deriveVisualizationFromBase(symbolVis);

	var definition = { 
		typeName: "windgauge",
		visObjectType: symbolVis,
		configInit: configInit,
		displayName: 'Wind Gauge',
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: '/Scripts/app/editor/symbols/ext/Icons/compass-outline-white.png',
		getDefaultConfig: function(){ 
			return {
				DataShape: 'Table',
				showValueCheckboxValue: true,
				showValueUnitsCheckboxValue: true,
				showTitleCheckboxValue: true,
				Height: 150,
				Width: 150,
				DisplayDigits: 2
			} 
		},
		configOptions: function(){
			return [
				{
					title: "Format Symbol",
					mode: "format"
				}
			];
		},
		configure: {
			moveRow: configMoveRow,
			deleteRow: configDeleteRow
		}
	}
	
	symbolVis.prototype.init = function(scope, elem) { 
		var container = elem.find('#container')[0]; 
		container.id = "windgauge_" + scope.symbol.Name;
		var chart;
		
		this.onDataUpdate = dataUpdate;
		this.onResize = resize;
		this.onConfigChange = configChanged;
		
		function configChanged(data) {
			if(chart) {
				// Show or hide the value & value units
				if (scope.config.showValueCheckboxValue == false) {
					//chart.axes[ 0 ].setBottomText( "" );
					chart.axes[ 0 ].bottomText = ( "" );
				} else {
					if(scope.config.showValueUnitsCheckboxValue == false){
						//chart.axes[ 0 ].setBottomText( scope.valuespd );
						chart.axes[ 0 ].bottomText = ( scope.valuespd );
					} else {
						//chart.axes[ 0 ].setBottomText( scope.valuespd + " " + scope.unitspd);
						chart.axes[ 0 ].bottomText = ( scope.valuespd + " " + scope.unitspd);
					}
				}

				// Show or hide the title
				if (scope.config.showTitleCheckboxValue == false) {
					chart.titles[ 0 ].text = ( "" );
				} else {
					if (scope.config.gaugeTitle) {
						chart.titles[ 0 ].text = ( scope.config.gaugeTitle );
					} else {
						chart.titles[ 0 ].text = ( scope.Label );
					}
				}
				
				chart.validateNow();
			}
		}
		
        function resize(width, height) {
            if(chart) {
				chart.axes[ 0 ].bottomTextYOffset = (-1)*(height/10); //wind speed offset
				chart.axes[ 0 ].bottomTextFontSize = height/15; //wind speed font size
				//chart.allLabels[ 0 ].size = height/10; //"N" font size
				//chart.allLabels[ 0 ].y = height/5; //"N" offset
				chart.arrows[ 0 ].startWidth = height/10; //width of arrow
				//chart.arrows[ 0 ].nailRadius = height/30;
            }
        }
		
		function dataUpdate(data){
			if(!data)return;
			
			//console.log(data);
			
			var tagsinsymbol = data.Rows.length;
			
			scope.valuedir = data.Rows[0].Value;
			
			if(tagsinsymbol > 1){		
				if(data.Rows[1].Value){
					var value_spd_staging = data.Rows[1].Value;
					scope.valuespd = Number.parseFloat(value_spd_staging).toPrecision(3);
				}
			
				if(data.Rows[1].Units){
					scope.unitspd = data.Rows[1].Units;
				}
			} else {
				scope.valuespd = "";
				scope.unitspd = "";
			}
			
			if(data.Rows[0].Label){
				scope.Label = data.Rows[0].Label;
			}

			if(!chart){
				chart = AmCharts.makeChart(container.id, {
					"creditsPosition": "bottom-right",
					"type": "gauge",
					"marginBottom": 20,
					"marginTop": 20,
					"startDuration": 0,
					"fontSize": 20,
					"arrows": [
						{						
							"innerRadius": "30%",
							"nailAlpha": 0,
							"nailRadius": 7,
							"startWidth": 25,
							"id": "GaugeArrow-1",
							"alpha":0.8,
							//"nailRadius":7,
							"color": "#ea3838",
							"value": scope.valuedir
						}
					],
					"axes": [
						{
							"endAngle": 360,
							"endValue": 360,
							"id": "GaugeAxis-1",
							"minorTickInterval": 22.5,
							"inside": false,
							"startAngle": 0,
							"valueInterval": 90,
							"bottomText": "",
							"bottomTextYOffset": -20,
							"bottomTextFontSize": 15,
							"labelFrequency": 1,
							"tickAlpha": 0.7,
							"bands": [
								{
									"color": "#555555",
									"endValue": 360,
									"id": "GaugeBand-4",
									"startValue": 0,
									"innerRadius": "97%",
									"radius": "100%"
								}
							]
						}
					],
					"balloon": {},
					"titles": [
						{
							"id": "Title-1",
							"size": 15,
							"text": scope.Label
						}
					]
			} );	
				
			} else {
				if (scope.config.showValueCheckboxValue == true) {
					if(scope.config.showValueUnitsCheckboxValue == false){
						chart.axes[ 0 ].setBottomText( scope.valuespd );
					} else {
						chart.axes[ 0 ].setBottomText( scope.valuespd + " " + scope.unitspd);
					}
				}
				chart.arrows[ 0 ].setValue( scope.valuedir );
			}
			
			if (scope.config.showTitleCheckboxValue == false) {
				chart.titles[ 0 ].text = ( "" );
			} else {
				if (scope.config.gaugeTitle) {
					chart.titles[ 0 ].text = ( scope.config.gaugeTitle );
				} else {
					chart.titles[ 0 ].text = ( scope.Label );
				}
			}
			
			chart.validateData();
		}
	};

    function configInit(scope) {
        var runtimeData = scope.runtimeData;

        // Reset row index if datasource was deleted
        if (isNaN(runtimeData.currentRow) || runtimeData.currentRow >= scope.symbol.DataSources.length) {
            runtimeData.currentRow = 0;
        }

        if (runtimeData.metaData) {
            // Set path binding list with actual names
            runtimeData.rowList = configDatasourceList(runtimeData.metaData.map(function (item) { return item.Path; }));
        } else {
            // Error getting metadata, fall back to configured datasources
            runtimeData.metaData = [];
            runtimeData.rowList = configDatasourceList(scope.symbol.DataSources);
        }
    }
	
    // Parse datasource list to build labels and full paths
    function configDatasourceList(datasources) {
        var showAssetNameInLegend = datasources
            .map(function (item) {
                var path = item.Path || item.PersistPath || item;
                return path.substr(0, path.indexOf('|')) || path;
            }).filter(function (element, index, array) {
                // Remove duplicates
                return array.indexOf(element) === index;
            }).length !== 1;

        return datasources.map(function (path) {
            var item = PV.Utils.parsePath(path);
            var label = item.label;
            return {
                label: showAssetNameInLegend ? label : label.substr(label.indexOf('|') + 1),
                path: item.fullPath
            };
        });
    }
	
    // keydown handler for row list
    function configOnChangeRow($event, runtimeData) {
        $event.stopPropagation();
        var rowHeight = $event.currentTarget.children[0].clientHeight;
        if ($event.keyCode == 38 && runtimeData.currentRow > 0) {
            // up arrow
            runtimeData.currentRow--;
            if ($event.currentTarget.scrollTop > runtimeData.currentRow * rowHeight) {
                $event.currentTarget.scrollTop = runtimeData.currentRow * rowHeight;
            }

        } else if ($event.keyCode == 40 && runtimeData.currentRow < runtimeData.metaData.length - 1) {
            // down arrow
            runtimeData.currentRow++;
            if ($event.currentTarget.scrollTop + ($event.currentTarget.clientHeight - rowHeight) <= runtimeData.currentRow * rowHeight) {
                $event.currentTarget.scrollTop += rowHeight;
            }
        }
    }
	
	function configMoveRow(scope, action) {
        var index = scope.runtimeData.currentRow;
        var datasources = scope.symbol.DataSources;

        var target, arrayOperator;
        if (action === 'up' && index > 0) {
            target = index - 1;
        } else if (action === 'down' && index < datasources.length - 1) {
            target = index + 1;
        } else if (action === 'top' && index > 0) {
            target = 0;
            arrayOperator = 'unshift';
        } else if (action === 'bottom' && index < datasources.length - 1) {
            target = datasources.length - 1;
            arrayOperator = 'push';
        } else {
            return;
        }

        scope.runtimeData.currentRow = target;
        if (arrayOperator) {
            // Move to head or tail
            datasources[arrayOperator](datasources.splice(index, 1)[0]);
        } else {
            // Swap with neighbor
            datasources[index] = datasources.splice(target, 1, datasources[index])[0];
        }
        scope.$root.$broadcast('refreshDataForChangedSymbols');
    }

    function configDeleteRow(scope) {
        var index = scope.runtimeData.currentRow;
        var datasources = scope.symbol.DataSources;

        if (datasources.length > 1) {
            datasources.splice(index, 1);
            scope.$root.$broadcast('refreshDataForChangedSymbols');
        }
    }
	
	PV.symbolCatalog.register(definition); 
})(window.PIVisualization); 